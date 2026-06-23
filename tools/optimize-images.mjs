import fs from "fs";
import path from "path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "images");
const OUT = path.join(ROOT, "images-optimized");
const MANIFEST = path.join(OUT, "_manifest.json");

const MAX_WIDTH = 2200;
const MAX_HEIGHT = 2200;
const JPEG_QUALITY = 82;
const PNG_QUALITY = 80;

const IMAGE_EXT = new Set([
  ".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".tif", ".tiff"
]);

function fmt(bytes) {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return (bytes / 1024).toFixed(1) + " KB";
}

const SKIP_EXT = new Set([".psd", ".psb"]);

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (!SKIP_EXT.has(path.extname(entry.name).toLowerCase())) files.push(full);
  }
  return files;
}

async function hasAlpha(inputPath) {
  const meta = await sharp(inputPath).metadata();
  return meta.hasAlpha === true;
}

async function optimizeImage(srcPath, relPath) {
  const ext = path.extname(srcPath).toLowerCase();
  const outPath = path.join(OUT, relPath);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  const before = fs.statSync(srcPath).size;

  if (!IMAGE_EXT.has(ext)) {
    fs.copyFileSync(srcPath, outPath);
    const after = fs.statSync(outPath).size;
    return { relPath, before, after, action: "copied" };
  }

  if (ext === ".gif" || ext === ".svg") {
    fs.copyFileSync(srcPath, outPath);
    const after = fs.statSync(outPath).size;
    return { relPath, before, after, action: "copied" };
  }

  let pipeline = sharp(srcPath, { failOn: "none" }).rotate();
  const meta = await pipeline.metadata();
  const needsResize =
    (meta.width && meta.width > MAX_WIDTH) ||
    (meta.height && meta.height > MAX_HEIGHT);

  if (needsResize) {
    pipeline = pipeline.resize({
      width: MAX_WIDTH,
      height: MAX_HEIGHT,
      fit: "inside",
      withoutEnlargement: true
    });
  }

  if (ext === ".jpg" || ext === ".jpeg") {
    await pipeline
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true, progressive: true })
      .toFile(outPath);
  } else if (ext === ".png") {
    const alpha = await hasAlpha(srcPath);
    if (alpha) {
      await pipeline
        .png({ compressionLevel: 9, quality: PNG_QUALITY, effort: 10 })
        .toFile(outPath);
    } else {
      // Photo-style PNG without transparency: keep extension for drop-in use.
      await pipeline
        .png({
          compressionLevel: 9,
          quality: PNG_QUALITY,
          palette: true,
          effort: 10
        })
        .toFile(outPath);
    }
  } else if (ext === ".webp") {
    await pipeline.webp({ quality: JPEG_QUALITY, effort: 6 }).toFile(outPath);
  } else if (ext === ".avif") {
    await pipeline.avif({ quality: JPEG_QUALITY, effort: 4 }).toFile(outPath);
  } else if (ext === ".tif" || ext === ".tiff") {
    const jpgOut = outPath.replace(/\.tiff?$/i, ".jpg");
    await pipeline
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true, progressive: true })
      .toFile(jpgOut);
    return {
      relPath,
      before,
      after: fs.statSync(jpgOut).size,
      action: "tiff->jpg",
      note: path.basename(jpgOut)
    };
  } else {
    fs.copyFileSync(srcPath, outPath);
  }

  const after = fs.statSync(outPath).size;
  if (after >= before) {
    fs.copyFileSync(srcPath, outPath);
    return { relPath, before, after: before, action: "kept-original" };
  }
  return { relPath, before, after, action: "optimized" };
}

async function main() {
  if (!fs.existsSync(SRC)) {
    console.error("Missing images/ folder.");
    process.exit(1);
  }

  if (fs.existsSync(OUT)) {
    fs.rmSync(OUT, { recursive: true, force: true });
  }
  fs.mkdirSync(OUT, { recursive: true });

  const files = walk(SRC).filter((f) => path.basename(f) !== "README.txt");
  const results = [];

  console.log(`Optimizing ${files.length} files from images/ -> images-optimized/\n`);

  for (const srcPath of files) {
    const relPath = path.relative(SRC, srcPath);
    process.stdout.write(`  ${relPath} ... `);
    try {
      const result = await optimizeImage(srcPath, relPath);
      results.push(result);
      const saved = result.before - result.after;
      const pct = result.before ? Math.round((saved / result.before) * 100) : 0;
      console.log(`${fmt(result.before)} -> ${fmt(result.after)} (${pct}% smaller)`);
    } catch (err) {
      console.log("FAILED");
      console.error(`    ${err.message}`);
      fs.copyFileSync(srcPath, path.join(OUT, relPath));
      results.push({
        relPath,
        before: fs.statSync(srcPath).size,
        after: fs.statSync(srcPath).size,
        action: "fallback-copy",
        error: err.message
      });
    }
  }

  const totalBefore = results.reduce((n, r) => n + r.before, 0);
  const totalAfter = results.reduce((n, r) => n + r.after, 0);
  const topSavings = results
    .filter((r) => r.before > r.after)
    .sort((a, b) => (b.before - b.after) - (a.before - a.after))
    .slice(0, 15);

  const summary = {
    generatedAt: new Date().toISOString(),
    source: "images/",
    output: "images-optimized/",
    settings: { MAX_WIDTH, MAX_HEIGHT, JPEG_QUALITY, PNG_QUALITY },
    fileCount: results.length,
    totalBefore,
    totalAfter,
    totalSaved: totalBefore - totalAfter,
    percentSaved: totalBefore ? Math.round(((totalBefore - totalAfter) / totalBefore) * 100) : 0,
    topSavings: topSavings.map((r) => ({
      file: r.relPath,
      before: r.before,
      after: r.after,
      saved: r.before - r.after
    })),
    errors: results.filter((r) => r.error).map((r) => ({ file: r.relPath, error: r.error }))
  };

  fs.writeFileSync(MANIFEST, JSON.stringify(summary, null, 2));

  console.log("\n--- Summary ---");
  console.log(`Files:  ${results.length}`);
  console.log(`Before: ${fmt(totalBefore)}`);
  console.log(`After:  ${fmt(totalAfter)}`);
  console.log(`Saved:  ${fmt(totalBefore - totalAfter)} (${summary.percentSaved}%)`);
  console.log(`\nOutput: ${OUT}`);
  console.log(`Report: ${MANIFEST}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
