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

// Escreve o bloco "Prontidão estimada" dentro de um elemento (usado na página inicial e no simulado).
function desenharProntidao(alvo, prontidao) {
  alvo.replaceChildren();

  if (!prontidao.fonte) {
    alvo.append(criar("p", "detalhe", "Faça um simulado para ver sua prontidão."));
    return;
  }

  const fraco =
    prontidao.fracos.length > 0
      ? " — ponto fraco: " + prontidao.fracos.map((d) => d.nome).join(" e ")
      : " — nenhum ponto fraco no momento";
  alvo.append(criar("p", "prontidao-linha", "Prontidão estimada: " + prontidao.percentual + "%" + fraco));

  const barra = criar("div", "barra");
  const preenchimento = criar("div", "barra-preenchida");
  preenchimento.style.width = prontidao.percentual + "%";
  barra.append(preenchimento);
  alvo.append(barra);

  const origem =
    prontidao.fonte === "simulados"
      ? "com base " +
        (prontidao.quantidade === 1 ? "no seu último simulado" : "nos seus últimos " + prontidao.quantidade + " simulados")
      : "com base nas notas dos quizzes dos módulos, porque você ainda não fez um simulado";
  alvo.append(
    criar(
      "p",
      "detalhe",
      "Média dos domínios ponderada pelo peso de cada um na prova, " +
        origem +
        ". É só uma estimativa para orientar o estudo, não uma previsão oficial."
    )
  );
}
