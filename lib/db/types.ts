/**
 * Domain types returned by the data-access layer. Feature code depends on
 * these, never on SQLite row shapes, which is what makes the storage swappable.
 */

export type ISODate = string; // "2026-10-17"
export type ISODateTime = string; // "2026-10-17T06:00:00.000Z"

export interface User {
  id: string;
  name: string;
  email: string | null;
  createdAt: ISODateTime;
}

export type TopicSource = "onboarding" | "learned";

export interface ProfileTopic {
  topic: string;
  weight: number; // 0..1
  source: TopicSource;
  updatedAt: ISODateTime;
}

export interface ReadingPreferences {
  storyLength?: "brief" | "standard" | "long";
  [key: string]: unknown;
}

export interface InterestProfile {
  id: string;
  userId: string;
  rawInput: string | null;
  summary: string | null;
  preferences: ReadingPreferences;
  topics: ProfileTopic[];
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface Article {
  id: string;
  url: string;
  contentHash: string | null;
  title: string;
  source: string;
  author: string | null;
  topic: string | null;
  excerpt: string | null;
  contentText: string | null;
  imageUrl: string | null;
  publishedAt: ISODateTime | null;
  fetchedAt: ISODateTime;
}

export type NewArticle = Omit<Article, "id" | "fetchedAt">;

export type EditionStatus = "building" | "ready" | "failed";

export interface Edition {
  id: string;
  userId: string;
  editionDate: ISODate;
  status: EditionStatus;
  layout: Record<string, unknown>;
  recap: unknown | null;
  createdAt: ISODateTime;
}

export type StoryLength = "brief" | "standard" | "long";

export interface EditionItem {
  id: string;
  editionId: string;
  articleId: string;
  section: string;
  position: number;
  isLead: boolean;
  length: StoryLength;
  score: number;
  summary: string | null;
  whyThisStory: string | null;
}

export type NewEditionItem = Omit<EditionItem, "id" | "editionId">;

export type EventType = "click" | "skip" | "like" | "dislike" | "dwell";

export interface ReaderEvent {
  id: string;
  userId: string;
  articleId: string | null;
  editionId: string | null;
  type: EventType;
  value: number | null;
  createdAt: ISODateTime;
}

export type NewReaderEvent = Omit<ReaderEvent, "id" | "createdAt">;
