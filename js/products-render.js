/* ============================================================
   DERA ZONE — Dynamic Product Rendering & Catalog
   ============================================================ */

window.CATEGORY_HIERARCHY = {
  'derazone': [
    'accessories',
    'gadgets',
    'wireless-earbuds-audio',
    'jewellery',
    'fashion-lifestyle',
    'footwear',
    'clothing-apparel',
    'winter-collection'
  ]
};

const DERAZONE_CAT_LABELS = {
  'accessories': 'Accessories',
  'gadgets': 'Gadgets',
  'wireless-earbuds-audio': 'Wireless Earbuds & Audio',
  'jewellery': 'Jewellery',
  'fashion-lifestyle': 'Fashion & Lifestyle',
  'footwear': 'Footwear',
  'clothing-apparel': 'Clothing & Apparel',
  'winter-collection': 'Winter Collection'
};

const DERAZONE_CAT_DESCRIPTIONS = {
  'all': 'Explore premium gadgets, wireless audio, lifestyle accessories & everyday essentials with nationwide Cash on Delivery.',
  'accessories': 'Fast chargers, MagSafe tech, ultra-durable cables, phone stands, and daily mobile essentials.',
  'gadgets': 'AMOLED smartwatches, high-capacity power banks, desk gadgets, and futuristic tech devices.',
  'wireless-earbuds-audio': 'Active noise-cancelling earbuds, deep bass gaming audio, and portable waterproof speakers.',
  'jewellery': 'Minimalist stainless steel chains, titanium rings, magnetic couples bracelets, and modern jewellery.',
  'fashion-lifestyle': 'Trending polarized sunglasses, long-lasting luxury fragrances, and curated lifestyle accessories.',
  'footwear': 'Everyday air-cushion sneakers, chunky streetwear low-tops, and ultra-soft ergonomic slides.',
  'clothing-apparel': 'Heavyweight 280 GSM streetwear tees, relaxed French terry hoodies, and tactical cargo joggers.',
  'winter-collection': 'Thermal sherpa-lined jackets, wind-resistant polar fleece hoodies, and lightweight puffer vests.'
};

function normalizeCategorySlug(c) {
  if (!c) return '';
  c = String(c).toLowerCase().trim().replace(/[\s_]+/g, '-');
  if (c === 'jewelry') return 'jewellery';
  if (c === 'wireless' || c === 'audio' || c === 'earbuds' || c === 'wireless-audio' || c === 'headphones' || c === 'handsfree') return 'wireless-earbuds-audio';
  if (c === 'fashion' || c === 'lifestyle' || c === 'sunglasses') return 'fashion-lifestyle';
  if (c === 'shoes' || c === 'sneakers') return 'footwear';
  if (c === 'clothing' || c === 'apparel' || c === 'streetwear') return 'clothing-apparel';
  if (c === 'winter' || c === 'jackets' || c === 'hoodies') return 'winter-collection';
  if (c === 'powerbanks' || c === 'smartwatches' || c === 'smartwatch') return 'gadgets';
  if (c === 'chargers' || c === 'cables' || c === 'usb-hubs' || c === 'car-charger') return 'accessories';
  return c;
}
window.normalizeCategorySlug = normalizeCategorySlug;
window.dzNormalizeCategory = normalizeCategorySlug;

function dzCatLabel(cat) {
  if (!cat) return '';
  const norm = normalizeCategorySlug(cat);
  return DERAZONE_CAT_LABELS[norm] || DERAZONE_CAT_LABELS[cat.toLowerCase()] || cat;
}
window.dzCatLabel = dzCatLabel;
window.velorCatLabel = dzCatLabel;

/* ── Live Product Catalog (Populated dynamically from backend / admin panel) ── */
const DERAZONE_CATALOG_PRODUCTS = [];

