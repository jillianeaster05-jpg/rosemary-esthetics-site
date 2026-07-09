# Rosemary Esthetics — Eleventy + CloudCannon site

Clean Eleventy + CloudCannon client-site template. Edit site-wide fields in `_data/site.json`; page content/images via CloudCannon editable regions.

Build: `npm run build` -> `_site`
Dev server: `npm run dev`

## Structure

- `_data/site.json` — business/contact/address/hours/social/policies/services (single source of truth for site-wide values)
- `_data/beautysalon.json` — the BeautySalon JSON-LD schema shared by every page
- `_includes/base.njk` — shared layout (head, header, footer, animation script)
- `_includes/book-cta.njk` — shared "Book Your Appointment" section
- `*.njk` (root) — the 15 pages, each with front-matter for title/description/canonical/OG/JSON-LD
- `css/site.css` — passthrough-copied site stylesheet (verbatim from the original static site)
- `img/`, favicons, `site.webmanifest`, `robots.txt`, `llms.txt`, `sitemap.xml` — passthrough-copied static assets
- `.cloudcannon/config.yml` — CloudCannon visual-editing configuration

## Notes

- Pages use `permalink:` front matter to output flat `.html` files at the root (matching the original site's link style), not Eleventy's default pretty URLs.
- `class="editable"` marks inline-editable prose; `data-editable="image"` marks inline-editable images. Header, footer, and nav are data-driven from `_data/site.json`, not per-page editable regions.
- The contact page's Netlify Forms markup (`data-netlify`, honeypot, field names) and the Google Map embed are preserved exactly from the original site.
