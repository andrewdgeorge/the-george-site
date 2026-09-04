# The George — Project Notes

The George is a premium private event venue at 1827 1st Avenue North, Suite 103, Birmingham, AL 35203. Booking opens July 2026, events start October 2026. The website is a static, single-file-per-page HTML site deployed to Netlify (project: `the-george-bhm`, URL: thegeorgebhm.com).

## Pages

- `index.html` — homepage (long-form)
- `weddings.html`, `galas.html`, `corporate-events.html`, `nonprofit-events.html`, `private-parties.html`, `rehearsal-dinner.html` — event-type landing pages
- `sitemap.xml`, `robots.txt` — SEO
- `netlify.toml` — deploy config

All pages share the same brand tokens (cream/amber/Cinzel/Cormorant/Jost) and signature elements (gold-rule, italic decorative numerals, brand stamp). Landing pages link `landing.css`; `index.html` has embedded styles.

## Design Context

Two root files are the source of truth for design and strategy; read both before any visual, copy, or UX decision:

- `PRODUCT.md` (strategic) — register (**brand**), users, the qualified-inquiry north star, brand personality ("quiet authority"), anti-references, 5 design principles, WCAG 2.1 AA target.
- `DESIGN.md` (visual) — colors, typography, spacing, motion, signature elements, off-web surfaces.

## Design System

Always read `DESIGN.md` before making any visual or UI decision. All font choices, colors, spacing, aesthetic direction, motion rules, signature elements, and off-web brand surfaces are defined there. Do not deviate without explicit approval.

When in doubt, the venue gets quieter.

## Deploy

Netlify CLI is linked. Production deploy: `netlify deploy --prod --dir=.` (always confirm with the user before running). After every upload, check for and strip any Cloudflare-injected email obfuscation `<script>` tag that breaks the mobile burger menu.

## Reference

See `The_George_Project_Reference_v2.md` for full business context (capacity, pricing, brand strategy, operational details).
