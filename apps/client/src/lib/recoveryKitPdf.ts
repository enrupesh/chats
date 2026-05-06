/**
 * VeilChat Recovery Kit — visual PDF generator + cross-platform download.
 *
 * Builds a single-page A4 PDF that contains a user's BIP-39 recovery
 * phrase laid out as numbered word cards plus a scannable QR code,
 * branded with VeilChat's identity.
 *
 * Download strategy:
 *   • Web / PWA / iOS  →  standard <a download> anchor click (browser handles save dialog)
 *   • Android native   →  @capacitor/filesystem writes directly to the public
 *                         Downloads folder (visible in Files app). The anchor
 *                         approach is silently ignored by the Android WebView —
 *                         no error is thrown, which was the root cause of the
 *                         "file missing" bug.
 */

export interface RecoveryKitInput {
  /** Username, e.g. "alice". Rendered as "@alice" inside the PDF. */
  username: string;
  /** Space-separated 12-word BIP-39 phrase. */
  phrase: string;
}

export interface RecoveryKit {
  /** The generated PDF as a Blob, ready to be downloaded or previewed. */
  blob: Blob;
  /** Suggested filename, e.g. "veilchat-recovery-kit-alice.pdf". */
  filename: string;
  /** Byte size of the blob, exposed so the UI can show "276 KB" etc. */
  bytes: number;
}

/** Result returned from triggerKitDownload — tells the UI where the file landed. */
export interface DownloadResult {
  /**
   * Human-readable location for the success message.
   * "Downloads"  — written to public Downloads folder (Android)
   * "device"     — browser handled the save dialog (web/iOS)
   */
  savedTo: "Downloads" | "device";
}

const VEIL_GREEN: [number, number, number] = [0, 168, 132];
const VEIL_GREEN_DARK: [number, number, number] = [0, 143, 113];
const INK: [number, number, number] = [17, 27, 33];
const MUTED: [number, number, number] = [100, 116, 124];
const PANEL_BG: [number, number, number] = [248, 250, 250];
const PANEL_BORDER: [number, number, number] = [220, 224, 226];
const SAFE_BG: [number, number, number] = [240, 250, 247];
const SAFE_BORDER: [number, number, number] = [180, 220, 207];

/**
 * Render a VeilChat Recovery Kit PDF for the given user. Returns a Blob
 * the caller can save with triggerKitDownload.
 */
