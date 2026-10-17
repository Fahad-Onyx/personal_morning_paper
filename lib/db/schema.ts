/**
 * SQLite schema, applied as ordered migrations.
 *
 * SQLite's built-in `PRAGMA user_version` stores which migrations have run, so
 * we don't need a migrations table. To change the schema, append a new entry
 * and never edit old ones.
 *
 * Portability notes (for a later move to Postgres/Supabase):
 * - IDs are TEXT UUIDs generated in app code, which map to Postgres `uuid`.
 * - Timestamps are ISO-8601 TEXT, which map to `timestamptz`.
 * - JSON columns are TEXT, which map to `jsonb`.
 */
export const MIGRATIONS: string[] = [
  // v1: initial schema
  `
  CREATE TABLE users (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    email       TEXT UNIQUE,
    created_at  TEXT NOT NULL
  );

  -- One interest profile per user: the LLM's structured read of their interests.
  CREATE TABLE interest_profiles (
    id           TEXT PRIMARY KEY,
    user_id      TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    raw_input    TEXT,                    -- what the reader typed during onboarding
    summary      TEXT,                    -- short LLM description of the reader
    preferences  TEXT NOT NULL DEFAULT '{}', -- JSON: reading length, tone, etc.
    created_at   TEXT NOT NULL,
    updated_at   TEXT NOT NULL
  );

  -- Weighted topics for a profile. The learning loop adjusts these weights.
  CREATE TABLE profile_topics (
    profile_id  TEXT NOT NULL REFERENCES interest_profiles(id) ON DELETE CASCADE,
    topic       TEXT NOT NULL,            -- normalised slug, e.g. "ai", "football"
    weight      REAL NOT NULL,            -- 0..1, higher means more interest
    source      TEXT NOT NULL CHECK (source IN ('onboarding', 'learned')),
    updated_at  TEXT NOT NULL,
    PRIMARY KEY (profile_id, topic)
  );

  CREATE TABLE articles (
    id            TEXT PRIMARY KEY,
    url           TEXT NOT NULL UNIQUE,   -- canonical URL (first dedupe key)
    content_hash  TEXT,                   -- hash of normalised title/text (second dedupe key)
    title         TEXT NOT NULL,
    source        TEXT NOT NULL,          -- publisher / feed name
    author        TEXT,
    topic         TEXT,                   -- topic of the feed it came from
    excerpt       TEXT,
    content_text  TEXT,                   -- extracted readable text
    image_url     TEXT,
    published_at  TEXT,
    fetched_at    TEXT NOT NULL
  );
  CREATE INDEX idx_articles_published ON articles(published_at);
  CREATE INDEX idx_articles_topic ON articles(topic);
  CREATE INDEX idx_articles_hash ON articles(content_hash);

  -- One edition per user per day.
  CREATE TABLE editions (
    id            TEXT PRIMARY KEY,
    user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    edition_date  TEXT NOT NULL,          -- YYYY-MM-DD
    status        TEXT NOT NULL CHECK (status IN ('building', 'ready', 'failed')),
    layout        TEXT NOT NULL DEFAULT '{}', -- JSON: section order, styling choices
    recap         TEXT,                   -- JSON: "3 things you learned today"
    created_at    TEXT NOT NULL,
    UNIQUE (user_id, edition_date)
  );

  CREATE TABLE edition_items (
    id              TEXT PRIMARY KEY,
    edition_id      TEXT NOT NULL REFERENCES editions(id) ON DELETE CASCADE,
    article_id      TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    section         TEXT NOT NULL,        -- section heading the story appears under
    position        INTEGER NOT NULL,     -- order within the edition
    is_lead         INTEGER NOT NULL DEFAULT 0, -- 0/1 boolean
    length          TEXT NOT NULL CHECK (length IN ('brief', 'standard', 'long')),
    score           REAL NOT NULL,        -- relevance score at build time
    summary         TEXT,
    why_this_story  TEXT,
    UNIQUE (edition_id, article_id)
  );
  CREATE INDEX idx_items_edition ON edition_items(edition_id, position);

  -- Behaviour signals for the learning loop. Append-only.
  CREATE TABLE events (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    article_id  TEXT REFERENCES articles(id) ON DELETE SET NULL,
    edition_id  TEXT REFERENCES editions(id) ON DELETE SET NULL,
    type        TEXT NOT NULL CHECK (type IN ('click', 'skip', 'like', 'dislike', 'dwell')),
    value       REAL,                     -- e.g. dwell time in ms
    created_at  TEXT NOT NULL
  );
  CREATE INDEX idx_events_user_time ON events(user_id, created_at);
  `,

  // v2: small key/value store for app state such as the last ingestion report.
  `
  CREATE TABLE app_meta (
    key         TEXT PRIMARY KEY,
    value       TEXT NOT NULL,          -- JSON
    updated_at  TEXT NOT NULL
  );
  `,
];
