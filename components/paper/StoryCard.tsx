"use client";

import { useState } from "react";
import type { StoryView } from "@/lib/edition/view";
import { paragraphs, timeAgo } from "@/lib/format";
import { sendEvent } from "./events-client";

/**
 * One story in the web reader. Owns the reader's interactions with it:
 * open original (click), like/dislike, skip/undo. Every interaction is sent
 * to /api/events, which feeds the learning loop.
 */
export function StoryCard({
  story,
  editionId,
  variant = "regular",
  sectionLabel,
}: {
  story: StoryView;
  editionId: string;
  variant?: "lead" | "regular";
  sectionLabel?: string;
}) {
  const { article, item } = story;
  const [skipped, setSkipped] = useState(story.skipped);
  const [reaction, setReaction] = useState(story.reaction);
  const base = { editionId, articleId: article.id };
  const isLead = variant === "lead";

  function react(type: "like" | "dislike") {
    const clearing = reaction === type;
    setReaction(clearing ? null : type);
    sendEvent({ ...base, type, value: clearing ? 0 : 1 });
  }

  function skip(undo = false) {
    setSkipped(!undo);
    sendEvent({ ...base, type: "skip", undo });
  }

  if (skipped) {
    return (
      <div className="flex items-center justify-between gap-3 border-y border-dashed border-rule py-2 text-sm text-ink-muted">
        <span className="truncate">
          Skipped: <span className="line-through">{article.title}</span>
        </span>
        <button type="button" onClick={() => skip(true)} className="shrink-0 underline underline-offset-2 hover:text-ink">
          Undo
        </button>
      </div>
    );
  }

  const headlineSize = isLead
    ? "text-3xl sm:text-5xl leading-[1.05]"
    : item.length === "long"
      ? "text-2xl sm:text-3xl leading-tight"
      : item.length === "standard"
        ? "text-xl sm:text-2xl leading-snug"
        : "text-lg leading-snug";

  const meta = [article.source, timeAgo(article.publishedAt ?? article.fetchedAt), article.author && `by ${article.author}`]
    .filter(Boolean)
    .join(" · ");

  return (
    <article data-article-id={article.id} className={`group ${isLead ? "" : "break-inside-avoid"}`}>
      {isLead && sectionLabel && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">Lead story · {sectionLabel}</p>
      )}

      {isLead && article.imageUrl && (
        // External images come from many hosts, so a plain <img> is simpler than next/image here.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={article.imageUrl} alt="" className="mb-4 aspect-[16/9] w-full object-cover grayscale-[30%]" loading="lazy" />
      )}

      <h3 className={`font-serif font-bold ${headlineSize}`}>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => sendEvent({ ...base, type: "click" })}
          className="decoration-accent decoration-2 underline-offset-4 hover:underline"
        >
          {article.title}
        </a>
      </h3>
      <p className="mt-1 text-xs uppercase tracking-wider text-ink-muted">{meta}</p>

      <div className={`mt-3 space-y-3 font-serif ${isLead ? "text-lg leading-relaxed sm:columns-2 sm:gap-8" : "text-[15px] leading-relaxed"}`}>
        {paragraphs(item.summary).map((p, i) => (
          <p key={i} className={isLead && i === 0 ? "first-letter:float-left first-letter:mr-2 first-letter:font-serif first-letter:text-6xl first-letter:font-bold first-letter:leading-[0.8]" : ""}>
            {p}
          </p>
        ))}
      </div>

      {item.whyThisStory && (
        <details className="mt-3 text-sm" open={isLead}>
          <summary className="cursor-pointer select-none text-xs font-semibold uppercase tracking-wider text-ink-muted hover:text-ink">
            Why this story?
          </summary>
          <p className="mt-1 border-l-2 border-accent pl-3 italic text-ink-muted">{item.whyThisStory}</p>
        </details>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => sendEvent({ ...base, type: "click" })}
          className="font-medium underline decoration-rule underline-offset-4 hover:decoration-ink"
        >
          Read original ↗
        </a>
        <span className="ml-auto flex items-center gap-1">
          <ReactButton active={reaction === "like"} label="More like this" onClick={() => react("like")}>
            ▲
          </ReactButton>
          <ReactButton active={reaction === "dislike"} label="Less like this" onClick={() => react("dislike")}>
            ▼
          </ReactButton>
          <button
            type="button"
            onClick={() => skip()}
            className="ml-1 rounded-sm border border-rule px-2 py-0.5 text-xs uppercase tracking-wider text-ink-muted hover:border-ink hover:text-ink"
          >
            Skip
          </button>
        </span>
      </div>
    </article>
  );
}

function ReactButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={`h-7 w-7 rounded-sm border text-xs transition-colors ${
        active ? "border-ink bg-ink text-paper" : "border-rule text-ink-muted hover:border-ink hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
