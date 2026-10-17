/* ============================================================
   DERA ZONE — Dynamic Product Rendering
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

function velorCatLabel(cat) {
  if (!cat) return '';
  return DERAZONE_CAT_LABELS[cat.toLowerCase()] || cat;
}

function derazoneProductCardHTML(p) {
  const badge = p.badge ? `<span class="product-badge${p.badge === 'New' ? ' new' : ''}">${p.badge}</span>` : '';
  const oldPrice = p.priceOld
    ? `<span class="product-price-old">PKR ${Number(p.priceOld).toLocaleString()}</span>`
    : '';
  const emoji = p.emoji || '✨';
  const variant = ((p.colors && p.colors[0]) || (p.sizes && p.sizes[0]) || 'Standard').replace(/\\/g, '\\\\').replace(/'/g, "\\''").replace(/"/g, '&quot;');
  const safeName = p.name.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;');
  const mainImage = (p.images && p.images.length) ? p.images[0] : null;
  const hasVideo  = !!p.video;

  const cat = p.category;
  const subcat = p.subcategory;
  const resolvedCat = subcat || cat;

  const fallbackEmoji = `<div style="width:100%;height:100%;background:var(--card);display:flex;align-items:center;justify-content:center;font-size:2rem;color:var(--primary);">${emoji}</div>`;
  const mediaHTML = mainImage
    ? `<img src="${mainImage}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;" loading="lazy" onerror="window.zhHandleImageError(this, '${emoji}', 'grid')" />`
    : hasVideo
      ? `<video src="${p.video}#t=0.1" muted preload="metadata" playsinline style="width:100%;height:100%;object-fit:cover;" onerror="window.zhHandleImageError(this, '${emoji}', 'grid')"></video>`
      : fallbackEmoji;

  const cardData = encodeURIComponent(JSON.stringify({
    name: p.name,
    price: p.price,
    emoji: emoji,
    variant: variant,
    image: mainImage || ''
  }));

  return `
    <div class="product-card" data-cat="${resolvedCat}" data-main-cat="derazone" data-additional-cats="${(p.additionalCategories || []).join(',')}">
      <div class="product-img-wrap">
        ${badge}
        <a href="product.html?id=${p.id}">${mediaHTML}</a>
      </div>
      <div class="product-info">
        <p class="product-cat">${velorCatLabel(resolvedCat)}</p>
        <h3 class="product-name"><a href="product.html?id=${p.id}">${p.name}</a></h3>
        <div class="product-price">PKR ${Number(p.price).toLocaleString()} ${oldPrice}</div>
        <div class="product-action-row" style="display:flex;gap:8px;margin-top:12px;">
          <button class="btn-primary product-add" style="flex:1;font-size:0.8rem;padding:8px;" data-card="${cardData}" data-action="add">Add to Bag</button>
          <button class="btn-outline product-buy" style="flex:1;font-size:0.8rem;padding:8px;" data-card="${cardData}" data-action="buy">Buy it Now</button>
        </div>
      </div>
    </div>
  `;
}

// keeping the legacy function name used elsewhere
window.derazoneCreateProductCard = derazoneProductCardHTML;

function derazoneEmptyState(msg) {
  return `<div style="grid-column:1/-1;text-align:center;padding:60px 20px;background:var(--card);border-radius:12px;border:1px solid var(--border);color:var(--muted);"><i class="fa-solid fa-box-open" style="font-size:2rem;color:var(--primary);margin-bottom:16px;"></i><p>${msg}</p></div>`;
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
        const tryAction = () => {
          if (action === 'add' && typeof window.addToCart === 'function') {
            window.addToCart(d.name, d.price, d.emoji, d.variant, d.image);
          } else if (action === 'buy' && typeof window.buyNow === 'function') {
            window.buyNow(d.name, d.price, d.emoji, d.variant, d.image);
          } else {
            window.addEventListener('DOMContentLoaded', tryAction, { once: true });
          }
        };
        tryAction();
      } catch(err) {}
    });
  });
}

function derazoneSetupShopFilters(products, grid) {
  const urlParams = new URLSearchParams(window.location.search);
  let activeSub = urlParams.get('cat');
  let activeBrand = urlParams.get('brand');
  let activeSort = 'featured';

  const subContainer = document.getElementById('sub-filter-container');
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
      subList.innerHTML = \`<li><button class="sidebar-link \${!activeSub ? 'active' : ''}" data-sub-filter="all">All Products</button></li>\` + 
      subs.map(s => {
        const isActive = activeSub === s ? 'active' : '';
        return \`<li><button class="sidebar-link \${isActive}" data-sub-filter="\${s}">\${DERAZONE_CAT_LABELS[s] || s}</button></li>\`;
      }).join('');
      
      if(subContainer) subContainer.style.display = 'block';

      subList.querySelectorAll('.sidebar-link').forEach(btn => {
        btn.addEventListener('click', () => {
          subList.querySelectorAll('.sidebar-link').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          activeSub = btn.dataset.subFilter;
          if (activeSub === 'all') activeSub = null;
          applyFiltersAndSort();
          if (window.innerWidth <= 991 && sidebar) sidebar.classList.remove('active');
        });
      });
    }
  }

  function applyFiltersAndSort() {
    let filtered = products.filter(p => {
      const c = p.category;
      const s = p.subcategory;
      const additional = p.additionalCategories || [];
      
      let show = true;
      if (activeSub) {
        show = (s === activeSub || c === activeSub || additional.includes(activeSub));
      }
      if (show && activeBrand) {
        show = (p.brand && p.brand.toLowerCase() === activeBrand.toLowerCase());
      }
      return show;
    });

    if (activeSort === 'price-asc') {
      filtered.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (activeSort === 'price-desc') {
      filtered.sort((a, b) => Number(b.price) - Number(a.price));
    }

    if (filtered.length === 0) {
      grid.innerHTML = derazoneEmptyState('No products found in this category.');
    } else {
      grid.innerHTML = filtered.map(derazoneProductCardHTML).join('');
      derazoneReInitCards(grid);
    }

    if (window.updateShopHero) {
      window.updateShopHero(activeSub, activeBrand);
    }
    
    let urlStr = window.location.pathname;
    let params = new URLSearchParams();
    if (activeSub) params.set('cat', activeSub);
    if (activeBrand) params.set('brand', activeBrand);
    
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

  renderSubFilters();
  applyFiltersAndSort();
}

async function derazoneRenderShopGrid() {
  const grid = document.querySelector('#shop-products-grid, .products-grid');
  if (!grid) return;

  try {
    const data = await apiGet('/products');
    let products = data.products || [];

    if (!products.length) {
      grid.innerHTML = derazoneEmptyState('No products available right now. Please check back soon.');
      return;
    }

    derazoneSetupShopFilters(products, grid);
  } catch (err) {
    grid.innerHTML = derazoneEmptyState('No products available');
  }
}

async function derazoneRenderHomepageGrids() {
  try {
    const data = await apiGet('/products');
    let allProducts = data.products || [];

    // --- 1. Render Category Circles ---
    const catContainer = document.getElementById('category-circles');
    if (catContainer) {
      try {
        const catRes = await apiGetCategories();
        const apiCategories = catRes.categories || [];
        if (apiCategories.length > 0) {
          catContainer.innerHTML = apiCategories.map(c => \`
            <a href="shop.html?cat=\${c.id}" class="cat-circle">
              <div class="cat-circle-img" style="display:flex;align-items:center;justify-content:center;background:var(--card);border:1px solid var(--border);"><i class="fa-solid fa-bolt" style="font-size:1.5rem;color:var(--primary);"></i></div>
              <p>\${c.name}</p>
            </a>
          \`).join('');
        }
      } catch (e) {
        console.warn('Failed to load categories');
      }
    }

    // --- 2. Render New Arrivals ---
    const newArrivalsGrid = document.getElementById('new-arrivals-grid');
    if (newArrivalsGrid) {
      const newProducts = allProducts.filter(p => p.newArrival === true || p.badge === 'New');
      if (newProducts.length > 0) {
        newArrivalsGrid.innerHTML = newProducts.slice(0, 24).map(p => derazoneProductCardHTML(p)).join('');
        derazoneReInitCards(newArrivalsGrid);
        document.getElementById('new-arrivals').style.display = 'block';
      }
    }

    // --- 3. Render Trending Now ---
    const trendingGrid = document.getElementById('trending-now-grid');
    if (trendingGrid) {
      const trendingProducts = allProducts.filter(p => p.trending === true || p.hotSelling === true);
      if (trendingProducts.length > 0) {
        trendingGrid.innerHTML = trendingProducts.slice(0, 24).map(p => derazoneProductCardHTML(p)).join('');
        derazoneReInitCards(trendingGrid);
        document.getElementById('trending-now').style.display = 'block';
      }
    }
    
    // --- 4. Render Spotlight ---
    const spotlightSection = document.getElementById('featured-spotlight');
    if (spotlightSection) {
      const spotlightRes = await apiGet('/admin/spotlight').catch(e => null);
      const spotlightIds = spotlightRes && spotlightRes.spotlight ? spotlightRes.spotlight : [];
      if (spotlightIds.length > 0) {
        const spotlightProducts = spotlightIds.map(id => allProducts.find(p => p.id === id)).filter(Boolean);
        if (spotlightProducts.length > 0) {
          spotlightSection.innerHTML = \`
            <div class="container">
              <div class="section-header-row" style="justify-content:center; text-align:center;">
                <h2 style="font-size: 2rem; color: var(--text);">Spotlight</h2>
              </div>
              <div class="product-grid-4">
                \${spotlightProducts.map(p => derazoneProductCardHTML(p)).join('')}
              </div>
            </div>
          \`;
          derazoneReInitCards(spotlightSection);
          spotlightSection.style.display = 'block';
        }
      }
    }

  } catch (err) {
    console.error('Failed to load homepage products:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('shop-products-grid') || document.querySelector('.shop-layout')) {
    derazoneRenderShopGrid();
  }
  if (document.getElementById('new-arrivals-grid')) {
    derazoneRenderHomepageGrids();
  }
});

