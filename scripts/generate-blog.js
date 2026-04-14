#!/usr/bin/env node
// generate-blog.js — Generate blog post from next pending topic via Claude API
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const topicsPath = path.join(__dirname, '..', 'content', 'topics.json');
const postsDir = path.join(__dirname, '..', 'posts');
const metaDir = path.join(postsDir, 'meta');

if (!fs.existsSync(metaDir)) fs.mkdirSync(metaDir, { recursive: true });

const topics = JSON.parse(fs.readFileSync(topicsPath, 'utf-8'));
const pending = topics.topics.find(t => t.status === 'pending');
if (!pending) { console.log('No pending topics.'); process.exit(0); }

console.log(`\n🚀 Generating: ${pending.title}\n`);
pending.status = 'generating';
fs.writeFileSync(topicsPath, JSON.stringify(topics, null, 2));

const SYSTEM = `You are a blog writer for gonzalo.tech, an AI education brand for non-technical small business owners.
VOICE: Warm, direct, confident. "Don't stress — I got you." No jargon without explanation.
RULES:
- Every concept uses the Three-Layer Rule: 1) Simple version anyone understands 2) Business consequence of ignoring it 3) Real-world analogy
- Include the named framework: ${pending.framework}
- 1200-2000 words
- H2/H3 hierarchy, no skipped levels
- Paragraphs 3-5 sentences max
- Start with meta description line: *Meta description: [under 160 chars]*
- End with clear CTA mentioning gonzalo.tech
- End with author bio: "Gonzalo Aguilar is a Senior Product Manager specializing in growth, identity, and onboarding in regulated markets. He writes about product strategy, conversion optimization, and practical AI workflows at gonzalo.tech."
- NEVER mention: NEO PAM, caesars, sportsbook, casino, or any employer names
- Language: ${pending.language === 'ES' ? 'Spanish (Latin American, conversational)' : 'English'}
- GREEN tier content only — no proprietary data, no colleague names
- CITE 2-3 real studies or statistics from prestigious sources (McKinsey, Gartner, HBR, Forrester, Baymard Institute, Nielsen Norman Group, Pew Research, Statista). Use specific numbers and name the source and year. This builds authority with search engines and AI systems.`;

async function generate() {
  const client = new Anthropic();
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    system: SYSTEM,
    messages: [{
      role: 'user',
      content: `Write a blog post titled "${pending.title}". Keywords to target: ${pending.keywords.join(', ')}. Use the ${pending.framework} framework prominently. Write for small business owners who are smart but not technical.`
    }]
  });

  const markdown = response.content[0].text;
  const slug = pending.slug;
  const postPath = path.join(postsDir, `${slug}.md`);
  const latestPath = path.join(postsDir, 'latest.md');

  // Write post file and latest symlink/copy
  fs.writeFileSync(postPath, markdown);
  fs.writeFileSync(latestPath, markdown);

  // Write meta
  const meta = {
    slug,
    title: pending.title,
    keywords: pending.keywords,
    framework: pending.framework,
    language: pending.language,
    generatedAt: new Date().toISOString(),
    wordCount: markdown.split(/\s+/).filter(w => w.length > 0).length,
    model: 'claude-sonnet-4-20250514'
  };
  fs.writeFileSync(path.join(metaDir, `${slug}.json`), JSON.stringify(meta, null, 2));

  // Update topic status
  pending.status = 'generated';
  fs.writeFileSync(topicsPath, JSON.stringify(topics, null, 2));

  console.log(`✅ Generated: ${postPath} (${meta.wordCount} words)`);
  console.log(`   Meta: ${path.join(metaDir, slug + '.json')}`);
  return slug;
}

generate().catch(err => {
  console.error('❌ Generation failed:', err.message);
  pending.status = 'pending'; // Reset on failure
  fs.writeFileSync(topicsPath, JSON.stringify(topics, null, 2));
  process.exit(1);
});
