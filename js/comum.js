// Funções usadas por todas as páginas.

// Busca um arquivo JSON e devolve os dados já convertidos.
async function carregarJson(caminho) {
  const resposta = await fetch(caminho);
  if (!resposta.ok) {
    throw new Error("Não foi possível carregar " + caminho);
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
    criar("h2", "", "Ops, algo deu errado"),
    criar(
      "p",
      "",
      "Se você abriu o arquivo direto no navegador, tente abrir por um servidor local: " +
        "rode 'python3 -m http.server 8000' na pasta do projeto e acesse http://localhost:8000."
    ),
    criar("p", "detalhe", String(erro.message || erro))
  );
  area.append(caixa);
}
