#!/usr/bin/env node
// build-sitemap.js — Generate sitemap.xml from published posts
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const topicsPath = path.join(rootDir, 'content', 'topics.json');
const BASE = 'https://gonzalo.tech';

const topics = JSON.parse(fs.readFileSync(topicsPath, 'utf-8'));
const published = topics.topics.filter(t =>
  t.status === 'published' || t.status === 'generated'
);

const today = new Date().toISOString().split('T')[0];

let urls = `  <url>
    <loc>${BASE}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE}/resources.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;

for (const topic of published) {
  urls += `
  <url>
    <loc>${BASE}/output/${topic.slug}.html</loc>
    <lastmod>${topic.publishedAt ? topic.publishedAt.split('T')[0] : today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

fs.writeFileSync(path.join(rootDir, 'sitemap.xml'), sitemap);
console.log(`✅ Sitemap generated with ${published.length + 2} URLs.`);
