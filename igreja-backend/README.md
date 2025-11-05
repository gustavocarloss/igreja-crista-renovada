# Igreja Backend (Node.js + Express + Prisma + SQLite)

Projeto backend simples para o app de igreja (Bíblia, Versículo do Dia, Eventos, Confirmação de Presença).

## O que está inclusо
- Node.js + Express API
- Prisma ORM + SQLite (`dev.db` gerado localmente)
- Modelos: User, Book, Verse, Event
- Rotas de autenticação (register/login), verses (get daily, add), events (create, list, confirm)
- Script de seed que **adiciona os nomes de todos os livros da Bíblia** e **2 eventos de teste** e um usuário de teste:
  - email: `teste@exemplo.com`
  - senha: `senha123`

## Importante sobre os versículos (texto completo)
Não incluí o texto completo dos versículos por motivos de **direitos autorais**. Se você quiser popular o banco com TODOS os versículos, tem três opções:
1. **Fornecer um arquivo JSON** contendo os versos (ex.: `[{"book":"Gênesis","chapter":1,"verse":1,"text":"..."}]`) e eu posso te ajudar a importar.
2. **Importar manualmente** usando um arquivo público (por exemplo, a King James Version em inglês é de domínio público). Se quiser, eu posso incluir automaticamente o KJV (em inglês) — confirme se tudo bem em inglês público-dominio.
3. **Usar apenas as referências** (book/chapter/verse) — o projeto já cria todos os livros e você pode adicionar os textos posteriormente via API ou `prisma` scripts.

## Como rodar localmente

1. Instale dependências:
```bash
npm install
```

2. Gere o banco e rode as migrations (Prisma):
```bash
npx prisma migrate dev --name init
```

3. Rode o seed (popula livros + 2 eventos + user de teste):
```bash
npm run seed
```

4. Rode o servidor:
```bash
npm run dev
# ou
npm start
```

API base: `http://localhost:4000/api`

## Rotas principais (exemplos)
- `POST /api/auth/register` — body: `{ name, email, password }`
- `POST /api/auth/login` — body: `{ email, password }` -> retorna `token`
- `GET /api/verses/daily` — pega um versículo aleatório (se houver textos)
- `POST /api/verses` — body: `{ bookId, chapter, verse, text }` (auth required)
- `GET /api/events` — lista eventos
- `POST /api/events` — criar evento (auth required)
- `POST /api/events/confirm` — confirmar presença (auth required) body: `{ eventId }`

## Como importar versículos (sugestão)
Se você tiver um arquivo JSON com os versículos, use um script Node para fazer `prisma.verse.create` em lote. Se preferir, me envie o arquivo e eu te ajudo a adaptar o `prisma/seed.js` para inserir os textos.

## Perguntas frequentes
- **Por que não inseriu todos os versículos?** Muitos textos da Bíblia em português são protegidos por direitos autorais (dependem da tradução). Para evitar infringir direitos, incluí apenas os nomes dos livros. Podemos usar KJV (inglês) que é domínio público caso você queira o texto completo em inglês.
- **Precisa de frontend?** Posso também gerar exemplos de chamadas fetch para o seu app React.

---

Se quiser que eu **adicione o texto completo em inglês (KJV)** agora — eu consigo incluir o arquivo público e rodar o seed — responda apenas `Sim KJV`.
Se preferir que eu **envie um formato** para você preencher em português, responda `Vou enviar`.
