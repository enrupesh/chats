/**
 * Generate Android splash screen image from the VeilChat brand colors.
 *
 * Creates a 2048×2048 PNG with the brand background and centred logo.
 * Android Studio / Capacitor will scale this down for each density bucket.
 *
 * Run from the project root:
 *   node apps/client/scripts/generate-splash.mjs
 */

import sharp from "sharp";
import { readFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const SPLASH_SIZE   = 2048;
const LOGO_SIZE     = 512;   // logo occupies ~25 % of the splash
const BG_COLOR      = { r: 252, g: 245, b: 235, alpha: 1 }; // #FCF5EB

const svgPath    = join(root, "public", "icon-512.svg");
const svgBuffer  = readFileSync(svgPath);

const androidResDir = join(root, "android", "app", "src", "main", "res", "drawable");

async function generate() {
  if (!existsSync(join(root, "android"))) {
    console.error(
      "❌  Android folder not found. Run `npx cap add android` first."
    );
    process.exit(1);
  }

  mkdirSync(androidResDir, { recursive: true });

  // 1. Render the logo SVG to a PNG at LOGO_SIZE
  const logoPng = await sharp(svgBuffer)
    .resize(LOGO_SIZE, LOGO_SIZE)
    .png()
    .toBuffer();

  // 2. Create a flat brand-colour background
  const background = await sharp({
    create: {
      width: SPLASH_SIZE,
      height: SPLASH_SIZE,
      channels: 4,
      background: BG_COLOR,
    },
  })
    .composite([
      {
        input: logoPng,
        gravity: "centre",
      },
    ])
    .png()
    .toFile(join(androidResDir, "splash.png"));

  console.log(`✓  drawable/splash.png  (${SPLASH_SIZE}×${SPLASH_SIZE})`);

  // Also write a landscape variant
  const bgLandscape = await sharp({
    create: {
      width: SPLASH_SIZE,
      height: SPLASH_SIZE,
      channels: 4,
      background: BG_COLOR,
    },
  })
    .composite([{ input: logoPng, gravity: "centre" }])
    .png()
    .toFile(join(androidResDir, "splash_land.png"));

  console.log(`✓  drawable/splash_land.png  (${SPLASH_SIZE}×${SPLASH_SIZE})`);
  console.log("\nSplash screen images generated successfully.");
}

generate().catch((err) => {
  console.error("Splash generation failed:", err);
  process.exit(1);
});
