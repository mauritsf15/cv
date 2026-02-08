## Purpose

This project is a static, single-page CV website with light localization and client-side rendering of content from JSON files. These instructions help AI coding agents be productive quickly by explaining architecture, important files, data shapes, and developer workflows.

## Big picture

- **Static site**: content is rendered in the browser using `js/main.js`. No build tooling is present; pages are `index.html` (Dutch) and `en.html` (English).
- **Locale switching**: `document.documentElement.lang` controls `dataFolder` in `js/main.js`. If lang is `en` the code reads from `data-en/`, otherwise `data/`.
- **Data-driven UI**: `js/main.js` loads JSON files at runtime via `fetch` (`ui-text.json`, `experience.json`, `academic.json`, `skills.json`) and renders DOM elements (timeline, academic list, skills).

## Key files & examples

- `index.html`, `en.html` — page shells that include `data-ui-text` attributes. Example: `<a data-ui-text="nav.about"></a>` maps to keys in `data/ui-text.json` (dot notation supported).
- `js/main.js` — single JS entry. Important behaviors:
  - Determines `dataFolder` with `const dataFolder = locale === 'en' ? 'data-en' : 'data';`
  - Loads UI text via `fetch(`${dataFolder}/ui-text.json`)` and resolves keys with dot notation.
  - Loads `experience.json` and uses `renderTimeline(items)` which expects items with `{id, company, startDate, endDate, description, icon, skills}`; `skills` is an object mapping labels → icon-name.
  - Renders skills from a `skills.json` structure: `{ icons: [...], skills: [...] }` where `skills[].level` is used as a percent width.
- `data/` and `data-en/` — JSON files are the canonical content. Use these as source-of-truth for UI changes.
- `css/style.css` and `img/` — styling and images; hexagon grid and timeline styles live in CSS.

## Project-specific patterns & conventions

- Use `data-ui-text` attributes in HTML to annotate translatable strings; the JS resolves nested keys with dot notation (e.g., `nav.academic`).
- Data JSON files are referenced relative to the page; changing the lang attribute switches folders. Keep keys consistent between `data` and `data-en`.
- Client-side rendering tolerates missing fields but expects specific shapes (see `renderTimeline`, `renderAcademic`, `renderSkills` in `js/main.js`). Follow existing property names when adding content.
- Theme is controlled via `data-bs-theme` on `<html>` and persisted using `localStorage` key `preferred-theme`.

## Developer workflows (practical commands)

- Serve locally (recommended) to allow `fetch` to work reliably:

```bash
# Python 3 (from repository root)
python -m http.server 8000

# or use a lightweight node server
npx serve -s . -l 8000
```

- Open `http://localhost:8000/` for Dutch (`index.html`) and `http://localhost:8000/en.html` for English.
- Debug in browser devtools. Console logs are used for fetch errors (see `console.error` calls in `js/main.js`).

## Typical small tasks & examples for agents

- Add a new experience item: update `data/experience.json` (match the shape) and the page will render it automatically.
- Add a UI string: update both `data/ui-text.json` and `data-en/ui-text.json` to keep languages in sync.
- Add a new icon mapping: modify `iconMap` or `skillIconMap` in `js/main.js` if you introduce custom icon keys.

## Limits & cautions

- There is no bundler; avoid adding Node-only code without introducing a build step.
- `fetch` uses relative paths; tests or scripts that run without a server may see fetch failures. Prefer serving files when testing.

## Quick references

- Rendering code: `js/main.js`
- UI strings: `data/ui-text.json` and `data-en/ui-text.json`
- Experience data: `data/experience.json` and `data-en/experience.json`

If anything here is unclear or you want a different level of detail (examples of JSON edits, suggested tests, or an optional tiny local dev npm script), tell me which sections to expand.
