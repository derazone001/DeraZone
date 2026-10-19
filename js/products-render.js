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
  if (c === 'wireless' || c === 'audio' || c === 'earbuds' || c === 'wireless-audio') return 'wireless-earbuds-audio';
  if (c === 'fashion' || c === 'lifestyle') return 'fashion-lifestyle';
  if (c === 'shoes') return 'footwear';
  if (c === 'clothing' || c === 'apparel') return 'clothing-apparel';
  if (c === 'winter') return 'winter-collection';
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

/* ── Live Product Catalog (Loaded from store.json / backend) ── */
const DERAZONE_CATALOG_PRODUCTS = [
  {
    "id": "dz-pro2-anc",
    "name": "Pro 2 ANC Wireless Earbuds (Active Noise Cancellation)",
    "category": "wireless-earbuds-audio",
    "subcategory": "wireless-earbuds-audio",
    "price": 3499,
    "priceOld": 4999,
    "badge": "TOP RATED",
    "emoji": "🎧",
    "inStock": true,
    "featured": true,
    "newArrival": true,
    "trending": true,
    "description": "Active Noise Cancellation (ANC), Transparency mode, deep dynamic bass, and 28-hour battery with wireless charging case."
  },
  {
    "id": "dz-gaming-tws",
    "name": "RGB Low-Latency Ultra Bass Gaming Earbuds",
    "category": "wireless-earbuds-audio",
    "subcategory": "wireless-earbuds-audio",
    "price": 2899,
    "priceOld": 3999,
    "badge": "HOT",
    "emoji": "🎮",
    "inStock": true,
    "featured": true,
    "newArrival": true,
    "trending": false,
    "description": "40ms ultra-low latency, dynamic RGB breathing lights, dual mic ENC noise cancellation for crisp gaming audio."
  },
  {
    "id": "dz-boom-speaker",
    "name": "Shockwave Portable IPX7 Waterproof Outdoor Speaker",
    "category": "wireless-earbuds-audio",
    "subcategory": "wireless-earbuds-audio",
    "price": 4299,
    "priceOld": 5999,
    "badge": "NEW",
    "emoji": "🔊",
    "inStock": true,
    "featured": false,
    "newArrival": true,
    "trending": true,
    "description": "360-degree immersive surround sound, deep punchy bass, 12-hour playtime, and rugged waterproof construction."
  },
  {
    "id": "dz-ultra9-amoled",
    "name": "Ultra 9 Max Smartwatch (AMOLED Display + BT Calling)",
    "category": "gadgets",
    "subcategory": "gadgets",
    "price": 4899,
    "priceOld": 6999,
    "badge": "BESTSELLER",
    "emoji": "⌚",
    "inStock": true,
    "featured": true,
    "newArrival": true,
    "trending": true,
    "description": "High-definition 2.1-inch AMOLED display, Bluetooth calling, heart rate/sleep monitor, and multi-sports tracking modes."
  },
  {
    "id": "dz-powerbank-20k",
    "name": "20,000mAh 65W PD Fast Charge Cyberpunk Power Bank",
    "category": "gadgets",
    "subcategory": "gadgets",
    "price": 3999,
    "priceOld": 5499,
    "badge": "FAST CHARGE",
    "emoji": "🔋",
    "inStock": true,
    "featured": true,
    "newArrival": false,
    "trending": true,
    "description": "Dual Type-C output, digital battery percentage screen, transparent cyberpunk casing, and laptop/phone fast charging."
  },
  {
    "id": "dz-smart-lightbar",
    "name": "Smart Ambient RGB Sound-Reactive Flow Light Bar",
    "category": "gadgets",
    "subcategory": "gadgets",
    "price": 2299,
    "priceOld": 3299,
    "badge": "POPULAR",
    "emoji": "💡",
    "inStock": true,
    "featured": false,
    "newArrival": true,
    "trending": false,
    "description": "32-bit ARM processor, 18 color modes, voice-activated rhythm pickup, perfect for gaming desks and car dashboards."
  },
  {
    "id": "dz-magsafe-15w",
    "name": "15W Magnetic MagSafe Wireless Fast Charger",
    "category": "accessories",
    "subcategory": "accessories",
    "price": 2499,
    "priceOld": 3499,
    "badge": "HOT",
    "emoji": "⚡",
    "inStock": true,
    "featured": true,
    "newArrival": true,
    "trending": true,
    "description": "Super-strong magnetic snap, intelligent temperature control, aluminum alloy body, and fast wireless charging."
  },
  {
    "id": "dz-braided-cable",
    "name": "100W PD Ultra-Durable Type-C Braided Fast Cable (2M)",
    "category": "accessories",
    "subcategory": "accessories",
    "price": 1199,
    "priceOld": 1799,
    "badge": "ESSENTIAL",
    "emoji": "🔌",
    "inStock": true,
    "featured": false,
    "newArrival": false,
    "trending": true,
    "description": "High-density nylon braided exterior, reinforced connectors, E-Marker smart chip, supports up to 100W power delivery."
  },
  {
    "id": "dz-aluminum-stand",
    "name": "Heavy-Duty 360 Rotating Aluminum Desk Phone Stand",
    "category": "accessories",
    "subcategory": "accessories",
    "price": 1499,
    "priceOld": 2199,
    "badge": "TOP RATED",
    "emoji": "📱",
    "inStock": true,
    "featured": false,
    "newArrival": true,
    "trending": false,
    "description": "Solid aerospace aluminum alloy, dual-hinge adjustable viewing angles, non-slip silicone pads, fully foldable for travel."
  },
  {
    "id": "dz-cuban-chain",
    "name": "Stainless Steel Minimalist Cuban Curb Chain (Silver)",
    "category": "jewellery",
    "subcategory": "jewellery",
    "price": 1799,
    "priceOld": 2499,
    "badge": "TRENDING",
    "emoji": "⛓️",
    "inStock": true,
    "featured": true,
    "newArrival": true,
    "trending": true,
    "description": "Rust-proof 316L stainless steel, diamond-cut bevels, hypoallergenic, highly polished shine for everyday streetwear."
  },
  {
    "id": "dz-matte-ring",
    "name": "Titanium Obsidian Matte Black Minimal Beveled Ring",
    "category": "jewellery",
    "subcategory": "jewellery",
    "price": 1299,
    "priceOld": 1899,
    "badge": "CLASSIC",
    "emoji": "💍",
    "inStock": true,
    "featured": false,
    "newArrival": false,
    "trending": true,
    "description": "Ultra-lightweight aerospace titanium, scratch-resistant matte brushed finish, comfort-fit rounded interior edges."
  },
  {
    "id": "dz-magnetic-bracelets",
    "name": "Dual Magnetic Attraction Couples Bracelets (Set of 2)",
    "category": "jewellery",
    "subcategory": "jewellery",
    "price": 1499,
    "priceOld": 2199,
    "badge": "POPULAR",
    "emoji": "✨",
    "inStock": true,
    "featured": false,
    "newArrival": true,
    "trending": false,
    "description": "Matching his & hers magnetic heart charms, durable braided cord, adjustable sizing, beautifully packaged for gifting."
  },
  {
    "id": "dz-polarized-shades",
    "name": "Vintage Polarized UV400 Matte Hexagonal Sunglasses",
    "category": "fashion-lifestyle",
    "subcategory": "fashion-lifestyle",
    "price": 2199,
    "priceOld": 3299,
    "badge": "TRENDING",
    "emoji": "🕶️",
    "inStock": true,
    "featured": true,
    "newArrival": true,
    "trending": true,
    "description": "HD polarized TAC lenses, anti-glare coating, lightweight reinforced metal frame, full UV400 eye protection."
  },
  {
    "id": "dz-perfume-oud",
    "name": "Velvet Noir Luxury Long-Lasting Unisex EDP (50ml)",
    "category": "fashion-lifestyle",
    "subcategory": "fashion-lifestyle",
    "price": 3299,
    "priceOld": 4799,
    "badge": "LUXURY",
    "emoji": "✨",
    "inStock": true,
    "featured": false,
    "newArrival": true,
    "trending": true,
    "description": "Exotic blend of amber, smoky vanilla, and subtle musk notes. Formulated for long-lasting all-day projection."
  },
  {
    "id": "dz-vacuum-tumbler",
    "name": "Smart Temperature LED Display Insulated Tumbler 500ml",
    "category": "fashion-lifestyle",
    "subcategory": "fashion-lifestyle",
    "price": 1999,
    "priceOld": 2899,
    "badge": "BESTSELLER",
    "emoji": "☕",
    "inStock": true,
    "featured": false,
    "newArrival": false,
    "trending": true,
    "description": "Touchscreen LED temperature readout, double-wall vacuum insulation keeps drinks hot for 12h or cold for 24h."
  },
  {
    "id": "dz-cloud-sneakers",
    "name": "Cloudfoam Air Cushion Breathable Running Sneakers",
    "category": "footwear",
    "subcategory": "footwear",
    "price": 4499,
    "priceOld": 6499,
    "badge": "TOP RATED",
    "emoji": "👟",
    "inStock": true,
    "featured": true,
    "newArrival": true,
    "trending": true,
    "description": "Engineered flyknit upper, responsive high-rebound cushioning, anti-slip rubber traction sole, ultra-lightweight."
  },
  {
    "id": "dz-street-chunky",
    "name": "Urban Streetwear Chunky Platform Low-Top Sneakers",
    "category": "footwear",
    "subcategory": "footwear",
    "price": 4999,
    "priceOld": 7299,
    "badge": "NEW",
    "emoji": "👟",
    "inStock": true,
    "featured": false,
    "newArrival": true,
    "trending": true,
    "description": "Bold contemporary chunky silhouette, premium synthetic leather overlays, padded collar for all-day streetwear comfort."
  },
  {
    "id": "dz-ergonomic-slides",
    "name": "Ultra-Soft Cloud Ergonomic Waterproof Slides",
    "category": "footwear",
    "subcategory": "footwear",
    "price": 1899,
    "priceOld": 2699,
    "badge": "HOT",
    "emoji": "🩴",
    "inStock": true,
    "featured": false,
    "newArrival": false,
    "trending": false,
    "description": "Thick EVA foam sole, ergonomic deep heel cup, non-slip textured outsole, water-resistant and easy to clean."
  },
  {
    "id": "dz-oversized-tee",
    "name": "Heavyweight 280 GSM Drop-Shoulder Streetwear Tee",
    "category": "clothing-apparel",
    "subcategory": "clothing-apparel",
    "price": 2299,
    "priceOld": 3299,
    "badge": "BESTSELLER",
    "emoji": "👕",
    "inStock": true,
    "featured": true,
    "newArrival": true,
    "trending": true,
    "description": "100% combed cotton, heavyweight 280 GSM fabric, ribbed crewneck collar, relaxed oversized drop-shoulder cut."
  },
  {
    "id": "dz-relaxed-hoodie",
    "name": "Premium French Terry Minimal Relaxed Pullover Hoodie",
    "category": "clothing-apparel",
    "subcategory": "clothing-apparel",
    "price": 3799,
    "priceOld": 5199,
    "badge": "ESSENTIAL",
    "emoji": "🧥",
    "inStock": true,
    "featured": false,
    "newArrival": true,
    "trending": true,
    "description": "Ultra-soft brushed French terry cotton, double-layer hood, front kangaroo pocket, ribbed cuffs and hem."
  },
  {
    "id": "dz-cargo-joggers",
    "name": "Tactical Relaxed Fit Multi-Pocket Cargo Joggers",
    "category": "clothing-apparel",
    "subcategory": "clothing-apparel",
    "price": 2999,
    "priceOld": 4299,
    "badge": "TRENDING",
    "emoji": "👖",
    "inStock": true,
    "featured": false,
    "newArrival": false,
    "trending": true,
    "description": "Stretch cotton twill fabric, elastic waistband with drawstring, 6 functional cargo pockets, cuffed ankle cuffs."
  },
  {
    "id": "dz-sherpa-jacket",
    "name": "Thermal Sherpa-Lined Heavy Duty Winter Bomber Jacket",
    "category": "winter-collection",
    "subcategory": "winter-collection",
    "price": 5899,
    "priceOld": 7999,
    "badge": "WINTER DROP",
    "emoji": "❄️",
    "inStock": true,
    "featured": true,
    "newArrival": true,
    "trending": true,
    "description": "Thick windproof outer shell, plush thermal sherpa fleece lining, heavy-duty metallic zipper, and storm cuffs."
  },
  {
    "id": "dz-polar-fleece",
    "name": "Insulated Wind-Resistant Heavyweight Polar Fleece Hoodie",
    "category": "winter-collection",
    "subcategory": "winter-collection",
    "price": 4299,
    "priceOld": 5999,
    "badge": "WARM",
    "emoji": "🧥",
    "inStock": true,
    "featured": false,
    "newArrival": true,
    "trending": true,
    "description": "High-pile thermal fleece insulation, anti-pilling fabric, zippered chest pocket, locks in body heat in freezing temps."
  },
  {
    "id": "dz-puffer-vest",
    "name": "Ultralight Warm Quilted Puffer Vest (Water Resistant)",
    "category": "winter-collection",
    "subcategory": "winter-collection",
    "price": 4699,
    "priceOld": 6499,
    "badge": "LIMITED",
    "emoji": "🦺",
    "inStock": true,
    "featured": false,
    "newArrival": false,
    "trending": true,
    "description": "Down-alternative insulation, water-resistant nylon shell, stand collar for wind protection, perfect for layering."
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

  if (!products.length) {
    grid.innerHTML = derazoneEmptyState('Fresh Collections Dropping Soon!');
    return;
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

  // --- 1. Render Trending Now ---
  const trendingGrid = document.getElementById('trending-now-grid');
  if (trendingGrid && allProducts.length) {
    const trendingList = allProducts.filter(p => p.trending === true || p.badge === 'HOT' || p.badge === 'BESTSELLER' || p.badge === 'TRENDING');
    const displayList = trendingList.length ? trendingList : allProducts.slice(0, 4);
    trendingGrid.innerHTML = displayList.slice(0, 4).map(p => derazoneProductCardHTML(p)).join('');
  }

  // --- 2. Render New Arrivals ---
  const newArrivalsGrid = document.getElementById('new-arrivals-grid');
  if (newArrivalsGrid && allProducts.length) {
    const newList = allProducts.filter(p => p.newArrival === true || p.badge === 'NEW' || p.badge === 'TOP RATED');
    const displayList = newList.length ? newList : allProducts.slice(4, 8);
    newArrivalsGrid.innerHTML = displayList.slice(0, 4).map(p => derazoneProductCardHTML(p)).join('');
  }

  // --- 3. Setup Categories Carousel (Single-Row Slideshow with next/prev) ---
  const catTrack = document.getElementById('categories-carousel-track');
  const catPrev = document.getElementById('cat-prev-btn');
  const catNext = document.getElementById('cat-next-btn');
  if (catTrack && catPrev && catNext) {
    catPrev.addEventListener('click', () => {
      catTrack.scrollBy({ left: -300, behavior: 'smooth' });
    });
    catNext.addEventListener('click', () => {
      catTrack.scrollBy({ left: 300, behavior: 'smooth' });
    });
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
