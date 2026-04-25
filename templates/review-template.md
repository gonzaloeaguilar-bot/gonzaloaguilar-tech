# Review Template — Coding Ergonomics

> Dev artifact. Copy this file to posts/review-[product-slug].md and fill in all [BRACKETS].
> Do NOT add to posts/meta/ or topics.json until content is complete.

---

*Meta description: [Product name] review from a developer. [One-sentence value prop]. Biomechanics, honest tradeoffs, and who should buy.*

> **Affiliate disclosure:** This page contains Amazon affiliate links. If you buy through them, I may earn a small commission at no extra cost to you. I only recommend gear I've actually used or that has a clear evidence base — never paid placements.

# [Product Name] Review — [Headline Hook]

**VERDICT UP FRONT:** [2–3 sentence verdict. Who it's for, key benefit, key limitation, price anchor.]

---

## The Problem It Solved For Me

[Personal story. What pain point, how long ignored, what the stakes were.]

## What This [Product Type] Actually Is

[Factual description. What it is, how it differs from obvious alternatives, key specs in prose.]

> **REAL-WORLD ANALOGY:** [Analogy that makes the mechanism obvious to a non-expert.]

## Why It Works (The Mechanism)

[The biomechanical or physiological mechanism. Cite at least one study. No vague claims.]

> **FRAMEWORK: The Ergonomic Investment Ladder** (or relevant named framework)
>
> [Position this product on the ladder or framework. Give the reader context for where this fits.]

## [N] Weeks In: What Changed

[Day-by-day or week-by-week progression. Be honest about what changed and what didn't.]

## Who This Is For (And Who It Isn't)

**This [product] is for you if:** [Specific profile. Be narrow.]

**This [product] is NOT for you if:** [Specific disqualifiers. Be honest about limits.]

## What It Costs vs. What [Ignoring the Problem] Costs

[Price vs. cost of inaction. Keep the math concrete.]

## The Honest Tradeoffs

[Bullet each real downside. No "con: it's too good." Only real tradeoffs.]

## Verdict

[One paragraph. Restate who should buy and who shouldn't. End with a single strong sentence.]

[Get the [Product Name] on Amazon](https://amzn.to/XXXXXXX) (affiliate link)

---

## Product Specs at a Glance

| Spec | Detail |
|------|--------|
| Product | [Full product name] |
| ASIN | [ASIN] |
| Price | ~$[XX.XX] |
| [Spec] | [Value] |

---

```json
{
  "@context": "https://schema.org",
  "@type": "Review",
  "itemReviewed": {
    "@type": "Product",
    "name": "[Product Name]",
    "brand": { "@type": "Brand", "name": "[Brand]" },
    "sku": "[ASIN]",
    "offers": {
      "@type": "Offer",
      "price": "[price]",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "url": "https://amzn.to/XXXXXXX"
    }
  },
  "author": {
    "@type": "Person",
    "name": "Gonzalo Aguilar",
    "url": "https://gonzalo.tech"
  },
  "reviewRating": {
    "@type": "Rating",
    "ratingValue": "[1-5]",
    "bestRating": "5",
    "worstRating": "1"
  },
  "reviewBody": "[One sentence summary of the review.]",
  "datePublished": "[YYYY-MM-DD]"
}
```

---

*gonzalo.tech — Don't stress, I got you.*

**Sources cited in this review:**

- [Author. "Title." Journal, Year. [PubMed/PMC/DOI link]]
