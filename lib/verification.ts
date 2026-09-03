import { createHash, randomInt } from "crypto";

export const VERIFICATION_COOKIE_NAME =
  "cimatecjr_pending_registration";

export const VERIFICATION_MAX_AGE = 10 * 60;

export const MAX_VERIFICATION_ATTEMPTS = 5;

export function generateOTC(): string {
  return String(randomInt(10000, 100000));
}

export function hashOTC(otc: string): string {
  return createHash("sha256")
    .update(otc)
    .digest("hex");
}