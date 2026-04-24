# gonzalo.tech — Project Instructions

## Quick Facts
- **Stack:** Static HTML (Vercel), Node.js content pipeline, Claude API
- **Repo:** gonzaloeaguilar-bot/gonzaloaguilar-tech
- **Live URL:** https://gonzalo.tech (Vercel — DNS pending registrar config)
- **Vercel preview:** https://gonzaloaguilar-tech.vercel.app
- **Brand:** Clean Minimal — Georgia headings, Calibri body, flat ink/slate palette
- **Audience:** Non-technical small business owners (EN + ES)

## Key Directories
- `scripts/` — Pipeline automation (generate, QA, build, PDF, repurpose, index, sitemap)
- `posts/` — Generated blog markdown + `posts/meta/` JSON
- `content/` — topics.json (169 topics, source of truth)
- `output/` — Generated HTML blog pages (88 posts)
- `courses/` — 3 course landing pages
- `products/` — 5 product pages
- `pdfs/` — Generated PDFs
- `repurposed/` — Social content packages
- `templates/` — blog-template.html, pdf-template.html

## Commands
- `npm run generate` — Generate next blog post from topics.json
- `npm run qa` — Run deterministic QA gate on latest post
- `npm run build-html` — Convert markdown to branded HTML
- `npm run pdf` — Generate PDF from HTML via Playwright
- `npm run repurpose` — Generate 18+ social content pieces
- `npm run build-index` — Rebuild homepage blog grid from topics.json
- `npm run build-sitemap` — Regenerate sitemap.xml (posts + courses + products)
- `npm run pipeline` — Full pipeline: generate → QA → HTML → PDF → repurpose → index → sitemap

## Conventions
- All content is GREEN tier — NEVER reference employer names, internal tools, or colleagues
- Use `claude-sonnet-4-20250514` for API generation
- Use Playwright Chromium for PDFs, NEVER wkhtmltopdf
- Vercel deployment — use ABSOLUTE paths (e.g., `/output/slug`, not `../output/slug.html`)
- Vercel `cleanUrls: true` — never use `.html` extensions in links, canonicals, or sitemap
- Run QA gate before any publish — zero-tolerance for failures
- Deploy: `npx vercel --prod` from repo root

## Brand Constants
```javascript
const C = {
  ink: "#0F172A", slate: "#334155", muted: "#64748B", subtle: "#94A3B8",
  border: "#E2E8F0", surface: "#F8FAFC", white: "#FFFFFF",
  red: "#DC2626", redLight: "#FEF2F2", green: "#16A34A", greenLight: "#F0FDF4",
  amber: "#D97706", amberLight: "#FFFBEB"
};
const FONT_H = "Georgia";
const FONT_B = "Calibri";
const FONT_C = "Consolas";
```

## Voice
- "Don't stress — I got you" / "Tranquilo — yo te explico"
- Three-Layer Rule: simple version + business consequence + real-world analogy
- Named frameworks: Three Questions Framework, Friction-to-Trust Pipeline, Anxiety Map

## Forbidden Terms
NEO PAM, GROWTH-, WHUSP-, caesars, czr, sportsbook, casino, hard rock, draftkings, fanduel, betmgm

## Author Bio
Gonzalo Aguilar is a Senior Product Manager specializing in growth, identity, and onboarding in regulated markets. He writes about product strategy, conversion optimization, and practical AI workflows at gonzalo.tech.
