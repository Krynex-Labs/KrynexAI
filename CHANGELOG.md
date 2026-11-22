# Changelog

All notable changes to this project are documented here.

## Unreleased

### Added
- Appearance section (10) with theme, accent and background controls, shared with the settings modal.
- Reviews section (11): swipeable carousel with arrows, dots, a counter and keyboard navigation.
- Header links for all 11 numbered sections; desktop header is now two rows to fit them.
- Repository tooling: `scripts/check.mjs`, GitHub Actions verification, PWA manifest, `robots.txt`, `sitemap.xml`, `humans.txt`, `.editorconfig` and `.gitattributes`.
- `CITATION.cff` citation metadata.
- GitHub contact (`@Krynex-Labs`) in the Contacts section, with the official Simple Icons mark.
- Background music toggle and volume slider in both appearance panels, playing `assets/music.mp3` quietly; the percentage is clickable for direct typing, and the track is credited as Bonobo — Cycles.
- Built-in theme presets (Classic, Midnight, Forest, Sunset, Paper) that apply mode, accent and background together, in both appearance panels.

### Changed
- License switched from Unlicense to Apache License 2.0.
- Theme, preset and Default-background swatches now show a single solid accent color instead of a two-tone accent/background dot.

### Fixed
- Gamification section: a stray `<div>` in `section-head` used to wrap the whole section content in a flex row, pushing the cards to the right.
- Appearance panel: removed the empty gap between Theme and Background by splitting the controls into two independent columns.
- Contact modal: keeps focus inside the dialog, restores focus to the opener on close, and clears stale prepared-message state when reopened.
- Escape while editing the music volume no longer closes the Appearance dialog.
- Section toggles now report the correct `aria-expanded` state, and expanding a section clears the temporary fixed height so late-loading content (AI Feed) is no longer clipped.
- Tablet widths (621–900px) now use the dropdown menu — the 11 desktop links used to be cut off and unreachable.
- Removed a duplicate `theme-color` meta tag that kept the browser toolbar dark after switching themes.
- Scroll progress no longer paints over dialogs; the back-to-top button no longer sits above the mobile-menu overlay.
- Music slider uses its own CSS variable instead of shadowing the theme's `--fill` color token.
- Improved light-theme contrast for the footer time and automation-flow captions; a corrupt time-record value no longer renders as `NaN`.
- Achievement share buttons: the SVG is now centered explicitly with flexbox and no default button padding, so the icon no longer sits off-center in its frame.
- Touch devices: hover effects on the back-to-top button and section collapse arrows no longer stay stuck (orange color, glow and rotated arrow) after a tap; hover styles now apply only where a real pointer is available.
- Mobile menu animation now runs on the GPU (3D transforms, layer promotion hints) without changing its timing or appearance.
- Toast notifications: the achievement icon and message now stay on one row and the text wraps properly instead of dropping below the icon on narrow screens.
