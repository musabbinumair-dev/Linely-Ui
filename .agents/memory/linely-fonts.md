---
name: Linely font system
description: How Boldonse and other signature fonts are loaded and applied in the Linely app
---

The app declares `--font-boldonse: "Boldonse", cursive, sans-serif` in the Tailwind @theme block and uses it via `font-boldonse` Tailwind class and the global CSS rule `.display, h1, h2, h3 { font-family: 'Boldonse', cursive !important; }`.

**Why:** Boldonse was not in the original Google Fonts import URLs, so the font never loaded — headings fell back to generic cursive.

**How to apply:** Always include `family=Boldonse` in the first Google Fonts @import line in `index.css`. Dashboard components use `.facility-clean-font` which overrides headings to Rethink Sans (correct behavior — Boldonse is for the marketing landing page only).

Font stack summary:
- Boldonse: hero/display headings on landing page
- Rethink Sans (`font-rethink`): section titles, dashboard headings
- Plus Jakarta Sans: body/UI text in dashboard (via `.facility-clean-font`)
- Outfit (`font-outfit`): KPI numbers and large metric values
- JetBrains Mono (`font-mono`): codes, IDs, timestamps, technical labels
