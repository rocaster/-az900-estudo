// Funções usadas por todas as páginas.

// Busca um arquivo JSON e devolve os dados já convertidos.
async function carregarJson(caminho) {
  const resposta = await fetch(caminho);
  if (!resposta.ok) {
    throw new Error(t("erro.carregar", { caminho: caminho }));
  }
  return resposta.json();
}

// Cria um elemento HTML: criar("p", "texto-pequeno", "Olá")
// Usamos textContent (e não innerHTML) para o navegador tratar tudo como texto puro.
function criar(tag, classe, texto) {
  const elemento = document.createElement(tag);
  if (classe) elemento.className = classe;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

// Mostra uma mensagem de erro amigável na página.
function mostrarErro(erro) {
  const area = document.getElementById("conteudo");
  area.replaceChildren();
  const caixa = criar("div", "cartao erro");
  caixa.append(
    criar("h2", "", t("erro.titulo")),
    criar("p", "", t("erro.servidor")),
    criar("p", "detalhe", String(erro.message || erro))
  );
  area.append(caixa);
}

// Escreve o bloco "Prontidão estimada" dentro de um elemento (usado na página inicial e no simulado).
function desenharProntidao(alvo, prontidao) {
  alvo.replaceChildren();

  if (!prontidao.fonte) {
    alvo.append(criar("p", "detalhe", t("prontidao.vazia")));
    return;
  }

  const fraco =
    prontidao.fracos.length > 0
      ? t("prontidao.fraco", { nomes: prontidao.fracos.map((d) => d.nome).join(t("prontidao.e")) })
      : t("prontidao.semFraco");
  alvo.append(criar("p", "prontidao-linha", t("prontidao.linha", { p: prontidao.percentual, fraco: fraco })));

  const barra = criar("div", "barra");
  const preenchimento = criar("div", "barra-preenchida");
  preenchimento.style.width = prontidao.percentual + "%";
  barra.append(preenchimento);
  alvo.append(barra);

  const origem =
    prontidao.fonte === "simulados"
      ? t("prontidao.baseSimulados", { n: prontidao.quantidade })
      : t("prontidao.baseModulos");
  alvo.append(criar("p", "detalhe", t("prontidao.explicacao", { origem: origem })));
}

// Céu decorativo com nuvens flutuando (só visual; o CSS cuida da animação).
// Fica atrás do conteúdo e não recebe cliques.
function desenharCeu() {
  if (!document.body || document.querySelector(".ceu")) return;
  const ceu = criar("div", "ceu");
  ceu.setAttribute("aria-hidden", "true");
  ceu.appendChild(criar("span", "estrelas e1"));
  ceu.appendChild(criar("span", "estrelas e2"));
  const formatos = ["a", "b", "b", "a", "a", "b", "a", "b"];
  formatos.forEach((formato, i) => {
    ceu.appendChild(criar("span", "nuvem " + formato + " n" + (i + 1)));
  });
  document.body.prepend(ceu);
}

// A página avisa aqui o que redesenhar quando o idioma muda (PT | EN no cabeçalho).
function aoTrocarIdioma(funcao) {
  document.addEventListener("idioma-alterado", () => {
    Promise.resolve()
      .then(funcao)
      .catch(mostrarErro);
  });
}

aplicarTextosFixos();
desenharSeletorIdioma();
desenharCeu();
