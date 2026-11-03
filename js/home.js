// Página inicial: mostra o progresso por domínio e a lista de módulos.

async function iniciar() {
  const dados = await carregarJson("data/modulos.json");
  const progresso = lerProgresso();
  desenharDominios(dados, progresso);
  desenharModulos(dados, progresso);
}

function desenharDominios(dados, progresso) {
  const area = document.getElementById("dominios");
  area.replaceChildren();

  for (const dominio of dados.dominios) {
    const modulos = dados.modulos.filter((m) => m.dominio === dominio.id);
    const percentual = percentualDoDominio(modulos, progresso);

    const linha = criar("div", "dominio");
    const cabecalho = criar("div", "dominio-topo");
    cabecalho.append(
      criar("strong", "", dominio.nome),
      criar("span", "peso", "Peso na prova: " + dominio.peso),
      criar("span", "percentual", percentual + "%")
    );

    const barra = criar("div", "barra");
    const preenchimento = criar("div", "barra-preenchida");
    preenchimento.style.width = percentual + "%";
    barra.append(preenchimento);

    linha.append(cabecalho, barra);
    area.append(linha);
  }
}

function desenharModulos(dados, progresso) {
  const area = document.getElementById("modulos");
  area.replaceChildren();

  for (const modulo of dados.modulos) {
    const dominio = dados.dominios.find((d) => d.id === modulo.dominio);
    const feito = progresso[modulo.id];

    const cartao = criar("a", "cartao modulo");
    cartao.href = "modulo.html?id=" + encodeURIComponent(modulo.id);

    const estado = feito
      ? "Melhor nota: " + feito.melhorNota + "%"
      : "Ainda não iniciado";

    cartao.append(
      criar("span", "etiqueta", dominio ? dominio.nome : ""),
      criar("h3", "", modulo.titulo),
      criar("p", "", modulo.resumo),
      criar("p", "detalhe", "~" + modulo.minutos + " min · " + estado)
    );
    area.append(cartao);
  }
}

iniciar().catch(mostrarErro);
