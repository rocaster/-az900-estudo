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
let tela = "inicio"; // "inicio", "prova" ou "resultado": o que está na tela (para trocar de idioma)
let provaCorrigida = null; // { prova, fim, automatico } do último simulado finalizado nesta visita

async function iniciar() {
  await carregarDados();

  const salva = lerProvaSalva();
  if (salva) {
    prova = salva;
    if (Date.now() >= fimDaProva()) {
      finalizar(true);
    } else {
      mostrarProva(t("sim.retomado"));
    }
    return;
  }
  mostrarInicio();
}

// Os dois idiomas têm os mesmos ids, a mesma ordem de opções e a mesma resposta certa,
// então o simulado salvo (que guarda só ids e índices) vale em qualquer idioma.
async function carregarDados() {
  [dados, banco] = await Promise.all([
    carregarJson(caminhoDados("modulos.json")),
    carregarJson(caminhoDados("perguntas.json")),
  ]);
}

// Troca de idioma: recarrega o conteúdo e redesenha a tela atual sem perder respostas,
// marcações, cronômetro nem o resultado que está aberto.
async function trocarIdiomaDoSimulado() {
  await carregarDados();
  if (tela === "prova" && prova) {
    const estavaConfirmando = confirmando;
    mostrarProva();
    if (estavaConfirmando) pedirConfirmacao();
  } else if (tela === "resultado" && provaCorrigida) {
    mostrarResultado(corrigir(provaCorrigida.prova, provaCorrigida.fim, provaCorrigida.automatico));
  } else {
    mostrarInicio();
  }
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
  return (Math.round(valor * 10) / 10).toLocaleString(localidade()) + "%";
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
  tela = "inicio";
  definirTitulo(t("titulo.simulado"));

  const total = Object.values(DISTRIBUICAO).reduce((soma, n) => soma + n, 0);
  area.append(criar("span", "etiqueta", t("sim.etiqueta")), criar("h1", "", t("sim.h1")));

  const regras = criar("section", "cartao objetivos");
  regras.append(criar("h2", "", t("sim.comoFunciona")));
  const lista = criar("ul", "lista");
  const itens = [
    t("sim.regra1", {
      total: total,
      lista: dados.dominios.map((d) => nomeDoDominio(d.id) + " (" + (DISTRIBUICAO[d.id] || 0) + ")").join(", "),
    }),
    t("sim.regra2"),
    t("sim.regra3"),
    t("sim.regra4"),
    t("sim.regra5"),
  ];
  for (const texto of itens) lista.append(criar("li", "", texto));
  regras.append(lista);

  const acoes = criar("div", "acoes");
  const comecar = criar("button", "botao", t("sim.comecar"));
  comecar.type = "button";
  comecar.id = "comecar";
  comecar.addEventListener("click", comecarProva);
  const voltar = criar("a", "botao secundario", t("comum.voltarInicio"));
  voltar.href = "index.html";
  acoes.append(comecar, voltar);
  regras.append(acoes);
  area.append(regras);

  const historico = lerHistoricoSimulados();
  const blocoProntidao = criar("section", "cartao");
  blocoProntidao.append(criar("h2", "", t("sim.suaProntidao")));
  const alvo = criar("div", "prontidao");
  blocoProntidao.append(alvo);
  area.append(blocoProntidao);
  desenharProntidao(alvo, calcularProntidao(dados, lerProgresso(), historico));

  area.append(criarHistorico(historico));
}

function criarHistorico(historico) {
  const bloco = criar("section", "cartao");
  bloco.id = "historico";
  bloco.append(criar("h2", "", t("sim.historico")));

  if (historico.length === 0) {
    bloco.append(criar("p", "detalhe", t("sim.historicoVazio")));
    return bloco;
  }

  const rolagem = criar("div", "tabela-rolagem");
  const tabela = criar("table", "tabela");
  const cabecalho = criar("tr");
  for (const titulo of [t("sim.colData"), t("sim.colNota"), t("sim.colResultado"), ...dados.dominios.map((d) => d.nome), t("sim.colDuracao")]) {
    cabecalho.append(criar("th", "", titulo));
  }
  const thead = criar("thead");
  thead.append(cabecalho);
  const tbody = criar("tbody");

  for (const tentativa of historico) {
    const linha = criar("tr");
    const data = new Date(tentativa.data);
    linha.append(
      criar("td", "", data.toLocaleString(localidade(), { dateStyle: "short", timeStyle: "short" })),
      criar("td", "numero", String(tentativa.nota)),
      criar("td", tentativa.aprovado ? "situacao aprovado" : "situacao ainda-nao", tentativa.aprovado ? t("sim.aprovado") : t("sim.aindaNao"))
    );
    for (const dominio of dados.dominios) {
      const valor = tentativa.dominios?.[dominio.id];
      linha.append(criar("td", "numero", valor ? valor.percentual + "%" : "—"));
    }
    linha.append(criar("td", "numero", formatarTempo(tentativa.duracaoMs) + (tentativa.automatico ? t("sim.tempoEsgotado") : "")));
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
  tela = "prova";
  definirTitulo(t("titulo.simuladoAndamento"));
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
  cronometro.setAttribute("aria-label", t("sim.tempoRestante"));
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
  navegador.append(criar("h2", "", t("sim.questoes")));
  const grade = criar("div", "navegador");
  grade.id = "navegador";
  const legenda = criar("p", "detalhe", t("sim.legenda"));
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
    mostrarAviso(t("sim.aviso5"));
  }
}

