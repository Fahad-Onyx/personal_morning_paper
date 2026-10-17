import type { z } from "zod";
import { env } from "@/lib/env";

/**
 * Provider-agnostic LLM wrapper.
 *
 * Feature code calls `llmJson()` with a prompt and a zod schema and gets back
 * typed data, or `null`. A null result means "no LLM answer": the provider is
 * `mock`, the key is missing, the request failed or timed out, or the reply
 * didn't match the schema. Every caller has a deterministic fallback, so the
 * paper still gets built when the LLM is down.
 *
 * Providers are plain `fetch` calls, so no SDK dependency is needed.
 */

const DEFAULT_MODELS = {
  anthropic: "claude-sonnet-5-5",
  openai: "gpt-4.1-mini",
} as const;

const TIMEOUT_MS = 30_000;

export interface LlmRequest<T> {
  system: string;
  prompt: string;
  schema: z.ZodType<T>;
  maxTokens?: number;
}

/** True when a real provider is configured (used for UI hints and logs). */
export function llmEnabled(): boolean {
  const e = env();
  return e.LLM_PROVIDER !== "mock" && Boolean(e.LLM_API_KEY);
}

export function llmLabel(): string {
  const e = env();
  if (!llmEnabled()) return "offline heuristics";
  return `${e.LLM_PROVIDER} · ${e.LLM_MODEL ?? DEFAULT_MODELS[e.LLM_PROVIDER as keyof typeof DEFAULT_MODELS]}`;
}

export async function llmJson<T>(req: LlmRequest<T>): Promise<T | null> {
  if (!llmEnabled()) return null;
  const e = env();
  const system = `${req.system}\n\nReply with a single JSON object only. No prose, no markdown fences.`;

  try {
    const text =
      e.LLM_PROVIDER === "anthropic"
        ? await callAnthropic(system, req.prompt, req.maxTokens ?? 1500)
        : await callOpenAI(system, req.prompt, req.maxTokens ?? 1500);

    const parsed = req.schema.safeParse(JSON.parse(extractJson(text)));
    if (!parsed.success) {
      console.warn("[llm] reply did not match schema:", parsed.error.issues.slice(0, 3));
      return null;
    }
    return parsed.data;
  } catch (err) {
    console.warn("[llm] request failed, using fallback:", (err as Error).message);
    return null;
  }
}

/** Models sometimes wrap JSON in fences or add a sentence; take the outermost {...}. */
function extractJson(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("no JSON object in reply");
  return text.slice(start, end + 1);
}

async function post(url: string, headers: Record<string, string>, body: unknown): Promise<unknown> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

async function callAnthropic(system: string, prompt: string, maxTokens: number): Promise<string> {
  const e = env();
  const data = (await post(
    "https://api.anthropic.com/v1/messages",
    { "x-api-key": e.LLM_API_KEY!, "anthropic-version": "2023-06-01" },
    {
      model: e.LLM_MODEL ?? DEFAULT_MODELS.anthropic,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: prompt }],
    },
  )) as { content: { type: string; text?: string }[] };
  return data.content.map((c) => c.text ?? "").join("");
}

async function callOpenAI(system: string, prompt: string, maxTokens: number): Promise<string> {
  const e = env();
  const data = (await post(
    "https://api.openai.com/v1/chat/completions",
    { authorization: `Bearer ${e.LLM_API_KEY}` },
    {
      model: e.LLM_MODEL ?? DEFAULT_MODELS.openai,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
    },
  )) as { choices: { message: { content: string } }[] };
  return data.choices[0]?.message.content ?? "";
}
