import { isValidRecoveryPhrase } from "./crypto";

const MAX_RECOVERY_FILE_BYTES = 5 * 1024 * 1024;

/**
 * Read a recovery kit or text export locally and return its valid 12-word
 * recovery phrase. The file contents never leave the browser.
 */
export async function readRecoveryPhraseFile(file: File): Promise<string> {
  if (file.size > MAX_RECOVERY_FILE_BYTES) {
    throw new Error("That recovery file is too large. Choose a file under 5 MB.");
  }

  const text = await readRecoveryPhraseSource(file);
  const phrase = extractRecoveryPhrase(text);
  if (!phrase) {
    throw new Error(
      "Couldn't find a 12-word recovery key in that file. Try pasting it instead.",
    );
  }
  return phrase;
}

async function readRecoveryPhraseSource(file: File): Promise<string> {
  const isPdf =
    file.type === "application/pdf" || /\.pdf$/i.test(file.name);
  if (!isPdf) {
    return file.text();
  }

  // Keep PDF.js out of the initial bundle; it is only needed when a PDF is
  // selected.
  const [pdfjs, workerUrlMod] = await Promise.all([
    import("pdfjs-dist"),
    import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
  ]);
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrlMod.default;

  const buf = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buf) }).promise;
  const out: string[] = [];
  try {
    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
      const page = await doc.getPage(pageNumber);
      const textContent = await page.getTextContent();
      for (const item of textContent.items) {
        if (typeof (item as { str?: unknown }).str === "string") {
          out.push((item as { str: string }).str);
        }
      }
    }
  } finally {
    try {
      await doc.destroy();
    } catch {
      /* ignore cleanup errors */
    }
  }
  return out.join(" ");
}

/**
 * Find a valid phrase inside plain text, JSON, CSV, or numbered text.
 */
export function extractRecoveryPhrase(text: string): string | null {
  const cleaned = text
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = cleaned.split(" ").filter((word) => word.length >= 3);

  for (let index = 0; index + 12 <= words.length; index++) {
    const candidate = words.slice(index, index + 12).join(" ");
    if (isValidRecoveryPhrase(candidate)) return candidate;
  }
  return null;
}