/* ── Product Card HTML Generator ── */
function derazoneProductCardHTML(p) {
  const normCat = normalizeCategorySlug(p.subcategory || p.category);
  const badgeHTML = p.badge ? `<span class="product-badge ${(p.badge || '').toLowerCase().replace(/[^a-z0-9]/g, '-')}" style="background:#7000ff;color:#fff;font-weight:800;font-size:0.7rem;letter-spacing:1px;">${p.badge}</span>` : '';
  const hasOldPrice = p.priceOld && p.priceOld > p.price;
  const pricingHTML = hasOldPrice 
    ? `<span class="product-price" style="color:#7000ff;font-weight:800;">PKR ${Number(p.price).toLocaleString()}</span>
       <span class="product-price-old" style="color:#9ca3af;text-decoration:line-through;margin-left:8px;font-size:0.85rem;">PKR ${Number(p.priceOld).toLocaleString()}</span>`
    : `<span class="product-price" style="color:#7000ff;font-weight:800;">PKR ${Number(p.price).toLocaleString()}</span>`;

  const primaryImg = (p.images && p.images[0]) || p.image || null;
  const imgContent = primaryImg
    ? `<img src="${primaryImg}" alt="${p.name.replace(/"/g, '&quot;')}" loading="lazy" style="max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;transition:transform 0.4s ease;padding:8px;" onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'">`
    : `<div class="product-img-placeholder" style="background:#f8fafc;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#7000ff;font-size:3.5rem;">
        <span>${p.emoji || '🛍️'}</span>
        <span style="font-size:0.75rem;font-weight:700;color:#64748b;margin-top:8px;text-transform:uppercase;letter-spacing:1px;">${dzCatLabel(normCat)}</span>
       </div>`;

  const cleanName = (p.name || '').replace(/'/g, "\\'");
  const cleanEmoji = (p.emoji || '🛍️').replace(/'/g, "\\'");
  const cleanImg = primaryImg ? primaryImg.replace(/'/g, "\\'") : '';

  const pSizes = Array.isArray(p.sizes) ? p.sizes : (typeof p.sizes === 'string' && p.sizes ? p.sizes.split(',').map(s=>s.trim()).filter(Boolean) : []);
  const pColors = Array.isArray(p.colors) ? p.colors : (typeof p.colors === 'string' && p.colors ? p.colors.split(',').map(c=>c.trim()).filter(Boolean) : []);
  const pVariants = Array.isArray(p.variants) ? p.variants : (typeof p.variants === 'string' && p.variants ? p.variants.split(',').map(v=>v.trim()).filter(Boolean) : []);
  const hasOptions = (pSizes.length > 0) || (pColors.length > 0) || (pVariants.length > 0);

  const addAction = hasOptions 
    ? `derazoneOpenQuickSelect('${p.id}')` 
    : `addToCart('${cleanName}', ${p.price}, '${cleanEmoji}', 'Standard', '${cleanImg}')`;

  return `
    <div class="product-card" data-cat="${normCat}" data-id="${p.id}" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.03);display:flex;flex-direction:column;transition:all 0.3s ease;">
      <div class="product-img-wrap" style="position:relative;aspect-ratio:1/1;width:100%;overflow:hidden;background:#f8fafc;display:flex;align-items:center;justify-content:center;">
        ${badgeHTML}
        ${imgContent}
        <div class="product-actions" style="position:absolute;bottom:10px;left:10px;right:10px;display:flex;gap:8px;z-index:2;">
          <button onclick="${addAction}" class="btn-primary" style="flex:1;padding:10px 14px;font-size:0.8rem;border-radius:8px;background:#7000ff;color:#fff;border:none;cursor:pointer;font-weight:700;box-shadow:0 4px 12px rgba(112,0,255,0.3);">
            <i class="fa-solid fa-bag-shopping"></i> Add to Bag
          </button>
        </div>
      </div>
      <div class="product-info" style="padding:16px;display:flex;flex-direction:column;flex:1;">
        <p class="product-cat" style="font-size:0.75rem;color:#7000ff;text-transform:uppercase;font-weight:700;letter-spacing:1px;margin-bottom:6px;">${dzCatLabel(normCat)}</p>
        <h3 class="product-name" style="font-size:0.95rem;font-weight:700;color:#0f172a;line-height:1.35;margin-bottom:10px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.6em;">
          <a href="product?id=${p.id}" style="color:inherit;text-decoration:none;">${p.name}</a>
        </h3>
        <div class="product-pricing" style="margin-top:auto;display:flex;align-items:baseline;">
          ${pricingHTML}
        </div>
      </div>
    </div>
  `;
}

function derazoneEmptyState(msg) {
  return `
    <div style="grid-column:1/-1;text-align:center;padding:60px 20px;background:#ffffff;border:1.5px dashed #e5e7eb;border-radius:16px;">
      <i class="fa-solid fa-box-open" style="font-size:3rem;color:#7000ff;margin-bottom:14px;display:block;"></i>
      <h3 style="font-size:1.25rem;font-weight:800;color:#0f172a;margin-bottom:8px;">${msg}</h3>
      <p style="color:#64748b;font-size:0.92rem;max-width:500px;margin:0 auto 20px;line-height:1.6;">
        We have new items arriving daily. Order directly via WhatsApp or view all collections.
      </p>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
        <button onclick="window.location.search=''" class="btn-primary" style="padding:10px 22px;border-radius:8px;background:#7000ff;color:#fff;border:none;font-weight:700;cursor:pointer;">
          <i class="fa-solid fa-boxes-stacked"></i> View All Products
        </button>
        <a href="https://wa.me/923294551652?text=Hello%20DERA%20ZONE,%20I%20am%20looking%20for%20a%20product" target="_blank" class="btn-hero-whatsapp" style="display:inline-flex;padding:10px 22px;border-radius:8px;text-decoration:none;font-weight:700;background:#25D366;color:#fff;align-items:center;gap:8px;">
          <i class="fa-brands fa-whatsapp"></i> Chat on WhatsApp
        </a>
      </div>
    </div>
  `;
}

function derazoneReInitCards(container) {
  // Safe helper in case other UI scripts inspect cards
}

/* ── Universal Shop Header Updater ── */
window.updateShopHero = function(cat) {
  const titleEl = document.getElementById('shop-hero-title');
  const descEl = document.getElementById('shop-hero-desc');
  if (!titleEl) return;

  const norm = normalizeCategorySlug(cat);
  if (norm && norm !== 'all' && DERAZONE_CAT_LABELS[norm]) {
    titleEl.textContent = DERAZONE_CAT_LABELS[norm].toUpperCase();
    if (descEl) descEl.textContent = DERAZONE_CAT_DESCRIPTIONS[norm] || `Discover premium ${DERAZONE_CAT_LABELS[norm]} curated for style, performance, and everyday use.`;
  } else {
    titleEl.textContent = 'ALL COLLECTIONS';
    if (descEl) descEl.textContent = DERAZONE_CAT_DESCRIPTIONS['all'];
  }
};

/* ── Setup Shop Page Filters & Dynamic Grid ── */
function derazoneSetupShopFilters(products, grid) {
  const urlParams = new URLSearchParams(window.location.search);
  let rawCat = urlParams.get('cat') || urlParams.get('category');
  let activeSub = rawCat ? normalizeCategorySlug(rawCat) : null;
  let activeSort = 'featured';

  const subList = document.getElementById('sidebar-sub-collections');
  const sortBtns = document.querySelectorAll('#sidebar-sort .sidebar-link');
  const sidebar = document.querySelector('.shop-sidebar');
  const mobileToggle = document.getElementById('mobile-sidebar-toggle');

  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => sidebar.classList.toggle('active'));
    document.addEventListener('click', (e) => {
      if (sidebar.classList.contains('active') && !sidebar.contains(e.target) && e.target !== mobileToggle && !mobileToggle.contains(e.target)) {
        sidebar.classList.remove('active');
      }
    });
  }

  function renderSubFilters() {
    if (subList) {
      const subs = CATEGORY_HIERARCHY['derazone'];
      subList.innerHTML = `<li><button class="sidebar-link ${(!activeSub || activeSub === 'all') ? 'active' : ''}" data-sub-filter="all">All Products</button></li>` + 
      subs.map(s => {
        const isActive = activeSub === s ? 'active' : '';
        return `<li><button class="sidebar-link ${isActive}" data-sub-filter="${s}">${DERAZONE_CAT_LABELS[s] || s}</button></li>`;
      }).join('');

      subList.querySelectorAll('.sidebar-link').forEach(btn => {
        btn.addEventListener('click', () => {
          subList.querySelectorAll('.sidebar-link').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const chosen = btn.dataset.subFilter;
          activeSub = (chosen === 'all') ? null : chosen;
          applyFiltersAndSort();
          if (window.innerWidth <= 991 && sidebar) sidebar.classList.remove('active');
        });
      });
    }
  }

  function applyFiltersAndSort() {
    const target = normalizeCategorySlug(activeSub);
    let filtered = products.filter(p => {
      if (!target || target === 'all') return true;
      const c = normalizeCategorySlug(p.category);
      const s = normalizeCategorySlug(p.subcategory);
      const add = (p.additionalCategories || []).map(normalizeCategorySlug);
      return (s === target || c === target || add.includes(target));
    });

    if (activeSort === 'price-asc') {
      filtered.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (activeSort === 'price-desc') {
      filtered.sort((a, b) => Number(b.price) - Number(a.price));
    }

    if (filtered.length === 0) {
      const catLabel = target ? (DERAZONE_CAT_LABELS[target] || target) : 'this collection';
      grid.innerHTML = derazoneEmptyState(`No products currently listed in "${catLabel}"`);
    } else {
      grid.innerHTML = filtered.map(derazoneProductCardHTML).join('');
      derazoneReInitCards(grid);
    }

    window.updateShopHero(activeSub);

    let urlStr = window.location.pathname;
    let params = new URLSearchParams();
    if (activeSub && activeSub !== 'all') params.set('cat', activeSub);
    const qs = params.toString();
    if (qs) urlStr += '?' + qs;
    window.history.replaceState(null, '', urlStr);
  }

  if (sortBtns.length > 0) {
    sortBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sortBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeSort = btn.dataset.sort;
        applyFiltersAndSort();
        if (window.innerWidth <= 991 && sidebar) sidebar.classList.remove('active');
      });
    });
  }

  // Intercept category links anywhere on the shop page without full reload
  document.querySelectorAll('a[href*="cat="]').forEach(link => {
    link.addEventListener('click', (e) => {
      try {
        const u = new URL(link.href, window.location.href);
        const newCat = u.searchParams.get('cat');
        if (newCat) {
          e.preventDefault();
          activeSub = normalizeCategorySlug(newCat);
          if (subList) {
            subList.querySelectorAll('.sidebar-link').forEach(b => {
              const bVal = normalizeCategorySlug(b.dataset.subFilter);
              b.classList.toggle('active', bVal === activeSub);
            });
          }
          applyFiltersAndSort();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } catch (err) {}
    });
  });

  window.addEventListener('popstate', () => {
    const p = new URLSearchParams(window.location.search);
    const rawP = p.get('cat') || p.get('category');
    activeSub = rawP ? normalizeCategorySlug(rawP) : null;
    if (subList) {
      subList.querySelectorAll('.sidebar-link').forEach(b => {
        const val = normalizeCategorySlug(b.dataset.subFilter);
        b.classList.toggle('active', (!activeSub && val === 'all') || val === activeSub);
      });
    }
    applyFiltersAndSort();
  });

  renderSubFilters();
  applyFiltersAndSort();
}

