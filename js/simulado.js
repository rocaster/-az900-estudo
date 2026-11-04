// Simulado: 40 questões sorteadas conforme o peso de cada domínio, com cronômetro de 45 minutos.
// Durante a prova não há correção. O resultado e a revisão aparecem só no final.

const DURACAO_MS = 45 * 60 * 1000;
const AVISO_MS = 5 * 60 * 1000;
const NOTA_APROVACAO = 700;

// Quantas questões de cada domínio (total de 40).
// Os pesos oficiais são faixas: 25–30%, 35–40% e 30–35%. Conceitos (11 = 27,5%) e arquitetura
// (15 = 37,5%) ficam exatamente no meio da faixa, e governança fica com as 14 restantes (35%).
const DISTRIBUICAO = { conceitos: 11, arquitetura: 15, governanca: 14 };

// Simulado em andamento fica salvo para sobreviver a um recarregamento da página.
const CHAVE_SIMULADO_ATUAL = "az900-simulado-atual";

let dados = null; // data/modulos.json
let banco = null; // data/perguntas.json
let prova = null; // simulado em andamento
let relogio = null; // intervalo do cronômetro
let avisoMostrado = false;
let confirmando = false;

async function iniciar() {
  [dados, banco] = await Promise.all([
    carregarJson("data/modulos.json"),
    carregarJson("data/perguntas.json"),
  ]);

  const salva = lerProvaSalva();
  if (salva) {
    prova = salva;
    if (Date.now() >= fimDaProva()) {
      finalizar(true);
    } else {
      mostrarProva("Seu simulado em andamento foi retomado. O cronômetro continuou correndo.");
    }
    return;
  }
  mostrarInicio();
}

// ---------- Utilidades ----------

function embaralhar(lista) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// 125000 ms vira "02:05".
function formatarTempo(ms) {
  const segundos = Math.max(0, Math.ceil(ms / 1000));
  const minutos = Math.floor(segundos / 60);
  return String(minutos).padStart(2, "0") + ":" + String(segundos % 60).padStart(2, "0");
}

function formatarPercentual(valor) {
  return (Math.round(valor * 10) / 10).toLocaleString("pt-BR") + "%";
}

function nomeDoDominio(id) {
  const dominio = dados.dominios.find((d) => d.id === id);
  return dominio ? dominio.nome : id;
}

function nomeDoModulo(id) {
  const modulo = dados.modulos.find((m) => m.id === id);
  return modulo ? modulo.titulo : id;
}

function perguntaDo(item) {
  return banco[item.modulo][item.indice];
}

function fimDaProva() {
  return prova.inicio + prova.duracaoMs;
}

function salvarProva() {
  try {
    localStorage.setItem(CHAVE_SIMULADO_ATUAL, JSON.stringify(prova));
  } catch (erro) {
    // Sem armazenamento, o simulado funciona, só não sobrevive a um recarregamento.
  }
}

function apagarProvaSalva() {
  try {
    localStorage.removeItem(CHAVE_SIMULADO_ATUAL);
  } catch (erro) {
    // Nada a fazer.
  }
}

// Lê o simulado salvo e confere se ele ainda bate com o banco de perguntas atual.
function lerProvaSalva() {
  let salva = null;
  try {
    salva = JSON.parse(localStorage.getItem(CHAVE_SIMULADO_ATUAL));
  } catch (erro) {
    return null;
  }
  const valida =
    salva &&
    Array.isArray(salva.itens) &&
    salva.itens.length > 0 &&
    salva.itens.every((item) => {
      const pergunta = banco[item.modulo]?.[item.indice];
      return pergunta && Array.isArray(item.ordem) && item.ordem.length === pergunta.opcoes.length;
    });
  if (!valida) {
    apagarProvaSalva();
    return null;
  }
  return salva;
}

// ---------- Sorteio ----------