export async function generateRecoveryKitPdf(
  input: RecoveryKitInput,
): Promise<RecoveryKit> {
  const [{ jsPDF }, QR] = await Promise.all([
    import("jspdf"),
    import("qrcode"),
  ]);

  const pdf = new jsPDF({
    unit: "pt",
    format: "a4",
    compress: true,
  });

  const pageW = pdf.internal.pageSize.getWidth(); // 595.28
  const pageH = pdf.internal.pageSize.getHeight(); // 841.89
  const margin = 48;

  /* ─────────── header band ─────────── */
  pdf.setFillColor(...VEIL_GREEN);
  pdf.rect(0, 0, pageW, 96, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(24);
  pdf.text("VeilChat", margin, 50);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10.5);
  pdf.setTextColor(220, 240, 234);
  pdf.text("Privacy by design. Visible to no one but you.", margin, 70);

  const pillText = "RECOVERY KIT";
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  const pillW =
    pdf.getStringUnitWidth(pillText) * 9 / pdf.internal.scaleFactor + 22;
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(pageW - margin - pillW, 36, pillW, 22, 11, 11, "F");
  pdf.setTextColor(...VEIL_GREEN_DARK);
  pdf.text(pillText, pageW - margin - pillW + 11, 51);

  /* ─────────── title ─────────── */
  let y = 138;
  pdf.setTextColor(...INK);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.text("Your VeilChat recovery kit", margin, y);

  y += 22;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.setTextColor(...MUTED);
  pdf.text(
    "Use this kit to restore your account on any device. Keep the file",
    margin,
    y,
  );
  y += 14;
  pdf.text(
    "somewhere only you can reach — a password manager works well.",
    margin,
    y,
  );

  /* ─────────── meta row ─────────── */
  y += 28;
  drawMetaCard(pdf, margin, y, "Account", `@${input.username}`);
  drawMetaCard(
    pdf,
    margin + (pageW - margin * 2) / 2 + 8,
    y,
    "Generated",
    new Date().toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  );

  /* ─────────── recovery phrase grid ─────────── */
  y += 64;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(...INK);
  pdf.text("Your 12-word recovery phrase", margin, y);

  y += 18;
  drawWordGrid(pdf, input.phrase, margin, y, pageW - margin * 2);

  /* ─────────── QR + side caption ─────────── */
  const qrTop = y + 4 * 44 + 28;
  const qrSize = 140;
  const qrLeft = margin;
  const qrDataUrl = await QR.toDataURL(input.phrase, {
    margin: 1,
    width: qrSize * 4,
    color: { dark: rgbToHex(INK), light: "#FFFFFF" },
    errorCorrectionLevel: "M",
  });
  pdf.addImage(qrDataUrl, "PNG", qrLeft, qrTop, qrSize, qrSize);

  const capX = qrLeft + qrSize + 20;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(...INK);
  pdf.text("Scan to restore", capX, qrTop + 18);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10.5);
  pdf.setTextColor(...MUTED);
  const lines = pdf.splitTextToSize(
    "On a new device, open VeilChat, choose Log in with Random ID, " +
      "then point your camera at this code (or type the 12 words above) " +
      "to recover your encrypted history.",
    pageW - margin - capX,
  );
  pdf.text(lines, capX, qrTop + 36);

  /* ─────────── safety panel ─────────── */
  const safeY = qrTop + qrSize + 22;
  const safeH = 78;
  pdf.setFillColor(...SAFE_BG);
  pdf.setDrawColor(...SAFE_BORDER);
  pdf.setLineWidth(0.6);
  pdf.roundedRect(margin, safeY, pageW - margin * 2, safeH, 10, 10, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(...VEIL_GREEN_DARK);
  pdf.text("Treat this like a key", margin + 16, safeY + 22);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(...INK);
  const safeLines = pdf.splitTextToSize(
    "Anyone with these 12 words can read your messages. VeilChat cannot " +
      "reset or recover them — they exist only here. Print this page or " +
      "store it in an encrypted password manager.",
    pageW - margin * 2 - 32,
  );
  pdf.text(safeLines, margin + 16, safeY + 38);

  /* ─────────── footer ─────────── */
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(...MUTED);
  pdf.text(
    "VeilChat — end-to-end encrypted messaging.",
    margin,
    pageH - 32,
  );
  pdf.text(
    `Page 1 of 1 · Kit for @${input.username}`,
    pageW - margin,
    pageH - 32,
    { align: "right" },
  );

  const blob = pdf.output("blob");
  return {
    blob,
    filename: `veilchat-recovery-kit-${sanitize(input.username)}.pdf`,
    bytes: blob.size,
  };
}

/* ─────────── Download ─────────── */

/**
 * Save a generated kit to the device.
 *
 * On Android native (Capacitor), the browser's anchor-download API is
 * silently swallowed by the WebView — no error, no file. We therefore
 * use @capacitor/filesystem to write the PDF directly into the device's
 * public Downloads folder (visible in the Files app).
 *
 * On every other platform (web, PWA, iOS) the standard anchor approach
 * works fine and we leave it unchanged.
 *
 * @throws  If the write fails (e.g. permission denied) — the caller
 *          must NOT mark the kit as downloaded when this throws.
 */
export async function triggerKitDownload(
  kit: RecoveryKit,
): Promise<DownloadResult> {
  const { isNative, isAndroid } = await import("./capacitor");

  if (isNative() && isAndroid()) {
    return triggerKitDownloadAndroid(kit);
  }

  triggerKitDownloadWeb(kit);
  return { savedTo: "device" };
}

/* ─── Android implementation ─── */

/**
 * On Android, `<a>.download.click()` is silently ignored by the Chromium
 * WebView — no error, no file. We instead:
 *
 *   1. Write the PDF to the app's external-files directory via
 *      @capacitor/filesystem (Directory.External = getExternalFilesDir).
 *      This requires zero permissions and works on every Android version.
 *
 *   2. Open the native Android share sheet with the file's content:// URI
 *      via @capacitor/share. The user can then choose "Save to Downloads",
 *      Google Drive, email, etc. The share sheet is the standard Android
 *      UX for "save this file somewhere you can find it later".
 *
 * onDownloaded() is called as soon as writeFile() succeeds — the file is
 * on-device at that point. The share sheet step is async and the user may
 * dismiss it, which is fine (the file stays in app external storage).
 */
