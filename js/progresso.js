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
