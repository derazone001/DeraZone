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

/* ── Built-in Fallback Catalog for Offline & Static Serving ── */
const DERAZONE_CATALOG_PRODUCTS = [
  // Wireless Earbuds & Audio
  { id: 'dz-pro2-anc', name: 'Pro 2 ANC Wireless Earbuds (Active Noise Cancellation)', category: 'wireless-earbuds-audio', subcategory: 'wireless-earbuds-audio', price: 3499, priceOld: 4999, badge: 'TOP RATED', emoji: '🎧', inStock: true, featured: true, newArrival: true, trending: true, description: 'Active Noise Cancellation (ANC), Transparency mode, deep dynamic bass, and 28-hour battery with wireless charging case.' },
  { id: 'dz-gaming-tws', name: 'RGB Low-Latency Ultra Bass Gaming Earbuds', category: 'wireless-earbuds-audio', subcategory: 'wireless-earbuds-audio', price: 2899, priceOld: 3999, badge: 'HOT', emoji: '🎮', inStock: true, featured: true, newArrival: true, trending: false, description: '40ms ultra-low latency, dynamic RGB breathing lights, dual mic ENC noise cancellation for crisp gaming audio.' },
  { id: 'dz-boom-speaker', name: 'Shockwave Portable IPX7 Waterproof Outdoor Speaker', category: 'wireless-earbuds-audio', subcategory: 'wireless-earbuds-audio', price: 4299, priceOld: 5999, badge: 'NEW', emoji: '🔊', inStock: true, featured: false, newArrival: true, trending: true, description: '360-degree immersive surround sound, deep punchy bass, 12-hour playtime, and rugged waterproof construction.' },

  // Gadgets
  { id: 'dz-ultra9-amoled', name: 'Ultra 9 Max Smartwatch (AMOLED Display + BT Calling)', category: 'gadgets', subcategory: 'gadgets', price: 4899, priceOld: 6999, badge: 'BESTSELLER', emoji: '⌚', inStock: true, featured: true, newArrival: true, trending: true, description: 'High-definition 2.1-inch AMOLED display, Bluetooth calling, heart rate/sleep monitor, and multi-sports tracking modes.' },
  { id: 'dz-powerbank-20k', name: '20,000mAh 65W PD Fast Charge Cyberpunk Power Bank', category: 'gadgets', subcategory: 'gadgets', price: 3999, priceOld: 5499, badge: 'FAST CHARGE', emoji: '🔋', inStock: true, featured: true, newArrival: false, trending: true, description: 'Dual Type-C output, digital battery percentage screen, transparent cyberpunk casing, and laptop/phone fast charging.' },
  { id: 'dz-smart-lightbar', name: 'Smart Ambient RGB Sound-Reactive Flow Light Bar', category: 'gadgets', subcategory: 'gadgets', price: 2299, priceOld: 3299, badge: 'POPULAR', emoji: '💡', inStock: true, featured: false, newArrival: true, trending: false, description: '32-bit ARM processor, 18 color modes, voice-activated rhythm pickup, perfect for gaming desks and car dashboards.' },

  // Accessories
  { id: 'dz-magsafe-15w', name: '15W Magnetic MagSafe Wireless Fast Charger', category: 'accessories', subcategory: 'accessories', price: 2499, priceOld: 3499, badge: 'HOT', emoji: '⚡', inStock: true, featured: true, newArrival: true, trending: true, description: 'Super-strong magnetic snap, intelligent temperature control, aluminum alloy body, and fast wireless charging.' },
  { id: 'dz-braided-cable', name: '100W PD Ultra-Durable Type-C Braided Fast Cable (2M)', category: 'accessories', subcategory: 'accessories', price: 1199, priceOld: 1799, badge: 'ESSENTIAL', emoji: '🔌', inStock: true, featured: false, newArrival: false, trending: true, description: 'High-density nylon braided exterior, reinforced connectors, E-Marker smart chip, supports up to 100W power delivery.' },
  { id: 'dz-aluminum-stand', name: 'Heavy-Duty 360 Rotating Aluminum Desk Phone Stand', category: 'accessories', subcategory: 'accessories', price: 1499, priceOld: 2199, badge: 'TOP RATED', emoji: '📱', inStock: true, featured: false, newArrival: true, trending: false, description: 'Solid aerospace aluminum alloy, dual-hinge adjustable viewing angles, non-slip silicone pads, fully foldable for travel.' },

  // Jewellery
  { id: 'dz-cuban-chain', name: 'Stainless Steel Minimalist Cuban Curb Chain (Silver)', category: 'jewellery', subcategory: 'jewellery', price: 1799, priceOld: 2499, badge: 'TRENDING', emoji: '⛓️', inStock: true, featured: true, newArrival: true, trending: true, description: 'Rust-proof 316L stainless steel, diamond-cut bevels, hypoallergenic, highly polished shine for everyday streetwear.' },
  { id: 'dz-matte-ring', name: 'Titanium Obsidian Matte Black Minimal Beveled Ring', category: 'jewellery', subcategory: 'jewellery', price: 1299, priceOld: 1899, badge: 'CLASSIC', emoji: '💍', inStock: true, featured: false, newArrival: false, trending: true, description: 'Ultra-lightweight aerospace titanium, scratch-resistant matte brushed finish, comfort-fit rounded interior edges.' },
  { id: 'dz-magnetic-bracelets', name: 'Dual Magnetic Attraction Couples Bracelets (Set of 2)', category: 'jewellery', subcategory: 'jewellery', price: 1499, priceOld: 2199, badge: 'POPULAR', emoji: '✨', inStock: true, featured: false, newArrival: true, trending: false, description: 'Matching his & hers magnetic heart charms, durable braided cord, adjustable sizing, beautifully packaged for gifting.' },

  // Fashion & Lifestyle
  { id: 'dz-polarized-shades', name: 'Vintage Polarized UV400 Matte Hexagonal Sunglasses', category: 'fashion-lifestyle', subcategory: 'fashion-lifestyle', price: 2199, priceOld: 3299, badge: 'TRENDING', emoji: '🕶️', inStock: true, featured: true, newArrival: true, trending: true, description: 'HD polarized TAC lenses, anti-glare coating, lightweight reinforced metal frame, full UV400 eye protection.' },
  { id: 'dz-perfume-oud', name: 'Velvet Noir Luxury Long-Lasting Unisex EDP (50ml)', category: 'fashion-lifestyle', subcategory: 'fashion-lifestyle', price: 3299, priceOld: 4799, badge: 'LUXURY', emoji: '✨', inStock: true, featured: false, newArrival: true, trending: true, description: 'Exotic blend of amber, smoky vanilla, and subtle musk notes. Formulated for long-lasting all-day projection.' },
  { id: 'dz-vacuum-tumbler', name: 'Smart Temperature LED Display Insulated Tumbler 500ml', category: 'fashion-lifestyle', subcategory: 'fashion-lifestyle', price: 1999, priceOld: 2899, badge: 'BESTSELLER', emoji: '☕', inStock: true, featured: false, newArrival: false, trending: true, description: 'Touchscreen LED temperature readout, double-wall vacuum insulation keeps drinks hot for 12h or cold for 24h.' },

  // Footwear
  { id: 'dz-cloud-sneakers', name: 'Cloudfoam Air Cushion Breathable Running Sneakers', category: 'footwear', subcategory: 'footwear', price: 4499, priceOld: 6499, badge: 'TOP RATED', emoji: '👟', inStock: true, featured: true, newArrival: true, trending: true, description: 'Engineered flyknit upper, responsive high-rebound cushioning, anti-slip rubber traction sole, ultra-lightweight.' },
  { id: 'dz-street-chunky', name: 'Urban Streetwear Chunky Platform Low-Top Sneakers', category: 'footwear', subcategory: 'footwear', price: 4999, priceOld: 7299, badge: 'NEW', emoji: '👟', inStock: true, featured: false, newArrival: true, trending: true, description: 'Bold contemporary chunky silhouette, premium synthetic leather overlays, padded collar for all-day streetwear comfort.' },
  { id: 'dz-ergonomic-slides', name: 'Ultra-Soft Cloud Ergonomic Waterproof Slides', category: 'footwear', subcategory: 'footwear', price: 1899, priceOld: 2699, badge: 'HOT', emoji: '🩴', inStock: true, featured: false, newArrival: false, trending: false, description: 'Thick EVA foam sole, ergonomic deep heel cup, non-slip textured outsole, water-resistant and easy to clean.' },

  // Clothing & Apparel
  { id: 'dz-oversized-tee', name: 'Heavyweight 280 GSM Drop-Shoulder Streetwear Tee', category: 'clothing-apparel', subcategory: 'clothing-apparel', price: 2299, priceOld: 3299, badge: 'BESTSELLER', emoji: '👕', inStock: true, featured: true, newArrival: true, trending: true, description: '100% combed cotton, heavyweight 280 GSM fabric, ribbed crewneck collar, relaxed oversized drop-shoulder cut.' },
  { id: 'dz-relaxed-hoodie', name: 'Premium French Terry Minimal Relaxed Pullover Hoodie', category: 'clothing-apparel', subcategory: 'clothing-apparel', price: 3799, priceOld: 5199, badge: 'ESSENTIAL', emoji: '🧥', inStock: true, featured: false, newArrival: true, trending: true, description: 'Ultra-soft brushed French terry cotton, double-layer hood, front kangaroo pocket, ribbed cuffs and hem.' },
  { id: 'dz-cargo-joggers', name: 'Tactical Relaxed Fit Multi-Pocket Cargo Joggers', category: 'clothing-apparel', subcategory: 'clothing-apparel', price: 2999, priceOld: 4299, badge: 'TRENDING', emoji: '👖', inStock: true, featured: false, newArrival: false, trending: true, description: 'Stretch cotton twill fabric, elastic waistband with drawstring, 6 functional cargo pockets, cuffed ankle cuffs.' },

  // Winter Collection
  { id: 'dz-sherpa-jacket', name: 'Thermal Sherpa-Lined Heavy Duty Winter Bomber Jacket', category: 'winter-collection', subcategory: 'winter-collection', price: 5899, priceOld: 7999, badge: 'WINTER DROP', emoji: '❄️', inStock: true, featured: true, newArrival: true, trending: true, description: 'Thick windproof outer shell, plush thermal sherpa fleece lining, heavy-duty metallic zipper, and storm cuffs.' },
  { id: 'dz-polar-fleece', name: 'Insulated Wind-Resistant Heavyweight Polar Fleece Hoodie', category: 'winter-collection', subcategory: 'winter-collection', price: 4299, priceOld: 5999, badge: 'WARM', emoji: '🧥', inStock: true, featured: false, newArrival: true, trending: true, description: 'High-pile thermal fleece insulation, anti-pilling fabric, zippered chest pocket, locks in body heat in freezing temps.' },
  { id: 'dz-puffer-vest', name: 'Ultralight Warm Quilted Puffer Vest (Water Resistant)', category: 'winter-collection', subcategory: 'winter-collection', price: 4699, priceOld: 6499, badge: 'LIMITED', emoji: '🦺', inStock: true, featured: false, newArrival: false, trending: true, description: 'Down-alternative insulation, water-resistant nylon shell, stand collar for wind protection, perfect for layering.' }
];

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
    console.warn('Backend unavailable, using built-in catalog:', err);
  }

  if (!products.length) {
    products = DERAZONE_CATALOG_PRODUCTS;
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
    console.warn('Backend unavailable, using built-in catalog for homepage:', err);
  }

  if (!allProducts.length) {
    allProducts = DERAZONE_CATALOG_PRODUCTS;
  }

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
