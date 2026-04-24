#!/usr/bin/env node
// build-index.js — Replace blog grid in index.html with all published posts
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const indexPath = path.join(rootDir, 'index.html');
const topicsPath = path.join(rootDir, 'content', 'topics.json');
const metaDir = path.join(rootDir, 'posts', 'meta');

const topics = JSON.parse(fs.readFileSync(topicsPath, 'utf-8'));
const published = topics.topics.filter(t =>
  t.status === 'published' || t.status === 'generated'
);

if (published.length === 0) {
  console.log('No published posts to list.');
  process.exit(0);
}

// Category mapping by framework/keywords
function getCategory(topic) {
  const kw = (topic.keywords || []).join(' ').toLowerCase();
  if (kw.includes('ux') || kw.includes('ui') || kw.includes('design')) return 'UX &middot; Design';
  if (kw.includes('ai') || kw.includes('ia')) return 'AI &middot; Strategy';
  if (kw.includes('conversion') || kw.includes('funnel') || kw.includes('trust') || kw.includes('onboarding')) return 'Growth &middot; Conversion';
  if (kw.includes('product') || kw.includes('qa') || kw.includes('testing')) return 'Product &middot; Strategy';
  return 'Strategy';
}

// Build blog cards HTML
const delay = ['d1','d2','d3','d4','d5','d1','d2','d3','d4','d5'];
const blogCards = published.map((topic, i) => {
  const metaPath = path.join(metaDir, `${topic.slug}.json`);
  let meta = {};
  if (fs.existsSync(metaPath)) {
    meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
  }

  const readTime = Math.ceil((meta.wordCount || 1200) / 250);
  const category = getCategory(topic);
  const keywords = (topic.keywords || []).map(k =>
    `<span class="blog-keyword">${k}</span>`
  ).join('');
  const d = delay[i % delay.length];

  return `      <div class="blog-card reveal ${d}">
        <div class="blog-body">
          <div class="blog-meta"><span>${category}</span><span class="reading-time">${readTime} min read</span></div>
          <h3>${topic.title}</h3>
          <div class="blog-keywords">${keywords}</div>
          <a href="/output/${topic.slug}" class="blog-link">Read article &rarr;</a>
        </div>
      </div>`;
}).join('\n');

// Replace everything between blog-grid open and close
let html = fs.readFileSync(indexPath, 'utf-8');
html = html.replace(
  /(<div class="blog-grid">)[\s\S]*?(<\/div>\s*<\/div>\s*<\/section>\s*\n*<!-- ══ CTA)/,
  `$1\n${blogCards}\n    </div>\n  </div>\n</section>\n\n<!-- ══ CTA`
);

fs.writeFileSync(indexPath, html);
console.log(`✅ Index updated with ${published.length} blog posts.`);
