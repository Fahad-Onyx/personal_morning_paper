"use client";

import { useEffect } from "react";
import { sendEvent, type ClientEvent } from "./events-client";

/**
 * Measures how long each story is actually on screen (at least 60% visible,
 * tab in the foreground) and reports it as `dwell` events when the reader
 * leaves or hides the page. Stories are found by their data-article-id.
 */
export function DwellTracker({ editionId }: { editionId: string }) {
  useEffect(() => {
    const visibleSince = new Map<string, number>(); // articleId → timestamp it became visible
    const total = new Map<string, number>(); // articleId → accumulated ms

    const stop = (id: string) => {
      const since = visibleSince.get(id);
      if (since === undefined) return;
      total.set(id, (total.get(id) ?? 0) + (performance.now() - since));
      visibleSince.delete(id);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.articleId!;
          if (entry.isIntersecting && document.visibilityState === "visible") visibleSince.set(id, performance.now());
          else stop(id);
        }
      },
      { threshold: 0.6 },
    );
    document.querySelectorAll<HTMLElement>("[data-article-id]").forEach((el) => observer.observe(el));

    const flush = () => {
      [...visibleSince.keys()].forEach(stop);
      const batch: ClientEvent[] = [...total.entries()]
        .filter(([, ms]) => ms >= 2000)
        .map(([articleId, ms]) => ({ editionId, articleId, type: "dwell", value: Math.round(ms) }));
      if (batch.length) sendEvent(batch);
      total.clear();
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
      else
        // Back in the foreground: restart timers for stories still on screen.
        document.querySelectorAll<HTMLElement>("[data-article-id]").forEach((el) => {
          observer.unobserve(el);
          observer.observe(el);
        });
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    return () => {
      flush();
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
    };
  }, [editionId]);

  return null;
}
