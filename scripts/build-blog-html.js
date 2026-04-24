#!/usr/bin/env node
// build-blog-html.js — Convert markdown blog post to branded HTML
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const file = process.argv[2];
if (!file) { console.error('Usage: node build-blog-html.js <markdown-file>'); process.exit(1); }
if (!fs.existsSync(file)) { console.error(`File not found: ${file}`); process.exit(1); }

const templatePath = path.join(__dirname, '..', 'templates', 'blog-template.html');
const outputDir = path.join(__dirname, '..', 'output');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const markdown = fs.readFileSync(file, 'utf-8');
const template = fs.readFileSync(templatePath, 'utf-8');

// Extract metadata from markdown
const lines = markdown.split('\n');

// Extract title from first H1
const h1Line = lines.find(l => /^# [^#]/.test(l));
const title = h1Line ? h1Line.replace(/^# /, '').trim() : 'Untitled';

// Extract meta description
const metaLine = lines.find(l => /meta description:/i.test(l));
let metaDesc = '';
if (metaLine) {
  metaDesc = metaLine.replace(/\*?meta description:\s*/i, '').replace(/\*$/,'').trim();
}

// Determine slug from filename
const slug = path.basename(file, '.md');

// Load meta JSON for keywords and language
let keywords = '';
let meta = {};
const metaJsonPath = path.join(__dirname, '..', 'posts', 'meta', `${slug}.json`);
if (fs.existsSync(metaJsonPath)) {
  meta = JSON.parse(fs.readFileSync(metaJsonPath, 'utf-8'));
  keywords = (meta.keywords || []).join(', ');
}

// Detect language from meta JSON, slug suffix, or markdown language line
let lang = 'en';
if (meta.language === 'ES') lang = 'es';
if (slug.match(/_(ES|es)$/)) lang = 'es';
const langLine = lines.find(l => /^language:\s*es/i.test(l));
if (langLine) lang = 'es';

// Strip meta description line from body content (it goes in <head>, not article)
const cleanedMarkdown = markdown.replace(/^\*?[Mm]eta [Dd]escription:.*\*?$/m, '').trim();

// Convert markdown to HTML
marked.setOptions({
  gfm: true,
  breaks: false
});
const htmlContent = marked.parse(cleanedMarkdown);

// Get publish date from meta JSON or fallback to today
const datePublished = (meta.generatedAt || meta.publishedAt || new Date().toISOString()).split('T')[0];

// Fill template
const html = template
  .replace(/\{\{TITLE\}\}/g, title)
  .replace(/\{\{META_DESCRIPTION\}\}/g, metaDesc)
  .replace(/\{\{KEYWORDS\}\}/g, keywords)
  .replace(/\{\{SLUG\}\}/g, slug)
  .replace(/\{\{LANG\}\}/g, lang)
  .replace(/\{\{DATE_PUBLISHED\}\}/g, datePublished)
  .replace(/\{\{YEAR\}\}/g, new Date().getFullYear().toString())
  .replace('{{CONTENT}}', htmlContent);

// Write output
const outputPath = path.join(outputDir, `${slug}.html`);
const latestPath = path.join(outputDir, 'latest.html');
fs.writeFileSync(outputPath, html);
fs.writeFileSync(latestPath, html);

console.log(`✅ Built HTML: ${outputPath}`);
console.log(`   Title: ${title}`);
console.log(`   Meta: ${metaDesc.substring(0, 80)}...`);
