/* ============================================================
   DERA ZONE - Search System
   Searches all products, pages, categories, keywords
   ============================================================ */
const derazone_STATIC_SEARCH_INDEX = [
  /* Categories */
  { type: 'category', title: 'All Collections',           keywords: 'all shop products catalog browse trending', url: 'shop.html', badge: 'Category' },
  { type: 'category', title: 'Accessories',               keywords: 'accessories bags belts caps eyewear wallet daily', url: 'shop.html?cat=accessories', badge: 'Category' },
  { type: 'category', title: 'Gadgets',                   keywords: 'gadgets smart gadgets smartwatch chargers tech devices', url: 'shop.html?cat=gadgets', badge: 'Category' },
  { type: 'category', title: 'Wireless Earbuds & Audio',  keywords: 'wireless earbuds audio headphones airpods bluetooth sound speakers bass', url: 'shop.html?cat=wireless-earbuds-audio', badge: 'Category' },
  { type: 'category', title: 'Jewellery',                 keywords: 'jewellery jewelry rings bracelets necklaces earrings bangles', url: 'shop.html?cat=jewellery', badge: 'Category' },
  { type: 'category', title: 'Fashion & Lifestyle',       keywords: 'fashion lifestyle perfume scents styling trending', url: 'shop.html?cat=fashion-lifestyle', badge: 'Category' },
  { type: 'category', title: 'Footwear',                  keywords: 'footwear shoes sneakers slides slippers boots', url: 'shop.html?cat=footwear', badge: 'Category' },
  { type: 'category', title: 'Clothing & Apparel',        keywords: 'clothing apparel shirts hoodies jackets tshirts pants', url: 'shop.html?cat=clothing-apparel', badge: 'Category' },
  { type: 'category', title: 'Winter Collection',         keywords: 'winter collection jackets fleece hoodies sweaters warm', url: 'shop.html?cat=winter-collection', badge: 'Category' },
  /* Pages */
  { type: 'page', title: 'About DERA ZONE', keywords: 'about dera zone story brand pakistan online shopping audio tech lifestyle', url: 'about.html', badge: 'Page' },
  { type: 'page', title: 'Contact Support', keywords: 'contact email phone whatsapp support customer care', url: 'contact.html', badge: 'Page' },
  { type: 'page', title: 'Shipping Info',   keywords: 'shipping delivery days free standard 3 5 working days', url: 'policy.html?page=shipping', badge: 'Policy' },
  { type: 'page', title: 'Returns & Exchange', keywords: 'returns refund exchange policy damage', url: 'policy.html?page=returns', badge: 'Policy' },
  { type: 'page', title: 'FAQs',            keywords: 'faq questions answers help support ordering payment', url: 'policy.html?page=faqs', badge: 'Help' },
  { type: 'page', title: 'Track Order',     keywords: 'track order tracking status delivery shipment courier', url: 'policy.html?page=track', badge: 'Tool' },
  { type: 'page', title: 'My Account',      keywords: 'account login signin signup register profile orders', url: 'account.html', badge: 'Account' },
];

let globalSearchProducts = [];