// Sorteia as questões: em cada domínio, faz um rodízio entre os módulos (um de cada vez)
// para espalhar as questões o mais igualmente possível. No fim, embaralha a ordem das
// questões e a ordem das opções de cada uma.
function sortearQuestoes() {
  const itens = [];

  for (const dominio of dados.dominios) {
    const quantidade = DISTRIBUICAO[dominio.id] || 0;
    const filas = embaralhar(dados.modulos.filter((m) => m.dominio === dominio.id))
      .map((modulo) =>
        embaralhar((banco[modulo.id] || []).map((_, indice) => ({ modulo: modulo.id, indice: indice })))
      )
      .filter((fila) => fila.length > 0);

    let escolhidas = 0;
    while (escolhidas < quantidade && filas.some((fila) => fila.length > 0)) {
      for (const fila of filas) {
        if (escolhidas >= quantidade) break;
        if (fila.length > 0) {
          itens.push({ ...fila.pop(), dominio: dominio.id });
          escolhidas++;
        }
      }
    }
  }

  return embaralhar(itens).map((item) => ({
    ...item,
    ordem: embaralhar(perguntaDo(item).opcoes.map((_, i) => i)),
  }));
}

// ---------- Tela inicial ----------

function mostrarInicio() {
  const area = document.getElementById("conteudo");
  area.replaceChildren();
  document.title = "Simulado · Estudo AZ-900";

  const total = Object.values(DISTRIBUICAO).reduce((soma, n) => soma + n, 0);
  area.append(criar("span", "etiqueta", "Simulado"), criar("h1", "", "Simulado AZ-900"));

  const regras = criar("section", "cartao objetivos");
  regras.append(criar("h2", "", "Como funciona"));
  const lista = criar("ul", "lista");
  const itens = [
    total + " questões sorteadas do banco do site, na proporção do peso de cada domínio na prova: " +
      dados.dominios.map((d) => nomeDoDominio(d.id) + " (" + (DISTRIBUICAO[d.id] || 0) + ")").join(", ") + ".",
    "45 minutos, com cronômetro na tela e aviso quando faltarem 5 minutos. Quando o tempo acabar, o simulado é enviado automaticamente.",
    "Uma questão por vez. Você pode voltar, pular e marcar questões para revisar antes de finalizar.",
    "Nenhuma correção durante a prova: o resultado, por domínio, e a revisão de cada questão aparecem no final.",
    "Nota estimada de 0 a 1000, proporcional aos acertos. Para ser aprovado na prova real, a Microsoft exige 700.",
  ];
  for (const texto of itens) lista.append(criar("li", "", texto));
  regras.append(lista);

  const acoes = criar("div", "acoes");
  const comecar = criar("button", "botao", "Começar simulado");
  comecar.type = "button";
  comecar.id = "comecar";
  comecar.addEventListener("click", comecarProva);
  const voltar = criar("a", "botao secundario", "Voltar ao início");
  voltar.href = "index.html";
  acoes.append(comecar, voltar);
  regras.append(acoes);
  area.append(regras);

  const historico = lerHistoricoSimulados();
  const blocoProntidao = criar("section", "cartao");
  blocoProntidao.append(criar("h2", "", "Sua prontidão"));
  const alvo = criar("div", "prontidao");
  blocoProntidao.append(alvo);
  area.append(blocoProntidao);
  desenharProntidao(alvo, calcularProntidao(dados, lerProgresso(), historico));

  area.append(criarHistorico(historico));
}

function criarHistorico(historico) {
  const bloco = criar("section", "cartao");
  bloco.id = "historico";
  bloco.append(criar("h2", "", "Seus últimos simulados"));

  if (historico.length === 0) {
    bloco.append(criar("p", "detalhe", "Você ainda não fez nenhum simulado. Os 10 últimos vão aparecer aqui."));
    return bloco;
  }

  const rolagem = criar("div", "tabela-rolagem");
  const tabela = criar("table", "tabela");
  const cabecalho = criar("tr");
  for (const titulo of ["Data", "Nota", "Resultado", ...dados.dominios.map((d) => d.nome), "Duração"]) {
    cabecalho.append(criar("th", "", titulo));
  }
  const thead = criar("thead");
  thead.append(cabecalho);
  const tbody = criar("tbody");

  for (const tentativa of historico) {
    const linha = criar("tr");
    const data = new Date(tentativa.data);
    linha.append(
      criar("td", "", data.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })),
      criar("td", "numero", String(tentativa.nota)),
      criar("td", tentativa.aprovado ? "situacao aprovado" : "situacao ainda-nao", tentativa.aprovado ? "Aprovado" : "Ainda não")
    );
    for (const dominio of dados.dominios) {
      const valor = tentativa.dominios?.[dominio.id];
      linha.append(criar("td", "numero", valor ? valor.percentual + "%" : "—"));
    }
    linha.append(criar("td", "numero", formatarTempo(tentativa.duracaoMs) + (tentativa.automatico ? " (tempo esgotado)" : "")));
    tbody.append(linha);
  }

  tabela.append(thead, tbody);
  rolagem.append(tabela);
  bloco.append(rolagem);
  return bloco;
}

