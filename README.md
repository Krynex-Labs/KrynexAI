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
- Process
- Pricing (Starter / Growth / Care)
- Build with us (Hire / Custom SLM / Courses)
- FAQ
- Contact CTA + modal form (mailto fallback)
- Time-on-site counter with localStorage record

## Notes

- Contact form builds a `mailto:` message to `krynexlabs@gmail.com`.
  Change the address in the inline `<script>` if needed.
- "Time on site" record is stored in `localStorage` under `krynexlabs_time_record`.

## License

Released into the public domain under the **Unlicense**.
Do whatever you want. No attribution required. No warranty. See `LICENSE`.