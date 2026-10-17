"use client";

import { useRouter } from "next/navigation";

/** Clears the reader cookie so someone else can onboard on this browser. */
export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/session", { method: "DELETE" });
        router.push("/");
        router.refresh();
      }}
      className="text-sm text-ink-muted underline underline-offset-4 hover:text-ink"
    >
      Switch reader
    </button>
  );
}
