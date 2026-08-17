# NeoDemanda

Sistema de cálculo de demanda elétrica para múltiplas unidades consumidoras,
desenvolvido para o Desafio Neoenergia Pernambuco.

## Como rodar no servidor

```bash
npm install
npm run dev
```

Isso abre um servidor local (Vite) com hot-reload. Para gerar a versão de
produção:

```bash
npm run build
npm run preview
```

## Arquitetura

O projeto é HTML/CSS/JavaScript puro (sem framework), organizado com **Vite**
como bundler/dev-server e módulos ES (`import`/`export`) em vez de scripts
soltos no `<script>`.

Existem 3 páginas HTML (entradas do Vite), cada uma carregando seu próprio
"entry point" em `src/main-*.js`:

- `index.html` → landing institucional (`src/main-landing.js`)
- `login.html` → tela de acesso (`src/main-login.js`)
- `app.html` → shell da aplicação, com 4 sub-views internas
  (dashboard, entrada de dados, resultados, memorial) trocadas via JS
  (`src/main-app.js` + `src/app-shell.js`)

```
src/
  app-shell.js        # roteador das sub-views de app.html (switchView, init, logout)
  main-app.js          # entry point de app.html (liga as funções ao window)
  main-login.js        # entry point de login.html
  main-landing.js       # entry point de index.html
  pages/
    dashboard/          # lógica da tela "Dashboard Inicial"
    input-form/         # lógica da tela "Entrada de Dados"
    results/             # lógica da tela "Resultados do Cálculo"
    memorial/            # lógica da tela "Memorial Técnico"
    login/               # lógica da tela de login
    landing/             # lógica da landing page
  components/
    topbar.js            # barra superior (nome do projeto, status, progresso)
  services/
    calculations.js      # motor de cálculo de demanda (fatores de simultaneidade etc.)
    exporters.js          # exportação em XML / CSV / impressão
  state/
    project.js            # estado global: projeto ativo + histórico (localStorage)
  styles/
    design-system.css     # tokens, cores, componentes base
    landing.css / login.css / dashboard.css
    main.css               # orquestrador (@import de tudo acima)
public/
  assets/logo_neoenergia.png
```

### Por que ficou assim

- Cada página tem sua pasta própria em `src/pages/`, do mesmo jeito que no
  projeto de referência (`pages/Dashboard`, `pages/Results` etc.), só que
  cada uma exporta funções de renderização em vez de componentes `.jsx`.
- `state/` guarda tudo que antes era variável global solta (`state.js`).
- `services/` guarda regras de negócio puras (cálculo, exportação),
  sem tocar no DOM diretamente.
- `components/topbar.js` é a única peça de UI reaproveitada entre views.
- Os `onclick="..."` do HTML continuam existindo (não migramos para React),
  então cada `main-*.js` só importa as funções das páginas e as expõe no
  `window` — é o "cabo" que liga o HTML antigo aos módulos novos.

### O que NÃO mudou

Toda a lógica de cálculo, as regras de negócio, os textos e o HTML/CSS visual
são os mesmos do projeto original — só a organização dos arquivos mudou.
