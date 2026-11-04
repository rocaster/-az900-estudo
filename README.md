# AZ-900 Study

A free, open study tool for the **Microsoft Azure Fundamentals (AZ-900)** certification, built by someone who went through the hassle of gathering study material from many different places.

> Independent community project, not affiliated with Microsoft. All questions are original, written for this project.

**Live site:** https://polite-coast-0d1f46c0f.6.azurestaticapps.net/?lang=en

## Features

- Home page with **progress by exam domain**
- **Modules** grouped by domain (with each domain's exam weight), each with a "What you need to know" checklist based on the official study guide and a link to Microsoft Learn
- **Quiz** for each module, with an explanation after every answer
- **Practice exam** with 40 questions in 45 minutes, drawn by domain weight (11, 15 and 14), with question navigation, flag for review, an estimated 0–1000 score (pass at 700), results by domain, a commented review and a history of the last 10 attempts
- **Estimated readiness** on the home page
- Progress saved in the browser (no sign-in, no database)
- **Two languages: Portuguese and English**, with a PT | EN switch in the header of every page. Progress, scores and practice exams are shared across both languages, and you can switch in the middle of a quiz or exam without losing answers. Direct links: `?lang=en` and `?lang=pt`
- **Animated cloud background** (automatic light and dark modes, calmer on quiz and exam pages, static when the system has animations turned off)

## Content

Based on the official AZ-900 skills-measured study guide and the Microsoft Learn modules: **12 modules and 105 questions**.

| Domain | Exam weight | Modules | Questions |
|---|---|---|---|
| Cloud concepts | 25–30% | 3 | 25 |
| Azure architecture and services | 35–40% | 5 | 45 |
| Azure management and governance | 30–35% | 4 | 35 |

## Running locally

Nothing to install. It only needs to be served by a local web server, because browsers block loading the JSON data files when the page is opened straight from disk.

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. The VS Code **Live Server** extension also works.

## Project structure

```
index.html          Home page (progress + module list)
modulo.html         Module content page
quiz.html           Module quiz
simulado.html       Practice exam in the real exam format
css/estilo.css      Styles (colors are variables at the top)
js/i18n.js          Languages: PT and EN interface text and the PT | EN switch
js/comum.js         Shared functions used by every page
js/progresso.js     Saves and reads progress in the browser
js/home.js          Home page logic
js/modulo.js        Module page logic
js/quiz.js          Quiz logic
js/simulado.js      Practice exam logic (draw, timer, scoring and review)
data/modulos.json   Domains and modules (Portuguese study content)
data/perguntas.json Quiz questions by module (Portuguese)
data/en/            The same data files, in English
```

## Languages

- The language comes, in this order, from `?lang=pt` or `?lang=en` in the URL (the choice is saved), the choice saved in the browser, or the browser language: Portuguese for Portuguese browsers, English for all others.
- Interface text lives in `js/i18n.js` (same keys under `pt` and `en`). English content lives in `data/en/`, with the same `id`s, the same option order and the same `correta` index as the Portuguese files, so progress is shared between languages.

## Adding content

1. **New module:** add an item to `data/modulos.json` with a unique `id` and the matching `dominio`. The optional `objetivos` ("What you need to know" checklist) and `itens` (bullets inside a content section) fields help organize the text.
2. **Questions:** in `data/perguntas.json`, add a list under the module's `id`. Each question has `pergunta`, `opcoes`, `correta` (position of the right answer, starting at 0) and `explicacao`.
3. **English:** repeat the change in `data/en/modulos.json` and `data/en/perguntas.json`, with the same `id`, options in the same order and the same `correta`.

## How progress is calculated

Each domain's percentage is the average of the **best scores** on that domain's module quizzes. Modules not yet attempted count as 0.

## Practice exam and readiness

- The practice exam score is **an estimate**: correct answers ÷ 40 × 1000. Microsoft uses its own scaled scoring (pass is 700), which is not simply proportional to correct answers.
- **Readiness** is the average of the domain percentages, weighted by each domain's exam weight (middle of the range: 27.5%, 37.5% and 32.5%). If you have taken any practice exam, it uses the average of the last (up to) 3 exams. Otherwise it uses the best module quiz scores (modules not attempted count as 0). The page always says which source was used.
- History is stored in the browser (`localStorage`), separate from module progress.

## Before publishing, check

- The **domain weights** in `data/modulos.json` and the content against the official AZ-900 skills-measured guide, which Microsoft updates from time to time.
- The **Microsoft Learn links** in `data/modulos.json` and `data/en/modulos.json`, since Microsoft sometimes moves or renames modules.

## Roadmap

- [x] Publish on Azure Static Web Apps with GitHub Actions
- [x] Modules covering all three exam domains
- [x] Practice exam with questions from every module
- [x] Portuguese and English versions
- [ ] Grow the question bank
- [ ] Spaced review of missed questions
- [ ] Exam date goal and study schedule
- [ ] Sign-in and cloud-synced progress (Functions + Cosmos DB)

## Hosting

The site is static and hosted on **Azure Static Web Apps** (Free plan). Every push to the `main` branch deploys automatically through GitHub Actions (`.github/workflows/`).

## Contributing

Question suggestions and corrections are welcome through issues or pull requests. Write questions in your own words, without copying from third-party practice tests or real exam material.

## Author

Built by **Alex "Rokay" Costa** · [rokay.dev](https://rokay.dev) · [LinkedIn](https://www.linkedin.com/in/alex-costa-2232b434b/)

## Sobre (Português)

O **Estudo AZ-900** é uma ferramenta gratuita e aberta para estudar para a certificação **Microsoft Azure Fundamentals (AZ-900)**: 12 módulos cobrindo os três domínios da prova, 105 perguntas originais com explicação e um simulado de 40 questões em 45 minutos, com nota estimada, resultado por domínio e revisão das questões. O progresso fica salvo no navegador, sem login.

O site está disponível em português e inglês. Use o seletor PT | EN no topo ou abra direto a versão em português: https://polite-coast-0d1f46c0f.6.azurestaticapps.net/?lang=pt

Projeto independente da comunidade, sem vínculo com a Microsoft. Feito por **Alex "Rokay" Costa** e hospedado no Azure Static Web Apps.
