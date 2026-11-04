# Estudo AZ-900

Ferramenta gratuita e aberta para estudar para a certificação **Microsoft Azure Fundamentals (AZ-900)**, feita por quem passou pelo perrengue de juntar material em vários lugares.

> Projeto independente da comunidade, sem vínculo com a Microsoft. As perguntas são originais, escritas para este projeto.

## O que já funciona (MVP)

- Página inicial com o **progresso por domínio** da prova
- **Módulos** separados por domínio (com o peso de cada um na prova), cada um com uma lista "O que você precisa saber" baseada no guia oficial e link para o Microsoft Learn
- **Quiz** por módulo, com explicação após cada resposta
- **Simulado** de 40 questões em 45 minutos, sorteadas pelo peso de cada domínio (11, 15 e 14), com navegação entre questões, marcação para revisão, nota estimada de 0 a 1000 (aprovação em 700), resultado por domínio, revisão comentada e histórico dos 10 últimos
- **Prontidão estimada** na página inicial
- Progresso salvo no navegador (sem login, sem banco de dados)

## Como rodar no seu computador

O projeto não precisa instalar nada. Só precisa ser aberto por um servidor local, porque o navegador não deixa carregar os arquivos de dados (JSON) quando a página é aberta direto do disco.

```bash
python3 -m http.server 8000
```

Depois acesse http://localhost:8000. Outra opção é a extensão **Live Server** do VS Code.

## Estrutura

```
index.html        Página inicial (progresso + lista de módulos)
modulo.html       Mostra o conteúdo de um módulo
quiz.html         Quiz de um módulo
simulado.html     Simulado no formato da prova
css/estilo.css    Visual (cores ficam nas variáveis do topo)
js/comum.js       Funções usadas por todas as páginas
js/progresso.js   Salva e lê o progresso no navegador
js/home.js        Lógica da página inicial
js/modulo.js      Lógica da página de módulo
js/quiz.js        Lógica do quiz
js/simulado.js    Lógica do simulado (sorteio, cronômetro, correção e revisão)
data/modulos.json Domínios e módulos (o conteúdo de estudo)
data/perguntas.json Perguntas do quiz, por módulo
```

## Como adicionar conteúdo

1. **Novo módulo:** adicione um item em `data/modulos.json`, com um `id` único e o `dominio` correspondente. Os campos opcionais `objetivos` (lista "O que você precisa saber") e `itens` (marcadores dentro de uma seção do conteúdo) ajudam a organizar o texto.
2. **Perguntas:** em `data/perguntas.json`, crie uma lista com o mesmo `id` do módulo. Cada pergunta tem `pergunta`, `opcoes`, `correta` (posição da resposta certa, começando em 0) e `explicacao`.

## Como o percentual é calculado

O percentual de cada domínio é a média das **melhores notas** dos quizzes dos módulos daquele domínio. Módulo ainda não feito conta como 0.

## Simulado e prontidão

- A nota do simulado é **uma estimativa**: acertos ÷ 40 × 1000. A Microsoft usa uma escala própria (a aprovação é 700), que não é simplesmente proporcional aos acertos.
- A **prontidão** é a média dos percentuais por domínio, ponderada pelo peso de cada domínio na prova (meio da faixa: 27,5%, 37,5% e 32,5%). Se você já fez algum simulado, ela usa a média dos últimos até 3 simulados. Se não, usa as melhores notas dos quizzes dos módulos (módulo não feito conta como 0). A página sempre diz qual fonte foi usada.
- O histórico fica no navegador (`localStorage`), separado do progresso dos módulos.

## Antes de publicar, confira

- Os **pesos dos domínios** em `data/modulos.json` e o conteúdo, comparando com o guia oficial de habilidades medidas da AZ-900, que a Microsoft atualiza de tempos em tempos.
- Os **links do Microsoft Learn** em `data/modulos.json`, já que a Microsoft às vezes move ou renomeia os módulos.

## Próximos passos

- [ ] Publicar no Azure Static Web Apps com GitHub Actions
- [ ] Mais módulos e perguntas para os três domínios
- [x] Simulado com perguntas de todos os módulos
- [ ] Revisão espaçada das perguntas erradas
- [ ] Meta de data da prova e cronograma
- [ ] Login e progresso na nuvem (Functions + Cosmos DB)

## Contribuindo

Sugestões de perguntas e correções são bem-vindas via issue ou pull request. Escreva as perguntas com suas próprias palavras, sem copiar de simulados de terceiros nem de material de prova real.
