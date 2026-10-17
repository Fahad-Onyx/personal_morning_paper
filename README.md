# Personal Morning Paper

A web app that learns what each reader cares about, gathers articles from across the web every day, and builds one personalized, newspaper-style edition. Readers can read it on the web, download it as a PDF, and browse past editions. Every edition is shaped by what the reader did with the previous ones.

Built for NaSCon '26 (Eynvision).

## Status

| Phase | Scope | State |
|---|---|---|
| 1 | Project setup, SQLite schema, data-access layer, home page | ✅ done |
| 2 | Onboarding → LLM interest profile | ✅ done |
| 3 | RSS ingestion, text extraction, dedupe | ⏳ |
| 4 | Ranking + edition builder | ⏳ |
| 5 | Web reader | ⏳ |
| 6 | PDF export | ⏳ |
| 7 | Archive | ⏳ |
| 8 | Learning loop | ⏳ |
| 9 | "3 things you learned today" | ⏳ |
| 10 | Polish | ⏳ |

## Run it

Requires Node.js 20 or newer.

```bash
npm install
cp .env.example .env.local     # then edit values if needed
npm run db:init                # creates ./data/morning-paper.db and applies the schema
npm run dev                    # http://localhost:3000
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` / `npm start` | Production build / server |
| `npm run db:init` | Create the SQLite file and run pending migrations |
| `npm run db:check` | Smoke-test every repository against a throwaway DB |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |

## Environment

See `.env.example`. `.env.local` is git-ignored, so secrets never get committed.

| Variable | Purpose |
|---|---|
| `DATABASE_PATH` | SQLite file location (default `./data/morning-paper.db`) |
| `LLM_PROVIDER` | `anthropic`, `openai`, or `mock` (no key needed) |
| `LLM_API_KEY` | Provider API key |
| `LLM_MODEL` | Optional model override |

## Architecture

```
app/          pages and API routes (Next.js App Router)
components/   UI components
lib/
  env.ts      typed, validated env vars (zod)
  db/         data-access layer: the only code that touches storage
    client.ts     SQLite connection + migration runner
    schema.ts     ordered migrations (PRAGMA user_version tracks progress)
    types.ts      domain types used by feature code
    users.ts, profiles.ts, articles.ts, editions.ts, events.ts   repositories
    index.ts      `db` facade: db.users.*, db.profiles.*, …
scripts/      CLI scripts (db:init, db:check)
```

The planned pipeline: **ingest → dedupe → score against profile → LLM summaries → compose edition → render web + PDF**. Reader events (click, skip, like, dislike, dwell) adjust topic weights, with time decay, before the next edition is built.

### Data model

- `users`
- `interest_profiles`: one per user, holding raw onboarding input, an LLM summary and reading preferences
- `profile_topics`: weighted topics (0–1) per profile, marked `onboarding` or `learned`
- `articles`: deduped by canonical URL and by content hash
- `editions`: one per user per day (`UNIQUE(user_id, edition_date)`); rebuilding replaces it
- `edition_items`: a story's section, position, lead flag, length, score, summary and "why this story"
- `events`: append-only behaviour signals

### Swapping SQLite for Supabase/Postgres

Feature code only imports `db` from `@/lib/db`. Every repository function is `async` and returns plain domain types, so moving to Postgres means re-implementing the files in `lib/db/` with the same signatures. The schema already uses portable choices: UUID text ids, ISO timestamps and JSON text columns.