async function derazoneRenderShopGrid() {
  const grid = document.querySelector('#shop-products-grid, .products-grid');
  if (!grid) return;

  let products = [];
  try {
    const data = await apiGet('/products');
    if (data && data.products && data.products.length > 0) {
      products = data.products;
    }
  } catch (err) {
    console.warn('Backend unavailable, using catalog store:', err);
  }

  if (!products.length && DERAZONE_CATALOG_PRODUCTS.length) {
    products = DERAZONE_CATALOG_PRODUCTS;
  }

  window._dzAllProducts = products;
  derazoneSetupShopFilters(products, grid);
}

/* ── Render Homepage Grids & Sliders ── */
async function derazoneRenderHomepageGrids() {
  let allProducts = [];
  try {
    const data = await apiGet('/products');
    if (data && data.products && data.products.length > 0) {
      allProducts = data.products;
    }
  } catch (err) {
    console.warn('Backend unavailable for homepage:', err);
  }

  if (!allProducts.length && DERAZONE_CATALOG_PRODUCTS.length) {
    allProducts = DERAZONE_CATALOG_PRODUCTS;
  }

  window._dzAllProducts = allProducts;

  // --- 1 & 2. Render Trending Now & New Arrivals ---
  const trendingGrid = document.getElementById('trending-now-grid');
  const newArrivalsGrid = document.getElementById('new-arrivals-grid');

  if (!allProducts.length) {
    const emptyNotice = `
      <div style="grid-column:1/-1;text-align:center;padding:45px 20px;background:#ffffff;border:1.5px dashed #e5e7eb;border-radius:16px;">
        <i class="fa-solid fa-boxes-packing" style="font-size:2.4rem;color:#7000ff;margin-bottom:12px;display:block;"></i>
        <h4 style="font-size:1.15rem;font-weight:700;color:#0f172a;margin-bottom:6px;">Fresh Collections Dropping Soon!</h4>
        <p style="color:#64748b;font-size:0.9rem;max-width:460px;margin:0 auto 16px;line-height:1.5;">
          Our catalog is currently being updated with verified products. Contact our team on WhatsApp for instant inquiries &amp; priority bookings.
        </p>
        <a href="https://wa.me/923294551652?text=Hello%20DERA%20ZONE,%20I%20am%20looking%20for%20products" target="_blank" class="btn-hero-whatsapp" style="display:inline-flex;padding:10px 22px;border-radius:8px;font-size:0.85rem;text-decoration:none;font-weight:700;background:#25D366;color:#fff;align-items:center;gap:8px;">
          <i class="fa-brands fa-whatsapp"></i> Chat on WhatsApp
        </a>
      </div>
    `;
    if (trendingGrid) trendingGrid.innerHTML = emptyNotice;
    if (newArrivalsGrid) newArrivalsGrid.innerHTML = emptyNotice;
  } else {
    if (trendingGrid) {
      const trendingList = allProducts.filter(p => p.trending === true || p.badge === 'HOT' || p.badge === 'BESTSELLER' || p.badge === 'TRENDING');
      const displayList = trendingList.length ? trendingList : allProducts;
      trendingGrid.innerHTML = displayList.slice(0, 4).map(p => derazoneProductCardHTML(p)).join('');
    }

    if (newArrivalsGrid) {
      const newList = allProducts.filter(p => p.newArrival === true || p.badge === 'NEW' || p.badge === 'TOP RATED');
      const displayList = newList.length ? newList : allProducts;
      newArrivalsGrid.innerHTML = displayList.slice(0, 4).map(p => derazoneProductCardHTML(p)).join('');
    }
  }

  // --- 4A. Render Pinned Collections with Actual Collection Names ---
  const pinnedWrapper = document.getElementById('pinned-collections-wrapper');
  if (pinnedWrapper && allProducts.length) {
    try {
      const pinRes = await apiGet('/pinned');
      const pinnedList = (pinRes && pinRes.pinned && Array.isArray(pinRes.pinned)) ? pinRes.pinned : [];
      let sectionsHTML = '';

      for (const col of pinnedList) {
        const rawId = (typeof col === 'string') ? col : (col.id || col.category || col.slug || '');
        const colId = normalizeCategorySlug(rawId);
        const colName = (typeof col === 'object' && col.name) ? col.name : dzCatLabel(colId);

        const colProducts = allProducts.filter(p => {
          const pCatSlug = normalizeCategorySlug(p.category || '');
          const pSubSlug = normalizeCategorySlug(p.subcategory || '');
          const rawCat = (p.category || '').toLowerCase().trim();
          return pCatSlug === colId || pSubSlug === colId || rawCat === colId;
        });

        if (colProducts.length > 0) {
          sectionsHTML += `
            <section class="dz-section" style="padding:60px 0;border-bottom:1px solid #f1f5f9;">
              <div class="container">
                <div class="section-header-row">
                  <div>
                    <span class="section-badge" style="background:rgba(112,0,255,0.08);color:#7000ff;padding:4px 10px;border-radius:20px;font-size:0.75rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Featured Collection</span>
                    <h2 class="section-title" style="margin-top:6px;">${colName}</h2>
                    <p class="section-subtitle">Curated picks from our ${colName} collection</p>
                  </div>
                  <a href="shop?cat=${colId}" class="section-link" style="color:#7000ff;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;gap:6px;">View All ${colName} <i class="fa-solid fa-arrow-right"></i></a>
                </div>
                <div class="products-grid">
                  ${colProducts.slice(0, 8).map(p => derazoneProductCardHTML(p)).join('')}
                </div>
              </div>
            </section>
          `;
        }
      }

      pinnedWrapper.innerHTML = sectionsHTML;
    } catch (err) {
      console.warn('Pinned collections render error:', err);
      pinnedWrapper.innerHTML = '';
    }
  }

  // --- 4B. Render Spotlight Products (2-Column Showcase Layout matching Reference Image 3) ---
  const spotlightSection = document.getElementById('spotlight-section');
  const spotlightContainer = document.getElementById('spotlight-container') || document.getElementById('spotlight-grid');
  if (spotlightContainer && allProducts.length) {
    try {
      const spotRes = await apiGet('/spotlight');
      const spotIds = (spotRes && spotRes.spotlight && Array.isArray(spotRes.spotlight)) ? spotRes.spotlight : [];
      
      let spotlightProducts = [];
      if (spotIds.length) {
        spotIds.forEach(id => {
          const match = allProducts.find(p => String(p.id) === String(id));
          if (match && !spotlightProducts.some(x => String(x.id) === String(match.id))) {
            spotlightProducts.push(match);
          }
        });
      }

      // Only show spotlight if admin has explicitly selected products in admin spotlight settings
      if (spotlightProducts.length > 0) {
        if (spotlightSection) spotlightSection.style.display = 'block';
        spotlightContainer.innerHTML = spotlightProducts.slice(0, 3).map(p => {
          const primaryImg = (p.images && p.images[0]) || p.image || '';
          const hasOldPrice = p.priceOld && p.priceOld > p.price;
          const cleanName = (p.name || '').replace(/'/g, "\\'");
          const cleanEmoji = (p.emoji || '🛍️').replace(/'/g, "\\'");
          const cleanImg = primaryImg ? primaryImg.replace(/'/g, "\\'") : '';
          
          const pSizes = Array.isArray(p.sizes) ? p.sizes : (typeof p.sizes === 'string' && p.sizes ? p.sizes.split(',').map(s=>s.trim()).filter(Boolean) : []);
          const pColors = Array.isArray(p.colors) ? p.colors : (typeof p.colors === 'string' && p.colors ? p.colors.split(',').map(c=>c.trim()).filter(Boolean) : []);
          const pVariants = Array.isArray(p.variants) ? p.variants : (typeof p.variants === 'string' && p.variants ? p.variants.split(',').map(v=>v.trim()).filter(Boolean) : []);
          const hasOptions = (pSizes.length > 0) || (pColors.length > 0) || (pVariants.length > 0);
          const addAction = hasOptions 
            ? `derazoneOpenQuickSelect('${p.id}')` 
            : `addToCart('${cleanName}', ${p.price}, '${cleanEmoji}', 'Standard', '${cleanImg}')`;

          const desc = p.description 
            ? (p.description.length > 260 ? p.description.slice(0, 260) + '...' : p.description) 
            : 'Engineered for premium performance and modern aesthetics. Experience handpicked craftsmanship with 100% verified authentic quality.';

          return `
            <div class="spotlight-layout">
              <div class="spotlight-image">
                ${primaryImg 
                  ? `<img src="${primaryImg}" alt="${p.name.replace(/"/g, '&quot;')}" loading="lazy" style="max-width:100%;max-height:420px;width:auto;height:auto;object-fit:contain;display:block;margin:0 auto;">` 
                  : `<div style="font-size:5rem;">${p.emoji || '🛍️'}</div>`}
              </div>
              <div class="spotlight-details">
                <span class="spotlight-label">⭐ FEATURED SPOTLIGHT</span>
                <h2 class="spotlight-name">
                  <a href="product?id=${p.id}" style="color:inherit;text-decoration:none;">${p.name}</a>
                </h2>
                <div class="spotlight-price">
                  <span>PKR ${Number(p.price).toLocaleString()}</span>
                  ${hasOldPrice ? `<span class="spotlight-price-old">PKR ${Number(p.priceOld).toLocaleString()}</span>` : ''}
                </div>
                <p class="spotlight-desc">${desc}</p>
                <div class="spotlight-badges">
                  <span class="spotlight-badge-item"><i class="fa-solid fa-circle-check" style="color:#10b981;"></i> 100% Verified Genuine</span>
                  <span class="spotlight-badge-item"><i class="fa-solid fa-truck-fast" style="color:#7000ff;"></i> Cash on Delivery Available</span>
                  <span class="spotlight-badge-item"><i class="fa-solid fa-rotate-left" style="color:#f59e0b;"></i> Easy 7-Day Exchange</span>
                </div>
                <div class="spotlight-actions">
                  <a href="product?id=${p.id}" class="spotlight-btn">
                    SHOP NOW <i class="fa-solid fa-arrow-right"></i>
                  </a>
                  <button onclick="${addAction}" class="spotlight-btn-secondary">
                    <i class="fa-solid fa-bag-shopping"></i> Add to Bag
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('');
      } else {
        if (spotlightSection) spotlightSection.style.display = 'none';
      }
    } catch (err) {
      if (spotlightSection) spotlightSection.style.display = 'none';
      console.warn('Spotlight fetch error:', err);
    }
  }

  // --- 5. Render Verified Reviews Dynamically (From /api/reviews) ---
  const reviewsContainer = document.getElementById('reviews-container');
  const reviewsSection = document.getElementById('reviews-section');
  if (reviewsContainer) {
    try {
      const data = await apiGet('/reviews');
      const reviews = (data && data.reviews) || [];
      if (reviews.length > 0) {
        if (reviewsSection) reviewsSection.style.display = 'block';
        reviewsContainer.innerHTML = reviews.map(r => {
          const starsCount = Math.max(1, Math.min(5, Number(r.rating) || 5));
          const starsHTML = '<i class="fa-solid fa-star" style="color:#f59e0b;"></i>'.repeat(starsCount);
          return `
            <div class="dz-review-card" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;padding:24px;box-shadow:0 4px 18px rgba(0,0,0,0.04);display:flex;flex-direction:column;">
              <div class="dz-review-stars" style="display:flex;gap:4px;margin-bottom:12px;">
                ${starsHTML}
              </div>
              <p class="dz-review-text" style="color:#374151;font-size:0.95rem;line-height:1.6;font-style:italic;margin-bottom:18px;flex:1;">
                "${(r.text || '').replace(/"/g, '&quot;')}"
              </p>
              <div class="dz-review-author" style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid #f3f4f6;padding-top:12px;">
                <strong style="color:#111827;font-size:0.88rem;">${r.customerName || 'Verified Buyer'}${r.city ? ' — ' + r.city : ''}</strong>
                <span class="dz-verified-badge" style="display:inline-flex;align-items:center;gap:4px;color:#10b981;font-size:0.75rem;font-weight:700;">
                  <i class="fa-solid fa-circle-check"></i> Verified Buyer
                </span>
              </div>
            </div>
          `;
        }).join('');
      } else {
        if (reviewsSection) reviewsSection.style.display = 'none';
      }
    } catch (err) {
      if (reviewsSection) reviewsSection.style.display = 'none';
      console.warn('Reviews fetch error:', err);
    }
  }

  // --- 5B. Render Real Customer Review Screenshots (From /api/review-images) ---
  const reviewImagesContainer = document.getElementById('review-images-container');
  const reviewImagesSection = document.getElementById('review-images-section');
  if (reviewImagesContainer) {
    try {
      const data = await apiGet('/review-images');
      const images = (data && (data.images || data.reviews)) || [];
      if (Array.isArray(images) && images.length > 0) {
        if (reviewImagesSection) reviewImagesSection.style.display = 'block';
        const sorted = images.slice().sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99));
        reviewImagesContainer.innerHTML = sorted.map(ri => {
          const cleanUrl = (ri.url || '').replace(/'/g, "\\'");
          const label = ri.label || 'Customer Feedback';
          const cleanLabel = label.replace(/'/g, "\\'");
          return `
            <div class="dz-review-img-card" onclick="openReviewLightbox('${cleanUrl}', '${cleanLabel}')" title="Click to view full screenshot">
              <div class="dz-review-img-wrap">
                <img src="${ri.url}" alt="${label.replace(/"/g, '&quot;')}" loading="lazy" />
                <div class="dz-review-img-zoom-hint">
                  <i class="fa-solid fa-magnifying-glass-plus"></i> View Full Proof
                </div>
              </div>
              <div class="dz-review-img-caption">
                <strong style="color:#0f172a;font-weight:700;">${label}</strong>
                <span style="color:#10b981;font-weight:700;display:inline-flex;align-items:center;gap:4px;font-size:0.75rem;">
                  <i class="fa-solid fa-circle-check"></i> Verified
                </span>
              </div>
            </div>
          `;
        }).join('');
      } else {
        if (reviewImagesSection) reviewImagesSection.style.display = 'none';
      }
    } catch (err) {
      if (reviewImagesSection) reviewImagesSection.style.display = 'none';
      console.warn('Review images fetch error:', err);
    }
  }
}

/* ── Categories Carousel (Works seamlessly on Phone, Tablet & Laptop) ── */
function initCategoryCarousel() {
  const catTrack = document.getElementById('categories-carousel-track');
  const catPrev = document.getElementById('cat-prev-btn');
  const catNext = document.getElementById('cat-next-btn');

  if (!catTrack || catTrack.dataset.carouselInitialized === 'true') return;
  catTrack.dataset.carouselInitialized = 'true';

  // 1. On desktop/laptop, 8 categories fit into one viewport leaving 0 scrollable overflow.
  // We duplicate the items so the carousel has ample scrollable content (infinite continuous track)
  // on large desktop screens, laptops, tablets, and phones!
  const originalItems = Array.from(catTrack.children);
  if (originalItems.length > 0 && originalItems.length <= 10) {
    originalItems.forEach(item => {
      const clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      catTrack.appendChild(clone);
    });
  }

  // Calculate dynamic step based on actual item width + gap
  function getScrollStep() {
    const item = catTrack.querySelector('.dz-circle-cat-item');
    if (item) {
      const w = item.offsetWidth || 135;
      const isMobile = window.innerWidth <= 768;
      // On mobile: scroll 1 item (~125px). On desktop: scroll 2 items (~320px)
      return isMobile ? (w + 20) : ((w + 28) * 2);
    }
    return window.innerWidth <= 768 ? 130 : 320;
  }

  let isPaused = false;
  let pauseTimer = null;

  function pauseAuto(ms = 4000) {
    isPaused = true;
    if (pauseTimer) clearTimeout(pauseTimer);
    pauseTimer = setTimeout(() => { isPaused = false; }, ms);
  }

  function doScrollNext() {
    pauseAuto();
    const step = getScrollStep();
    const maxScroll = catTrack.scrollWidth - catTrack.clientWidth;
    if (maxScroll <= 5) return;

    if (catTrack.scrollLeft >= maxScroll - 25) {
      catTrack.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      catTrack.scrollBy({ left: step, behavior: 'smooth' });
    }
  }

  function doScrollPrev() {
    pauseAuto();
    const step = getScrollStep();
    const maxScroll = catTrack.scrollWidth - catTrack.clientWidth;
    if (maxScroll <= 5) return;

    if (catTrack.scrollLeft <= 25) {
      catTrack.scrollTo({ left: maxScroll, behavior: 'smooth' });
    } else {
      catTrack.scrollBy({ left: -step, behavior: 'smooth' });
    }
  }

  if (catNext) {
    catNext.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      doScrollNext();
    });
  }

  if (catPrev) {
    catPrev.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      doScrollPrev();
    });
  }

  // Pause when hovered or touched
  catTrack.addEventListener('mouseenter', () => { isPaused = true; });
  catTrack.addEventListener('mouseleave', () => { isPaused = false; });
  catTrack.addEventListener('touchstart', () => { pauseAuto(6000); }, { passive: true });

  // Auto-sliding interval (every 2.6 seconds)
  if (window._dzCatAutoSlide) clearInterval(window._dzCatAutoSlide);
  window._dzCatAutoSlide = setInterval(() => {
    if (!isPaused && catTrack.scrollWidth > catTrack.clientWidth) {
      const maxScroll = catTrack.scrollWidth - catTrack.clientWidth;
      if (catTrack.scrollLeft >= maxScroll - 25) {
        catTrack.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        catTrack.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
      }
    }
  }, 2600);
}