async function triggerKitDownloadAndroid(
  kit: RecoveryKit,
): Promise<DownloadResult> {
  const { Filesystem, Directory } = await import("@capacitor/filesystem");

  // Convert Blob → raw base64 string (@capacitor/filesystem expects this).
  const base64 = await blobToBase64(kit.blob);

  // Timestamp suffix prevents collisions on repeated downloads.
  const ts = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .slice(0, 19);
  const filename = kit.filename.replace(/\.pdf$/, `-${ts}.pdf`);

  // Write to app-specific external storage — always writable, no permission
  // needed on any Android version. The file lands at:
  //   /sdcard/Android/data/me.veilchat.app/files/<filename>
  const writeResult = await Filesystem.writeFile({
    path: filename,
    data: base64,
    directory: Directory.External,
    recursive: true,
  });

  // Open the share sheet so the user can save the file to Downloads,
  // Google Drive, or anywhere else. We run this in a non-blocking way so
  // that even if Share.share() throws (e.g. user dismisses) we still
  // return success — the file IS on the device at this point.
  void (async () => {
    try {
      const { Share } = await import("@capacitor/share");
      await Share.share({
        title: "VeilChat Recovery Kit",
        files: [writeResult.uri],
        dialogTitle: "Save your recovery kit",
      });
    } catch {
      // User dismissed the share sheet — file remains in app external storage.
    }
  })();

  // The file is on the device in app-specific external storage. The share
  // sheet (launched above) lets the user move it to Downloads or Drive.
  // We return "device" because we can't guarantee the final destination
  // chosen by the user in the share sheet.
  return { savedTo: "device" };
}

/* ─── Web / PWA / iOS implementation ─── */

function triggerKitDownloadWeb(kit: RecoveryKit): void {
  const url = URL.createObjectURL(kit.blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = kit.filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 0);
}

/* ─── Helpers ─── */

/**
 * Encode a Blob as a raw base64 string (no data-URL prefix).
 * FileReader is used because it is available in both the WebView and the web.
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // Strip "data:application/pdf;base64," — writeFile needs the raw base64.
      const comma = dataUrl.indexOf(",");
      if (comma === -1) {
        reject(new Error("Unexpected FileReader result format."));
        return;
      }
      resolve(dataUrl.slice(comma + 1));
    };
    reader.onerror = () =>
      reject(reader.error ?? new Error("FileReader failed."));
    reader.readAsDataURL(blob);
  });
}

/* ─────────── small helpers ─────────── */

function drawMetaCard(
  pdf: import("jspdf").jsPDF,
  x: number,
  y: number,
  label: string,
  value: string,
) {
  const cardW = (pdf.internal.pageSize.getWidth() - 48 * 2) / 2 - 8;
  pdf.setFillColor(...PANEL_BG);
  pdf.setDrawColor(...PANEL_BORDER);
  pdf.setLineWidth(0.6);
  pdf.roundedRect(x, y, cardW, 50, 8, 8, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(...MUTED);
  pdf.text(label.toUpperCase(), x + 12, y + 16);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.setTextColor(...INK);
  pdf.text(value, x + 12, y + 36);
}

function drawWordGrid(
  pdf: import("jspdf").jsPDF,
  phrase: string,
  x: number,
  y: number,
  width: number,
) {
  const words = phrase.trim().split(/\s+/).slice(0, 12);
  const cols = 3;
  const gap = 8;
  const cellW = (width - gap * (cols - 1)) / cols;
  const cellH = 38;

  for (let i = 0; i < words.length; i++) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const cx = x + c * (cellW + gap);
    const cy = y + r * (cellH + 6);

    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(...PANEL_BORDER);
    pdf.setLineWidth(0.6);
    pdf.roundedRect(cx, cy, cellW, cellH, 6, 6, "FD");

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(...MUTED);
    pdf.text(String(i + 1).padStart(2, "0"), cx + 10, cy + 16);

    pdf.setFont("courier", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(...INK);
    pdf.text(words[i] ?? "", cx + 30, cy + 24);
  }
}

function rgbToHex(rgb: [number, number, number]): string {
  return (
    "#" +
    rgb
      .map((c) =>
        Math.max(0, Math.min(255, Math.round(c)))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

function sanitize(name: string): string {
  return (name || "account").replace(/[^a-zA-Z0-9_-]+/g, "-").toLowerCase();
}

/** Format a byte count as "276 KB" / "1.4 MB" */
export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024)
    return `${(n / 1024).toFixed(n < 10 * 1024 ? 1 : 0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}
