#!/usr/bin/env node
/**
 * Henter meny fra Foodora restaurant-side via Puppeteer og lagrer i backend/static_menu.json
 * Kjør: node scripts/fetch-menu.js  (eller: npm run fetch-menu fra prosjektrot)
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const SOURCES = [
  { name: 'Ninito', url: 'https://order.ninito.com/no/group/oscars-pizzeria/holter' },
  { name: 'Foodora', url: 'https://www.foodora.no/restaurant/n1sj/oscars-pizzeria' },
];
const OUT_PATH = path.join(__dirname, '..', 'backend', 'static_menu.json');

/**
 * Transform raw menu data to target format:
 * [{ name, name_en, items: [{ name, description, price?, sizes? }] }]
 */
function transformToTargetFormat(categories) {
  const result = [];

  for (const cat of categories) {
    const items = (cat.items || []).map((item) => {
      const out = {
        name: item.name || '',
        description: item.description || '',
      };
      if (item.sizes && item.sizes.length > 0) {
        out.sizes = item.sizes.map((s) => ({
          name: s.name || '',
          price: parseFloat(s.price) || 0,
        }));
      } else if (item.price != null) {
        out.price = parseFloat(item.price) || 0;
      }
      return out;
    });

    if (items.length > 0) {
      result.push({
        name: cat.name || '',
        name_en: cat.name_en || cat.name || '',
        items,
      });
    }
  }

  return result;
}

/**
 * Try to extract menu from __PRELOADED_STATE__ or similar global
 */
function extractFromPreloadedState(page) {
  return page.evaluate(() => {
    const keys = [
      '__PRELOADED_STATE__',
      '__NEXT_DATA__',
      '__INITIAL_STATE__',
      'window.__PRELOADED_STATE__',
    ];

    for (const key of keys) {
      let obj = null;
      try {
        if (key.startsWith('window.')) {
          obj = eval(key);
        } else {
          obj = window[key];
        }
        if (!obj) continue;

        const str = typeof obj === 'string' ? obj : JSON.stringify(obj);
        const data = typeof obj === 'string' ? JSON.parse(obj) : obj;

        // Look for restaurant/menu structure
        const menu =
          data?.restaurant?.menu ||
          data?.menu ||
          data?.store?.menu ||
          data?.categories ||
          data?.props?.pageProps?.restaurant?.menu ||
          data?.props?.pageProps?.menu ||
          data?.vendor?.menu ||
          data?.vendor?.data?.menu;

        if (menu && Array.isArray(menu)) {
          return JSON.stringify(menu);
        }
        if (menu && typeof menu === 'object' && menu.categories) {
          return JSON.stringify(menu.categories);
        }
        if (menu && typeof menu === 'object' && Array.isArray(menu.product_categories)) {
          return JSON.stringify(menu.product_categories);
        }

        // Recursive search for categories array
        function findCategories(o, depth = 0) {
          if (depth > 12) return null;
          if (Array.isArray(o) && o.length > 0) {
            const first = o[0];
            if (
              first &&
              typeof first === 'object' &&
              (first.name || first.title || first.label || first.id) &&
              (first.items || first.products || Array.isArray(first.products) ||
                first.products_count !== undefined || first.product_count !== undefined)
            ) {
              return o;
            }
            // Array of products directly
            if (first && typeof first === 'object' && (first.name || first.title) && (first.price !== undefined || first.price_info)) {
              return [{ name: 'Meny', name_en: 'Menu', items: o }];
            }
          }
          if (o && typeof o === 'object') {
            for (const v of Object.values(o)) {
              const found = findCategories(v, depth + 1);
              if (found) return found;
            }
          }
          return null;
        }

        const cats = findCategories(data);
        if (cats) return JSON.stringify(cats);
      } catch (_) {}
    }
    return null;
  });
}

/**
 * Intercept network responses for menu/API data
 */
