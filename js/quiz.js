// Página do quiz: uma pergunta por vez, com explicação logo após cada resposta.

let idModulo = "";
let perguntas = [];
let posicao = 0;
let acertos = 0;

async function iniciar() {
  idModulo = new URLSearchParams(window.location.search).get("id");
  const todas = await carregarJson("data/perguntas.json");
  perguntas = todas[idModulo];

  if (!perguntas || perguntas.length === 0) {
    throw new Error("Não há perguntas para este módulo.");
  }

  mostrarPergunta();
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

function mostrarPergunta() {
  const pergunta = perguntas[posicao];
  const area = document.getElementById("conteudo");
  area.replaceChildren();

  const cartao = criar("div", "cartao");
  cartao.append(
    criar("p", "detalhe", "Pergunta " + (posicao + 1) + " de " + perguntas.length),
    criar("h2", "", pergunta.pergunta)
  );

  // Marcamos qual opção é a correta antes de embaralhar.
  const opcoes = embaralhar(
    pergunta.opcoes.map((texto, indice) => ({
      texto: texto,
      correta: indice === pergunta.correta,
    }))
  );

  const lista = criar("div", "opcoes");
  const retorno = criar("div", "retorno");

  for (const opcao of opcoes) {
    const botao = criar("button", "opcao", opcao.texto);
    botao.type = "button";
    botao.addEventListener("click", () =>
      responder(botao, opcao, lista, retorno, pergunta)
    );
    lista.append(botao);
  }

  cartao.append(lista, retorno);
  area.append(cartao);
}

function responder(botaoClicado, opcao, lista, retorno, pergunta) {
  // Trava todos os botões e mostra qual era a certa.
  const botoes = lista.querySelectorAll("button");
  botoes.forEach((b) => (b.disabled = true));

  if (opcao.correta) {
    acertos++;
    botaoClicado.classList.add("certa");
    retorno.append(criar("strong", "", "Isso mesmo! "));
  } else {
    botaoClicado.classList.add("errada");
    // Destaca a opção correta.
    botoes.forEach((b) => {
      if (b.textContent === pergunta.opcoes[pergunta.correta]) b.classList.add("certa");
    });
    retorno.append(criar("strong", "", "Não foi dessa vez. "));
  }

  retorno.append(criar("span", "", pergunta.explicacao));

  const ultima = posicao === perguntas.length - 1;
  const proxima = criar("button", "botao", ultima ? "Ver resultado" : "Próxima pergunta");
  proxima.type = "button";
  proxima.addEventListener("click", () => {
    if (ultima) {
      mostrarResultado();
    } else {
      posicao++;
      mostrarPergunta();
    }
  });
  retorno.append(proxima);
}

function mensagemPara(nota) {
  if (nota === 100) return "Perfeito! Esse assunto já está no bolso.";
  if (nota >= 70) return "Muito bem! Você está no caminho certo para a certificação.";
  if (nota >= 40) return "Bom começo. Releia o módulo e tente de novo para fixar.";
  return "Tudo bem, é assim que se aprende. Releia o módulo com calma e tente outra vez.";
}

function mostrarResultado() {
  const nota = registrarResultado(idModulo, acertos, perguntas.length);
  const area = document.getElementById("conteudo");
  area.replaceChildren();

  const cartao = criar("div", "cartao resultado");
  cartao.append(
    criar("h2", "", "Você acertou " + acertos + " de " + perguntas.length),
    criar("p", "nota", nota + "%"),
    criar("p", "", mensagemPara(nota))
  );

  const acoes = criar("div", "acoes");
  const refazer = criar("a", "botao", "Tentar de novo");
  refazer.href = "quiz.html?id=" + encodeURIComponent(idModulo);
  const revisar = criar("a", "botao secundario", "Reler o módulo");
  revisar.href = "modulo.html?id=" + encodeURIComponent(idModulo);
  const inicio = criar("a", "botao secundario", "Voltar ao início");
  inicio.href = "index.html";
  acoes.append(refazer, revisar, inicio);

  cartao.append(acoes);
  area.append(cartao);
}

iniciar().catch(mostrarErro);
