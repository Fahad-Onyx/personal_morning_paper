import { z } from "zod";

/**
 * Typed, validated access to environment variables.
 * Next.js loads .env.local automatically; standalone scripts load it via
 * `tsx --env-file=.env.local` (see package.json).
 */
const EnvSchema = z.object({
  DATABASE_PATH: z.string().min(1).default("./data/morning-paper.db"),
  LLM_PROVIDER: z.enum(["anthropic", "openai", "mock"]).default("mock"),
  LLM_API_KEY: z.string().optional(),
  LLM_MODEL: z.string().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

let cached: Env | null = null;

export function env(): Env {
  if (!cached) {
    // Treat empty strings ("LLM_API_KEY=") as unset so defaults apply.
    const raw = Object.fromEntries(
      Object.entries(process.env).filter(([, v]) => v !== ""),
    );
    cached = EnvSchema.parse(raw);
  }
  return cached;
}
