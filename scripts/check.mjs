#!/usr/bin/env node
/* Lightweight sanity checks for the static site. No dependencies, Node built-ins only. */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => readFileSync(resolve(root, name), 'utf8');

const VOID_TAGS = new Set([
  'meta', 'link', 'br', 'hr', 'img', 'input', 'source', 'area', 'base', 'col',
  'embed', 'param', 'track', 'wbr', 'path', 'circle', 'rect', 'line',
  'polyline', 'polygon', 'use', 'stop', 'ellipse'
]);

let failed = 0;
function check(name, ok, detail = '') {
  if (ok) console.log(`  ok   ${name}`);
  else {
    console.error(`  FAIL ${name}${detail ? `: ${detail}` : ''}`);
    failed += 1;
  }
}

function tagIssues(html) {
  const stack = [];
  const bad = [];
  for (const match of html.matchAll(/<\/?([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*>/g)) {
    const name = match[1].toLowerCase();
    if (VOID_TAGS.has(name) || match[0].endsWith('/>')) continue;
    if (match[0][1] === '/') {
      const top = stack[stack.length - 1];
      if (top === name) stack.pop();
      else bad.push(`unexpected </${name}>`);
    } else {
      stack.push(name);
    }
  }
  return { unclosed: stack, bad };
}

function balancedBraces(text) {
  return (text.match(/{/g) || []).length === (text.match(/}/g) || []).length;
}

for (const file of ['index.html', 'full.html', 'style.css', 'script.js', 'logo.svg', 'README.md', 'LICENSE', 'CITATION.cff', 'assets/music.mp3']) {
  check(`${file} exists`, existsSync(resolve(root, file)));
}

const license = read('LICENSE');
check('LICENSE is Apache 2.0', license.includes('Apache License') && license.includes('Version 2.0, January 2004'));
check('CITATION.cff matches license', read('CITATION.cff').includes('license: Apache-2.0'));

for (const file of ['index.html', 'full.html']) {
  const html = read(file);
  const { unclosed, bad } = tagIssues(html);
  check(`${file}: tags balanced`, !unclosed.length && !bad.length,
    [...unclosed.map((tag) => `<${tag}> never closed`), ...bad].join(', '));

  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
  check(`${file}: unique ids`, !duplicates.length, [...new Set(duplicates)].join(', '));

  const anchors = [...html.matchAll(/href="#([^"]+)"/g)]
    .map((m) => m[1])
    .filter((value) => /^[A-Za-z][\w-]*$/.test(value));
  const missing = [...new Set(anchors.filter((anchor) => !ids.includes(anchor)))];
  check(`${file}: internal links resolve`, !missing.length, missing.join(', '));

  check(`${file}: braces balanced`, balancedBraces(html));
  check(`${file}: music controls present`, html.includes('data-music-toggle') && html.includes('data-music-volume') && html.includes('data-music-input'));
}

check('style.css: braces balanced', balancedBraces(read('style.css')));
check('script.js: no console.log', !read('script.js').includes('console.log'));

const manifest = JSON.parse(read('manifest.webmanifest'));
check('manifest: has name and icon', Boolean(manifest.name && manifest.icons?.length));

console.log(failed ? `\n${failed} check(s) failed.` : '\nAll checks passed.');
process.exit(failed ? 1 : 0);
