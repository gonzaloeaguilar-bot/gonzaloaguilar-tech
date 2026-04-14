#!/usr/bin/env node
// repurpose.js — Blog markdown → 18+ social content pieces via Claude API
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const file = process.argv[2];
if (!file) { console.error('Usage: node repurpose.js <markdown-file>'); process.exit(1); }
if (!fs.existsSync(file)) { console.error(`File not found: ${file}`); process.exit(1); }

const markdown = fs.readFileSync(file, 'utf-8');
const slug = path.basename(file, '.md');
const outDir = path.join(__dirname, '..', 'repurposed', slug);
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const SYSTEM = `You are a content repurposing engine for gonzalo.tech.
BRAND VOICE: Warm, direct, confident. "Don't stress — I got you" / "Tranquilo — yo te explico".
RULES:
- All content GREEN tier — no employer names, no proprietary data
- Keep the Three-Layer Rule spirit: accessible, consequential, relatable
- Vary format and angle — don't just shorten the blog post
- Include hashtags where appropriate
- NEVER mention: NEO PAM, caesars, sportsbook, casino, hard rock, draftkings, fanduel, betmgm`;

const PIECES = [
  { id: 'linkedin-post-en', prompt: 'Write a LinkedIn post (EN, 150-300 words) with a hook, key insight, and CTA to the blog.' },
  { id: 'linkedin-post-es', prompt: 'Write a LinkedIn post (ES, 150-300 words) with a hook, key insight, and CTA to the blog.' },
  { id: 'twitter-thread-en', prompt: 'Write a Twitter/X thread (EN, 5-8 tweets, numbered). First tweet is the hook. Last tweet has CTA.' },
  { id: 'twitter-thread-es', prompt: 'Write a Twitter/X thread (ES, 5-8 tweets, numbered). First tweet is the hook. Last tweet has CTA.' },
  { id: 'newsletter-en', prompt: 'Write a newsletter intro (EN, 200-400 words) summarizing the blog with a personal angle and link CTA.' },
  { id: 'newsletter-es', prompt: 'Write a newsletter intro (ES, 200-400 words) summarizing the blog with a personal angle and link CTA.' },
  { id: 'reel-script-en', prompt: 'Write a 60-second Reel/TikTok script (EN). Include: hook (3s), problem (10s), framework (25s), CTA (5s). Write as spoken word with [VISUAL] cues.' },
  { id: 'reel-script-es', prompt: 'Write a 60-second Reel/TikTok script (ES). Include: hook (3s), problem (10s), framework (25s), CTA (5s). Write as spoken word with [VISUAL] cues.' },
  { id: 'carousel-outline-en', prompt: 'Write a 7-10 slide carousel outline (EN). Each slide: headline + 1-2 sentences. Slide 1 = hook, last slide = CTA.' },
  { id: 'carousel-outline-es', prompt: 'Write a 7-10 slide carousel outline (ES). Each slide: headline + 1-2 sentences. Slide 1 = hook, last slide = CTA.' },
  { id: 'pull-quotes', prompt: 'Extract 5 standalone pull quotes from the blog that work as social media snippets. Bold the key phrase.' },
  { id: 'email-subject-lines', prompt: 'Write 10 email subject lines for promoting this blog post. Mix curiosity, urgency, and value angles.' },
  { id: 'seo-meta', prompt: 'Write 3 title tag variations (under 60 chars) and 3 meta descriptions (under 160 chars) for this blog post.' },
  { id: 'quora-answer-en', prompt: 'Write a Quora-style answer (EN, 200-300 words) that addresses the blog topic as a question. Natural, helpful tone.' },
  { id: 'reddit-post-en', prompt: 'Write a Reddit post (EN, 200-400 words) for r/smallbusiness or r/entrepreneur. No self-promotion feel — value-first.' },
  { id: 'youtube-description', prompt: 'Write a YouTube video description (EN) for a video version of this blog. Include timestamps, keywords, and links.' },
  { id: 'pinterest-pins', prompt: 'Write 3 Pinterest pin descriptions (EN, 100-150 chars each) with keywords for this blog topic.' },
  { id: 'story-slides', prompt: 'Write 5 Instagram Story text slides (EN). Short, punchy, one insight per slide. Last slide = swipe-up CTA.' }
];

async function repurpose() {
  const client = new Anthropic();
  let generated = 0;

  // Process in batches of 3 to avoid rate limits
  for (let i = 0; i < PIECES.length; i += 3) {
    const batch = PIECES.slice(i, i + 3);
    const results = await Promise.all(batch.map(async (piece) => {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: SYSTEM,
        messages: [{
          role: 'user',
          content: `Based on this blog post, ${piece.prompt}\n\nBLOG POST:\n${markdown}`
        }]
      });
      return { id: piece.id, content: response.content[0].text };
    }));

    for (const result of results) {
      const outPath = path.join(outDir, `${result.id}.md`);
      fs.writeFileSync(outPath, result.content);
      generated++;
      console.log(`  ✅ ${result.id}`);
    }
  }

  // Write manifest
  const manifest = {
    slug,
    generatedAt: new Date().toISOString(),
    pieces: generated,
    files: PIECES.map(p => `${p.id}.md`)
  };
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

  console.log(`\n✅ Repurposed: ${generated} pieces → ${outDir}`);
}

repurpose().catch(err => {
  console.error('❌ Repurposing failed:', err.message);
  process.exit(1);
});
