import crypto from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "myblog_admin_session";

function getAdminSecret(): string {
  return process.env.ADMIN_PASSCODE || "sakura-admin";
}

export function createAdminToken(): string {
  const secret = getAdminSecret();
  return crypto
    .createHmac("sha256", secret)
    .update("owner-authenticated-v1")
    .digest("hex");
}

export function verifyPasscode(input: string): boolean {
  const expected = getAdminSecret();
  return input.trim() === expected.trim();
}

export async function isOwnerAuthenticated(): Promise<boolean> {
  try {
    const store = await cookies();
    const token = store.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) return false;
    return token === createAdminToken();
  } catch {
    return false;
  }
}
