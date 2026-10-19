/* ============================================================
   DERA ZONE — Sitemap Generator
   Run: node generate-sitemap.js
   ============================================================ */

const fs   = require('fs');
const path = require('path');

const DOMAIN = 'https://derazone.com';
const TODAY  = new Date().toISOString().slice(0, 10);

/* Static pages */
const STATIC = [
  { loc: `${DOMAIN}/`,           changefreq: 'weekly',  priority: '1.0' },
  { loc: `${DOMAIN}/shop.html`,  changefreq: 'daily',   priority: '0.9' },
  { loc: `${DOMAIN}/about.html`, changefreq: 'monthly', priority: '0.7' },
  { loc: `${DOMAIN}/contact.html`, changefreq: 'monthly', priority: '0.6' },
  { loc: `${DOMAIN}/policy.html`, changefreq: 'monthly', priority: '0.5' },
];

const CATEGORIES = [
  'accessories',
  'gadgets',
  'wireless-earbuds-audio',
  'jewellery',
  'fashion-lifestyle',
  'footwear',
  'clothing-apparel',
  'winter-collection'
];

function urlEntry(loc, changefreq, priority) {
  const escapedLoc = loc.replace(/&/g, '&amp;');
  return `  <url>\n    <loc>${escapedLoc}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

function generate() {
  const entries = [];
  STATIC.forEach(p => entries.push(urlEntry(p.loc, p.changefreq, p.priority)));
  CATEGORIES.forEach(cat => {
    entries.push(urlEntry(`${DOMAIN}/shop.html?cat=${cat}`, 'weekly', '0.8'));
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

${entries.join('\n')}

</urlset>`;

  const outPath = path.join(__dirname, 'sitemap.xml');
  fs.writeFileSync(outPath, xml, 'utf8');
  console.log(`Done! sitemap.xml updated with ${entries.length} URLs`);
}

generate();
