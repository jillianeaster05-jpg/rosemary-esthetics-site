# Rosemary Esthetics: Eleventy site, edited with Sveltia CMS

Eleventy site deployed by Netlify from this repo's `main` branch. Jillian edits it at
`https://rosemaryestheticsidaho.com/admin/` (Sveltia CMS, GitHub login through Netlify's OAuth).
Every save in the editor is a commit to `main`, and Netlify rebuilds within about a minute.

Build: `npm run build` -> `_site`
Dev server: `npm run dev`

## Structure

- `_data/site.json`: business, contact, address, hours, social, policies and the service menu
  (names, prices, durations). Prices must match the Square booking menu, which is the source of truth.
- `_data/pages/*.json`: all page wording, one file per page, plus `shared.json` for the header,
  footer and booking box. Templates print from these files; edit wording here, not in templates.
- `_data/beautysalon.json`: the BeautySalon JSON-LD schema shared by every page.
- `_includes/base.njk`: shared layout (head, header, footer, animation script).
- `_includes/book-cta.njk`: shared "Book Your Appointment" section.
- `*.njk` (root): the 15 pages (layout only), with front matter for permalink, canonical and OG image.
- `policies-faq.11tydata.js`: builds the FAQPage schema from the same FAQ list the page shows.
- `admin/index.html`, `admin/config.yml`: the Sveltia CMS editor and its field definitions.
  `config.yml` has no `base_url` on purpose; that is what makes it sign in through Netlify.
- `css/site.css`, `img/`, favicons, `site.webmanifest`, `robots.txt`, `llms.txt`, `sitemap.xml`:
  passthrough-copied static assets.

## Notes

- Pages use `permalink:` front matter to output flat `.html` files at the root (matching the
  original site's link style), not Eleventy's default pretty URLs.
- Service price lists loop over `site.services.<category>`, so adding or removing a service in
  `site.json` (or in the editor) updates every page that lists that category.
- Wording printed inside HTML attributes escapes quotes, and wording printed inside scripts goes
  through the `jsString` filter, so nothing typed in the editor can break a page.
- The contact page's Netlify Forms markup (`data-netlify`, honeypot, field names) and the Google
  Map embed are preserved exactly from the original site.
- Leftover `class="editable"` attributes are from the retired CloudCannon editor. They are
  harmless and change nothing visible.