document.addEventListener('DOMContentLoaded', () => {
  const toggle    = document.getElementById('search-toggle');
  const overlay   = document.getElementById('search-overlay');
  const closeBtn  = document.getElementById('search-close');
  const input     = document.getElementById('search-input');
  const results   = document.getElementById('search-results');

  if (!toggle || !overlay) return;

  // Pre-fetch products for search when overlay is opened
  async function preloadProductsForSearch() {
    if (globalSearchProducts.length > 0) return;
    try {
      const res = await fetch((typeof API !== 'undefined' ? API : '/api') + '/products');
      if (res.ok) {
        const data = await res.json();
        globalSearchProducts = data.products || [];
      }
    } catch(err) {
      console.warn("Failed to load products for search", err);
    }
  }

  /* open */
  toggle.addEventListener('click', () => {
    overlay.classList.add('active');
    preloadProductsForSearch(); // lazy load
    setTimeout(() => input?.focus(), 120);
  });

  /* close */
  const closeSearch = () => {
    overlay.classList.remove('active');
    if (input) input.value = '';
    if (results) results.innerHTML = '';
  };
  closeBtn?.addEventListener('click', closeSearch);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeSearch(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSearch(); });

  /* search logic */
  input?.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q || q.length < 2) { results.innerHTML = ''; return; }
    
    // Search Static Index
    const staticMatches = derazone_STATIC_SEARCH_INDEX.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.keywords.toLowerCase().includes(q)
    );

    // Search Products
    const productMatches = globalSearchProducts.filter(p => {
      const pTitle = (p.name || p.title || '').toLowerCase();
      const pCat = (p.category || '').toLowerCase();
      const pSub = (p.subcategory || '').toLowerCase();
      return pTitle.includes(q) || pCat.includes(q) || pSub.includes(q);
    }).slice(0, 8); // limit to top 8 products

    if (staticMatches.length === 0 && productMatches.length === 0) {
      results.innerHTML = `<div class="search-no-results">No results for "<em>${q}</em>"</div>`;
      return;
    }

    let html = '';

    // Render Products First (since users usually search for products)
    if (productMatches.length > 0) {
      html += `<div class="search-section-title" style="padding: 8px 12px; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 2px; color: #888; font-weight: 700; background: #faf8f5; border-bottom: 1px solid #eee;">Products</div>`;
      productMatches.forEach(p => {
        const imgUrl = p.images && p.images[0] ? p.images[0] : 'images/placeholder.jpg';
        const price = p.price ? `PKR ${Number(p.price).toLocaleString()}` : '';
        html += `
        <a href="product.html?id=${p.id || p.name}" class="search-result-item product-result" onclick="closeSearchOverlay()" style="display: flex; align-items: center; gap: 12px; padding: 10px; border-bottom: 1px solid #eee; text-decoration: none;">
          <img src="${imgUrl}" alt="${p.name || p.title}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" onerror="this.src='images/placeholder.jpg'"/>
          <div style="flex: 1; display: flex; flex-direction: column;">
            <span class="sr-title" style="color: #111; font-weight: 600; font-size: 0.95rem;">${highlight(p.name || p.title || '', q)}</span>
            <span class="sr-price" style="color: #888; font-size: 0.85rem;">${price}</span>
          </div>
        </a>`;
      });
    }

    // Render Categories & Pages
    if (staticMatches.length > 0) {
      if (productMatches.length > 0) html += `<div class="search-section-title" style="padding: 8px 12px; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 2px; color: #888; font-weight: 700; background: #faf8f5; border-bottom: 1px solid #eee; border-top: 1px solid #eee; margin-top: 10px;">Pages & Categories</div>`;
      staticMatches.forEach(item => {
        const icon = item.type === 'category' ? '<i class="fa-solid fa-layer-group"></i>' : '<i class="fa-solid fa-file"></i>';
        html += `
        <a href="${item.url}" class="search-result-item" onclick="closeSearchOverlay()" style="display: flex; align-items: center; gap: 12px; padding: 10px; border-bottom: 1px solid #eee; text-decoration: none;">
          <span style="color: #888; font-size: 1.1rem; width: 20px; text-align: center;">${icon}</span>
          <div style="flex: 1; display: flex; flex-direction: column;">
            <span class="sr-title" style="color: #111; font-weight: 600; font-size: 0.95rem;">${highlight(item.title, q)}</span>
            <span class="sr-badge" style="color: #888; font-size: 0.8rem;">${item.badge}</span>
          </div>
        </a>`;
      });
    }

    results.innerHTML = html;
  });

  /* Enter key navigation */
  input?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const first = results.querySelector('.search-result-item');
      if (first) first.click();
    }
  });
});

/* highlight matched text */
function highlight(text, query) {
  if (!text) return '';
  const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(re, '<mark style="background: rgba(196,153,108,0.3); color: inherit;">$1</mark>');
}

/* called from onclick in results */
window.closeSearchOverlay = function() {
  document.getElementById('search-overlay')?.classList.remove('active');
}


