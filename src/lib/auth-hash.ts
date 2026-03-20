const SESSION_KEY = "hygiene-auth-session";

/** SHA-256 hex digest of a string (uses SubtleCrypto — works in all modern browsers). */
export async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** The expected hash, baked at build time. Empty string when auth is disabled. */
export function getExpectedHash(): string {
  return process.env.NEXT_PUBLIC_AUTH_HASH ?? "";
}

export function isAuthRequired(): boolean {
  return getExpectedHash().length > 0;
}

export function hasSession(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SESSION_KEY) === getExpectedHash();
}

export function setSession(): void {
  sessionStorage.setItem(SESSION_KEY, getExpectedHash());
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}