async function captureMenuFromNetwork(page, pageUrl) {
  let captured = null;

  const handler = async (response) => {
    try {
      const url = response.url();
      const urlLower = url.toLowerCase();
      if (
        !urlLower.includes('menu') &&
        !urlLower.includes('catalog') &&
        !urlLower.includes('restaurant') &&
        !urlLower.includes('product') &&
        !urlLower.includes('graphql') &&
        !urlLower.includes('/api/') &&
        !urlLower.includes('deliveryhero') &&
        !urlLower.includes('ninito') &&
        !urlLower.includes('fd-no') &&
        !urlLower.includes('vendor') &&
        !urlLower.includes('group')
      ) {
        return;
      }
      const ct = (response.headers()['content-type'] || '').toLowerCase();
      if (!ct.includes('json') && !ct.includes('javascript')) return;

      const text = await response.text();
      if (!text || text.length < 200) return;

      const data = JSON.parse(text);

      // Look for category-like arrays
      function findMenuInObject(o, depth = 0) {
        if (depth > 10) return null;
        if (Array.isArray(o) && o.length > 0) {
          const first = o[0];
          if (
            first &&
            typeof first === 'object' &&
            (first.name || first.title || first.label) &&
            (first.items || first.products || Array.isArray(first.products))
          ) {
            return o;
          }
        }
        if (o && typeof o === 'object') {
          for (const v of Object.values(o)) {
            const found = findMenuInObject(v, depth + 1);
            if (found) return found;
          }
        }
        return null;
      }

      const cats = findMenuInObject(data);
      if (cats && !captured && cats.length > 0) {
        captured = cats;
      }
    } catch (_) {}
  };

  page.on('response', handler);
  await page.goto(pageUrl, {
    waitUntil: 'networkidle2',
    timeout: 30000,
  });

  // Scroll to trigger lazy-loaded menu content
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight / 2);
  });
  await new Promise((r) => setTimeout(r, 1500));
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await new Promise((r) => setTimeout(r, 1500));

  page.off('response', handler);

  return captured;
}

/**
 * Normalize raw API/DOM structure to our format
 */
function normalizeCategories(raw) {
  if (!Array.isArray(raw)) return [];

  return raw.map((cat) => {
    const name = cat.name || cat.title || cat.label || '';
    const itemsRaw = cat.items || cat.products || [];
    const items = itemsRaw.map((p) => {
      const itemName = p.name || p.title || p.label || '';
      const desc = p.description || p.desc || '';
      const price = p.price ?? p.prices?.default ?? p.prices?.standard ?? p.base_price;
      const sizesRaw = p.sizes || p.variants || p.options?.filter((o) => o.type === 'size') || [];

      const item = { name: itemName, description: desc || '' };

      if (sizesRaw.length > 0) {
        item.sizes = sizesRaw.map((s) => ({
          name: s.name || s.label || s.title || '',
          price: parseFloat(s.price ?? s.prices?.default ?? s.prices?.standard ?? price ?? 0) || 0,
        }));
      } else if (price != null) {
        item.price = parseFloat(price) || 0;
      }
      return item;
    });

    return { name, name_en: name, items };
  });
}

/**
 * Fallback: scrape from DOM
 */
async function scrapeFromDOM(page) {
  return page.evaluate(() => {
    const categories = [];

    // Common selectors for menu sections
    const sectionSelectors = [
      '[data-testid="menu-category"]',
      '[data-testid="category"]',
      '.menu-category',
      '.category-section',
      'section[class*="category"]',
      '[class*="MenuCategory"]',
      '[class*="CategorySection"]',
      'h2, h3',
    ];

    let sections = [];
    for (const sel of sectionSelectors) {
      try {
        const els = document.querySelectorAll(sel);
        if (els.length > 2) {
          sections = Array.from(els);
          break;
        }
      } catch (_) {}
    }

    if (sections.length === 0) {
      // Try by structure: find all product cards and group by preceding heading
      const cards = document.querySelectorAll(
        '[data-testid="product"], [data-testid="menu-item"], .product, .menu-item, [class*="ProductCard"], [class*="MenuItem"]'
      );
      if (cards.length > 0) {
        let currentCat = { name: 'Meny', items: [] };
        const headings = document.querySelectorAll('h2, h3, [class*="category"]');
        // Simplified: put all in one category if we can't infer structure
        const items = Array.from(cards).map((el) => {
          const nameEl = el.querySelector('[class*="name"], [class*="title"], h4, span');
          const priceEl = el.querySelector('[class*="price"], [data-testid="price"]');
          const descEl = el.querySelector('[class*="description"], [class*="desc"]');
          return {
            name: nameEl?.textContent?.trim() || '',
            description: descEl?.textContent?.trim() || '',
            price: parseFloat(priceEl?.textContent?.replace(/[^\d.,]/g, '').replace(',', '.')) || undefined,
          };
        });
        return [{ name: 'Meny', name_en: 'Menu', items }];
      }
    }

    for (const section of sections) {
      const heading = section.tagName.match(/^H[2-6]$/)
        ? section
        : section.querySelector('h2, h3, h4, [class*="title"], [class*="heading"]');
      const catName = heading?.textContent?.trim() || 'Ukjent';

      const productEls = section.querySelectorAll(
        '[data-testid="product"], [data-testid="menu-item"], .product, .menu-item, [class*="ProductCard"], [class*="MenuItem"], li'
      );

      const items = Array.from(productEls)
        .slice(0, 50)
        .map((el) => {
          const nameEl = el.querySelector('[class*="name"], [class*="title"], h4, span');
          const priceEl = el.querySelector('[class*="price"], [data-testid="price"]');
          const descEl = el.querySelector('[class*="description"], [class*="desc"]');
          const name = nameEl?.textContent?.trim() || '';
          if (!name) return null;
          return {
            name,
            description: descEl?.textContent?.trim() || '',
            price: parseFloat(priceEl?.textContent?.replace(/[^\d.,]/g, '').replace(',', '.')) || undefined,
          };
        })
        .filter(Boolean);

      if (items.length > 0) {
        categories.push({ name: catName, name_en: catName, items });
      }
    }

    return categories;
  });
}

