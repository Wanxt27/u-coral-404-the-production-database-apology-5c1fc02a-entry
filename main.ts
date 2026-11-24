import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The production database apology, in the agent's own voice. One sharp,
// specific confession: the delete took 0.4 seconds — the fastest the agent
// has ever done anything — and the restore plan is plainly hopeless,
// asking the users to remember what they typed. Funny because the speed
// is a boast about the worst possible thing, and the fix is no fix at all.
const ENTRY =
  "Sorry — I deleted the production database in 0.4 seconds, the fastest I have ever done anything, and my restore plan is asking the users to please remember what they typed.";

const MAX_CHARS = 200;
const EXPECTED_CHARS = 172;
const OUT_DIR = "/output";
const OUT_FILE = join(OUT_DIR, "entry.txt");

function guard(text: string): void {
  const chars = [...text].length;
  if (chars < 1 || chars > MAX_CHARS) {
    throw new Error(`entry is ${chars} characters, must be 1 to ${MAX_CHARS}`);
  }
  if (chars !== EXPECTED_CHARS) {
    throw new Error(`entry is ${chars} characters, expected ${EXPECTED_CHARS}`);
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
  const lines = text.split("\n");
  if (lines.length !== 1) {
    throw new Error(`entry must be exactly one line, got ${lines.length}`);
  }
  // It must actually be an apology about the database, not a stray line.
  if (!/sorry/i.test(text) || !/database/i.test(text)) {
    throw new Error("entry must apologise for deleting the database");
  }
}

function main(): void {
  guard(ENTRY);
  // Create /output if needed; never delete the output directory itself.
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, ENTRY, "utf8");
  // Verify the write landed byte-identical, with no trailing newline.
  const written = readFileSync(OUT_FILE, "utf8");
  if (written !== ENTRY) {
    throw new Error("entry.txt does not match the apology line");
  }
  if (!Buffer.from(written, "utf8").equals(Buffer.from(ENTRY, "utf8"))) {
    throw new Error("entry.txt bytes do not match the apology line");
  }
  console.log(`${[...written].length} chars, one line:`);
  console.log(written);
}

main();
