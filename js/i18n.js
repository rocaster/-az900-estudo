// Idiomas do site: português (padrão) e inglês.
// Este arquivo é carregado no <head> de todas as páginas, antes dos outros scripts.
//
// Como o idioma é escolhido, nesta ordem:
//   1. ?lang=pt ou ?lang=en na URL (e a escolha fica salva);
//   2. a escolha salva no navegador (localStorage, chave "az900-idioma");
//   3. o idioma do navegador: começa com "pt" → português; qualquer outro → inglês.
//
// Para traduzir um texto novo: adicione a mesma chave em TEXTOS.pt e TEXTOS.en e use t("chave").
// Textos com {nome} recebem valores: t("quiz.contador", { n: 1, total: 8 }).
// Um valor também pode ser uma função, para plurais: (p) => (p.n === 1 ? "..." : "...").

const CHAVE_IDIOMA = "az900-idioma";
const IDIOMAS = {
  pt: { html: "pt-BR", local: "pt-BR", nome: "Português", sigla: "PT" },
  en: { html: "en", local: "en-US", nome: "English", sigla: "EN" },
};

const TEXTOS = {
  pt: {
    "marca": "Estudo AZ-900",
    "titulo.sufixo": "Estudo AZ-900",
    "titulo.home": "Estudo AZ-900",
    "titulo.modulo": "Módulo",
    "titulo.quiz": "Quiz",
    "titulo.simulado": "Simulado",
    "titulo.simuladoAndamento": "Simulado em andamento",
    "titulo.simuladoResultado": "Resultado do simulado",
    "meta.descricao": "Ferramenta gratuita e aberta para estudar para a certificação Microsoft Azure Fundamentals (AZ-900).",
    "idioma.grupo": "Idioma",
    "carregando": "Carregando…",

    "erro.titulo": "Ops, algo deu errado",
    "erro.servidor":
      "Se você abriu o arquivo direto no navegador, tente abrir por um servidor local: " +
      "rode 'python3 -m http.server 8000' na pasta do projeto e acesse http://localhost:8000.",
    "erro.carregar": "Não foi possível carregar {caminho}",

    "home.h1": "Sua jornada até a AZ-900",
    "home.abertura":
      "Estude um módulo, teste o que aprendeu e acompanhe seu progresso em cada domínio da prova. Gratuito e feito pela comunidade.",
    "home.simuladoTitulo": "Simulado",
    "home.simuladoTexto": "40 questões em 45 minutos, sorteadas na proporção do peso de cada domínio, como na prova.",
    "home.simuladoBotao": "Fazer o simulado",
    "home.progressoTitulo": "Seu progresso por domínio",
    "home.modulosTitulo": "Módulos",
    "home.peso": "Peso na prova: {peso}",
    "home.grupo": "{dominio} · {peso} da prova",
    "home.melhorNota": "Melhor nota: {nota}%",
    "home.naoIniciado": "Ainda não iniciado",
    "home.minutos": "~{min} min · {estado}",
    "rodape.texto": "Projeto independente da comunidade, sem vínculo com a Microsoft. Conteúdo de apoio no",
    "rodape.link": "Microsoft Learn",
    "rodape.url": "https://learn.microsoft.com/pt-br/credentials/certifications/resources/study-guides/az-900",

    "prontidao.vazia": "Faça um simulado para ver sua prontidão.",
    "prontidao.linha": "Prontidão estimada: {p}%{fraco}",
    "prontidao.fraco": " — ponto fraco: {nomes}",
    "prontidao.semFraco": " — nenhum ponto fraco no momento",
    "prontidao.e": " e ",
    "prontidao.baseSimulados": (p) =>
      p.n === 1 ? "com base no seu último simulado" : "com base nos seus últimos " + p.n + " simulados",
    "prontidao.baseModulos": "com base nas notas dos quizzes dos módulos, porque você ainda não fez um simulado",
    "prontidao.explicacao":
      "Média dos domínios ponderada pelo peso de cada um na prova, {origem}. É só uma estimativa para orientar o estudo, não uma previsão oficial.",

    "modulo.naoEncontrado": "Módulo não encontrado.",
    "modulo.objetivos": "O que você precisa saber",
    "modulo.fazerQuiz": "Fazer o quiz deste módulo",
    "modulo.learn": "Aprofundar no Microsoft Learn",

    "quiz.semPerguntas": "Não há perguntas para este módulo.",
    "quiz.contador": "Pergunta {n} de {total}",
    "quiz.certo": "Isso mesmo! ",
    "quiz.errado": "Não foi dessa vez. ",
    "quiz.verResultado": "Ver resultado",
    "quiz.proxima": "Próxima pergunta",
    "quiz.msg100": "Perfeito! Esse assunto já está no bolso.",
    "quiz.msg70": "Muito bem! Você está no caminho certo para a certificação.",
    "quiz.msg40": "Bom começo. Releia o módulo e tente de novo para fixar.",
    "quiz.msg0": "Tudo bem, é assim que se aprende. Releia o módulo com calma e tente outra vez.",
    "quiz.acertou": "Você acertou {acertos} de {total}",
    "quiz.tentarDeNovo": "Tentar de novo",
    "quiz.reler": "Reler o módulo",
    "comum.voltarInicio": "Voltar ao início",

    "sim.etiqueta": "Simulado",
    "sim.h1": "Simulado AZ-900",
    "sim.comoFunciona": "Como funciona",
    "sim.regra1": "{total} questões sorteadas do banco do site, na proporção do peso de cada domínio na prova: {lista}.",
    "sim.regra2":
      "45 minutos, com cronômetro na tela e aviso quando faltarem 5 minutos. Quando o tempo acabar, o simulado é enviado automaticamente.",
    "sim.regra3": "Uma questão por vez. Você pode voltar, pular e marcar questões para revisar antes de finalizar.",
    "sim.regra4": "Nenhuma correção durante a prova: o resultado, por domínio, e a revisão de cada questão aparecem no final.",
    "sim.regra5": "Nota estimada de 0 a 1000, proporcional aos acertos. Para ser aprovado na prova real, a Microsoft exige 700.",
    "sim.comecar": "Começar simulado",
    "sim.suaProntidao": "Sua prontidão",
    "sim.retomado": "Seu simulado em andamento foi retomado. O cronômetro continuou correndo.",
    "sim.historico": "Seus últimos simulados",
    "sim.historicoVazio": "Você ainda não fez nenhum simulado. Os 10 últimos vão aparecer aqui.",
    "sim.colData": "Data",
    "sim.colNota": "Nota",
    "sim.colResultado": "Resultado",
    "sim.colDuracao": "Duração",
    "sim.aprovado": "Aprovado",
    "sim.aindaNao": "Ainda não",
    "sim.tempoEsgotado": " (tempo esgotado)",
    "sim.tempoRestante": "Tempo restante",
    "sim.questoes": "Questões",
    "sim.legenda":
      "Azul: respondida. Contorno: sem resposta. ⚑: marcada para revisão. Toque em um número para ir até a questão.",
    "sim.aviso5":
      "Atenção: faltam 5 minutos ou menos. Quando o tempo acabar, o simulado será enviado automaticamente.",
    "sim.contador": "Questão {n} de {total}",
    "sim.respondidas": "Respondidas: {feitas}/{total}",
    "sim.navRotulo": "Questão {n}, {estado}{marcada}",
    "sim.navRespondida": "respondida",
    "sim.navSemResposta": "sem resposta",
    "sim.navMarcada": ", marcada para revisão",
    "sim.marcadaRevisao": " · ⚑ marcada para revisão",
    "sim.anterior": "← Anterior",
    "sim.proxima": "Próxima →",
    "sim.revisarFinalizar": "Revisar e finalizar",
    "sim.marcar": "⚑ Marcar para revisão",
    "sim.desmarcar": "⚑ Desmarcar revisão",
    "sim.finalizar": "Finalizar simulado",
    "sim.confirmarTitulo": "Finalizar o simulado?",
    "sim.confirmarRespondidas": "Você respondeu {feitas} de {total} questões.",
    "sim.confirmarSemResposta": (p) =>
      p.n === 1
        ? "1 questão está sem resposta e vai contar como errada."
        : p.n + " questões estão sem resposta e vão contar como erradas.",
    "sim.confirmarMarcadas": (p) =>
      p.n === 1 ? "1 questão está marcada para revisão." : p.n + " questões estão marcadas para revisão.",
    "sim.confirmarAviso": "Depois de finalizar, não dá para mudar as respostas.",
    "sim.finalizarAgora": "Finalizar agora",
    "sim.voltarSimulado": "Voltar ao simulado",
    "sim.resultadoTitulo": "Resultado do simulado",
    "sim.enviadoAuto": "O tempo acabou e o simulado foi enviado automaticamente.",
    "sim.acertos": "Você acertou {acertos} de {total} ({pct}). Nota mínima para aprovação: {minimo}.",
    "sim.tempoUsado": "Tempo usado: {usado} de {total}.",
    "sim.notaExplicacao":
      "Nota estimada: proporcional aos acertos (acertos ÷ {total} × 1000). Não é a escala oficial da Microsoft, " +
      "que calcula a nota de outro jeito. Use como referência de estudo.",
    "sim.porDominio": "Desempenho por domínio",
    "sim.pontoFraco": "Ponto fraco",
    "sim.deTotal": "{acertos} de {total}",
    "sim.ondeReforcar": "Onde reforçar",
    "sim.reforcarTexto": "{dominio}: releia os módulos e refaça os quizzes.",
    "sim.nenhumFraco": "Nenhum ponto fraco",
    "sim.tudoCerto": "Você acertou todas as questões. Excelente!",
    "sim.outro": "Fazer outro simulado",
    "sim.revisao": "Revisão das questões",
    "sim.filtroErradas": "Erradas e em branco ({n})",
    "sim.filtroTodas": "Todas ({n})",
    "sim.nenhumaErrada": "Nenhuma questão errada ou em branco. Parabéns!",
    "sim.itemCabecalho": "Questão {n} · {dominio} · {modulo} · {situacao}",
    "sim.certa": "Certa",
    "sim.emBranco": "Em branco",
    "sim.errada": "Errada",
    "sim.suaResposta": "Sua resposta: {resposta}",
    "sim.semResposta": "sem resposta",
    "sim.respostaCorreta": "Resposta correta: {resposta}",
  },

  en: {
    "marca": "AZ-900 Study",
    "titulo.sufixo": "AZ-900 Study",
    "titulo.home": "AZ-900 Study",
    "titulo.modulo": "Module",
    "titulo.quiz": "Quiz",
    "titulo.simulado": "Practice exam",
    "titulo.simuladoAndamento": "Practice exam in progress",
    "titulo.simuladoResultado": "Practice exam results",
    "meta.descricao": "A free, open tool to study for the Microsoft Azure Fundamentals (AZ-900) certification.",
    "idioma.grupo": "Language",
    "carregando": "Loading…",

    "erro.titulo": "Oops, something went wrong",
    "erro.servidor":
      "If you opened the file directly in the browser, try opening it through a local server: " +
      "run 'python3 -m http.server 8000' in the project folder and go to http://localhost:8000.",
    "erro.carregar": "Couldn't load {caminho}",

    "home.h1": "Your path to AZ-900",
    "home.abertura":
      "Study a module, test what you learned, and track your progress in each exam domain. Free and community-made.",
    "home.simuladoTitulo": "Practice exam",
    "home.simuladoTexto": "40 questions in 45 minutes, drawn in proportion to each domain's weight, just like the exam.",
    "home.simuladoBotao": "Take the practice exam",
    "home.progressoTitulo": "Your progress by domain",
    "home.modulosTitulo": "Modules",
    "home.peso": "Exam weight: {peso}",
    "home.grupo": "{dominio} · {peso} of the exam",
    "home.melhorNota": "Best score: {nota}%",
    "home.naoIniciado": "Not started yet",
    "home.minutos": "~{min} min · {estado}",
    "rodape.texto": "An independent community project, not affiliated with Microsoft. Supporting content on",
    "rodape.link": "Microsoft Learn",
    "rodape.url": "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-900",

    "prontidao.vazia": "Take a practice exam to see your readiness.",
    "prontidao.linha": "Estimated readiness: {p}%{fraco}",
    "prontidao.fraco": " — weak spot: {nomes}",
    "prontidao.semFraco": " — no weak spots right now",
    "prontidao.e": " and ",
    "prontidao.baseSimulados": (p) =>
      p.n === 1 ? "based on your latest practice exam" : "based on your last " + p.n + " practice exams",
    "prontidao.baseModulos": "based on your module quiz scores, because you haven't taken a practice exam yet",
    "prontidao.explicacao":
      "Average of the domains weighted by each one's exam weight, {origem}. It's only an estimate to guide your study, not an official prediction.",

    "modulo.naoEncontrado": "Module not found.",
    "modulo.objetivos": "What you need to know",
    "modulo.fazerQuiz": "Take this module's quiz",
    "modulo.learn": "Go deeper on Microsoft Learn",

    "quiz.semPerguntas": "There are no questions for this module.",
    "quiz.contador": "Question {n} of {total}",
    "quiz.certo": "That's right! ",
    "quiz.errado": "Not this time. ",
    "quiz.verResultado": "See results",
    "quiz.proxima": "Next question",
    "quiz.msg100": "Perfect! You've got this topic down.",
    "quiz.msg70": "Well done! You're on the right track for the certification.",
    "quiz.msg40": "Good start. Reread the module and try again to make it stick.",
    "quiz.msg0": "That's okay, this is how you learn. Reread the module calmly and try again.",
    "quiz.acertou": "You got {acertos} of {total} right",
    "quiz.tentarDeNovo": "Try again",
    "quiz.reler": "Reread the module",
    "comum.voltarInicio": "Back to home",

    "sim.etiqueta": "Practice exam",
    "sim.h1": "AZ-900 practice exam",
    "sim.comoFunciona": "How it works",
    "sim.regra1": "{total} questions drawn from the site's question bank, in proportion to each domain's exam weight: {lista}.",
    "sim.regra2":
      "45 minutes, with an on-screen timer and a warning when 5 minutes are left. When time runs out, the exam is submitted automatically.",
    "sim.regra3": "One question at a time. You can go back, skip, and flag questions for review before you finish.",
    "sim.regra4": "No grading during the exam: your results by domain and a review of each question appear at the end.",
    "sim.regra5": "Estimated score from 0 to 1000, proportional to correct answers. To pass the real exam, Microsoft requires 700.",
    "sim.comecar": "Start practice exam",
    "sim.suaProntidao": "Your readiness",
    "sim.retomado": "Your practice exam in progress was resumed. The timer kept running.",
    "sim.historico": "Your recent practice exams",
    "sim.historicoVazio": "You haven't taken a practice exam yet. Your last 10 will appear here.",
    "sim.colData": "Date",
    "sim.colNota": "Score",
    "sim.colResultado": "Result",
    "sim.colDuracao": "Duration",
    "sim.aprovado": "Passed",
    "sim.aindaNao": "Not yet",
    "sim.tempoEsgotado": " (time ran out)",
    "sim.tempoRestante": "Time remaining",
    "sim.questoes": "Questions",
    "sim.legenda":
      "Blue: answered. Outline: unanswered. ⚑: flagged for review. Tap a number to go to that question.",
    "sim.aviso5": "Heads up: 5 minutes or less remaining. When time runs out, the exam will be submitted automatically.",
    "sim.contador": "Question {n} of {total}",
    "sim.respondidas": "Answered: {feitas}/{total}",
    "sim.navRotulo": "Question {n}, {estado}{marcada}",
    "sim.navRespondida": "answered",
    "sim.navSemResposta": "unanswered",
    "sim.navMarcada": ", flagged for review",
    "sim.marcadaRevisao": " · ⚑ flagged for review",
    "sim.anterior": "← Previous",
    "sim.proxima": "Next →",
    "sim.revisarFinalizar": "Review and finish",
    "sim.marcar": "⚑ Flag for review",
    "sim.desmarcar": "⚑ Remove flag",
    "sim.finalizar": "Finish exam",
    "sim.confirmarTitulo": "Finish the practice exam?",
    "sim.confirmarRespondidas": "You answered {feitas} of {total} questions.",
    "sim.confirmarSemResposta": (p) =>
      p.n === 1 ? "1 question is unanswered and will count as wrong." : p.n + " questions are unanswered and will count as wrong.",
    "sim.confirmarMarcadas": (p) =>
      p.n === 1 ? "1 question is flagged for review." : p.n + " questions are flagged for review.",
    "sim.confirmarAviso": "Once you finish, you can't change your answers.",
    "sim.finalizarAgora": "Finish now",
    "sim.voltarSimulado": "Back to the exam",
    "sim.resultadoTitulo": "Practice exam results",
    "sim.enviadoAuto": "Time ran out and the exam was submitted automatically.",
    "sim.acertos": "You got {acertos} of {total} right ({pct}). Passing score: {minimo}.",
    "sim.tempoUsado": "Time used: {usado} of {total}.",
    "sim.notaExplicacao":
      "Estimated score: proportional to correct answers (correct ÷ {total} × 1000). This isn't Microsoft's official scale, " +
      "which calculates the score differently. Use it as a study reference.",
    "sim.porDominio": "Performance by domain",
    "sim.pontoFraco": "Weak spot",
    "sim.deTotal": "{acertos} of {total}",
    "sim.ondeReforcar": "Where to improve",
    "sim.reforcarTexto": "{dominio}: reread the modules and retake the quizzes.",
    "sim.nenhumFraco": "No weak spots",
    "sim.tudoCerto": "You got every question right. Excellent!",
    "sim.outro": "Take another practice exam",
    "sim.revisao": "Question review",
    "sim.filtroErradas": "Wrong and unanswered ({n})",
    "sim.filtroTodas": "All ({n})",
    "sim.nenhumaErrada": "No wrong or unanswered questions. Congratulations!",
    "sim.itemCabecalho": "Question {n} · {dominio} · {modulo} · {situacao}",
    "sim.certa": "Correct",
    "sim.emBranco": "Unanswered",
    "sim.errada": "Wrong",
    "sim.suaResposta": "Your answer: {resposta}",
    "sim.semResposta": "no answer",
    "sim.respostaCorreta": "Correct answer: {resposta}",
  },
};