// ---------- Prova ----------

function comecarProva() {
  const itens = sortearQuestoes();
  prova = {
    versao: 1,
    inicio: Date.now(),
    duracaoMs: DURACAO_MS,
    itens: itens,
    respostas: itens.map(() => null), // índice da opção escolhida (na ordem original do JSON)
    marcadas: itens.map(() => false),
    atual: 0,
  };
  salvarProva();
  mostrarProva();
}

function mostrarProva(mensagem) {
  const area = document.getElementById("conteudo");
  area.replaceChildren();
  document.title = "Simulado em andamento · Estudo AZ-900";
  avisoMostrado = false;
  confirmando = false;

  const barra = criar("div", "barra-simulado");
  const contador = criar("span", "contador");
  contador.id = "contador";
  const respondidas = criar("span", "respondidas");
  respondidas.id = "respondidas";
  const cronometro = criar("span", "cronometro");
  cronometro.id = "cronometro";
  cronometro.setAttribute("role", "timer");
  cronometro.setAttribute("aria-label", "Tempo restante");
  barra.append(contador, respondidas, cronometro);

  const aviso = criar("div", "aviso");
  aviso.id = "aviso";
  aviso.setAttribute("role", "status");
  aviso.setAttribute("aria-live", "polite");
  if (mensagem) aviso.textContent = mensagem;
  aviso.hidden = !mensagem;

  const questao = criar("section", "cartao");
  questao.id = "questao";

  const navegador = criar("section", "cartao");
  navegador.append(criar("h2", "", "Questões"));
  const grade = criar("div", "navegador");
  grade.id = "navegador";
  const legenda = criar(
    "p",
    "detalhe",
    "Azul: respondida. Contorno: sem resposta. ⚑: marcada para revisão. Toque em um número para ir até a questão."
  );
  navegador.append(grade, legenda);

  area.append(barra, aviso, questao, navegador);

  desenharQuestao();
  clearInterval(relogio);
  atualizarRelogio();
  relogio = setInterval(atualizarRelogio, 1000);
}

function mostrarAviso(texto) {
  const aviso = document.getElementById("aviso");
  if (!aviso) return;
  aviso.textContent = texto;
  aviso.hidden = false;
}

function atualizarRelogio() {
  if (!prova) return;
  const restante = fimDaProva() - Date.now();
  if (restante <= 0) {
    finalizar(true);
    return;
  }
  const cronometro = document.getElementById("cronometro");
  if (cronometro) {
    cronometro.textContent = "⏱ " + formatarTempo(restante);
    cronometro.classList.toggle("alerta", restante <= AVISO_MS);
  }
  if (restante <= AVISO_MS && !avisoMostrado) {
    avisoMostrado = true;
    mostrarAviso("Atenção: faltam 5 minutos ou menos. Quando o tempo acabar, o simulado será enviado automaticamente.");
  }
}

function atualizarResumo() {
  const total = prova.itens.length;
  const feitas = prova.respostas.filter((r) => r !== null).length;
  document.getElementById("contador").textContent = "Questão " + (prova.atual + 1) + " de " + total;
  document.getElementById("respondidas").textContent = "Respondidas: " + feitas + "/" + total;

  const grade = document.getElementById("navegador");
  grade.replaceChildren();
  prova.itens.forEach((_, i) => {
    const respondida = prova.respostas[i] !== null;
    const marcada = prova.marcadas[i];
    const botao = criar("button", "nav-item", String(i + 1) + (marcada ? " ⚑" : ""));
    botao.type = "button";
    if (respondida) botao.classList.add("respondida");
    if (marcada) botao.classList.add("marcada");
    if (i === prova.atual && !confirmando) {
      botao.classList.add("atual");
      botao.setAttribute("aria-current", "true");
    }
    botao.setAttribute(
      "aria-label",
      "Questão " + (i + 1) + ", " + (respondida ? "respondida" : "sem resposta") + (marcada ? ", marcada para revisão" : "")
    );
    botao.addEventListener("click", () => irPara(i));
    grade.append(botao);
  });
}

