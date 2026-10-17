# Architecture

Personal Morning Paper is one Next.js app. Pages, API routes and the daily pipeline all share one data-access layer over SQLite.

## System diagram

```mermaid
flowchart LR
  subgraph Reader["Reader (browser)"]
    OB[Onboarding<br/>topic cards + free text]
    RD[Web reader<br/>lead, sections, recap]
    AR[Archive]
    PR[Profile]
  end

  subgraph App["Next.js app (App Router)"]
    direction TB
    API_ON["/api/onboarding"]
    API_EV["/api/events"]
    API_BUILD["/api/editions/build"]
    API_PDF["/api/editions/:id/pdf"]
    API_RECAP["/api/editions/:id/recap"]
    API_ING["/api/ingest"]

    subgraph Lib["lib/"]
      PROF[profile/build<br/>heuristics + LLM]
      ING[ingestion<br/>RSS, Readability, dedupe]
      LEARN[learning/update<br/>decayed signals]
      RANK[ranking/score<br/>explainable score]
      ED[edition/build<br/>pick, sections, lengths]
      SUM[edition/summarize<br/>+ recap]
      PDF[pdf/render<br/>Playwright Chromium]
      LLM[llm.ts<br/>anthropic, openai, mock]
      DAL[(db/*<br/>data-access layer)]
    end
  end

  FEEDS[(Curated RSS feeds<br/>+ article pages)]
  SQLITE[(SQLite<br/>better-sqlite3)]
  PROVIDER[(LLM provider)]

  OB --> API_ON --> PROF --> DAL
  RD -- click / skip / like / dwell --> API_EV --> DAL
  RD --> API_PDF --> PDF
  RD --> API_RECAP --> SUM
  RD --> API_BUILD --> ED
  AR --> DAL
  PR --> DAL
  API_ING --> ING
  ING --> FEEDS
  ING --> DAL
  ED --> LEARN --> DAL
  ED --> RANK
  ED --> SUM
  PROF --> LLM
  SUM --> LLM
  LLM --> PROVIDER
  DAL --> SQLITE
```

## Daily pipeline

```mermaid
sequenceDiagram
  autonumber
  participant Cron as Cron / "Print" button
  participant Ingest as ingestion
  participant Learn as learning
  participant Rank as ranking
  participant Build as edition builder
  participant LLM as llm.ts
  participant DB as db (SQLite)

  Cron->>Ingest: runIngestion() for followed topics
  Ingest->>Ingest: fetch RSS → canonical URL → title hash → Readability
  Ingest->>DB: insert new articles (skip duplicates)
  Cron->>Build: buildEdition(user)
  Build->>Learn: applyLearning(user)
  Learn->>DB: events (30 days) → decayed per-topic signal → new weights
  Build->>Rank: score candidates (topic · recency · keywords · quality)
  Rank-->>Build: ranked list (avoid-list removed, printed/skipped removed)
  Build->>Build: pick (dedupe, outlet diversity, section caps, ≤2 wildcards)
  Build->>Build: lead, section order, story lengths
  par
    Build->>LLM: summaries (batched by 6)
  and
    Build->>LLM: "3 things you learned" recap
  end
  LLM-->>Build: JSON or null → extractive fallback
  Build->>DB: save edition + items + layout + recap
```

## Data model

```mermaid
erDiagram
  users ||--o| interest_profiles : has
  interest_profiles ||--o{ profile_topics : weights
  users ||--o{ editions : "one per day"
  editions ||--o{ edition_items : contains
  articles ||--o{ edition_items : "printed as"
  users ||--o{ events : produces
  articles ||--o{ events : about
  editions ||--o{ events : during

  users {
    text id PK
    text name
    text email
  }
  interest_profiles {
    text id PK
    text user_id FK
    text raw_input
    text summary
    json preferences
  }
  profile_topics {
    text profile_id FK
    text topic
    real weight
    real base_weight
    text source
  }
  articles {
    text id PK
    text url UK
    text content_hash
    text title
    text source
    text topic
    text content_text
    text published_at
  }
  editions {
    text id PK
    text user_id FK
    text edition_date
    json layout
    json recap
  }
  edition_items {
    text id PK
    text edition_id FK
    text article_id FK
    text section
    int position
    int is_lead
    text length
    real score
    text summary
    text why_this_story
  }
  events {
    text id PK
    text user_id FK
    text article_id FK
    text edition_id FK
    text type
    real value
    text created_at
  }
  app_meta {
    text key PK
    json value
  }
```

## Key decisions

| Decision | Why |
|---|---|
| Data-access layer with async functions over synchronous SQLite | Feature code never sees SQL, so a move to Supabase/Postgres only rewrites `lib/db/*`. |
| Explainable score, not an opaque model | The same score parts produce the "why this story" note, so every placement can be explained in one sentence. |
| Learning recomputed from the onboarding base | `weight = base + 0.35·tanh(signal/2)` is bounded and idempotent. One busy morning can't erase what the reader said they like. |
| 5-day half-life on signals | Last week matters more than last month, so interests can drift naturally. |
| LLM is optional everywhere | Each LLM call validates its JSON with zod and returns `null` on any failure. Every caller has a deterministic fallback: a keyword profile, extractive summaries, key-fact recaps. |
| Same `EditionView` for web and PDF | The PDF is guaranteed to be the same edition as the webpage. |
| Reused headless Chromium | Launching takes about 1 s and rendering about 0.2 s, so the browser is kept warm between PDF requests. |
| Offline sample stories | The demo works without network access, and the stories are clearly labelled "Sample Desk". |
