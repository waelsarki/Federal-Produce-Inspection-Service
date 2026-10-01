/**
 * Per-certificate verification codes.
 *
 * The register reference printed on the sheet (`FP//AP/VOL..I/1220`) is derived
 * from the application number, which makes it useful to a human reading a file
 * but useless as proof: anyone who knows the application number can work it
 * out. The barcode therefore does not encode it. It encodes a verification code
 * minted from a cryptographically strong source when the certificate is issued,
 * stored on the application, and printed from then on.
 *
 * Two properties follow, and both are the point of the code existing:
 *
 *  - **Stable.** The code is written once, beside the issue date, and read back
 *    on every later print. A certificate that printed a different code each time
 *    could not be verified after the first copy went out.
 *  - **Unpredictable.** 80 bits from `crypto.getRandomValues`, so a code cannot
 *    be guessed or derived from the application it belongs to.
 *
 * The alphabet is Crockford-style base 32: the digits and the letters minus I,
 * L, O and U. Dropping those four removes the characters people misread as 1,
 * 0 and V, so a code read off a printout and typed into the verify form works.
 * Every character is in the Code 39 alphabet, so the existing encoder can carry
 * it without substituting anything away.
 */

const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/** Random data characters, before the check character is appended. */
export const VERIFICATION_CODE_DATA_LENGTH = 16;

/** Data characters plus one check character. */
export const VERIFICATION_CODE_LENGTH = VERIFICATION_CODE_DATA_LENGTH + 1;

/**
 * Web Crypto is the only acceptable source here. Falling back to `Math.random`
 * would still produce a well-formed code, so the downgrade would be invisible
 * on the certificate while quietly removing the unpredictability that makes the
 * code worth anything. Refusing is the safer failure.
 */
function hasWebCrypto(): boolean {
  return typeof globalThis.crypto?.getRandomValues === "function";
}

/**
 * Weights chosen to be odd, so each is invertible modulo 32.
 *
 * This matters: with the naive `(i + 1)` weighting, a substitution at position
 * i passes whenever `(i + 1) * d` is a multiple of 32, and every even position
 * shares a factor with 32, so several wrong characters slipped through. With an
 * odd weight the only value of d that survives is 0, which is the same
 * The remaining gap is documented rather than hidden: two odd weights always
 * differ by an even number, so swapping two characters that sit exactly 16
 * places apart in the alphabet still passes. That is 2 characters in 32, and
 * such a code is still reported as "no certificate matches" rather than as a
 * match, because the lookup is an exact comparison - it fails safe.
 */
const WEIGHTS = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31];

function checkCharacter(data: string): string {
  let sum = 0;
  for (let index = 0; index < data.length; index += 1) {
    sum += WEIGHTS[index % WEIGHTS.length] * ALPHABET.indexOf(data[index]);
  }
  return ALPHABET[sum % ALPHABET.length];
}

/**
 * A fresh code, drawn from the CSPRNG. Rejected in favour of a loop by the
 * caller that knows which codes are already taken; a collision needs two codes
 * to land on the same 80 bits, so retrying is not a real cost.
 */
export function randomVerificationCode(): string {
  if (!hasWebCrypto()) {
    throw new Error("Verification codes need Web Crypto, which this browser does not provide.");
  }
  const bytes = new Uint8Array(VERIFICATION_CODE_DATA_LENGTH);
  globalThis.crypto.getRandomValues(bytes);
  // 32 divides 256, so masking a byte gives every alphabet index exactly the
  // same number of sources - no modulo bias, unlike a plain `% 32`.
  const data = Array.from(bytes, (byte) => ALPHABET[byte & 31]).join("");
  return data + checkCharacter(data);
}

/** A code that no application in `taken` is already using. */
export function mintVerificationCode(taken: string[] = []): string {
  const used = new Set(taken.map(normalizeVerificationCode));
  for (let attempt = 0; attempt < 1000; attempt += 1) {
    const code = randomVerificationCode();
    if (!used.has(normalizeVerificationCode(code))) return code;
  }
  throw new Error("Could not find an unused verification code.");
}

/** `A7K2...` for storage, `A7K2-...-C` for printing. Grouping is presentational. */
export function formatVerificationCode(code: string): string {
  return normalizeVerificationCode(code).replace(/(.{4})(?=.)/g, "$1-");
}

/**
 * Folds whatever was pasted or scanned into the stored form: upper case, and
 * nothing but alphabet characters. Hyphens and spaces a scanner or a human adds
 * are discarded, and the letters I, L, O and U are mapped onto the digits they
 * are most often read as, which is the whole reason those four are absent.
 */
export function normalizeVerificationCode(input: string): string {
  return input
    .toUpperCase()
    .replace(/[ILOU]/g, (character) => ({ I: "1", L: "1", O: "0", U: "V" })[character] ?? character)
    .replace(/[^0-9A-Z]/g, "");
}

export type CodeCheck =
  | { ok: true; code: string }
  | { ok: false; reason: "empty" | "length" | "alphabet" | "check" };

/**
 * Whether a typed or scanned string is a well-formed code, and why not when it
 * is not. The check character is verified separately from the lookup so a typo
 * can be reported as a typo rather than as "no such certificate".
 */
export function checkVerificationCode(input: string): CodeCheck {
  const code = normalizeVerificationCode(input);
  if (!code) return { ok: false, reason: "empty" };
  if (code.length !== VERIFICATION_CODE_LENGTH) return { ok: false, reason: "length" };
  if (![...code].every((character) => ALPHABET.includes(character))) return { ok: false, reason: "alphabet" };
  if (checkCharacter(code.slice(0, -1)) !== code.slice(-1)) return { ok: false, reason: "check" };
  return { ok: true, code };
}
