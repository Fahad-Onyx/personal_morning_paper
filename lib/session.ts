import { cookies } from "next/headers";
import { db, type InterestProfile, type User } from "@/lib/db";

/**
 * Lightweight reader identity for the demo: onboarding creates a user and
 * stores its id in an httpOnly cookie. There are no passwords; real auth
 * (e.g. Supabase Auth) would replace this file without touching pages.
 */
export const SESSION_COOKIE = "pmp_uid";
const ONE_YEAR = 60 * 60 * 24 * 365;

export async function getCurrentUser(): Promise<User | null> {
  const id = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!id) return null;
  return db.users.getUser(id);
}

/** The signed-in reader and their profile, or null if they haven't onboarded. */
export async function getCurrentReader(): Promise<{ user: User; profile: InterestProfile } | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const profile = await db.profiles.getProfileByUser(user.id);
  return profile ? { user, profile } : null;
}

export async function setSessionUser(userId: string): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR,
  });
}

export async function clearSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