function atualizarResumo() {
  const total = prova.itens.length;
  const feitas = prova.respostas.filter((r) => r !== null).length;
  document.getElementById("contador").textContent = t("sim.contador", { n: prova.atual + 1, total: total });
  document.getElementById("respondidas").textContent = t("sim.respondidas", { feitas: feitas, total: total });

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
      t("sim.navRotulo", {
        n: i + 1,
        estado: respondida ? t("sim.navRespondida") : t("sim.navSemResposta"),
        marcada: marcada ? t("sim.navMarcada") : "",
      })
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
    criar("p", "detalhe", t("sim.contador", { n: i + 1, total: prova.itens.length }) + (prova.marcadas[i] ? t("sim.marcadaRevisao") : "")),
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
  const anterior = criar("button", "botao secundario", t("sim.anterior"));
  anterior.type = "button";
  anterior.id = "anterior";
  anterior.disabled = i === 0;
  anterior.addEventListener("click", () => irPara(i - 1));

  const ultima = i === prova.itens.length - 1;
  const proxima = criar("button", "botao", ultima ? t("sim.revisarFinalizar") : t("sim.proxima"));
  proxima.type = "button";
  proxima.id = "proxima";
  proxima.addEventListener("click", () => (ultima ? pedirConfirmacao() : irPara(i + 1)));

  const marcar = criar("button", "botao secundario", prova.marcadas[i] ? t("sim.desmarcar") : t("sim.marcar"));
  marcar.type = "button";
  marcar.id = "marcar";
  marcar.setAttribute("aria-pressed", prova.marcadas[i] ? "true" : "false");
  marcar.addEventListener("click", () => {
    prova.marcadas[i] = !prova.marcadas[i];
    salvarProva();
    desenharQuestao();
  });

  const terminar = criar("button", "botao secundario", t("sim.finalizar"));
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

  area.append(criar("h2", "", t("sim.confirmarTitulo")));
  area.append(criar("p", "", t("sim.confirmarRespondidas", { feitas: total - semResposta, total: total })));
  if (semResposta > 0) {
    area.append(criar("p", "alerta-texto", t("sim.confirmarSemResposta", { n: semResposta })));
  }
  if (marcadas > 0) {
    area.append(criar("p", "", t("sim.confirmarMarcadas", { n: marcadas })));
  }
  area.append(criar("p", "detalhe", t("sim.confirmarAviso")));

  const acoes = criar("div", "acoes");
  const confirmar = criar("button", "botao", t("sim.finalizarAgora"));
  confirmar.type = "button";
  confirmar.id = "confirmar-finalizar";
  confirmar.addEventListener("click", () => finalizar(false));
  const voltar = criar("button", "botao secundario", t("sim.voltarSimulado"));
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
  provaCorrigida = { prova: prova, fim: fim, automatico: automatico };
  prova = null;
  mostrarResultado(resultado);
}

