#!/usr/bin/env node
// orchestrator.js — Full pipeline: generate → QA → HTML → PDF → repurpose → git commit
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

function run(cmd, label) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`▶ ${label}`);
  console.log('='.repeat(60));
  try {
    execSync(cmd, { cwd: rootDir, stdio: 'inherit' });
    return true;
  } catch (err) {
    console.error(`\n❌ FAILED: ${label}`);
    return false;
  }
}

function getLatestSlug() {
  const topicsPath = path.join(rootDir, 'content', 'topics.json');
  const topics = JSON.parse(fs.readFileSync(topicsPath, 'utf-8'));
  // Find most recently generated topic
  const generated = topics.topics.filter(t => t.status === 'generated' || t.status === 'generating');
  if (generated.length > 0) return generated[generated.length - 1].slug;
  return null;
}

async function pipeline() {
  const startTime = Date.now();
  console.log('\n🚀 gonzalo.tech Content Pipeline');
  console.log(`   Started: ${new Date().toISOString()}\n`);

  // Step 1: Generate
  if (!run('node scripts/generate-blog.js', 'GENERATE BLOG POST')) {
    console.error('\n💀 Pipeline aborted at generation.');
    process.exit(1);
  }

  const slug = getLatestSlug();
  if (!slug) {
    console.log('\n⚠️ No topic was generated (all done?)');
    process.exit(0);
  }

  const postPath = path.join('posts', `${slug}.md`);
  const htmlPath = path.join('output', `${slug}.html`);

  // Step 2: QA Gate
  if (!run(`node scripts/qa-gate.js ${postPath}`, 'QA GATE')) {
    console.error(`\n💀 Pipeline aborted — QA failed for ${slug}`);
    // Mark as failed in topics.json
    const topicsPath = path.join(rootDir, 'content', 'topics.json');
    const topics = JSON.parse(fs.readFileSync(topicsPath, 'utf-8'));
    const topic = topics.topics.find(t => t.slug === slug);
    if (topic) {
      topic.status = 'qa_failed';
      fs.writeFileSync(topicsPath, JSON.stringify(topics, null, 2));
    }
    process.exit(1);
  }

  // Step 3: Build HTML
  if (!run(`node scripts/build-blog-html.js ${postPath}`, 'BUILD HTML')) {
    console.error('\n💀 Pipeline aborted at HTML build.');
    process.exit(1);
  }

  // Step 4: Generate branded PDF (from markdown, not raw HTML)
  if (!run(`node scripts/generate-pdf.js ${postPath}`, 'GENERATE PDF')) {
    console.error('\n⚠️ PDF generation failed — continuing without PDF.');
    // Non-fatal: continue pipeline
  }

  // Step 5: PDF QA
  const pdfPath = path.join('pdfs', `${slug}.pdf`);
  if (fs.existsSync(path.join(rootDir, pdfPath))) {
    if (!run(`node scripts/qa-pdf.js ${pdfPath}`, 'PDF QA')) {
      console.error('\n⚠️ PDF QA failed — PDF may have issues.');
    }
  }

  // Step 6: Repurpose
  if (!run(`node scripts/repurpose.js ${postPath}`, 'REPURPOSE CONTENT')) {
    console.error('\n⚠️ Repurposing failed — continuing without social content.');
    // Non-fatal: continue pipeline
  }

  // Step 7: Mark as published in topics.json
  const topicsPath = path.join(rootDir, 'content', 'topics.json');
  const topics = JSON.parse(fs.readFileSync(topicsPath, 'utf-8'));
  const topic = topics.topics.find(t => t.slug === slug);
  if (topic) {
    topic.status = 'published';
    topic.publishedAt = new Date().toISOString();
    fs.writeFileSync(topicsPath, JSON.stringify(topics, null, 2));
  }

  // Step 8: Rebuild resources page (lists all available PDFs)
  run('node scripts/build-resources-page.js', 'BUILD RESOURCES PAGE');

  // Step 9: Rebuild homepage blog grid
  run('node scripts/build-index.js', 'REBUILD HOMEPAGE INDEX');

  // Step 10: Rebuild sitemap
  run('node scripts/build-sitemap.js', 'REBUILD SITEMAP');

  // Step 11: Git commit (only in CI or if GIT_COMMIT env is set)
  if (process.env.CI || process.env.GIT_COMMIT) {
    run(`git add -A && git commit -m "content: publish ${slug}" --author="gonzalo-bot <bot@gonzalo.tech>"`,
      'GIT COMMIT');
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ PIPELINE COMPLETE — ${slug}`);
  console.log(`   Duration: ${elapsed}s`);
  console.log(`   Post: ${postPath}`);
  console.log(`   HTML: ${htmlPath}`);
  console.log(`   PDF: pdfs/${slug}.pdf`);
  console.log(`   Social: repurposed/${slug}/`);
  console.log('='.repeat(60));
}

pipeline().catch(err => {
  console.error('❌ Pipeline error:', err.message);
  process.exit(1);
});
