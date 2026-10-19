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

function velorCatLabel(cat) {
  if (!cat) return '';
  return DERAZONE_CAT_LABELS[cat.toLowerCase()] || cat;
}

/* ── Live Product Catalog (Populated dynamically from backend / admin panel) ── */
const DERAZONE_CATALOG_PRODUCTS = [];


/* ── Product Card HTML Generator ── */
function derazoneProductCardHTML(p) {
  const badge = p.badge ? `<span class="product-badge${p.badge === 'New' || p.badge === 'NEW' ? ' new' : ''}">${p.badge}</span>` : '';
  const oldPrice = p.priceOld
    ? `<span class="product-price-old">PKR ${Number(p.priceOld).toLocaleString()}</span>`
    : '';
  const emoji = p.emoji || '⚡';
  const variant = ((p.colors && p.colors[0]) || (p.sizes && p.sizes[0]) || 'Standard').replace(/\\/g, '\\\\').replace(/'/g, "\\''").replace(/"/g, '&quot;');
  const mainImage = (p.images && p.images.length) ? p.images[0] : null;
  const hasVideo  = !!p.video;

  const cat = p.category;
  const subcat = p.subcategory;
  const resolvedCat = subcat || cat;

  const fallbackEmoji = `<div style="width:100%;height:100%;background:#faf7ff;display:flex;align-items:center;justify-content:center;font-size:3rem;color:#7000ff;">${emoji}</div>`;
  const mediaHTML = mainImage
    ? `<img src="${mainImage}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;" loading="lazy" onerror="this.onerror=null;this.parentElement.innerHTML='${fallbackEmoji}';" />`
    : hasVideo
      ? `<video src="${p.video}#t=0.1" muted preload="metadata" playsinline style="width:100%;height:100%;object-fit:cover;"></video>`
      : fallbackEmoji;

  const cardData = encodeURIComponent(JSON.stringify({
    name: p.name,
    price: p.price,
    emoji: emoji,
    variant: variant,
    image: mainImage || ''
  }));

  return `
    <div class="product-card" data-cat="${resolvedCat}" data-id="${p.id}">
      <div class="product-img-wrap">
        ${badge}
        <a href="product.html?id=${p.id}">${mediaHTML}</a>
      </div>
      <div class="product-info">
        <p class="product-cat">${velorCatLabel(resolvedCat)}</p>
        <h3 class="product-name"><a href="product.html?id=${p.id}">${p.name}</a></h3>
        <div class="product-rating" style="display:flex;align-items:center;gap:4px;font-size:0.75rem;color:#f59e0b;margin-bottom:6px;">
          <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i>
          <span style="color:#64748b;margin-left:4px;">(4.9)</span>
        </div>
        <div class="product-price">PKR ${Number(p.price).toLocaleString()} ${oldPrice}</div>
        <div class="product-action-row" style="display:flex;gap:8px;margin-top:12px;">
          <button class="btn-primary product-add" style="flex:1;font-size:0.8rem;padding:9px;" data-card="${cardData}" data-action="add">Add to Bag</button>
          <button class="btn-outline product-buy" style="flex:1;font-size:0.8rem;padding:9px;" data-card="${cardData}" data-action="buy">Buy Now</button>
        </div>
      </div>
    </div>
  `;
}

window.derazoneCreateProductCard = derazoneProductCardHTML;

function derazoneEmptyState(msg) {
  return `<div style="grid-column:1/-1;text-align:center;padding:60px 20px;background:#ffffff;border-radius:16px;border:1px solid rgba(112,0,255,0.1);box-shadow:0 6px 24px rgba(112,0,255,0.04);">
    <div style="width:64px;height:64px;border-radius:50%;background:#faf7ff;color:#7000ff;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:1.8rem;border:1px solid #c084fc;">
      <i class="fa-solid fa-box-open"></i>
    </div>
    <h3 style="font-size:1.2rem;font-weight:700;color:#0f0728;margin-bottom:8px;">${msg}</h3>
    <p style="color:#64748b;font-size:0.9rem;max-width:440px;margin:0 auto 20px;">Looking for a specific item or model? Reach out directly on WhatsApp for instant assistance and priority ordering!</p>
    <a href="https://wa.me/923294551652?text=Hello%20DERA%20ZONE,%20I%20am%20looking%20for%20a%20product" target="_blank" class="btn-hero-whatsapp" style="display:inline-flex;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;">
      <i class="fa-brands fa-whatsapp"></i> Inquire on WhatsApp
    </a>
  </div>`;
}

function derazoneReInitCards(container) {
  container.querySelectorAll('.product-img-wrap').forEach(wrap => {
    const vid = wrap.querySelector('video');
    if (vid) {
      wrap.addEventListener('mouseenter', () => vid.play().catch(e=>e));
      wrap.addEventListener('mouseleave', () => { vid.pause(); vid.currentTime=0; });
    }
  });

  container.querySelectorAll('button[data-card]').forEach(btn => {
    const fresh = btn.cloneNode(true);
    btn.parentNode.replaceChild(fresh, btn);
    fresh.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        const d = JSON.parse(decodeURIComponent(fresh.dataset.card));
        const action = fresh.dataset.action;
        if (action === 'add' && typeof window.addToCart === 'function') {
          window.addToCart(d.name, d.price, d.emoji, d.variant, d.image);
        } else if (action === 'buy' && typeof window.buyNow === 'function') {
          window.buyNow(d.name, d.price, d.emoji, d.variant, d.image);
        }
      } catch(err) {
        console.error(err);
      }
    });
  });
}