function mostrarResultado(resultado) {
  const area = document.getElementById("conteudo");
  area.replaceChildren();
  tela = "resultado";
  definirTitulo(t("titulo.simuladoResultado"));

  // Placar geral
  const placar = criar("section", "cartao resultado");
  placar.id = "resultado";
  placar.append(criar("h1", "", t("sim.resultadoTitulo")));
  if (resultado.automatico) {
    placar.append(criar("p", "alerta-texto", t("sim.enviadoAuto")));
  }
  const nota = criar("p", "nota", String(resultado.nota));
  nota.id = "nota";
  nota.append(criar("span", "nota-escala", " / 1000"));
  placar.append(
    nota,
    criar("p", resultado.aprovado ? "situacao aprovado" : "situacao ainda-nao", resultado.aprovado ? t("sim.aprovado") : t("sim.aindaNao")),
    criar(
      "p",
      "",
      t("sim.acertos", {
        acertos: resultado.acertos,
        total: resultado.total,
        pct: formatarPercentual((resultado.acertos / resultado.total) * 100),
        minimo: NOTA_APROVACAO,
      })
    ),
    criar("p", "detalhe", t("sim.tempoUsado", { usado: formatarTempo(resultado.duracaoMs), total: formatarTempo(DURACAO_MS) })),
    criar("p", "detalhe", t("sim.notaExplicacao", { total: resultado.total }))
  );
  area.append(placar);

  // Desempenho por domínio
  const dominiosFeitos = dados.dominios.filter((d) => resultado.dominios[d.id]);
  const menor = Math.min(...dominiosFeitos.map((d) => resultado.dominios[d.id].percentual));
  const fracos = menor < 100 ? dominiosFeitos.filter((d) => resultado.dominios[d.id].percentual === menor) : [];

  const blocoDominios = criar("section", "cartao");
  blocoDominios.id = "por-dominio";
  blocoDominios.append(criar("h2", "", t("sim.porDominio")));
  for (const dominio of dominiosFeitos) {
    const placarDominio = resultado.dominios[dominio.id];
    const fraco = fracos.includes(dominio);
    const linha = criar("div", "dominio" + (fraco ? " fraco" : ""));
    linha.dataset.dominio = dominio.id;
    const topo = criar("div", "dominio-topo");
    topo.append(criar("strong", "", dominio.nome));
    if (fraco) topo.append(criar("span", "selo-fraco", t("sim.pontoFraco")));
    topo.append(
      criar("span", "peso", t("sim.deTotal", { acertos: placarDominio.acertos, total: placarDominio.total })),
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
    reforco.append(criar("h2", "", t("sim.ondeReforcar")));
    for (const dominio of fracos) {
      reforco.append(criar("p", "", t("sim.reforcarTexto", { dominio: dominio.nome })));
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
    reforco.append(criar("h2", "", t("sim.nenhumFraco")), criar("p", "", t("sim.tudoCerto")));
  }
  area.append(reforco);

  area.append(criarRevisao(resultado));

  const acoes = criar("div", "acoes");
  const outro = criar("a", "botao", t("sim.outro"));
  outro.href = "simulado.html";
  const inicio = criar("a", "botao secundario", t("comum.voltarInicio"));
  inicio.href = "index.html";
  acoes.append(outro, inicio);
  area.append(acoes);
  window.scrollTo(0, 0);
}

function criarRevisao(resultado) {
  const bloco = criar("section", "cartao");
  bloco.id = "revisao";
  bloco.append(criar("h2", "", t("sim.revisao")));

  const erradas = resultado.questoes.filter((q) => !q.acertou);
  const filtros = criar("div", "filtros");
  const botaoErradas = criar("button", "filtro", t("sim.filtroErradas", { n: erradas.length }));
  botaoErradas.type = "button";
  botaoErradas.dataset.filtro = "erradas";
  const botaoTodas = criar("button", "filtro", t("sim.filtroTodas", { n: resultado.questoes.length }));
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
      lista.append(criar("p", "detalhe", t("sim.nenhumaErrada")));
      return;
    }
    for (const q of mostrar) {
      const item = criar("article", "item-revisao " + (q.acertou ? "acerto" : "falha"));
      item.append(
        criar(
          "p",
          "detalhe",
          t("sim.itemCabecalho", {
            n: q.numero,
            dominio: nomeDoDominio(q.item.dominio),
            modulo: nomeDoModulo(q.item.modulo),
            situacao: q.acertou ? t("sim.certa") : q.resposta === null ? t("sim.emBranco") : t("sim.errada"),
          })
        ),
        criar("h3", "", q.pergunta.pergunta),
        criar(
          "p",
          q.acertou ? "resposta-certa" : "resposta-errada",
          t("sim.suaResposta", { resposta: q.resposta === null ? t("sim.semResposta") : q.pergunta.opcoes[q.resposta] })
        )
      );
      if (!q.acertou) {
        item.append(criar("p", "resposta-certa", t("sim.respostaCorreta", { resposta: q.pergunta.opcoes[q.pergunta.correta] })));
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

aoTrocarIdioma(trocarIdiomaDoSimulado);
iniciar().catch(mostrarErro);
