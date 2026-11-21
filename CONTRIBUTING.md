# Contributing

The site is plain HTML, CSS and JavaScript. There is no build step and there are no dependencies.

## Workflow

1. Edit `index.html`, `style.css` or `script.js`. Keep `full.html` in sync — it is the same page with CSS and JS inlined.
2. Follow the existing style: two-space indentation, double quotes in HTML, single quotes in JS.
3. Run `node scripts/check.mjs` before opening a pull request. It checks tag balance, duplicate IDs, internal links and CSS braces.
4. Do not commit editor files, caches or build artifacts.

## Sections

Sections are numbered in their kicker (`01 / Solutions` … `11 / Reviews`). When adding a section:

- give it an `id`, a numbered kicker and a `section-toggle` with `data-collapse="<id>"`;
- add a link to it in `.nav-links` in `index.html` and `full.html`;
- use `reveal` on the blocks that should fade in on scroll.
