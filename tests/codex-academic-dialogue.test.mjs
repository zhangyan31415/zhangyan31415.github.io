import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

const pageRoot = new URL("../codex-academic-dialogue/", import.meta.url);

async function readRequired(path) {
  try {
    return await readFile(new URL(path, pageRoot), "utf8");
  } catch {
    assert.fail(`missing required export file: ${path}`);
  }
}

test("exports a standalone academic dialogue page", async () => {
  const html = await readRequired("index.html");

  assert.match(html, /ZrS₂ 高阶 k·p 模型跨布里渊区爆带/);
  assert.match(html, /我让你用 GMKG/);
  assert.match(html, /\+9\.246 eV/);
  assert.match(html, /−6\.213 eV/);
  assert.match(html, /经过脱敏和压缩/);
  assert.match(html, /href="\/codex-academic-dialogue\/assets\/css\//);
  assert.match(
    html,
    /property="og:image" content="https:\/\/zhangyan31415\.github\.io\/codex-academic-dialogue\/og\.png"/,
  );
  assert.match(
    html,
    /rel="canonical" href="https:\/\/zhangyan31415\.github\.io\/codex-academic-dialogue\/"/,
  );
  assert.doesNotMatch(html, /<script\b/i);
  assert.doesNotMatch(html, /localhost|codex-preview/i);
});

test("ships every static asset needed by the page", async () => {
  await access(new URL("og.png", pageRoot));
  await access(new URL("favicon.svg", pageRoot));

  const cssRoot = new URL("assets/css/", pageRoot);
  const cssFiles = (await readdir(cssRoot)).filter((name) => name.endsWith(".css"));
  assert.equal(cssFiles.length, 1);
  const css = await readFile(new URL(cssFiles[0], cssRoot), "utf8");
  assert.match(css, /--paper:#f3f0e7/);
});

test("does not publish operational details or credentials", async () => {
  const html = await readRequired("index.html");
  const forbidden = [
    /\/data\//i,
    /\/Users\//i,
    /bigmem\d*/i,
    /gpuh\d*/i,
    /login\d*/i,
    /019f[0-9a-f-]{12,}/i,
    /auth\.json/i,
    /api[_-]?key/i,
    /password/i,
    /token=/i,
  ];

  for (const pattern of forbidden) {
    assert.doesNotMatch(html, pattern);
  }
});