document.addEventListener('DOMContentLoaded', () => {
  initCategoryCarousel();
  if (document.getElementById('shop-products-grid') || document.querySelector('.shop-layout')) {
    derazoneRenderShopGrid();
  }
  if (document.getElementById('new-arrivals-grid') || document.getElementById('trending-now-grid') || document.getElementById('spotlight-grid') || document.getElementById('spotlight-container') || document.getElementById('review-images-container')) {
    derazoneRenderHomepageGrids();
  }
});

// Run immediately if already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initCategoryCarousel();
}

/* ════════════════════════════════════════════════════════════
   UNIVERSAL QUICK SELECT VARIANT MODAL (Homepage & Shop)
   ════════════════════════════════════════════════════════════ */
let _activeQuickProduct = null;
let _selectedQuickSize = null;
let _selectedQuickColor = null;
let _selectedQuickVariant = null;

function ensureQuickSelectModal() {
  let modal = document.getElementById('dz-quick-select-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'dz-quick-select-modal';
    modal.className = 'dz-quick-modal-overlay';
    modal.innerHTML = `
      <div class="dz-quick-modal-card">
        <button type="button" class="dz-quick-modal-close" onclick="closeQuickSelectModal()" aria-label="Close">&times;</button>
        <div class="dz-quick-modal-header">
          <img id="qm-thumb" src="" alt="Product" />
          <div style="flex:1;min-width:0;">
            <h4 id="qm-title">Product Title</h4>
            <div id="qm-price-wrap" class="qm-price-wrap"></div>
          </div>
        </div>
        <div class="dz-quick-modal-body">
          <div id="qm-sizes-wrap" class="qm-option-group" style="display:none;">
            <label class="qm-option-label">Select Size: <span id="qm-selected-size-label" class="qm-selected-val"></span></label>
            <div id="qm-sizes-list" class="qm-options-pills"></div>
          </div>
          <div id="qm-colors-wrap" class="qm-option-group" style="display:none;">
            <label class="qm-option-label">Select Color: <span id="qm-selected-color-label" class="qm-selected-val"></span></label>
            <div id="qm-colors-list" class="qm-options-pills"></div>
          </div>
          <div id="qm-variants-wrap" class="qm-option-group" style="display:none;">
            <label class="qm-option-label">Select Model / Variant: <span id="qm-selected-variant-label" class="qm-selected-val"></span></label>
            <div id="qm-variants-list" class="qm-options-pills"></div>
          </div>
          <div class="qm-option-group">
            <label class="qm-option-label">Quantity</label>
            <div class="qm-qty-stepper">
              <button type="button" class="qm-qty-btn" onclick="stepQuickQty(-1)">&minus;</button>
              <input type="text" id="qm-qty-input" value="1" readonly />
              <button type="button" class="qm-qty-btn" onclick="stepQuickQty(1)">&plus;</button>
            </div>
          </div>
        </div>
        <div class="dz-quick-modal-footer">
          <button type="button" id="qm-add-btn" class="qm-btn-primary" onclick="confirmQuickSelectAddToCart()">
            <i class="fa-solid fa-bag-shopping"></i> Add to Bag
          </button>
          <a id="qm-details-link" href="#" class="qm-link-details">View Full Product Details &rarr;</a>
        </div>
      </div>
    `;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeQuickSelectModal();
    });
    document.body.appendChild(modal);
  }
  return modal;
}

