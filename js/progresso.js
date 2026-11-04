// Guarda o progresso do aluno no próprio navegador (localStorage).
// Formato salvo: { "id-do-modulo": { melhorNota: 80, tentativas: 2 }, ... }

const CHAVE_PROGRESSO = "az900-progresso";

function lerProgresso() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_PROGRESSO)) || {};
  } catch (erro) {
    // O navegador pode bloquear o localStorage (janela anônima, por exemplo).
    return {};
  }
}

function salvarProgresso(progresso) {
  try {
    localStorage.setItem(CHAVE_PROGRESSO, JSON.stringify(progresso));
  } catch (erro) {
    // Sem armazenamento, o app continua funcionando, só não lembra do progresso.
  }
}

// Chamada quando o aluno termina um quiz. Guarda a melhor nota e o número de tentativas.
function registrarResultado(idModulo, acertos, total) {
  const progresso = lerProgresso();
  const nota = Math.round((acertos / total) * 100);
  const anterior = progresso[idModulo] || { melhorNota: 0, tentativas: 0 };
  progresso[idModulo] = {
    melhorNota: Math.max(anterior.melhorNota, nota),
    tentativas: anterior.tentativas + 1,
  };
  salvarProgresso(progresso);
  return nota;
}

// Percentual de aprendizado de um domínio = média das melhores notas dos módulos dele.
// Módulo que ainda não foi feito conta como 0.
function percentualDoDominio(modulosDoDominio, progresso) {
  if (modulosDoDominio.length === 0) return 0;
  const soma = modulosDoDominio.reduce(
    (total, modulo) => total + (progresso[modulo.id]?.melhorNota || 0),
    0
  );
  return Math.round(soma / modulosDoDominio.length);
}

// ---------- Simulados ----------
// Histórico dos simulados, do mais recente para o mais antigo (guardamos só os 10 últimos).
// Formato: [{ data, nota, acertos, total, aprovado, duracaoMs, automatico,
//             dominios: { "id-do-dominio": { acertos, total, percentual } } }, ...]
const CHAVE_SIMULADOS = "az900-simulados";
const MAXIMO_SIMULADOS = 10;

function lerHistoricoSimulados() {
  try {
    const lista = JSON.parse(localStorage.getItem(CHAVE_SIMULADOS));
    return Array.isArray(lista) ? lista : [];
  } catch (erro) {
    return [];
  }
}

function salvarResultadoSimulado(resultado) {
  const historico = [resultado, ...lerHistoricoSimulados()].slice(0, MAXIMO_SIMULADOS);
  try {
    localStorage.setItem(CHAVE_SIMULADOS, JSON.stringify(historico));
  } catch (erro) {
    // Sem armazenamento, o resultado aparece na tela, mas não fica no histórico.
  }
  return historico;
}

// Peso de um domínio na prova, usando o meio da faixa: "25–30%" vira 27,5.
function pesoMedio(dominio) {
  const numeros = (dominio.peso.match(/\d+(?:[.,]\d+)?/g) || []).map((n) => Number(n.replace(",", ".")));
  if (numeros.length === 0) return 1;
  return numeros.reduce((soma, n) => soma + n, 0) / numeros.length;
}

// Prontidão estimada = média ponderada pelos pesos da prova dos percentuais de cada domínio.
// Fonte dos percentuais: a média dos últimos até 3 simulados, se houver algum.
// Sem simulado, usamos as melhores notas dos quizzes dos módulos (módulo não feito conta 0).
// Sem nenhum dado, devolvemos { fonte: null }.
function calcularProntidao(dados, progresso, historico) {
  const recentes = historico.slice(0, 3);
  let fonte = null;
  let porDominio = [];

  if (recentes.length > 0) {
    fonte = "simulados";
    porDominio = dados.dominios.map((dominio) => ({
      id: dominio.id,
      nome: dominio.nome,
      peso: pesoMedio(dominio),
      percentual:
        recentes.reduce((soma, t) => soma + (t.dominios?.[dominio.id]?.percentual || 0), 0) /
        recentes.length,
    }));
  } else if (dados.modulos.some((modulo) => progresso[modulo.id])) {
    fonte = "modulos";
    porDominio = dados.dominios.map((dominio) => ({
      id: dominio.id,
      nome: dominio.nome,
      peso: pesoMedio(dominio),
      percentual: percentualDoDominio(
        dados.modulos.filter((m) => m.dominio === dominio.id),
        progresso
      ),
    }));
  } else {
    return { fonte: null };
  }

  const somaPesos = porDominio.reduce((soma, d) => soma + d.peso, 0);
  const percentual = porDominio.reduce((soma, d) => soma + d.peso * d.percentual, 0) / somaPesos;
  const menor = Math.min(...porDominio.map((d) => d.percentual));
  const fracos = menor < 100 ? porDominio.filter((d) => d.percentual === menor) : [];

  return {
    fonte: fonte,
    quantidade: recentes.length,
    percentual: Math.round(percentual),
    porDominio: porDominio,
    fracos: fracos,
  };
}
