/**
 * Generate all Android launcher icon sizes from the master SVG.
 *
 * Run from the project root:
 *   node apps/client/scripts/generate-android-icons.mjs
 *
 * Requires the `android` folder to already exist (run `npx cap add android` first).
 * Uses `sharp` which is already a dev-dependency of @veil/client.
 */

import sharp from "sharp";
import { readFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const svgPath = join(root, "public", "icon-512.svg");
const svgBuffer = readFileSync(svgPath);

const androidResDir = join(
  root,
  "android",
  "app",
  "src",
  "main",
  "res"
);

// Standard Android mipmap densities + sizes for launcher icons
const densities = [
  { folder: "mipmap-mdpi",    size: 48  },
  { folder: "mipmap-hdpi",    size: 72  },
  { folder: "mipmap-xhdpi",   size: 96  },
  { folder: "mipmap-xxhdpi",  size: 144 },
  { folder: "mipmap-xxxhdpi", size: 192 },
];

// Foreground icon for adaptive icons (larger, with padding)
const adaptiveDensities = [
  { folder: "mipmap-mdpi",    size: 108 },
  { folder: "mipmap-hdpi",    size: 162 },
  { folder: "mipmap-xhdpi",   size: 216 },
  { folder: "mipmap-xxhdpi",  size: 324 },
  { folder: "mipmap-xxxhdpi", size: 432 },
];

async function generate() {
  if (!existsSync(androidResDir)) {
    console.error(
      "❌  Android res directory not found at:\n   " + androidResDir +
      "\n\nRun `npx cap add android` first, then re-run this script."
    );
    process.exit(1);
  }

  console.log("Generating Android launcher icons…");

  // Standard ic_launcher.png
  for (const { folder, size } of densities) {
    const dir = join(androidResDir, folder);
    mkdirSync(dir, { recursive: true });
    const out = join(dir, "ic_launcher.png");
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(out);
    console.log(`  ✓  ${folder}/ic_launcher.png  (${size}×${size})`);

    // Round icon (same source, Android will clip to circle)
    const outRound = join(dir, "ic_launcher_round.png");
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outRound);
    console.log(`  ✓  ${folder}/ic_launcher_round.png  (${size}×${size})`);
  }

  // Adaptive icon foreground (ic_launcher_foreground.png)
  for (const { folder, size } of adaptiveDensities) {
    const dir = join(androidResDir, folder);
    mkdirSync(dir, { recursive: true });
    const out = join(dir, "ic_launcher_foreground.png");
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(out);
    console.log(`  ✓  ${folder}/ic_launcher_foreground.png  (${size}×${size})`);
  }

  // Play Store / high-res icon (512×512)
  const playStoreOut = join(root, "android-playstore-icon.png");
  await sharp(svgBuffer).resize(512, 512).png().toFile(playStoreOut);
  console.log(`  ✓  android-playstore-icon.png  (512×512) — use for Play Store listing`);

  // Notification small icon (white, 24×24 mdpi baseline)
  const notifDir = join(androidResDir, "drawable");
  mkdirSync(notifDir, { recursive: true });
  const notifOut = join(notifDir, "ic_stat_notify.png");
  await sharp(svgBuffer).resize(24, 24).png().toFile(notifOut);
  console.log(`  ✓  drawable/ic_stat_notify.png  (24×24) — notification icon`);

  console.log("\nAll Android icons generated successfully.");
}

generate().catch((err) => {
  console.error("Icon generation failed:", err);
  process.exit(1);
});