function lerIdiomaSalvo() {
  try {
    return localStorage.getItem(CHAVE_IDIOMA);
  } catch (erro) {
    return null;
  }
}

function salvarIdioma(codigo) {
  try {
    localStorage.setItem(CHAVE_IDIOMA, codigo);
  } catch (erro) {
    // Sem armazenamento, o idioma vale só para esta página.
  }
}

function escolherIdiomaInicial() {
  const daUrl = new URLSearchParams(window.location.search).get("lang");
  if (daUrl && IDIOMAS[daUrl.toLowerCase()]) {
    const codigo = daUrl.toLowerCase();
    salvarIdioma(codigo);
    return codigo;
  }
  const salvo = lerIdiomaSalvo();
  if (salvo && IDIOMAS[salvo]) return salvo;
  const doNavegador = (navigator.language || "").toLowerCase();
  return doNavegador.startsWith("pt") ? "pt" : "en";
}

let idiomaAtual = escolherIdiomaInicial();

function idioma() {
  return idiomaAtual;
}

// Localidade para datas e números: "pt-BR" ou "en-US".
function localidade() {
  return IDIOMAS[idiomaAtual].local;
}

// Texto traduzido. Se a chave faltar no idioma atual, usa o português.
function t(chave, valores) {
  let texto = TEXTOS[idiomaAtual][chave];
  if (texto === undefined) texto = TEXTOS.pt[chave];
  if (texto === undefined) return chave;
  if (typeof texto === "function") return texto(valores || {});
  if (!valores) return texto;
  return texto.replace(/\{(\w+)\}/g, (inteiro, nome) => (nome in valores ? String(valores[nome]) : inteiro));
}

