// Builds the whole site into one self-contained index.html (React app + compiled Tailwind CSS inlined).
// Usage: npm install && npm run build
const fs = require("fs"), path = require("path");
const tw = require("tailwindcss");
const esbuild = require("esbuild");

(async () => {
  const src = path.join(__dirname, "src");
  const app = fs.readFileSync(path.join(src, "app.jsx"), "utf8");
  // Every whitespace- or quote-separated token is offered to Tailwind; it keeps only real utility classes.
  const candidates = [...new Set(app.split(/[\s"'`]+/).filter(Boolean))];
  const compiler = await tw.compile(fs.readFileSync(path.join(src, "styles.css"), "utf8"), {
    base: src,
    loadStylesheet: async (id, base) => {
      const p = id === "tailwindcss" ? require.resolve("tailwindcss/index.css") : id.startsWith("tailwindcss/") ? require.resolve(id.endsWith(".css") ? id : id + ".css") : path.resolve(base, id);
      return { path: p, base: path.dirname(p), content: fs.readFileSync(p, "utf8") };
    },
    loadModule: async () => { throw new Error("Tailwind plugins are not used in this project"); },
  });
  const css = (await esbuild.transform(compiler.build(candidates), { loader: "css", minify: true })).code;
  const out = await esbuild.build({
    entryPoints: [path.join(src, "app.jsx")], bundle: true, minify: true, write: false, format: "iife", target: "es2020",
    nodePaths: (process.env.NODE_PATH || "").split(path.delimiter).filter(Boolean),
    define: { "process.env.NODE_ENV": '"production"' }, legalComments: "none",
  });
  const js = out.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");
  const html = `<!DOCTYPE html>
<html lang="ms">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Kerangka Kurikulum Latihan PPP KPM</title>
<meta name="description" content="Laman interaktif Kerangka Kurikulum Latihan (KKL) Pegawai Perkhidmatan Pendidikan, Kementerian Pendidikan.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>${css}</style>
</head>
<body>
<div id="root"></div>
<noscript><p style="padding:24px;color:#eaf2ff">Laman ini memerlukan JavaScript.</p></noscript>
<script>${js}</script>
</body>
</html>
`;
  fs.writeFileSync(path.join(__dirname, "index.html"), html);
  console.log(`index.html dibina: ${(html.length / 1024).toFixed(0)} KB`);
})().catch((e) => { console.error(e); process.exit(1); });
