#!/usr/bin/env node
// qa-pdf.js — Deterministic PDF quality checks (zero AI calls)
// Exit 0 = PASS, Exit 1 = FAIL
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const file = process.argv[2];
if (!file) { console.error('Usage: node qa-pdf.js <pdf-file>'); process.exit(1); }
if (!fs.existsSync(file)) { console.error(`File not found: ${file}`); process.exit(1); }

const errors = [];
const warnings = [];

// 1. File size check
const stats = fs.statSync(file);
const sizeKB = stats.size / 1024;
if (sizeKB < 10) errors.push(`PDF too small: ${sizeKB.toFixed(1)} KB (min 10 KB)`);
if (sizeKB > 5000) warnings.push(`PDF very large: ${sizeKB.toFixed(0)} KB (>5 MB)`);

// 2. PDF header check — verify it's actually a PDF
const header = Buffer.alloc(5);
const fd = fs.openSync(file, 'r');
fs.readSync(fd, header, 0, 5, 0);
fs.closeSync(fd);
if (header.toString() !== '%PDF-') {
  errors.push('Not a valid PDF file (missing %PDF- header)');
}

// 3. Read raw PDF content for text checks
const rawContent = fs.readFileSync(file);
const textContent = rawContent.toString('latin1');

// 4. Check for cover page indicator (gonzalo.tech brand)
if (!textContent.includes('gonzalo.tech')) {
  warnings.push('Brand name "gonzalo.tech" not found in PDF text');
}

// 5. Check for forbidden terms in PDF text
const forbidden = ['NEO PAM', 'GROWTH-', 'WHUSP-', 'caesars', 'sportsbook', 'casino',
  'hard rock', 'draftkings', 'fanduel', 'betmgm', 'czr'];
// Extract only text streams from PDF (between BT/ET markers) to avoid binary false positives
const textStreams = textContent.match(/BT[\s\S]*?ET/g) || [];
const decodedText = textStreams.join(' ').toLowerCase();
// Also check parenthesized strings (PDF text objects)
const parenStrings = textContent.match(/\(([^)]+)\)/g) || [];
const parenText = parenStrings.join(' ').toLowerCase();
const searchText = decodedText + ' ' + parenText;
forbidden.forEach(term => {
  if (searchText.includes(term.toLowerCase()))
    errors.push(`FORBIDDEN TERM in PDF: "${term}"`);
});

// 6. Check page count via PDF object count (basic heuristic)
const pageMatches = textContent.match(/\/Type\s*\/Page[^s]/g);
const pageCount = pageMatches ? pageMatches.length : 0;
if (pageCount < 2) warnings.push(`Only ${pageCount} page(s) detected — expected cover + content + CTA`);
if (pageCount > 30) warnings.push(`${pageCount} pages — unusually long for a blog PDF`);

// RESULTS
const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

if (errors.length > 0) {
  console.error(`\n❌ PDF QA FAILED — ${errors.length} error(s):`);
  errors.forEach((e, i) => console.error(`  ${i + 1}. ${e}`));
  if (warnings.length > 0) {
    console.warn(`\n⚠️ ${warnings.length} warning(s):`);
    warnings.forEach((w, i) => console.warn(`  ${i + 1}. ${w}`));
  }
  const logEntry = `[${new Date().toISOString()}] PDF FAIL: ${file}\n${errors.map(e => `  - ${e}`).join('\n')}\n\n`;
  fs.appendFileSync(path.join(logDir, 'qa-failures.log'), logEntry);
  process.exit(1);
} else {
  console.log(`\n✅ PDF QA PASSED — ${sizeKB.toFixed(0)} KB, ~${pageCount} pages`);
  if (warnings.length > 0) {
    console.warn(`   ⚠️ ${warnings.length} warning(s):`);
    warnings.forEach((w, i) => console.warn(`     ${i + 1}. ${w}`));
  }
  process.exit(0);
}
