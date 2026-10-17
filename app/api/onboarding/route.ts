import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildProfile, OnboardingInputSchema } from "@/lib/profile/build";
import { getCurrentUser, setSessionUser } from "@/lib/session";

/**
 * POST /api/onboarding
 * Body: OnboardingInput. Builds the interest profile (LLM with heuristic
 * fallback), saves it, and signs the reader in. Re-running onboarding as the
 * same reader replaces their profile instead of creating a new user.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = OnboardingInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid onboarding answers", issues: parsed.error.issues }, { status: 400 });
  }
  const input = parsed.data;
  if (input.topics.length === 0 && !input.freeText) {
    return NextResponse.json({ error: "Pick at least one topic or tell us what you care about." }, { status: 400 });
  }

  try {
    const built = await buildProfile(input);

    const existing = await getCurrentUser();
    const user = existing ?? (await db.users.createUser({ name: input.name }));
    if (existing && existing.name !== input.name) await db.users.renameUser(existing.id, input.name);

    const profile = await db.profiles.upsertProfile({
      userId: user.id,
      rawInput: JSON.stringify(input),
      summary: built.summary,
      preferences: {
        storyLength: built.storyLength,
        readingMinutes: built.readingMinutes,
        keywords: built.keywords,
        avoid: built.avoid,
      },
      topics: built.topics,
    });

    await setSessionUser(user.id);
    return NextResponse.json({ profile, via: built.via });
  } catch (err) {
    console.error("[onboarding] failed:", err);
    return NextResponse.json({ error: "Couldn't save your profile. Please try again." }, { status: 500 });
  }
}
