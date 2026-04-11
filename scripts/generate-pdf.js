#!/usr/bin/env node
// generate-pdf.js — Markdown → branded PDF via PDF template + Playwright Chromium
// Accepts either .md (preferred) or .html input
const { chromium } = require('playwright');
const { marked } = require('marked');
const fs = require('fs');
const path = require('path');

const file = process.argv[2];
if (!file) { console.error('Usage: node generate-pdf.js <markdown-or-html-file>'); process.exit(1); }
if (!fs.existsSync(file)) { console.error(`File not found: ${file}`); process.exit(1); }

const pdfDir = path.join(__dirname, '..', 'pdfs');
if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

const ext = path.extname(file);
const slug = path.basename(file, ext);
const pdfPath = path.join(pdfDir, `${slug}.pdf`);

function buildPdfHtml(markdownContent) {
  const templatePath = path.join(__dirname, '..', 'templates', 'pdf-template.html');
  const template = fs.readFileSync(templatePath, 'utf-8');

  const lines = markdownContent.split('\n');

  // Extract title from first H1
  const h1Line = lines.find(l => /^# [^#]/.test(l));
  const title = h1Line ? h1Line.replace(/^# /, '').trim() : 'Untitled';

  // Extract meta description
  const metaLine = lines.find(l => /meta description:/i.test(l));
  let metaDesc = '';
  if (metaLine) {
    metaDesc = metaLine.replace(/\*?meta description:\s*/i, '').replace(/\*$/, '').trim();
  }

  // Detect language
  const lang = slug.match(/_(ES|es)$/) ? 'es' : 'en';

  // Convert markdown to HTML (strip the meta description line from content)
  const cleanedMarkdown = lines
    .filter(l => !/^\*?meta description:/i.test(l.trim()))
    .join('\n');

  marked.setOptions({ gfm: true, breaks: false });
  const htmlContent = marked.parse(cleanedMarkdown);

  // Format date
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

  return template
    .replace(/\{\{TITLE\}\}/g, title)
    .replace(/\{\{META_DESCRIPTION\}\}/g, metaDesc)
    .replace(/\{\{LANG\}\}/g, lang)
    .replace(/\{\{DATE\}\}/g, dateStr)
    .replace('{{CONTENT}}', htmlContent);
}

async function generatePdf() {
  let htmlToRender;

  if (ext === '.md') {
    // Build PDF-specific HTML from markdown
    const markdown = fs.readFileSync(file, 'utf-8');
    htmlToRender = buildPdfHtml(markdown);
  } else {
    // Fallback: use HTML directly
    htmlToRender = fs.readFileSync(file, 'utf-8');
  }

  // Write temp HTML for Playwright
  const tempHtml = path.join(pdfDir, `_temp_${slug}.html`);
  fs.writeFileSync(tempHtml, htmlToRender);

  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(`file://${path.resolve(tempHtml)}`, { waitUntil: 'networkidle' });

  await page.pdf({
    path: pdfPath,
    format: 'Letter',
    printBackground: true,
    displayHeaderFooter: false
  });

  await browser.close();

  // Clean up temp file
  fs.unlinkSync(tempHtml);

  // Verify PDF
  const stats = fs.statSync(pdfPath);
  if (stats.size < 1000) {
    console.error(`❌ PDF too small (${stats.size} bytes) — likely broken`);
    process.exit(1);
  }

  console.log(`✅ PDF generated: ${pdfPath} (${(stats.size / 1024).toFixed(1)} KB)`);
}

generatePdf().catch(err => {
  console.error('❌ PDF generation failed:', err.message);
  process.exit(1);
});