function irPara(indice) {
  prova.atual = Math.max(0, Math.min(prova.itens.length - 1, indice));
  confirmando = false;
  salvarProva();
  desenharQuestao();
  document.getElementById("questao").scrollIntoView({ block: "nearest" });
}

function desenharQuestao() {
  const area = document.getElementById("questao");
  area.replaceChildren();
  const i = prova.atual;
  const item = prova.itens[i];
  const pergunta = perguntaDo(item);

  area.append(
    criar("p", "detalhe", "Questão " + (i + 1) + " de " + prova.itens.length + (prova.marcadas[i] ? " · ⚑ marcada para revisão" : "")),
    criar("h2", "", pergunta.pergunta)
  );

  const opcoes = criar("div", "opcoes");
  for (const original of item.ordem) {
    const escolhida = prova.respostas[i] === original;
    const botao = criar("button", "opcao" + (escolhida ? " selecionada" : ""), pergunta.opcoes[original]);
    botao.type = "button";
    botao.setAttribute("aria-pressed", escolhida ? "true" : "false");
    botao.addEventListener("click", () => {
      prova.respostas[i] = original;
      salvarProva();
      desenharQuestao();
    });
    opcoes.append(botao);
  }
  area.append(opcoes);

  const acoes = criar("div", "acoes");
  const anterior = criar("button", "botao secundario", "← Anterior");
  anterior.type = "button";
  anterior.id = "anterior";
  anterior.disabled = i === 0;
  anterior.addEventListener("click", () => irPara(i - 1));

  const ultima = i === prova.itens.length - 1;
  const proxima = criar("button", "botao", ultima ? "Revisar e finalizar" : "Próxima →");
  proxima.type = "button";
  proxima.id = "proxima";
  proxima.addEventListener("click", () => (ultima ? pedirConfirmacao() : irPara(i + 1)));

  const marcar = criar("button", "botao secundario", prova.marcadas[i] ? "⚑ Desmarcar revisão" : "⚑ Marcar para revisão");
  marcar.type = "button";
  marcar.id = "marcar";
  marcar.setAttribute("aria-pressed", prova.marcadas[i] ? "true" : "false");
  marcar.addEventListener("click", () => {
    prova.marcadas[i] = !prova.marcadas[i];
    salvarProva();
    desenharQuestao();
  });

  const terminar = criar("button", "botao secundario", "Finalizar simulado");
  terminar.type = "button";
  terminar.id = "finalizar";
  terminar.addEventListener("click", pedirConfirmacao);

  acoes.append(anterior, proxima, marcar, terminar);
  area.append(acoes);
  atualizarResumo();
}

function pedirConfirmacao() {
  confirmando = true;
  const area = document.getElementById("questao");
  area.replaceChildren();
  const total = prova.itens.length;
  const semResposta = prova.respostas.filter((r) => r === null).length;
  const marcadas = prova.marcadas.filter(Boolean).length;

  area.append(criar("h2", "", "Finalizar o simulado?"));
  area.append(criar("p", "", "Você respondeu " + (total - semResposta) + " de " + total + " questões."));
  if (semResposta > 0) {
    area.append(
      criar(
        "p",
        "alerta-texto",
        semResposta === 1
          ? "1 questão está sem resposta e vai contar como errada."
          : semResposta + " questões estão sem resposta e vão contar como erradas."
      )
    );
  }
  if (marcadas > 0) {
    area.append(
      criar("p", "", marcadas === 1 ? "1 questão está marcada para revisão." : marcadas + " questões estão marcadas para revisão.")
    );
  }
  area.append(criar("p", "detalhe", "Depois de finalizar, não dá para mudar as respostas."));

  const acoes = criar("div", "acoes");
  const confirmar = criar("button", "botao", "Finalizar agora");
  confirmar.type = "button";
  confirmar.id = "confirmar-finalizar";
  confirmar.addEventListener("click", () => finalizar(false));
  const voltar = criar("button", "botao secundario", "Voltar ao simulado");
  voltar.type = "button";
  voltar.id = "voltar-simulado";
  voltar.addEventListener("click", () => irPara(prova.atual));
  acoes.append(confirmar, voltar);
  area.append(acoes);
  atualizarResumo();
}

