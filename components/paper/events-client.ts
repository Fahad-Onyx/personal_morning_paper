"use client";

/** Browser-side event sender. Fire-and-forget: a lost signal must never break reading. */
export interface ClientEvent {
  editionId: string;
  articleId: string;
  type: "click" | "skip" | "like" | "dislike" | "dwell";
  value?: number;
  undo?: boolean;
}

export function sendEvent(e: ClientEvent | ClientEvent[]): void {
  const body = JSON.stringify(Array.isArray(e) ? { events: e } : e);
  // sendBeacon survives page unloads (e.g. clicking through to an article).
  if (typeof navigator !== "undefined" && navigator.sendBeacon?.("/api/events", body)) return;
  void fetch("/api/events", { method: "POST", body, keepalive: true }).catch(() => {});
}