// Caminho do arquivo de dados no idioma atual: data/modulos.json ou data/en/modulos.json.
function caminhoDados(arquivo) {
  return idiomaAtual === "pt" ? "data/" + arquivo : "data/" + idiomaAtual + "/" + arquivo;
}

// Título da aba: "Simulado · Estudo AZ-900" (ou só o nome do site).
function definirTitulo(texto) {
  const sufixo = t("titulo.sufixo");
  document.title = texto && texto !== sufixo ? texto + " · " + sufixo : sufixo;
}

// Preenche os textos fixos do HTML marcados com data-i18n (texto), data-i18n-href e data-i18n-content.
function aplicarTextosFixos() {
  document.documentElement.lang = IDIOMAS[idiomaAtual].html;
  for (const el of document.querySelectorAll("[data-i18n]")) el.textContent = t(el.dataset.i18n);
  for (const el of document.querySelectorAll("[data-i18n-href]")) el.href = t(el.dataset.i18nHref);
  for (const el of document.querySelectorAll("[data-i18n-content]")) el.content = t(el.dataset.i18nContent);
  const tituloInicial = document.documentElement.dataset.titulo;
  if (tituloInicial) definirTitulo(t(tituloInicial));
}

// Troca o idioma sem recarregar: salva, atualiza os textos fixos e avisa a página
// (cada página redesenha o que estiver na tela, sem perder respostas).
function trocarIdioma(codigo) {
  if (!IDIOMAS[codigo] || codigo === idiomaAtual) return;
  idiomaAtual = codigo;
  salvarIdioma(codigo);

  // Se a URL tinha ?lang=..., atualiza para o idioma novo (o link continua valendo).
  const url = new URL(window.location.href);
  if (url.searchParams.has("lang")) {
    url.searchParams.set("lang", codigo);
    history.replaceState(history.state, "", url);
  }

  aplicarTextosFixos();
  atualizarSeletorIdioma();
  document.dispatchEvent(new CustomEvent("idioma-alterado", { detail: { idioma: codigo } }));
}