// ---------- Correção e resultado ----------

function corrigir(provaFeita, fim, automatico) {
  const porDominio = {};
  const questoes = provaFeita.itens.map((item, i) => {
    const pergunta = perguntaDo(item);
    const resposta = provaFeita.respostas[i];
    const acertou = resposta === pergunta.correta;
    const placar = (porDominio[item.dominio] = porDominio[item.dominio] || { acertos: 0, total: 0 });
    placar.total++;
    if (acertou) placar.acertos++;
    return { numero: i + 1, item: item, pergunta: pergunta, resposta: resposta, acertou: acertou };
  });

  for (const placar of Object.values(porDominio)) {
    placar.percentual = Math.round((placar.acertos / placar.total) * 100);
  }

  const total = questoes.length;
  const acertos = questoes.filter((q) => q.acertou).length;
  const nota = Math.round((acertos / total) * 1000);
  return {
    data: new Date(fim).toISOString(),
    nota: nota,
    acertos: acertos,
    total: total,
    aprovado: nota >= NOTA_APROVACAO,
    duracaoMs: Math.max(0, Math.min(fim - provaFeita.inicio, provaFeita.duracaoMs)),
    automatico: automatico,
    dominios: porDominio,
    questoes: questoes,
  };
}

function finalizar(automatico) {
  if (!prova) return;
  clearInterval(relogio);
  relogio = null;
  const fim = Math.min(Date.now(), fimDaProva());
  const resultado = corrigir(prova, fim, automatico);
  const { questoes, ...resumo } = resultado;
  salvarResultadoSimulado(resumo);
  apagarProvaSalva();
  prova = null;
  mostrarResultado(resultado);
}

function mostrarResultado(resultado) {
  const area = document.getElementById("conteudo");
  area.replaceChildren();
  document.title = "Resultado do simulado · Estudo AZ-900";

  // Placar geral
  const placar = criar("section", "cartao resultado");
  placar.id = "resultado";
  placar.append(criar("h1", "", "Resultado do simulado"));
  if (resultado.automatico) {
    placar.append(criar("p", "alerta-texto", "O tempo acabou e o simulado foi enviado automaticamente."));
  }
  const nota = criar("p", "nota", String(resultado.nota));
  nota.id = "nota";
  nota.append(criar("span", "nota-escala", " / 1000"));
  placar.append(
    nota,
    criar("p", resultado.aprovado ? "situacao aprovado" : "situacao ainda-nao", resultado.aprovado ? "Aprovado" : "Ainda não"),
    criar(
      "p",
      "",
      "Você acertou " + resultado.acertos + " de " + resultado.total + " (" + formatarPercentual((resultado.acertos / resultado.total) * 100) +
        "). Nota mínima para aprovação: " + NOTA_APROVACAO + "."
    ),
    criar("p", "detalhe", "Tempo usado: " + formatarTempo(resultado.duracaoMs) + " de " + formatarTempo(DURACAO_MS) + "."),
    criar(
      "p",
      "detalhe",
      "Nota estimada: proporcional aos acertos (acertos ÷ " + resultado.total + " × 1000). Não é a escala oficial da Microsoft, " +
        "que calcula a nota de outro jeito. Use como referência de estudo."
    )
  );
  area.append(placar);

  // Desempenho por domínio
  const dominiosFeitos = dados.dominios.filter((d) => resultado.dominios[d.id]);
  const menor = Math.min(...dominiosFeitos.map((d) => resultado.dominios[d.id].percentual));
  const fracos = menor < 100 ? dominiosFeitos.filter((d) => resultado.dominios[d.id].percentual === menor) : [];

  const blocoDominios = criar("section", "cartao");
  blocoDominios.id = "por-dominio";
  blocoDominios.append(criar("h2", "", "Desempenho por domínio"));
  for (const dominio of dominiosFeitos) {
    const placarDominio = resultado.dominios[dominio.id];
    const fraco = fracos.includes(dominio);
    const linha = criar("div", "dominio" + (fraco ? " fraco" : ""));
    linha.dataset.dominio = dominio.id;
    const topo = criar("div", "dominio-topo");
    topo.append(criar("strong", "", dominio.nome));
    if (fraco) topo.append(criar("span", "selo-fraco", "Ponto fraco"));
    topo.append(
      criar("span", "peso", placarDominio.acertos + " de " + placarDominio.total),
      criar("span", "percentual", placarDominio.percentual + "%")
    );
    const barra = criar("div", "barra");
    const preenchimento = criar("div", "barra-preenchida");
    preenchimento.style.width = placarDominio.percentual + "%";
    barra.append(preenchimento);
    linha.append(topo, barra);
    blocoDominios.append(linha);
  }
  area.append(blocoDominios);

  // Onde reforçar
  const reforco = criar("section", "cartao objetivos");
  reforco.id = "reforco";
  if (fracos.length > 0) {
    reforco.append(criar("h2", "", "Onde reforçar"));
    for (const dominio of fracos) {
      reforco.append(criar("p", "", dominio.nome + ": releia os módulos e refaça os quizzes."));
      const lista = criar("ul", "lista");
      for (const modulo of dados.modulos.filter((m) => m.dominio === dominio.id)) {
        const li = criar("li");
        const link = criar("a", "", modulo.titulo);
        link.href = "modulo.html?id=" + encodeURIComponent(modulo.id);
        li.append(link);
        lista.append(li);
      }
      reforco.append(lista);
    }
  } else {
    reforco.append(criar("h2", "", "Nenhum ponto fraco"), criar("p", "", "Você acertou todas as questões. Excelente!"));
  }
  area.append(reforco);

  area.append(criarRevisao(resultado));

  const acoes = criar("div", "acoes");
  const outro = criar("a", "botao", "Fazer outro simulado");
  outro.href = "simulado.html";
  const inicio = criar("a", "botao secundario", "Voltar ao início");
  inicio.href = "index.html";
  acoes.append(outro, inicio);
  area.append(acoes);
  window.scrollTo(0, 0);
}

