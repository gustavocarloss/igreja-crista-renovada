# Igreja Cristã Renovada — App Web

Aplicativo web (PWA) da Igreja Cristã Renovada: programação de cultos e eventos, calendário, confirmação de presença, chat por evento, leitura da Bíblia e perfil do membro. Pensado para celular, pode ser instalado na tela inicial e funciona parcialmente offline.

**Produção:** https://gustavocarloss.github.io/igreja-crista-renovada/

## Funcionalidades

- **Programação** (`/`): próximos eventos e cultos.
- **Calendário** (`/calendario`): eventos organizados por mês.
- **Detalhes do evento** (`/detalhes/:id`): local com mapa, lista de presença e chat com envio de imagens.
- **Bíblia** (`/biblia`): leitura por livro e capítulo (API [bolls.life](https://bolls.life)). Os capítulos já lidos ficam em cache para uso offline.
- **Perfil** (`/perfil`): dados do usuário.
- **Administração** (`/adicionar`, `/editar/:id`): criar e editar eventos. Só aparece para usuários com `role = 'admin'`.
- **PWA**: instalável, com aviso de instalação, banner de "sem conexão" e atualização automática do service worker.

## Stack

- [React 19](https://react.dev) + [React Router 7](https://reactrouter.com)
- [Vite 7](https://vite.dev) + [vite-plugin-pwa](https://vite-pwa-org.netlify.app) (Workbox)
- [Supabase](https://supabase.com): autenticação e banco Postgres com RLS
- [Vitest](https://vitest.dev) + Testing Library
- ESLint 9

## Como rodar localmente

Requer **Node.js 20+**.

```bash
npm install
cp .env.example .env   # preencha com os dados do seu projeto Supabase
npm run dev
```

O app abre em `http://localhost:5173/igreja-crista-renovada/` (o caminho base é explicado em [Deploy](#deploy)).

### Variáveis de ambiente

| Variável            | Descrição                                                          |
| ------------------- | ------------------------------------------------------------------ |
| `VITE_SUPABASE_URL` | URL do projeto Supabase (`https://xxxx.supabase.co`)               |
| `VITE_SUPABASE_KEY` | Chave **anon / publishable** do Supabase                           |

> [!WARNING]
> Toda variável `VITE_*` vai parar no JavaScript público. **Nunca** use a chave `service_role`/secret. O app se recusa a iniciar e o build de produção falha se detectar uma (ver [src/config.js](src/config.js) e [vite.config.js](vite.config.js)).

## Scripts

| Comando                 | O que faz                                        |
| ----------------------- | ------------------------------------------------ |
| `npm run dev`           | Servidor de desenvolvimento com HMR              |
| `npm run build`         | Build de produção em `dist/`                     |
| `npm run preview`       | Serve o build localmente com os mesmos headers de segurança (CSP) do `vercel.json` |
| `npm run lint`          | ESLint                                           |
| `npm test`              | Vitest em modo watch                             |
| `npm run test:run`      | Roda os testes uma vez                           |
| `npm run test:coverage` | Testes com relatório de cobertura em `coverage/` |

## Banco de dados (Supabase)

O app usa as tabelas `user`, `meeting` (eventos), `attendance` (presenças) e `messages` (chat). A segurança dos dados depende das políticas de **Row Level Security**: o bloqueio de rotas de admin no front-end é só conveniência de interface.

Os scripts SQL na raiz devem ser executados no **Supabase > SQL Editor**:

- [supabase-security.sql](supabase-security.sql): todas as regras de acesso (RLS e permissões). Sem login ninguém acessa nada. Cada membro só altera o próprio nome e foto, e não consegue alterar o próprio `role`. Só admins gerenciam eventos. O nome no chat vem do perfil, e o autor ou um admin pode apagar mensagens. Pode ser executado de novo sempre que necessário.
- [supabase-chat-images.sql](supabase-chat-images.sql): coluna e validação para imagens no chat (executar uma vez).

Para tornar um usuário administrador, defina `role = 'admin'` na linha dele em **Table Editor > user**. O app não consegue alterar esse campo, de propósito.

## Estrutura do projeto

```
src/
├── components/        # Telas e componentes, cada um em sua pasta (.jsx, .css, .spec.jsx)
│   └── common/        # Componentes compartilhados (modal, spinner, banners, inputs...)
├── context/           # AppContext: sessão, usuário e modal global
├── hooks/             # Hooks customizados (useNow, useOnlineStatus)
├── pwa/               # Registro do service worker e prompt de instalação
├── services/api.js    # Todo acesso ao Supabase
├── utils/             # Datas, sanitização, imagens, erros...
└── config.js          # Leitura e validação das variáveis de ambiente
```

As convenções de desenvolvimento (estrutura de 3 arquivos por componente, cobertura mínima de 80%, acessibilidade) estão em [INSTRUCTIONS.md](INSTRUCTIONS.md).

## Deploy

### GitHub Pages (atual)

Cada push na `main` dispara o workflow [deploy-pages.yml](.github/workflows/deploy-pages.yml), que faz o build e publica no GitHub Pages.

1. Em **Settings > Secrets and variables > Actions**, crie os secrets `SUPABASE_URL` e `SUPABASE_ANON_KEY`.
2. Em **Settings > Pages**, escolha **GitHub Actions** como fonte.

Como o site é servido em `/igreja-crista-renovada/`, o caminho base está definido em `BASE_PATH` no [vite.config.js](vite.config.js). Se passar a usar um domínio próprio, troque para `'/'`.

O GitHub Pages não permite configurar headers HTTP. Por isso, no build, a Content-Security-Policy definida no [vercel.json](vercel.json) é embutida no `index.html` como `<meta>`. Para mudar a política, edite só o `vercel.json`.

### Vercel (alternativa)

O [vercel.json](vercel.json) já está configurado, com rewrites de SPA, headers de segurança (CSP, HSTS etc.) e cache. Para usá-lo, ajuste `BASE_PATH` para `'/'` e configure as mesmas variáveis `VITE_*` no painel da Vercel.

### Keep-alive do Supabase

Projetos gratuitos do Supabase são pausados quando ficam inativos. O workflow [keep-alive.yml](.github/workflows/keep-alive.yml) faz uma consulta diária (12:00 UTC) para manter o projeto ativo, usando os mesmos secrets do deploy.
