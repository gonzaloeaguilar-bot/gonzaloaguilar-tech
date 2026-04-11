#!/usr/bin/env node
// qa-gate.js — Deterministic quality gate (zero AI calls)
// Exit 0 = PASS, Exit 1 = FAIL
const fs = require('fs');
const path = require('path');

const file = process.argv[2];
if (!file) { console.error('Usage: node qa-gate.js <markdown-file>'); process.exit(1); }
if (!fs.existsSync(file)) { console.error(`File not found: ${file}`); process.exit(1); }

const content = fs.readFileSync(file, 'utf-8');
const lines = content.split('\n');
const errors = [];

// 1. Word count
const words = content.split(/\s+/).filter(w => w.length > 0).length;
if (words < 800) errors.push(`Word count too low: ${words} (min 800)`);
if (words > 2500) errors.push(`Word count too high: ${words} (max 2500)`);

// 2. H1 count
const h1s = lines.filter(l => /^# [^#]/.test(l));
if (h1s.length !== 1) errors.push(`Expected 1 H1, found ${h1s.length}`);

// 3. H2 count
const h2s = lines.filter(l => /^## [^#]/.test(l));
if (h2s.length < 2) errors.push(`Expected 2+ H2s, found ${h2s.length}`);

// 4. Meta description
if (!content.includes('Meta description:') && !content.includes('meta description:'))
  errors.push('Missing meta description');

// 5. CTA in last 200 words
const lastWords = content.split(/\s+/).slice(-200).join(' ').toLowerCase();
if (!lastWords.includes('gonzalo.tech') && !lastWords.includes('http'))
  errors.push('Missing CTA in last 200 words');

// 6. Named framework
const frameworks = ['Three Questions', 'Friction-to-Trust', 'Anxiety Map'];
const hasFramework = frameworks.some(f => content.includes(f));
if (!hasFramework) errors.push('Missing named framework (Three Questions, Friction-to-Trust, or Anxiety Map)');

// 7. Forbidden terms
const forbidden = ['NEO PAM', 'GROWTH-', 'WHUSP-', 'caesars', 'sportsbook', 'casino',
  'hard rock', 'draftkings', 'fanduel', 'betmgm', 'czr'];
const contentLower = content.toLowerCase();
forbidden.forEach(term => {
  if (contentLower.includes(term.toLowerCase()))
    errors.push(`FORBIDDEN TERM found: "${term}"`);
});

// 8. Placeholder text
const placeholders = ['[TODO]', '[INSERT]', '[TBD]', 'PLACEHOLDER', 'Lorem ipsum'];
placeholders.forEach(p => {
  if (content.includes(p)) errors.push(`Placeholder found: "${p}"`);
});

// 9. Author bio
if (!content.includes('Gonzalo Aguilar is a Senior Product Manager'))
  errors.push('Missing author bio at end');

// 10. Language purity (basic check)
const langLine = lines.find(l => l.includes('language:') || l.includes('Language:'));
const isES = file.includes('_ES') || (langLine && langLine.toLowerCase().includes('es'));
if (!isES) {
  const spanishWords = ['también', 'además', 'según', 'través', 'después', 'aquí', 'está'];
  spanishWords.forEach(w => {
    if (contentLower.includes(w)) errors.push(`Spanish word in EN post: "${w}"`);
  });
}

// RESULTS
const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

if (errors.length > 0) {
  console.error(`\n❌ QA FAILED — ${errors.length} issue(s):\n`);
  errors.forEach((e, i) => console.error(`  ${i + 1}. ${e}`));
  const logEntry = `[${new Date().toISOString()}] FAIL: ${file}\n${errors.map(e => `  - ${e}`).join('\n')}\n\n`;
  fs.appendFileSync(path.join(logDir, 'qa-failures.log'), logEntry);
  process.exit(1);
} else {
  console.log(`\n✅ QA PASSED — ${words} words, ${h2s.length} sections, all checks green.\n`);
  process.exit(0);
}