function criarRevisao(resultado) {
  const bloco = criar("section", "cartao");
  bloco.id = "revisao";
  bloco.append(criar("h2", "", "Revisão das questões"));

  const erradas = resultado.questoes.filter((q) => !q.acertou);
  const filtros = criar("div", "filtros");
  const botaoErradas = criar("button", "filtro", "Erradas e em branco (" + erradas.length + ")");
  botaoErradas.type = "button";
  botaoErradas.dataset.filtro = "erradas";
  const botaoTodas = criar("button", "filtro", "Todas (" + resultado.questoes.length + ")");
  botaoTodas.type = "button";
  botaoTodas.dataset.filtro = "todas";
  filtros.append(botaoErradas, botaoTodas);

  const lista = criar("div", "lista-revisao");
  lista.id = "lista-revisao";

  function desenhar(filtro) {
    botaoErradas.setAttribute("aria-pressed", filtro === "erradas" ? "true" : "false");
    botaoTodas.setAttribute("aria-pressed", filtro === "todas" ? "true" : "false");
    lista.replaceChildren();
    const mostrar = filtro === "erradas" ? erradas : resultado.questoes;
    if (mostrar.length === 0) {
      lista.append(criar("p", "detalhe", "Nenhuma questão errada ou em branco. Parabéns!"));
      return;
    }
    for (const q of mostrar) {
      const item = criar("article", "item-revisao " + (q.acertou ? "acerto" : "falha"));
      item.append(
        criar(
          "p",
          "detalhe",
          "Questão " + q.numero + " · " + nomeDoDominio(q.item.dominio) + " · " + nomeDoModulo(q.item.modulo) +
            " · " + (q.acertou ? "Certa" : q.resposta === null ? "Em branco" : "Errada")
        ),
        criar("h3", "", q.pergunta.pergunta),
        criar(
          "p",
          q.acertou ? "resposta-certa" : "resposta-errada",
          "Sua resposta: " + (q.resposta === null ? "sem resposta" : q.pergunta.opcoes[q.resposta])
        )
      );
      if (!q.acertou) {
        item.append(criar("p", "resposta-certa", "Resposta correta: " + q.pergunta.opcoes[q.pergunta.correta]));
      }
      item.append(criar("p", "", q.pergunta.explicacao));
      lista.append(item);
    }
  }

  botaoErradas.addEventListener("click", () => desenhar("erradas"));
  botaoTodas.addEventListener("click", () => desenhar("todas"));
  desenhar(erradas.length > 0 ? "erradas" : "todas");

  bloco.append(filtros, lista);
  return bloco;
}

iniciar().catch(mostrarErro);
