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
    <loc>${BASE}/resources</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;

// Add courses
const coursesDir = path.join(rootDir, 'courses');
if (fs.existsSync(coursesDir)) {
  for (const file of fs.readdirSync(coursesDir).filter(f => f.endsWith('.html'))) {
    const slug = file.replace('.html', '');
    urls += `
  <url>
    <loc>${BASE}/courses/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }
}

// Add products
const productsDir = path.join(rootDir, 'products');
if (fs.existsSync(productsDir)) {
  for (const file of fs.readdirSync(productsDir).filter(f => f.endsWith('.html'))) {
    const slug = file.replace('.html', '');
    urls += `
  <url>
    <loc>${BASE}/products/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }
}

// Add blog posts
for (const topic of published) {
  urls += `
  <url>
    <loc>${BASE}/output/${topic.slug}</loc>
    <lastmod>${topic.publishedAt ? topic.publishedAt.split('T')[0] : today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
}

const totalUrls = published.length + 2 +
  (fs.existsSync(coursesDir) ? fs.readdirSync(coursesDir).filter(f => f.endsWith('.html')).length : 0) +
  (fs.existsSync(productsDir) ? fs.readdirSync(productsDir).filter(f => f.endsWith('.html')).length : 0);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

fs.writeFileSync(path.join(rootDir, 'sitemap.xml'), sitemap);
console.log(`✅ Sitemap generated with ${totalUrls} URLs.`);
