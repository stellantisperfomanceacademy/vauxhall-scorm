import fs from "fs";
import path from "path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "images");
const OPT = path.join(ROOT, "images-optimized");
const REPORT = path.join(ROOT, "tools", "apply-optimized-report.json");

// Vehicle hero / cutout PNGs — keep originals for transparency quality
const VEHICLE_HERO_PNGS = new Set([
  "corsa_stretched.png",
  "mokka.png",
  "mokkatransparent.png",
  "combo_long.png",
  "crosssland2.png",
  "insignia2.png"
]);

// Full-bleed timeline backgrounds — safe to optimize even if PNG has alpha metadata
const TIMELINE_BG_PNGS = new Set([
  "timeline1/FawkesHill.png",
  "timeline2/LondonOLD2.png",
  "timeline3/oldmapreliabilitytrail.png",
  "timeline4/BritishRaceTrack2_BG.png",
  "timeline5/GMDEAL_newspaperVauxhall.png",
  "timeline5/1931Mass Market & Bedfords_pano.png",
  "timeline7/War Production_BG.png",
  "timeline8/factorylineBG.png",
  "timeline9/70sCarsLivingRoom2.png",
  "timeline9/70sCarsDriveway2.png",
  "timeline10/ellsmerePortBG.png"
]);

function fmt(bytes) {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return (bytes / 1024).toFixed(1) + " KB";
}

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "_manifest.json") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

function relPosix(full, base) {
  return path.relative(base, full).split(path.sep).join("/");
}

function isRivalPng(rel) {
  return /-rival\.png$/i.test(rel);
}

function isOverlayFolder(rel) {
  return rel.startsWith("logos/") || rel.startsWith("press/");
}

function isTransparentName(rel) {
  return /transparent/i.test(path.basename(rel));
}

async function pngHasAlpha(filePath) {
  const meta = await sharp(filePath).metadata();
  return meta.hasAlpha === true;
}

async function skipReason(rel, originalPath) {
  if (TIMELINE_BG_PNGS.has(rel)) return null;

  if (isRivalPng(rel)) return "rival png (keep original)";
  if (isOverlayFolder(rel)) return "logo/press overlay (keep original)";
  if (isTransparentName(rel)) return "transparent overlay (keep original)";
  if (VEHICLE_HERO_PNGS.has(path.basename(rel))) return "vehicle hero png (keep original)";

  const ext = path.extname(rel).toLowerCase();
  if (ext === ".png" && fs.existsSync(originalPath)) {
    if (await pngHasAlpha(originalPath)) return "png with alpha (keep original)";
  }
  return null;
}

async function main() {
  if (!fs.existsSync(OPT)) {
    console.error("Missing images-optimized/. Run: npm run optimize-images");
    process.exit(1);
  }

  const files = walk(OPT);
  const applied = [];
  const skipped = [];
  const missingOriginal = [];

  console.log("Applying optimized assets to images/ (selective)\n");

  for (const optPath of files) {
    const rel = relPosix(optPath, OPT);
    const destPath = path.join(SRC, rel);
    const originalPath = destPath;
    const reason = await skipReason(rel, originalPath);

    if (reason) {
      skipped.push({ file: rel, reason });
      console.log(`  skip  ${rel} — ${reason}`);
      continue;
    }

    if (!fs.existsSync(originalPath) && !rel.endsWith(".jpg")) {
      // e.g. movano.tif optimized to movano.jpg
      const alt = rel.replace(/\.tiff?$/i, ".jpg");
      if (alt !== rel && fs.existsSync(path.join(SRC, alt.replace(/\//g, path.sep)))) {
        const altDest = path.join(SRC, alt.replace(/\//g, path.sep));
        const before = fs.statSync(altDest).size;
        fs.mkdirSync(path.dirname(altDest), { recursive: true });
        fs.copyFileSync(optPath, altDest);
        const after = fs.statSync(altDest).size;
        applied.push({ file: alt, before, after, note: "from tiff optimize" });
        console.log(`  apply ${alt} — ${fmt(before)} -> ${fmt(after)}`);
        continue;
      }
    }

    if (!fs.existsSync(originalPath)) {
      missingOriginal.push(rel);
      console.log(`  new   ${rel} — no original, copying optimized`);
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.copyFileSync(optPath, destPath);
      applied.push({
        file: rel,
        before: 0,
        after: fs.statSync(destPath).size,
        note: "new file"
      });
      continue;
    }

    const before = fs.statSync(originalPath).size;
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.copyFileSync(optPath, destPath);
    const after = fs.statSync(destPath).size;
    applied.push({ file: rel, before, after });
    console.log(`  apply ${rel} — ${fmt(before)} -> ${fmt(after)}`);
  }

  const saved = applied.reduce((n, r) => n + Math.max(0, r.before - r.after), 0);
  const summary = {
    generatedAt: new Date().toISOString(),
    appliedCount: applied.length,
    skippedCount: skipped.length,
    bytesSaved: saved,
    applied,
    skipped,
    missingOriginal
  };

  fs.writeFileSync(REPORT, JSON.stringify(summary, null, 2));

  console.log("\n--- Summary ---");
  console.log(`Applied: ${applied.length}`);
  console.log(`Skipped: ${skipped.length} (rivals + transparent overlays)`);
  console.log(`Saved:   ${fmt(saved)}`);
  console.log(`Report:  ${REPORT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
