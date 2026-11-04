// Página do quiz: uma pergunta por vez, com explicação logo após cada resposta.

let idModulo = "";
let perguntas = [];
let posicao = 0;
let acertos = 0;
// Estado da tela atual, para redesenhar no outro idioma sem perder nada:
let ordemAtual = []; // ordem (embaralhada) das opções da pergunta atual, em índices do JSON
let respostaAtual = null; // índice escolhido na pergunta atual (null = ainda não respondeu)
let notaFinal = null; // preenchida quando o resultado aparece

async function carregarPerguntas() {
  const todas = await carregarJson(caminhoDados("perguntas.json"));
  perguntas = todas[idModulo];
  if (!perguntas || perguntas.length === 0) {
    throw new Error(t("quiz.semPerguntas"));
  }
}

async function iniciar() {
  idModulo = new URLSearchParams(window.location.search).get("id");
  await carregarPerguntas();
  novaPergunta();
}

// Troca de idioma: recarrega as perguntas no outro idioma (mesmos ids, mesma ordem e mesma
// resposta certa) e redesenha a tela atual, mantendo posição, acertos e resposta.
async function trocarIdiomaDoQuiz() {
  await carregarPerguntas();
  if (notaFinal !== null) {
    desenharResultado();
  } else {
    desenharPergunta();
  }
}

// Devolve uma cópia da lista em ordem aleatória (para a resposta certa não ficar sempre na mesma posição).
function embaralhar(lista) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function novaPergunta() {
  ordemAtual = embaralhar(perguntas[posicao].opcoes.map((_, indice) => indice));
  respostaAtual = null;
  desenharPergunta();
}

function desenharPergunta() {
  const pergunta = perguntas[posicao];
  const area = document.getElementById("conteudo");
  area.replaceChildren();

  const cartao = criar("div", "cartao");
  cartao.append(
    criar("p", "detalhe", t("quiz.contador", { n: posicao + 1, total: perguntas.length })),
    criar("h2", "", pergunta.pergunta)
  );

  const lista = criar("div", "opcoes");
  const retorno = criar("div", "retorno");

  for (const indice of ordemAtual) {
    const botao = criar("button", "opcao", pergunta.opcoes[indice]);
    botao.type = "button";
    botao.dataset.indice = String(indice);
    botao.addEventListener("click", () => responder(indice));
    lista.append(botao);
  }

  cartao.append(lista, retorno);
  area.append(cartao);

  if (respostaAtual !== null) mostrarCorrecao(lista, retorno, pergunta);
}

function responder(indice) {
  if (respostaAtual !== null) return;
  respostaAtual = indice;
  if (indice === perguntas[posicao].correta) acertos++;
  desenharPergunta();
}

function mostrarCorrecao(lista, retorno, pergunta) {
  // Trava todos os botões e mostra qual era a certa.
  const botoes = lista.querySelectorAll("button");
  botoes.forEach((b) => (b.disabled = true));
  const acertou = respostaAtual === pergunta.correta;

  botoes.forEach((b) => {
    const indice = Number(b.dataset.indice);
    if (indice === respostaAtual) b.classList.add(acertou ? "certa" : "errada");
    if (!acertou && indice === pergunta.correta) b.classList.add("certa");
  });
  retorno.append(criar("strong", "", acertou ? t("quiz.certo") : t("quiz.errado")));
  retorno.append(criar("span", "", pergunta.explicacao));

  const ultima = posicao === perguntas.length - 1;
  const proxima = criar("button", "botao", ultima ? t("quiz.verResultado") : t("quiz.proxima"));
  proxima.type = "button";
  proxima.addEventListener("click", () => {
    if (ultima) {
      mostrarResultado();
    } else {
      posicao++;
      novaPergunta();
    }
  });
  retorno.append(proxima);
}

function mensagemPara(nota) {
  if (nota === 100) return t("quiz.msg100");
  if (nota >= 70) return t("quiz.msg70");
  if (nota >= 40) return t("quiz.msg40");
  return t("quiz.msg0");
}

function mostrarResultado() {
  notaFinal = registrarResultado(idModulo, acertos, perguntas.length);
  desenharResultado();
}

function desenharResultado() {
  const nota = notaFinal;
  const area = document.getElementById("conteudo");
  area.replaceChildren();

  const cartao = criar("div", "cartao resultado");
  cartao.append(
    criar("h2", "", t("quiz.acertou", { acertos: acertos, total: perguntas.length })),
    criar("p", "nota", nota + "%"),
    criar("p", "", mensagemPara(nota))
  );

  const acoes = criar("div", "acoes");
  const refazer = criar("a", "botao", t("quiz.tentarDeNovo"));
  refazer.href = "quiz.html?id=" + encodeURIComponent(idModulo);
  const revisar = criar("a", "botao secundario", t("quiz.reler"));
  revisar.href = "modulo.html?id=" + encodeURIComponent(idModulo);
  const inicio = criar("a", "botao secundario", t("comum.voltarInicio"));
  inicio.href = "index.html";
  acoes.append(refazer, revisar, inicio);

  cartao.append(acoes);
  area.append(cartao);
}

aoTrocarIdioma(trocarIdiomaDoQuiz);
iniciar().catch(mostrarErro);
