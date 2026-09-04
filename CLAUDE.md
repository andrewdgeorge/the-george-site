# The George — Project Notes

The George is a premium private event venue at 1827 1st Avenue North, Suite 103, Birmingham, AL 35203. Booking opens July 2026, events start October 2026. The website is a static, single-file-per-page HTML site deployed to Netlify (project: `the-george-bhm`, URL: thegeorgebhm.com).

## Pages

- `index.html` — the LIVE homepage. Currently the "Coming Soon" page.
- `home.html` — the full long-form homepage. Not linked from navigation and carries a `noindex` tag; it is an off-menu preview shared by link only. Do not swap it into `index.html` without explicit approval.
- `weddings.html`, `galas.html`, `corporate-events.html`, `nonprofit-events.html`, `private-parties.html`, `rehearsal-dinner.html` — event-type landing pages
- `images/` — every image the site uses, lowercase hyphenated names. Source files and unused renders live outside the repo in `../the-george-source-media/`.
- `sitemap.xml`, `robots.txt` — SEO
- `netlify.toml` — deploy config

All pages share the same brand tokens (cream/amber/Cinzel/Cormorant/Jost) and signature elements (gold-rule, italic decorative numerals, brand stamp). Landing pages link `landing.css`; `index.html` and `home.html` have embedded styles.

## Design Context

Two root files are the source of truth for design and strategy; read both before any visual, copy, or UX decision:

- `PRODUCT.md` (strategic) — register (**brand**), users, the qualified-inquiry north star, brand personality ("quiet authority"), anti-references, 5 design principles, WCAG 2.1 AA target.
- `DESIGN.md` (visual) — colors, typography, spacing, motion, signature elements, off-web surfaces.

## Design System

Always read `DESIGN.md` before making any visual or UI decision. All font choices, colors, spacing, aesthetic direction, motion rules, signature elements, and off-web brand surfaces are defined there. Do not deviate without explicit approval.

When in doubt, the venue gets quieter.

## Source Control and Deploy

The repo is `andrewdgeorge/the-george-site` on GitHub (private). `main` is production.

Workflow for every change:

1. Branch off `main`. Never commit directly to `main`.
2. Make the change, commit atomically, push, open a pull request.
3. Netlify builds a Deploy Preview for the PR. QA the preview URL (`/browse`), not production.
4. The user reviews the preview and approves. Merge to `main` deploys to production.

Do NOT run `netlify deploy --prod`. Production deploys come from merging to `main` only. If Netlify is not yet connected to the GitHub repo, stop and ask the user before deploying by any other means.

Rollback: revert the merge commit on `main`, or use "Publish deploy" on a previous deploy in the Netlify dashboard.

After any deploy, check for and strip any Cloudflare-injected email obfuscation `<script>` tag that breaks the mobile burger menu.

Netlify's publish directory is `.` (the repo root), so everything committed is publicly served. Keep working files, notes, and tool folders out of the repo or in `.gitignore`.

## Reference

See `The_George_Project_Reference_v2.md` for full business context (capacity, pricing, brand strategy, operational details).
