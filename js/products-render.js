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

function dzCatLabel(cat) {
  if (!cat) return '';
  const norm = normalizeCategorySlug(cat);
  return DERAZONE_CAT_LABELS[norm] || DERAZONE_CAT_LABELS[cat.toLowerCase()] || cat;
}
window.dzCatLabel = dzCatLabel;
window.velorCatLabel = dzCatLabel;

/* ── Live Product Catalog (Populated dynamically from backend / admin panel, with offline fallback) ── */
const DERAZONE_CATALOG_PRODUCTS = [
  /* Accessories */
  {
    id: 'dz-acc-01',
    name: '65W GaN Fast Charger Dual Port (USB-C + USB-A)',
    category: 'accessories',
    subcategory: 'accessories',
    price: 2850,
    priceOld: 3500,
    images: ['images/categories/accessories.png'],
    badge: 'HOT',
    trending: true,
    newArrival: false
  },
  {
    id: 'dz-acc-02',
    name: 'Ultra-Durable Braided Fast Charging Cable (Type-C 100W)',
    category: 'accessories',
    subcategory: 'accessories',
    price: 950,
    priceOld: 1400,
    images: ['images/categories/accessories.png'],
    badge: 'BESTSELLER',
    trending: false,
    newArrival: false
  },
  /* Gadgets */
  {
    id: 'dz-gad-01',
    name: 'AMOLED Ultra Smartwatch with Silicone Sports Strap & BT Calling',
    category: 'gadgets',
    subcategory: 'gadgets',
    price: 5499,
    priceOld: 6999,
    images: ['images/categories/gadgets.png'],
    badge: 'TOP RATED',
    trending: true,
    newArrival: false
  },
  {
    id: 'dz-gad-02',
    name: '20,000mAh 22.5W Fast Charging Metallic Power Bank',
    category: 'gadgets',
    subcategory: 'gadgets',
    price: 4200,
    priceOld: 5200,
    images: ['images/categories/gadgets.png'],
    badge: 'POPULAR',
    trending: false,
    newArrival: true
  },
  /* Wireless Earbuds & Audio */
  {
    id: 'dz-aud-01',
    name: 'Pro ANC Wireless Earbuds with Touch Control & Deep Bass',
    category: 'wireless-earbuds-audio',
    subcategory: 'wireless-earbuds-audio',
    price: 3999,
    priceOld: 4999,
    images: ['images/categories/wireless-audio.png'],
    badge: 'BESTSELLER',
    trending: true,
    newArrival: false
  },
  {
    id: 'dz-aud-02',
    name: 'Waterproof Portable Bluetooth Speaker with Surround Bass',
    category: 'wireless-earbuds-audio',
    subcategory: 'wireless-earbuds-audio',
    price: 3250,
    priceOld: 3950,
    images: ['images/categories/wireless-audio.png'],
    badge: 'NEW',
    trending: false,
    newArrival: true
  },
  /* Jewellery */
  {
    id: 'dz-jwl-01',
    name: 'Sleek Cuban Curb Chain & Titanium Ring Set',
    category: 'jewellery',
    subcategory: 'jewellery',
    price: 1850,
    priceOld: 2400,
    images: ['images/categories/jewellery.png'],
    badge: 'TRENDING',
    trending: true,
    newArrival: false
  },
  {
    id: 'dz-jwl-02',
    name: 'Magnetic Couples Distance Bracelet Set (Matte Black & Silver)',
    category: 'jewellery',
    subcategory: 'jewellery',
    price: 1450,
    priceOld: 1950,
    images: ['images/categories/jewellery.png'],
    badge: 'HOT',
    trending: false,
    newArrival: false
  },
  /* Fashion & Lifestyle */
  {
    id: 'dz-lfs-01',
    name: 'Polarized Matte Black Wayfarer Sunglasses UV400',
    category: 'fashion-lifestyle',
    subcategory: 'fashion-lifestyle',
    price: 2150,
    priceOld: 2800,
    images: ['images/categories/lifestyle.png'],
    badge: 'BESTSELLER',
    trending: true,
    newArrival: false
  },
  {
    id: 'dz-lfs-02',
    name: 'Luxury Long-Lasting Pocket Fragrance (50ml EDP)',
    category: 'fashion-lifestyle',
    subcategory: 'fashion-lifestyle',
    price: 2450,
    priceOld: 3200,
    images: ['images/categories/lifestyle.png'],
    badge: 'POPULAR',
    trending: false,
    newArrival: true
  },
  /* Footwear */
  {
    id: 'dz-ftw-01',
    name: 'Air-Cushion Streetwear Low-Top Sneakers (White / Black)',
    category: 'footwear',
    subcategory: 'footwear',
    price: 4850,
    priceOld: 6200,
    images: ['images/categories/footwear.png'],
    badge: 'NEW',
    trending: false,
    newArrival: true
  },
  {
    id: 'dz-ftw-02',
    name: 'Ergonomic Cloud Slides (Matte Charcoal)',
    category: 'footwear',
    subcategory: 'footwear',
    price: 1750,
    priceOld: 2200,
    images: ['images/categories/footwear.png'],
    badge: 'TRENDING',
    trending: true,
    newArrival: false
  },
  /* Clothing & Apparel */
  {
    id: 'dz-clt-01',
    name: 'Heavyweight 280 GSM Relaxed Fit Oversized Tee (Black)',
    category: 'clothing-apparel',
    subcategory: 'clothing-apparel',
    price: 2250,
    priceOld: 2800,
    images: ['images/categories/clothing.png'],
    badge: 'BESTSELLER',
    trending: true,
    newArrival: false
  },
  {
    id: 'dz-clt-02',
    name: 'French Terry Streetwear Drop-Shoulder Hoodie',
    category: 'clothing-apparel',
    subcategory: 'clothing-apparel',
    price: 3850,
    priceOld: 4800,
    images: ['images/categories/clothing.png'],
    badge: 'HOT',
    trending: false,
    newArrival: true
  },
  /* Winter Collection */
  {
    id: 'dz-wnt-01',
    name: 'Thermal Sherpa-Lined Quilted Puffer Jacket',
    category: 'winter-collection',
    subcategory: 'winter-collection',
    price: 5950,
    priceOld: 7500,
    images: ['images/categories/winter.png'],
    badge: 'TOP RATED',
    trending: false,
    newArrival: true
  },
  {
    id: 'dz-wnt-02',
    name: 'Wind-Resistant Polar Fleece Zip Hoodie',
    category: 'winter-collection',
    subcategory: 'winter-collection',
    price: 3650,
    priceOld: 4500,
    images: ['images/categories/winter.png'],
    badge: 'SEASONAL',
    trending: true,
    newArrival: false
  }
];

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
    ? `<img src="${primaryImg}" alt="${p.name.replace(/"/g, '&quot;')}" loading="lazy" style="width:100%;height:100%;object-fit:cover;transition:transform 0.4s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">`
    : `<div class="product-img-placeholder" style="background:#f8fafc;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#7000ff;font-size:3.5rem;">
        <span>${p.emoji || '🛍️'}</span>
        <span style="font-size:0.75rem;font-weight:700;color:#64748b;margin-top:8px;text-transform:uppercase;letter-spacing:1px;">${dzCatLabel(normCat)}</span>
       </div>`;

  const cleanName = p.name.replace(/'/g, "\\'");
  const cleanEmoji = (p.emoji || '🛍️').replace(/'/g, "\\'");

  return `
    <div class="product-card" data-cat="${normCat}" data-id="${p.id}" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.03);display:flex;flex-direction:column;transition:all 0.3s ease;">
      <div class="product-img-wrap" style="position:relative;aspect-ratio:1/1;width:100%;overflow:hidden;background:#f8fafc;">
        ${badgeHTML}
        ${imgContent}
        <div class="product-actions" style="position:absolute;bottom:10px;left:10px;right:10px;display:flex;gap:8px;z-index:2;">
          <button onclick="addToCart('${cleanName}', ${p.price}, '${cleanEmoji}', 'Standard')" class="btn-primary" style="flex:1;padding:10px 14px;font-size:0.8rem;border-radius:8px;background:#7000ff;color:#fff;border:none;cursor:pointer;font-weight:700;box-shadow:0 4px 12px rgba(112,0,255,0.3);">
            <i class="fa-solid fa-bag-shopping"></i> Add to Bag
          </button>
        </div>
      </div>
      <div class="product-info" style="padding:16px;display:flex;flex-direction:column;flex:1;">
        <p class="product-cat" style="font-size:0.75rem;color:#7000ff;text-transform:uppercase;font-weight:700;letter-spacing:1px;margin-bottom:6px;">${dzCatLabel(normCat)}</p>
        <h3 class="product-name" style="font-size:0.95rem;font-weight:700;color:#0f172a;line-height:1.35;margin-bottom:10px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.6em;">
          <a href="product.html?id=${p.id}" style="color:inherit;text-decoration:none;">${p.name}</a>
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

  // --- 3. Setup Categories Carousel (Single-Row Slideshow with Continuous Auto-Play & Next/Prev) ---
  const catTrack = document.getElementById('categories-carousel-track');
  const catPrev = document.getElementById('cat-prev-btn');
  const catNext = document.getElementById('cat-next-btn');
  if (catTrack) {
    let isPaused = false;

    function stepNext() {
      const maxScroll = catTrack.scrollWidth - catTrack.clientWidth;
      if (catTrack.scrollLeft >= maxScroll - 15) {
        catTrack.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        catTrack.scrollBy({ left: 190, behavior: 'smooth' });
      }
    }

    function stepPrev() {
      if (catTrack.scrollLeft <= 15) {
        catTrack.scrollTo({ left: catTrack.scrollWidth, behavior: 'smooth' });
      } else {
        catTrack.scrollBy({ left: -190, behavior: 'smooth' });
      }
    }

    if (catNext) {
      catNext.onclick = () => {
        isPaused = true;
        stepNext();
        setTimeout(() => { isPaused = false; }, 3000);
      };
    }
    if (catPrev) {
      catPrev.onclick = () => {
        isPaused = true;
        stepPrev();
        setTimeout(() => { isPaused = false; }, 3000);
      };
    }

    catTrack.addEventListener('mouseenter', () => { isPaused = true; });
    catTrack.addEventListener('mouseleave', () => { isPaused = false; });
    catTrack.addEventListener('touchstart', () => { isPaused = true; }, { passive: true });
    catTrack.addEventListener('touchend', () => {
      setTimeout(() => { isPaused = false; }, 2500);
    }, { passive: true });

    // Auto-slide every 2.2 seconds automatically on phone & desktop
    if (window._dzCatAutoSlide) clearInterval(window._dzCatAutoSlide);
    window._dzCatAutoSlide = setInterval(() => {
      if (!isPaused) {
        stepNext();
      }
    }, 2200);
  }

  // --- 4. Render Pinned Collections (Spotlight from Admin) ---
  const spotlightGrid = document.getElementById('spotlight-grid');
  if (spotlightGrid && allProducts.length) {
    try {
      let pinnedIds = [];
      const spotRes = await apiGet('/spotlight');
      if (spotRes && spotRes.spotlight && spotRes.spotlight.length) {
        pinnedIds = spotRes.spotlight;
      }
      
      let pinnedProducts = [];
      if (pinnedIds.length) {
        pinnedProducts = allProducts.filter(p => pinnedIds.includes(p.id));
      }
      if (!pinnedProducts.length) {
        // Fallback to featured products from catalog
        pinnedProducts = allProducts.filter(p => p.featured === true).slice(0, 4);
      }
      if (!pinnedProducts.length) {
        pinnedProducts = allProducts.slice(0, 4);
      }

      spotlightGrid.innerHTML = pinnedProducts.slice(0, 4).map(p => derazoneProductCardHTML(p)).join('');
    } catch (err) {
      spotlightGrid.innerHTML = allProducts.slice(0, 4).map(p => derazoneProductCardHTML(p)).join('');
    }
  }

  // --- 5. Render Verified Reviews Dynamically (From /api/reviews) ---
  const reviewsContainer = document.getElementById('reviews-container');
  if (reviewsContainer) {
    try {
      const data = await apiGet('/reviews');
      const reviews = (data && data.reviews) || [];
      if (reviews.length > 0) {
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
        // Clean elegant invite card - NO FAKE REVIEWS
        reviewsContainer.innerHTML = `
          <div style="grid-column:1/-1;text-align:center;padding:50px 20px;background:#ffffff;border:1.5px dashed #e5e7eb;border-radius:16px;max-width:620px;margin:0 auto;">
            <i class="fa-regular fa-star" style="font-size:2.5rem;color:#7000ff;margin-bottom:12px;"></i>
            <h3 style="font-size:1.15rem;font-weight:700;color:#111827;margin-bottom:6px;">No Customer Reviews Yet</h3>
            <p style="color:#6b7280;font-size:0.9rem;line-height:1.5;margin-bottom:18px;">
              Be the first to share your experience with DERA ZONE. Customer reviews published from our Admin panel will automatically appear here.
            </p>
            <a href="https://wa.me/923294551652?text=Hello%20DERA%20ZONE,%20I%20would%20like%20to%20share%20my%20feedback" target="_blank" class="btn-hero-whatsapp" style="display:inline-flex;padding:10px 22px;border-radius:10px;text-decoration:none;font-weight:700;background:#25D366;color:#fff;align-items:center;gap:8px;">
              <i class="fa-brands fa-whatsapp"></i> Share Feedback on WhatsApp
            </a>
          </div>
        `;
      }
    } catch (err) {
      console.warn('Reviews fetch error:', err);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('shop-products-grid') || document.querySelector('.shop-layout')) {
    derazoneRenderShopGrid();
  }
  if (document.getElementById('new-arrivals-grid') || document.getElementById('trending-now-grid') || document.getElementById('spotlight-grid')) {
    derazoneRenderHomepageGrids();
  }
});
