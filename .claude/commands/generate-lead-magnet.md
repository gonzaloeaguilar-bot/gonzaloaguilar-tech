Take the markdown file at $ARGUMENTS, apply brand template, generate PDF:
1. Read the markdown file
2. Run `node scripts/build-blog-html.js $ARGUMENTS` to apply brand styling
3. Run `node scripts/generate-pdf.js` on the resulting HTML
4. Report the PDF path and file size