/* ── Universal Shop Header Updater ── */
window.updateShopHero = function(cat) {
  const titleEl = document.getElementById('shop-hero-title');
  const descEl = document.getElementById('shop-hero-desc');
  if (!titleEl) return;

  const cleanCat = (cat || 'all').toLowerCase();
  if (cleanCat !== 'all' && DERAZONE_CAT_LABELS[cleanCat]) {
    titleEl.textContent = DERAZONE_CAT_LABELS[cleanCat].toUpperCase();
    if (descEl) descEl.textContent = DERAZONE_CAT_DESCRIPTIONS[cleanCat] || `Discover premium ${DERAZONE_CAT_LABELS[cleanCat]} curated for style, performance, and everyday use.`;
  } else {
    titleEl.textContent = 'ALL COLLECTIONS';
    if (descEl) descEl.textContent = DERAZONE_CAT_DESCRIPTIONS['all'];
  }
};

/* ── Setup Shop Page Filters & Dynamic Grid ── */
function derazoneSetupShopFilters(products, grid) {
  const urlParams = new URLSearchParams(window.location.search);
  let activeSub = urlParams.get('cat');
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
    let filtered = products.filter(p => {
      if (!activeSub || activeSub === 'all') return true;
      const c = (p.category || '').toLowerCase();
      const s = (p.subcategory || '').toLowerCase();
      const add = (p.additionalCategories || []).map(x => x.toLowerCase());
      const target = activeSub.toLowerCase();
      return (s === target || c === target || add.includes(target));
    });

    if (activeSort === 'price-asc') {
      filtered.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (activeSort === 'price-desc') {
      filtered.sort((a, b) => Number(b.price) - Number(a.price));
    }

    if (filtered.length === 0) {
      grid.innerHTML = derazoneEmptyState('No products found in this collection.');
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

  // Handle in-page category switches from navbar without needing a hard reload
  document.querySelectorAll('.nav-links a[href*="cat="]').forEach(link => {
    link.addEventListener('click', (e) => {
      try {
        const u = new URL(link.href, window.location.href);
        const newCat = u.searchParams.get('cat');
        if (newCat) {
          e.preventDefault();
          activeSub = newCat;
          if (subList) {
            subList.querySelectorAll('.sidebar-link').forEach(b => {
              b.classList.toggle('active', b.dataset.subFilter === newCat);
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
    activeSub = p.get('cat');
    if (subList) {
      subList.querySelectorAll('.sidebar-link').forEach(b => {
        const val = b.dataset.subFilter;
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
    console.warn('Backend unavailable or no products:', err);
  }

  if (!products.length && DERAZONE_CATALOG_PRODUCTS.length) {
    products = DERAZONE_CATALOG_PRODUCTS;
  }

  if (!products.length) {
    grid.innerHTML = derazoneEmptyState('Fresh Collections Dropping Soon! We are updating store inventory. Contact our team on WhatsApp for instant inquiries &amp; priority booking.');
    return;
  }

  derazoneSetupShopFilters(products, grid);
}

/* ── Render Homepage Grids ── */
async function derazoneRenderHomepageGrids() {
  let allProducts = [];
  try {
    const data = await apiGet('/products');
    if (data && data.products && data.products.length > 0) {
      allProducts = data.products;
    }
  } catch (err) {
    console.warn('Backend unavailable or no products for homepage:', err);
  }

  if (!allProducts.length && DERAZONE_CATALOG_PRODUCTS.length) {
    allProducts = DERAZONE_CATALOG_PRODUCTS;
  }

  // If no live products yet, keep the clean styled placeholder cards intact!
  if (!allProducts.length) return;

  // --- 1. Render New Arrivals ---
  const newArrivalsGrid = document.getElementById('new-arrivals-grid');
  if (newArrivalsGrid) {
    const newProducts = allProducts.filter(p => p.newArrival === true || p.badge === 'NEW' || p.badge === 'TOP RATED');
    const displayList = newProducts.length ? newProducts : allProducts;
    newArrivalsGrid.innerHTML = displayList.slice(0, 4).map(p => derazoneProductCardHTML(p)).join('');
    derazoneReInitCards(newArrivalsGrid);
  }

  // --- 2. Render Trending Now ---
  const trendingGrid = document.getElementById('trending-now-grid');
  if (trendingGrid) {
    const trendingProducts = allProducts.filter(p => p.trending === true || p.badge === 'HOT' || p.badge === 'BESTSELLER');
    const displayList = trendingProducts.length ? trendingProducts : allProducts.slice(4, 8);
    trendingGrid.innerHTML = displayList.slice(0, 4).map(p => derazoneProductCardHTML(p)).join('');
    derazoneReInitCards(trendingGrid);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('shop-products-grid') || document.querySelector('.shop-layout')) {
    derazoneRenderShopGrid();
  }
  if (document.getElementById('new-arrivals-grid') || document.getElementById('trending-now-grid')) {
    derazoneRenderHomepageGrids();
  }
});
