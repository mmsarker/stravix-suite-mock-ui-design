import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const project = path.join(root, "hrm-mock");
const buildDir = path.join(project, "build", "browser");
const siteOutput = path.join(root, "dist", "hrm-mock");
const outputBase = path.join(root, "dist");
if (!siteOutput.startsWith(outputBase + path.sep))
  throw new Error("HRM output must stay inside the Site dist directory.");

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const build = spawnSync(npm, ["run", "build"], {
  cwd: project,
  stdio: "inherit",
  shell: process.platform === "win32",
});
if (build.status !== 0) process.exit(build.status ?? 1);
if (!existsSync(path.join(buildDir, "index.html")))
  throw new Error("Angular build did not produce its index.html.");

rmSync(siteOutput, { recursive: true, force: true });
mkdirSync(siteOutput, { recursive: true });
cpSync(buildDir, siteOutput, { recursive: true });

const angularIndex = readFileSync(path.join(siteOutput, "index.html"), "utf8");
const styles = [
  ...new Set(
    [...angularIndex.matchAll(/<link[^>]+href="([^"]+\.css)"[^>]*>/g)].map(
      (match) => match[1],
    ),
  ),
];
const scripts = [
  ...angularIndex.matchAll(/<script[^>]+src="([^"]+\.js)"[^>]*><\/script>/g),
].map((match) => ({
  src: match[1],
  type: /type="module"/.test(match[0]) ? ' type="module"' : "",
}));
if (!scripts.some((script) => /main\.js$/.test(script.src)))
  throw new Error("Angular main bundle was not found in the generated index.");

const toSiteAsset = (file) => {
  const relative = path.posix.join(
    "hrm-mock",
    file.replace(/^\.\//, "").replaceAll("\\", "/"),
  );
  const assetPath = path.resolve(root, "dist", relative);
  if (!assetPath.startsWith(path.resolve(root, "dist") + path.sep))
    throw new Error(`Angular asset escapes Site dist: ${file}`);
  const hash = createHash("sha256")
    .update(readFileSync(assetPath))
    .digest("hex")
    .slice(0, 12);
  return `${relative}?v=${hash}`;
};
const siteIndexPath = path.join(root, "dist", "index.html");
let siteIndex = readFileSync(siteIndexPath, "utf8");
siteIndex = siteIndex.replace(/\s*<hrm-root><\/hrm-root>/g, "");
siteIndex = siteIndex.replace(
  /\s*<link[^>]+href="hrm-mock\/[^\"]+"[^>]*>/g,
  "",
);
siteIndex = siteIndex.replace(
  /\s*<script[^>]+src="hrm-mock\/[^\"]+"[^>]*><\/script>/g,
  "",
);
siteIndex = siteIndex.replace(
  "</head>",
  `${styles.map((file) => `  <link rel="stylesheet" href="${toSiteAsset(file)}">`).join("\n")}\n</head>`,
);
siteIndex = siteIndex.replace(
  '<div id="app"></div>',
  '<div id="app"></div>\n  <hrm-root></hrm-root>',
);
siteIndex = siteIndex.replace(
  "</body>",
  `${scripts.map((script) => `  <script${script.type} src="${toSiteAsset(script.src)}"></script>`).join("\n")}\n</body>`,
);
siteIndex = siteIndex.replace(
  /(<link\b[^>]*\bhref=")([^"]+\.css)(?:\?[^\"]*)?("[^>]*>)/g,
  (tag, start, file, end) => {
    if (/^(?:[a-z]+:|\/\/)/i.test(file)) return tag;
    const assetPath = path.resolve(root, "dist", file);
    if (
      !assetPath.startsWith(path.resolve(root, "dist") + path.sep) ||
      !existsSync(assetPath)
    )
      return tag;
    const hash = createHash("sha256")
      .update(readFileSync(assetPath))
      .digest("hex")
      .slice(0, 12);
    return `${start}${file}?v=${hash}${end}`;
  },
);
siteIndex = siteIndex.replace(
  /(<script\b[^>]*\bsrc=")([^"]+\.js)(?:\?[^\"]*)?("[^>]*><\/script>)/g,
  (tag, start, file, end) => {
    if (/^(?:[a-z]+:|\/\/)/i.test(file)) return tag;
    const assetPath = path.resolve(root, "dist", file);
    if (
      !assetPath.startsWith(path.resolve(root, "dist") + path.sep) ||
      !existsSync(assetPath)
    )
      return tag;
    const hash = createHash("sha256")
      .update(readFileSync(assetPath))
      .digest("hex")
      .slice(0, 12);
    return `${start}${file}?v=${hash}${end}`;
  },
);
writeFileSync(siteIndexPath, siteIndex);
console.log(
  `Integrated the Angular HRM app into ${path.relative(root, siteIndexPath)}.`,
);