function getChromePath() {
  // Use system Chrome on macOS if Puppeteer's bundled Chrome isn't available
  if (process.platform === 'darwin') {
    const paths = [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
    ];
    for (const p of paths) {
      try {
        if (fs.existsSync(p)) return p;
      } catch (_) {}
    }
  }
  return null;
}

async function main() {
  let browser;
  try {
    console.log('Starter Puppeteer og åpner Foodora...');
    const launchOpts = {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    };
    const sysChrome = getChromePath();
    if (sysChrome) {
      launchOpts.executablePath = sysChrome;
    }
    browser = await puppeteer.launch(launchOpts);

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    await page.setViewport({ width: 1280, height: 800 });

    let menuData = null;
    let lastError = null;

    for (const source of SOURCES) {
      console.log(`\n--- Prøver ${source.name}: ${source.url} ---`);
      try {
        // 1. Network interception
        console.log('Fanger nettverksforespørsler...');
        menuData = await captureMenuFromNetwork(page, source.url);

        // 2. __PRELOADED_STATE__
        if (!menuData) {
          console.log('Søker i __PRELOADED_STATE__...');
          const preloaded = await extractFromPreloadedState(page);
          if (preloaded) {
            try {
              menuData = JSON.parse(preloaded);
            } catch (_) {}
          }
        }

        // 3. DOM scraping
        if (!menuData) {
          console.log('Venter på meny...');
          await page.waitForSelector(
            '[data-testid="product"], [data-testid="menu-item"], .product, .menu-item, [class*="ProductCard"], [class*="MenuItem"], [class*="product"], [class*="category"]',
            { timeout: 12000 }
          ).catch(() => {});
          await new Promise((r) => setTimeout(r, 2500));
          console.log('Prøver DOM-scraping...');
          menuData = await scrapeFromDOM(page);
        }

        if (menuData && Array.isArray(menuData) && menuData.length > 0) {
          console.log(`✓ Meny funnet via ${source.name}`);
          break;
        }
      } catch (e) {
        lastError = e;
        console.log(`  ${source.name} feilet: ${e.message}`);
      }
    }

    await browser.close();

    if (!menuData || (Array.isArray(menuData) && menuData.length === 0)) {
      throw new Error(
        'Kunne ikke hente meny fra Ninito eller Foodora. Sidene kan ha endret struktur. Du kan oppdatere backend/static_menu.json manuelt.'
      );
    }

    const normalized = normalizeCategories(menuData);
    const transformed = transformToTargetFormat(normalized);

    if (transformed.length === 0) {
      throw new Error('Ingen menykategorier funnet.');
    }

    fs.writeFileSync(OUT_PATH, JSON.stringify(transformed, null, 2), 'utf8');
    console.log(`✓ Meny hentet og lagret i ${OUT_PATH}`);
    console.log(`  Kategorier: ${transformed.length}`);
    transformed.forEach((c) =>
      console.log(`  - ${c.name} (${c.items?.length || 0} retter)`)
    );
  } catch (e) {
    console.error('Feil ved henting av meny:', e.message);
    if (browser) await browser.close();
    process.exit(1);
  }
}

main();
