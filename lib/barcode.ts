/**
 * Code 39 (ISO/IEC 16388) encoder.
 *
 * The certificate needs a machine-readable copy of its register reference, and
 * pulling in a barcode package for one symbology would be heavier than the
 * pattern table itself. Code 39 is the right choice for the job: it is
 * self-checking, every ordinary scanner reads it, and its alphabet covers the
 * digits, letters and separators that appear in an FPIS reference.
 *
 * A character is nine elements - five bars and four spaces - of which exactly
 * three are wide, and characters are separated by a single narrow space. The
 * `*` character brackets the data as start and stop, which is what gives the
 * symbology its self-checking property.
 */

export const CODE39_NARROW = 1;
export const CODE39_WIDE = 3;

/** Scanners need clear paper either side of the symbol before they will lock on. */
export const CODE39_QUIET_ZONE = 10;

const START_STOP = "*";

/** The nine elements of each character, in bar/space order, as `n` or `w`. */
const PATTERNS: Record<string, string> = {
  "0": "nnnwwnwnn",
  "1": "wnnwnnnnw",
  "2": "nnwwnnnnw",
  "3": "wnwwnnnnn",
  "4": "nnnwwnnnw",
  "5": "wnnwwnnnn",
  "6": "nnwwwnnnn",
  "7": "nnnwnnwnw",
  "8": "wnnwnnwnn",
  "9": "nnwwnnwnn",
  A: "wnnnnwnnw",
  B: "nnwnnwnnw",
  C: "wnwnnwnnn",
  D: "nnnnwwnnw",
  E: "wnnnwwnnn",
  F: "nnwnwwnnn",
  G: "nnnnnwwnw",
  H: "wnnnnwwnn",
  I: "nnwnnwwnn",
  J: "nnnnwwwnn",
  K: "wnnnnnnww",
  L: "nnwnnnnww",
  M: "wnwnnnnwn",
  N: "nnnnwnnww",
  O: "wnnnwnnwn",
  P: "nnwnwnnwn",
  Q: "nnnnnnwww",
  R: "wnnnnnwwn",
  S: "nnwnnnwwn",
  T: "nnnnwnwwn",
  U: "wwnnnnnnw",
  V: "nwwnnnnnw",
  W: "wwwnnnnnn",
  X: "nwnnwnnnw",
  Y: "wwnnwnnnn",
  Z: "nwwnwnnnn",
  "-": "nwnnnnwnw",
  ".": "wwnnnnwnn",
  " ": "nwwnnnwnn",
  $: "nwnwnwnnn",
  "/": "nwnwnnnwn",
  "+": "nwnnnwnwn",
  "%": "nnnwnwnwn",
  [START_STOP]: "nwnnwnwnn",
};

export type BarcodeBar = {
  /** Left edge of the bar, in modules from the start of the quiet zone. */
  x: number;
  /** Bar width in modules. */
  width: number;
};

export type Code39Barcode = {
  /** The bars that make up the symbol, in left-to-right order. */
  bars: BarcodeBar[];
  /** Overall width in modules, quiet zones included. */
  width: number;
  /** The text the symbol encodes, after any substitution. */
  value: string;
};

/**
 * Folds a value onto the Code 39 alphabet, upper-casing it and swapping any
 * character the symbology cannot carry for a hyphen. `*` is reserved for the
 * start and stop markers, so it is substituted too.
 */
export function sanitizeCode39(value: string): string {
  let result = "";
  for (const character of value.toUpperCase()) {
    result += PATTERNS[character] && character !== START_STOP ? character : "-";
  }
  return result;
}

export function encodeCode39(value: string): Code39Barcode {
  const text = sanitizeCode39(value);
  const data = `${START_STOP}${text}${START_STOP}`;
  const bars: BarcodeBar[] = [];
  let cursor = CODE39_QUIET_ZONE;

  for (let index = 0; index < data.length; index += 1) {
    // Characters are separated by a narrow space, which is what keeps the
    // scanner's element clocking in step across the symbol.
    if (index > 0) cursor += CODE39_NARROW;

    const pattern = PATTERNS[data[index]] ?? PATTERNS["-"];
    let isBar = true;
    for (const element of pattern) {
      const width = element === "w" ? CODE39_WIDE : CODE39_NARROW;
      if (isBar) bars.push({ x: cursor, width });
      cursor += width;
      isBar = !isBar;
    }
  }

  return { bars, width: cursor + CODE39_QUIET_ZONE, value: text };
}
