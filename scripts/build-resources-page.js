#!/usr/bin/env node
// build-resources-page.js — Auto-generate a /resources page listing all free PDF guides
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const pdfDir = path.join(rootDir, 'pdfs');
const metaDir = path.join(rootDir, 'posts', 'meta');
const outputPath = path.join(rootDir, 'resources.html');

// Collect all PDFs with their metadata
const pdfs = fs.readdirSync(pdfDir)
  .filter(f => f.endsWith('.pdf') && !f.startsWith('_'))
  .map(f => {
    const slug = path.basename(f, '.pdf');
    const metaPath = path.join(metaDir, `${slug}.json`);
    let meta = { title: slug, keywords: [], language: 'EN' };
    if (fs.existsSync(metaPath)) {
      meta = { ...meta, ...JSON.parse(fs.readFileSync(metaPath, 'utf-8')) };
    }
    const stats = fs.statSync(path.join(pdfDir, f));
    return {
      slug,
      file: f,
      title: meta.title,
      keywords: meta.keywords || [],
      language: meta.language || 'EN',
      sizeKB: (stats.size / 1024).toFixed(0),
      date: meta.generatedAt ? new Date(meta.generatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''
    };
  })
  .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

if (pdfs.length === 0) {
  console.log('No PDFs found — skipping resources page.');
  process.exit(0);
}

const cards = pdfs.map(p => `
      <div class="resource-card">
        <div class="resource-lang">${p.language}</div>
        <h2><a href="output/${p.slug}.html">${p.title}</a></h2>
        <p class="resource-meta">${p.date} &middot; ${p.sizeKB} KB PDF</p>
        ${p.keywords.length ? `<p class="resource-tags">${p.keywords.join(', ')}</p>` : ''}
        <a href="pdfs/${p.file}" class="resource-download" download>Download Free PDF</a>
      </div>`).join('\n');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Free Guides & Resources — gonzalo.tech</title>
  <meta name="description" content="Free downloadable PDF guides on AI, product strategy, and conversion optimization for small business owners. No email required.">
  <meta property="og:title" content="Free Guides & Resources — gonzalo.tech">
  <meta property="og:description" content="Free downloadable PDF guides on AI, product strategy, and conversion optimization for small business owners.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://gonzalo.tech/resources">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --ink: #0F172A; --slate: #334155; --muted: #64748B; --subtle: #94A3B8;
      --border: #E2E8F0; --surface: #F8FAFC; --white: #FFFFFF;
      --font-heading: Georgia, 'Times New Roman', serif;
      --font-body: Calibri, 'Gill Sans', 'Segoe UI', sans-serif;
    }
    body {
      font-family: var(--font-body);
      font-size: 18px;
      line-height: 1.7;
      color: var(--slate);
      background: var(--white);
      -webkit-font-smoothing: antialiased;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem 1.5rem 4rem;
    }
    .site-header {
      border-bottom: 1px solid var(--border);
      padding: 1.5rem 0;
      margin-bottom: 2rem;
    }
    .site-header a {
      font-family: var(--font-heading);
      font-size: 1.25rem;
      color: var(--ink);
      text-decoration: none;
    }
    .page-title {
      font-family: var(--font-heading);
      font-size: 2rem;
      color: var(--ink);
      margin-bottom: 0.5rem;
    }
    .page-intro {
      color: var(--muted);
      font-size: 1.05rem;
      margin-bottom: 2.5rem;
      max-width: 700px;
    }
    .resource-count {
      font-size: 0.9rem;
      color: var(--subtle);
      margin-bottom: 1.5rem;
    }
    .resource-card {
      border: 1px solid var(--border);
      padding: 1.5rem;
      margin-bottom: 1rem;
    }
    .resource-card h2 {
      font-family: var(--font-heading);
      font-size: 1.2rem;
      margin-bottom: 0.25rem;
    }
    .resource-card h2 a {
      color: var(--ink);
      text-decoration: none;
    }
    .resource-card h2 a:hover {
      text-decoration: underline;
    }
    .resource-lang {
      display: inline-block;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: var(--muted);
      border: 1px solid var(--border);
      padding: 2px 8px;
      margin-bottom: 0.5rem;
    }
    .resource-meta {
      font-size: 0.85rem;
      color: var(--muted);
      margin-bottom: 0.25rem;
    }
    .resource-tags {
      font-size: 0.8rem;
      color: var(--subtle);
      margin-bottom: 0.75rem;
    }
    .resource-download {
      display: inline-block;
      padding: 0.4rem 1rem;
      background: var(--ink);
      color: var(--white);
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 600;
    }
    .resource-download:hover { background: var(--slate); }
    .site-footer {
      margin-top: 4rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border);
      text-align: center;
      font-size: 0.85rem;
      color: var(--subtle);
    }
    @media (max-width: 600px) {
      body { font-size: 16px; }
      .container { padding: 1rem; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="site-header">
      <a href="/">gonzalo.tech</a>
    </header>

    <h1 class="page-title">Free Guides & Resources</h1>
    <p class="page-intro">Practical guides on AI, product strategy, and conversion optimization. Written for business owners, not engineers. All free — no email required.</p>
    <p class="resource-count">${pdfs.length} guide${pdfs.length !== 1 ? 's' : ''} available</p>

    <div class="resources">
${cards}
    </div>

    <footer class="site-footer">
      &copy; ${new Date().getFullYear()} gonzalo.tech — Gonzalo Aguilar
    </footer>
  </div>
</body>
</html>`;

fs.writeFileSync(outputPath, html);
console.log(`✅ Resources page: ${outputPath} (${pdfs.length} guides listed)`);
