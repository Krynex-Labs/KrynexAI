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

### Changed
- License switched from Unlicense to Apache License 2.0.

### Fixed
- Gamification section: a stray `<div>` in `section-head` used to wrap the whole section content in a flex row, pushing the cards to the right.
- Appearance panel: removed the empty gap between Theme and Background by splitting the controls into two independent columns.
