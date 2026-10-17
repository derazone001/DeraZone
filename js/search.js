/* ============================================================
   DERA ZONE - Search System
   Searches all products, pages, categories, keywords
   ============================================================ */
const derazone_STATIC_SEARCH_INDEX = [
  /* Categories */
  { type: 'category', title: 'All Collections',   keywords: 'all shop products catalog browse', url: 'shop.html',     badge: 'Category' },
  { type: 'category', title: 'Jewelry',            keywords: 'jewelry rings bracelets necklaces earrings bangles sets gold silver', url: 'jewelry.html', badge: 'Category' },
  { type: 'category', title: 'Cosmetics',          keywords: 'cosmetics beauty makeup lipstick blush foundation skincare', url: 'cosmetics.html', badge: 'Category' },
  { type: 'category', title: 'Deals',              keywords: 'deals sale discount offer reduced price deal bundle', url: 'shop.html?cat=deals', badge: 'Sale' },
  /* Pages */
  { type: 'page', title: 'Our Story',        keywords: 'about zarin e husn story brand lahore founded history',   url: 'about.html',                  badge: 'Page' },
  { type: 'page', title: 'Contact Us',       keywords: 'contact email phone whatsapp address location',           url: 'contact.html',                badge: 'Page' },
  { type: 'page', title: 'Shipping Info',    keywords: 'shipping delivery days free standard',                    url: 'policy.html?page=shipping',   badge: 'Policy' },
  { type: 'page', title: 'Returns Policy',   keywords: 'returns refund exchange 14 day policy',                   url: 'policy.html?page=returns',    badge: 'Policy' },
  { type: 'page', title: 'FAQs',             keywords: 'faq questions answers help support',                      url: 'policy.html?page=faqs',       badge: 'Help'   },
  { type: 'page', title: 'Track Your Order', keywords: 'track order tracking status delivery shipment',           url: 'policy.html?page=track',      badge: 'Tool'   },
  { type: 'page', title: 'My Account',       keywords: 'account login signin signup register profile',            url: 'account',                badge: 'Account'},
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


