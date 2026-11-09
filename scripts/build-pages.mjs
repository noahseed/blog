import { readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// This portfolio uses server-rendered JSX and native browser interactions only.
// Export its existing page without a Worker or client-side framework runtime.
const root = process.cwd();
const base = process.env.PAGES_BASE_PATH ?? '/sebastien-site-personnel';
if (base && !/^\/[a-zA-Z0-9_-]+$/.test(base)) throw new Error('Invalid Pages base path');
const temp = resolve(root, '.sites-runtime/pages-export');
const out = resolve(root, 'out');
await mkdir(temp, { recursive: true });
try {
  const source = await readFile(resolve(root, 'app/page.tsx'), 'utf8');
  if (/^["']use client["']/.test(source.trim()) || /\b(?:useState|useEffect|onClick|onChange)\b/.test(source)) {
    throw new Error('Client interactions require a hydrated static export; update this exporter first.');
  }
  const result = ts.transpileModule(source, { compilerOptions: {
    jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022
  }});
  const modulePath = resolve(temp, 'page.mjs');
  await writeFile(modulePath, result.outputText);
  const { default: Page } = await import(pathToFileURL(modulePath).href);
  const page = renderToStaticMarkup(createElement(Page))
    .replace(/\b(href|src)="\/(?!\/)/g, `$1="${base}/`);
  const css = (await readFile(resolve(root, 'app/globals.css'), 'utf8'))
    .replace(/url\((['"]?)\/(?!\/)/g, `url($1${base}/`);
  await rm(out, { recursive: true, force: true });
  await mkdir(out, { recursive: true });
  await cp(resolve(root, 'public'), out, { recursive: true });
  await writeFile(resolve(out, 'style.css'), css);
  await writeFile(resolve(out, '.nojekyll'), '');
  await writeFile(resolve(out, 'index.html'), `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sébastien Rondeau-Cameira — Web, mobile &amp; DevOps</title><meta name="description" content="Le site personnel de Sébastien Rondeau-Cameira : développement web et mobile, parcours et projets."><link rel="icon" href="${base}/favicon.svg"><link rel="stylesheet" href="${base}/style.css"></head><body>${page}</body></html>`);
  console.log(`GitHub Pages export ready: ${out} (base: ${base || '/'})`);
} finally {
  await rm(temp, { recursive: true, force: true });
}
