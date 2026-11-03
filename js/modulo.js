// Página de um módulo: mostra o conteúdo e leva para o quiz.

async function iniciar() {
  // A URL é modulo.html?id=conceitos-nuvem. Aqui pegamos o valor depois de "id=".
  const id = new URLSearchParams(window.location.search).get("id");
  const dados = await carregarJson("data/modulos.json");
  const modulo = dados.modulos.find((m) => m.id === id);

  if (!modulo) {
    throw new Error("Módulo não encontrado.");
  }

  const dominio = dados.dominios.find((d) => d.id === modulo.dominio);
  document.title = modulo.titulo + " · Estudo AZ-900";

  const area = document.getElementById("conteudo");
  area.replaceChildren();

  area.append(
    criar("span", "etiqueta", dominio ? dominio.nome : ""),
    criar("h1", "", modulo.titulo)
  );

  for (const secao of modulo.conteudo) {
    const bloco = criar("section", "cartao");
    bloco.append(criar("h2", "", secao.titulo), criar("p", "", secao.texto));
    area.append(bloco);
  }

  const acoes = criar("div", "acoes");

  const botaoQuiz = criar("a", "botao", "Fazer o quiz deste módulo");
  botaoQuiz.href = "quiz.html?id=" + encodeURIComponent(modulo.id);

  const linkLearn = criar("a", "botao secundario", "Aprofundar no Microsoft Learn");
  linkLearn.href = modulo.learn;
  linkLearn.target = "_blank";
  linkLearn.rel = "noopener noreferrer";

  acoes.append(botaoQuiz, linkLearn);
  area.append(acoes);
}

iniciar().catch(mostrarErro);
