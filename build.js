import esbuild from "esbuild";
import fs from "fs";

// 1. build JS
await esbuild.build({
  entryPoints: ["scripts/script.js"],
  bundle: true,
  minify: true,
  legalComments: "none",
  outfile: "dist/script.js",
});

// 2. build CSS
await esbuild.build({
  entryPoints: ["styles/style.css"],
  bundle: true,
  minify: true,
  outfile: "dist/style.css",
});

// 3. copy & rewrite HTML
let html = fs.readFileSync("index.html", "utf8");

// rewrite paths to point to dist outputs
html = html
  .replace(/styles\/style\.css/, "style.css")
  .replace(/scripts\/script\.js/, "script.js");

fs.mkdirSync("dist", { recursive: true });
fs.writeFileSync("dist/index.html", html);
