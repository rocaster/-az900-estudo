// Página inicial: mostra o progresso por domínio e os módulos agrupados por domínio.

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

// Os módulos aparecem separados por domínio, na ordem e com o peso da prova.
function desenharModulos(dados, progresso) {
  const area = document.getElementById("modulos");
  area.replaceChildren();

  for (const dominio of dados.dominios) {
    const modulos = dados.modulos.filter((m) => m.dominio === dominio.id);
    if (modulos.length === 0) continue;

    const grupo = criar("section", "grupo");
    grupo.append(criar("h3", "grupo-titulo", dominio.nome + " · " + dominio.peso + " da prova"));

    const grade = criar("div", "grade");
    for (const modulo of modulos) {
      const feito = progresso[modulo.id];

      const cartao = criar("a", "cartao modulo");
      cartao.href = "modulo.html?id=" + encodeURIComponent(modulo.id);

      const estado = feito
        ? "Melhor nota: " + feito.melhorNota + "%"
        : "Ainda não iniciado";

      cartao.append(
        criar("h4", "", modulo.titulo),
        criar("p", "", modulo.resumo),
        criar("p", "detalhe", "~" + modulo.minutos + " min · " + estado)
      );
      grade.append(cartao);
    }

    grupo.append(grade);
    area.append(grupo);
  }
}

iniciar().catch(mostrarErro);
