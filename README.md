# KrynexLabs — make work flow.

Landing page for KrynexLabs: AI automation for business.
One-page static site. No build step, no dependencies — open `index.html` and it works.

## Stack

- Plain HTML + CSS + vanilla JS (no framework)
- Google Fonts: DM Sans + Manrope
- `logo.svg` — brand mark, drop it next to `index.html`

## Sections

- Hero
- What you can improve (strip)
- Solutions
- Autopilot feature band
- About (story, principles, quote)
- Process
- Pricing (Starter / Growth / Care)
- Build with us (Hire / Custom SLM / Courses)
- FAQ
- Contact CTA + modal form (mailto fallback)
- Appearance settings: dark / light / system theme, 8 accent colors and a quiet background music toggle with volume slider (`assets/music.mp3`)
- Time-on-site counter with localStorage record + achievements menu (arrow by the timer)
- Gamification (09): achievements, site tasks, and coins — exchange for a discount
  (10 coins = 1%; send a screenshot of the balance to KrynexLabs@gmail.com)

## Notes

- Contact form builds a `mailto:` message to `krynexlabs@gmail.com`.
  Change the address in the inline `<script>` if needed.
- "Time on site" record is stored in `localStorage` under `krynexlabs_time_record`.
- Theme and accent are stored under `krynexlabs_theme` and `krynexlabs_accent`.
- Background music plays `assets/music.mp3` and is credited in the UI as **Bonobo — Cycles**. Attribution does not grant redistribution rights — use a properly licensed track before publishing publicly.
  The sun/moon button in the header flips dark/light in one tap; the full
  appearance panel (system theme, accent colors, reset) opens from "Appearance"
  in the mobile menu and in the footer.
- `full.html` is the same page with CSS and JS inlined; regenerate it after
  editing `index.html`, `style.css` or `script.js`.

## Development

- Run `node scripts/check.mjs` to validate tags, ids, links, CSS braces and the manifest. No dependencies needed.
- `.github/workflows/verify.yml` runs the same check in CI.
- `manifest.webmanifest` makes the page installable; `robots.txt` and `sitemap.xml` are for search engines. Replace the placeholder host in the sitemap before publishing.
- `CHANGELOG.md`, `CONTRIBUTING.md`, `SECURITY.md` and `CODE_OF_CONDUCT.md` are the usual repository documents.

## License

Licensed under the **Apache License 2.0**. You may use, modify and distribute it
subject to the terms in `LICENSE`. See `CITATION.cff` for citation metadata.