window.stepQuickQty = function(delta) {
  const input = document.getElementById('qm-qty-input');
  if (!input) return;
  let cur = parseInt(input.value) || 1;
  cur = Math.max(1, Math.min(99, cur + delta));
  input.value = cur;
};

window.closeQuickSelectModal = function() {
  const modal = document.getElementById('dz-quick-select-modal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
};

window.derazoneOpenQuickSelect = async function(productId) {
  const modal = ensureQuickSelectModal();
  let product = (window._dzAllProducts || []).find(p => String(p.id) === String(productId));
  
  if (!product) {
    try {
      const data = await apiGet('/products');
      if (data && data.products) {
        window._dzAllProducts = data.products;
        product = data.products.find(p => String(p.id) === String(productId));
      }
    } catch (err) {}
  }

  if (!product) {
    window.location.href = `product?id=${productId}`;
    return;
  }

  _activeQuickProduct = product;
  _selectedQuickSize = null;
  _selectedQuickColor = null;
  _selectedQuickVariant = null;

  // Header
  const thumb = document.getElementById('qm-thumb');
  const title = document.getElementById('qm-title');
  const priceWrap = document.getElementById('qm-price-wrap');
  const detailsLink = document.getElementById('qm-details-link');
  const qtyInput = document.getElementById('qm-qty-input');

  const primaryImg = (product.images && product.images[0]) || product.image || '';
  if (thumb) {
    thumb.src = primaryImg || 'images/placeholder.png';
    thumb.alt = product.name || 'Product';
  }
  if (title) title.textContent = product.name || 'Product';
  if (detailsLink) detailsLink.href = `product?id=${product.id}`;
  if (qtyInput) qtyInput.value = '1';

  if (priceWrap) {
    const hasOld = product.priceOld && product.priceOld > product.price;
    priceWrap.innerHTML = `
      <span style="color:#7000ff;font-weight:800;font-size:1.15rem;">PKR ${Number(product.price).toLocaleString()}</span>
      ${hasOld ? `<span style="color:#94a3b8;text-decoration:line-through;font-size:0.9rem;">PKR ${Number(product.priceOld).toLocaleString()}</span>` : ''}
    `;
  }

  // Parse Options
  const pSizes = Array.isArray(product.sizes) ? product.sizes : (typeof product.sizes === 'string' && product.sizes ? product.sizes.split(',').map(s=>s.trim()).filter(Boolean) : []);
  const pColors = Array.isArray(product.colors) ? product.colors : (typeof product.colors === 'string' && product.colors ? product.colors.split(',').map(c=>c.trim()).filter(Boolean) : []);
  const pVariants = Array.isArray(product.variants) ? product.variants : (typeof product.variants === 'string' && product.variants ? product.variants.split(',').map(v=>v.trim()).filter(Boolean) : []);

  const vs = (product.variantStock && typeof product.variantStock === 'object') ? product.variantStock : {};
  const hasVS = Object.keys(vs).length > 0;
  const getQuickOptStock = (name) => {
    if (!name) return 999;
    if (!hasVS) return (product.stock != null) ? Number(product.stock) : (product.inStock !== false ? 999 : 0);
    if (vs[name] !== undefined) return Number(vs[name]);
    const f = Object.keys(vs).find(k => k.trim().toLowerCase() === name.trim().toLowerCase());
    return f ? Number(vs[f]) : 999;
  };

  const updateQuickModalStockState = () => {
    let avail = 999;
    if (hasVS) {
      const combined = [_selectedQuickVariant, _selectedQuickSize, _selectedQuickColor].filter(Boolean).join(' — ');
      if (vs[combined] !== undefined) {
        avail = Number(vs[combined]);
      } else {
        const checked = [];
        if (_selectedQuickVariant && vs[_selectedQuickVariant] !== undefined) checked.push(Number(vs[_selectedQuickVariant]));
        if (_selectedQuickColor && vs[_selectedQuickColor] !== undefined) checked.push(Number(vs[_selectedQuickColor]));
        if (_selectedQuickSize && vs[_selectedQuickSize] !== undefined) checked.push(Number(vs[_selectedQuickSize]));
        if (checked.length > 0) avail = Math.min(...checked);
        else if (product.stock != null) avail = Number(product.stock);
      }
    } else if (product.stock != null) {
      avail = Number(product.stock);
    }

    const isSoldOut = (product.inStock === false) || (avail <= 0);
    const addBtn = document.getElementById('qm-add-btn');
    if (addBtn) {
      if (isSoldOut) {
        addBtn.disabled = true;
        addBtn.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Out of Stock';
        addBtn.style.opacity = '0.5';
        addBtn.style.cursor = 'not-allowed';
      } else {
        addBtn.disabled = false;
        addBtn.innerHTML = '<i class="fa-solid fa-bag-shopping"></i> Add to Bag';
        addBtn.style.opacity = '1';
        addBtn.style.cursor = 'pointer';
      }
    }
  };

  // 1. Sizes
  const sizesWrap = document.getElementById('qm-sizes-wrap');
  const sizesList = document.getElementById('qm-sizes-list');
  const sizeLabel = document.getElementById('qm-selected-size-label');
  if (pSizes.length > 0) {
    _selectedQuickSize = pSizes[0];
    if (sizeLabel) sizeLabel.textContent = _selectedQuickSize;
    sizesList.innerHTML = pSizes.map((s, idx) => {
      const stk = getQuickOptStock(s);
      const isSold = stk <= 0;
      return `<div class="qm-pill ${idx === 0 ? 'active' : ''} ${isSold ? 'sold-out' : ''}" data-size="${s}" style="${isSold ? 'opacity:0.5;text-decoration:line-through;cursor:not-allowed;' : ''}">${s}${isSold ? ' (Sold Out)' : ''}</div>`;
    }).join('');
    sizesList.querySelectorAll('.qm-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        sizesList.querySelectorAll('.qm-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        _selectedQuickSize = btn.dataset.size;
        if (sizeLabel) sizeLabel.textContent = _selectedQuickSize;
        updateQuickModalStockState();
      });
    });
    sizesWrap.style.display = 'block';
  } else {
    sizesWrap.style.display = 'none';
  }

  // 2. Colors
  const colorsWrap = document.getElementById('qm-colors-wrap');
  const colorsList = document.getElementById('qm-colors-list');
  const colorLabel = document.getElementById('qm-selected-color-label');
  if (pColors.length > 0) {
    _selectedQuickColor = (typeof pColors[0] === 'object' ? pColors[0].name : pColors[0]) || '';
    if (colorLabel) colorLabel.textContent = _selectedQuickColor;
    colorsList.innerHTML = pColors.map((c, idx) => {
      const cName = typeof c === 'object' ? c.name : c;
      const stk = getQuickOptStock(cName);
      const isSold = stk <= 0;
      return `<div class="qm-pill ${idx === 0 ? 'active' : ''} ${isSold ? 'sold-out' : ''}" data-color="${cName}" style="${isSold ? 'opacity:0.5;text-decoration:line-through;cursor:not-allowed;' : ''}">${cName}${isSold ? ' (Sold Out)' : ''}</div>`;
    }).join('');
    colorsList.querySelectorAll('.qm-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        colorsList.querySelectorAll('.qm-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        _selectedQuickColor = btn.dataset.color;
        if (colorLabel) colorLabel.textContent = _selectedQuickColor;
        updateQuickModalStockState();
      });
    });
    colorsWrap.style.display = 'block';
  } else {
    colorsWrap.style.display = 'none';
  }

  // 3. Variants
  const variantsWrap = document.getElementById('qm-variants-wrap');
  const variantsList = document.getElementById('qm-variants-list');
  const variantLabel = document.getElementById('qm-selected-variant-label');
  if (pVariants.length > 0) {
    _selectedQuickVariant = (typeof pVariants[0] === 'object' ? pVariants[0].name : pVariants[0]) || '';
    if (variantLabel) variantLabel.textContent = _selectedQuickVariant;
    variantsList.innerHTML = pVariants.map((v, idx) => {
      const vName = typeof v === 'object' ? v.name : v;
      const stk = getQuickOptStock(vName);
      const isSold = stk <= 0;
      return `<div class="qm-pill ${idx === 0 ? 'active' : ''} ${isSold ? 'sold-out' : ''}" data-variant="${vName}" style="${isSold ? 'opacity:0.5;text-decoration:line-through;cursor:not-allowed;' : ''}">${vName}${isSold ? ' (Sold Out)' : ''}</div>`;
    }).join('');
    variantsList.querySelectorAll('.qm-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        variantsList.querySelectorAll('.qm-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        _selectedQuickVariant = btn.dataset.variant;
        if (variantLabel) variantLabel.textContent = _selectedQuickVariant;
        updateQuickModalStockState();
      });
    });
    variantsWrap.style.display = 'block';
  } else {
    variantsWrap.style.display = 'none';
  }

  updateQuickModalStockState();

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
};

window.confirmQuickSelectAddToCart = function() {
  if (!_activeQuickProduct) return;
  const p = _activeQuickProduct;
  const variantParts = [_selectedQuickVariant, _selectedQuickSize, _selectedQuickColor].filter(Boolean);
  const finalVariant = variantParts.length > 0 ? variantParts.join(' - ') : 'Standard';
  const qty = parseInt(document.getElementById('qm-qty-input')?.value) || 1;
  const primaryImg = (p.images && p.images[0]) || p.image || '';

  window.addToCart(p.name, Number(p.price), p.emoji || '🛍️', finalVariant, primaryImg, qty);
  closeQuickSelectModal();
};

/* ── Lightbox Helpers ── */
window.openReviewLightbox = function(url, caption = '') {
  const lb = document.getElementById('review-lightbox');
  const img = document.getElementById('review-lightbox-img');
  const cap = document.getElementById('review-lightbox-caption');
  if (img) img.src = url;
  if (cap) cap.textContent = caption || '';
  if (lb) lb.classList.add('active');
  document.body.style.overflow = 'hidden';
};

window.closeReviewLightbox = function() {
  const lb = document.getElementById('review-lightbox');
  if (lb) lb.classList.remove('active');
  document.body.style.overflow = '';
};