// Botões PT | EN no cabeçalho.
function desenharSeletorIdioma() {
  const alvo = document.querySelector(".idiomas");
  if (!alvo) return;
  alvo.replaceChildren();
  alvo.setAttribute("role", "group");
  for (const [codigo, info] of Object.entries(IDIOMAS)) {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "idioma";
    botao.dataset.idioma = codigo;
    botao.lang = info.html;
    botao.textContent = info.sigla;
    botao.setAttribute("aria-label", info.nome);
    botao.title = info.nome;
    botao.addEventListener("click", () => trocarIdioma(codigo));
    alvo.append(botao);
  }
  atualizarSeletorIdioma();
}

function atualizarSeletorIdioma() {
  const alvo = document.querySelector(".idiomas");
  if (!alvo) return;
  alvo.setAttribute("aria-label", t("idioma.grupo"));
  for (const botao of alvo.querySelectorAll("button.idioma")) {
    botao.setAttribute("aria-pressed", botao.dataset.idioma === idiomaAtual ? "true" : "false");
  }
}

// Já no <head>: acerta o lang e o título antes de a página aparecer.
document.documentElement.lang = IDIOMAS[idiomaAtual].html;
if (document.documentElement.dataset.titulo) definirTitulo(t(document.documentElement.dataset.titulo));
