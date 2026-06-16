import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "vauxhall-scorm-external-review");

const runtimeFiles = [
  "index.html",
  "netlify.toml",
  "css/styles.css",
  "js/scorm-api.js",
  "js/content.js",
  "js/engine.js",
  "js/review-panel.js"
];

const ASSET_RE = /(?:images|assets)\/[a-zA-Z0-9_\-./]+\.(?:png|jpe?g|webp|svg|gif|ttf)/gi;
const VS_CARS = ["corsa", "frontera", "mokka", "astra", "grandland"];

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function copyFile(relPath) {
  const src = path.join(root, relPath);
  const dst = path.join(outDir, relPath);
  if (!fs.existsSync(src) || !fs.statSync(src).isFile()) return false;
  ensureDir(path.dirname(dst));
  fs.copyFileSync(src, dst);
  return true;
}

function copyDir(relDir) {
  const srcDir = path.join(root, relDir);
  if (!fs.existsSync(srcDir)) return 0;
  let n = 0;
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const rel = path.join(relDir, entry.name).replace(/\\/g, "/");
    if (entry.isDirectory()) n += copyDir(rel);
    else if (entry.isFile() && copyFile(rel)) n++;
  }
  return n;
}

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

function collectAssetRefs(text) {
  const refs = new Set();
  let m;
  ASSET_RE.lastIndex = 0;
  while ((m = ASSET_RE.exec(text)) !== null) refs.add(m[0].replace(/\\/g, "/"));
  return refs;
}

function writeDeployNotes() {
  const txt = `NETLIFY DEPLOY
==============

Drop vauxhall-scorm-external-review.zip on Netlify → Sites → Deploy manually.
index.html must be at the ZIP root (not inside a subfolder).

Quick verify after deploy:
  /css/styles.css   -> 200
  /js/engine.js     -> 200
  /js/content.js    -> 200
`;
  fs.writeFileSync(path.join(outDir, "DEPLOY.txt"), txt, "utf8");
}

function verifyOutput() {
  const required = [
    "index.html",
    "netlify.toml",
    "css/styles.css",
    "js/engine.js",
    "js/content.js",
    "js/scorm-api.js",
    "js/review-panel.js",
    "assets/img/logo-h-white.png",
    "assets/img/logo-h-blue.png",
    "assets/img/roundel-white.png",
    "assets/fonts/VauxhallNeue-Regular.ttf"
  ];
  const missing = required.filter((rel) => !fs.existsSync(path.join(outDir, rel)));
  if (missing.length) console.warn("⚠ Missing:", missing.join(", "));
  else console.log("✓ All required files present");
  return missing;
}

function main() {
  // Clean output dir
  if (fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  // Copy runtime JS/CSS/HTML + netlify.toml
  for (const rel of runtimeFiles) copyFile(rel);

  // Collect asset refs from all runtime files
  const assetRefs = new Set();
  for (const rel of runtimeFiles) {
    if (!fs.existsSync(path.join(root, rel))) continue;
    const txt = read(rel);
    for (const ref of collectAssetRefs(txt)) assetRefs.add(ref);
  }

  // Always copy full assets/img and assets/fonts (referenced dynamically)
  copyDir("assets/img");
  copyDir("assets/fonts");

  // Add vs rivals + vehicle hero images
  for (const id of VS_CARS) {
    assetRefs.add(`images/${id}.png`);
    assetRefs.add(`images/${id}-rival.png`);
    assetRefs.add(`images/${id}.jpg`);
    assetRefs.add(`assets/vs/${id}.png`);
    assetRefs.add(`assets/vs/${id}-rival.png`);
  }

  let copied = 0, missing = 0;
  for (const ref of assetRefs) {
    if (copyFile(ref)) copied++;
    else missing++;
  }

  writeDeployNotes();

  const missingRequired = verifyOutput();
  console.log(`Runtime files: ${runtimeFiles.length}`);
  console.log(`Asset refs: ${assetRefs.size} | copied: ${copied} | not found: ${missing}`);
  console.log("Output:", outDir);
  if (missingRequired.length) process.exitCode = 1;
}

main();
