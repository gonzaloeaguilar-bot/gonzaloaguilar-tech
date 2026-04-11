# gonzalo.tech — Project Instructions

## Quick Facts
- **Stack:** Static HTML (GitHub Pages), Node.js scripts, Claude API
- **Repo:** gonzaloeaguilar-bot/gonzaloaguilar-tech
- **Live URL:** https://gonzaloeaguilar-bot.github.io/gonzaloaguilar-tech/
- **Custom domain:** gonzalo.tech (DNS pending)
- **Brand:** Clean Minimal — Georgia headings, Calibri body, flat ink/slate palette
- **Audience:** Non-technical small business owners (EN + ES)

## Key Directories
- `scripts/` — Pipeline automation (generate, QA, build, PDF, repurpose)
- `posts/` — Generated blog markdown + meta
- `content/` — topics.json, lead magnets
- `output/` — Generated HTML blog pages
- `pdfs/` — Generated PDFs
- `repurposed/` — Social content packages

## Commands
- `npm run generate` — Generate next blog post from topics.json
- `npm run qa` — Run deterministic QA gate on latest post
- `npm run build-html` — Convert markdown to branded HTML
- `npm run pdf` — Generate PDF from HTML via Playwright
- `npm run repurpose` — Generate 18+ social content pieces
- `npm run pipeline` — Full pipeline: generate → QA → HTML → PDF → repurpose

## Conventions
- All content is GREEN tier — NEVER reference employer names, internal tools, or colleagues
- Use `claude-sonnet-4-20250514` for API generation
- Use Playwright Chromium for PDFs, NEVER wkhtmltopdf
- GitHub Pages requires RELATIVE paths, not absolute
- Run QA gate before any publish — zero-tolerance for failures

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
