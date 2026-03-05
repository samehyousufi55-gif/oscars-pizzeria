const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function scrapeNinito() {
    console.log('Starter Puppeteer...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1280, height: 800 });

    const productMap = {};

    page.on('response', async (response) => {
        try {
            const url = response.url();
            if (url.includes('firestore.googleapis.com') || url.includes('/products')) {
                const text = await response.text();
                const data = JSON.parse(text);

                function findProducts(o) {
                    if (!o) return;
                    if (Array.isArray(o)) {
                        for (const x of o) findProducts(x);
                    } else if (typeof o === 'object') {
                        // Ninito specific check
                        if ((o.name || o.title) && (o.id || o.productId)) {
                            const name = o.name || o.title;
                            const id = o.id || o.productId;
                            if (typeof name === 'string' && typeof id === 'string' && id.length > 20) {
                                productMap[name] = id;
                            }
                        }
                        for (const k in o) findProducts(o[k]);
                    }
                }
                findProducts(data);
            }
        } catch (e) { }
    });

    console.log('Går til Ninito Holter...');
    await page.goto('https://order.ninito.com/no/group/oscars-pizzeria/holter', {
        waitUntil: 'networkidle2',
        timeout: 60000
    });

    // Bla lenger ned for å laste alle produkter
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            let distance = 100;
            let timer = setInterval(() => {
                let scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });

    await new Promise(r => setTimeout(r, 5000));

    // Prøv også å hente fra __NEXT_DATA__
    const nextData = await page.evaluate(() => {
        const script = document.getElementById('__NEXT_DATA__');
        return script ? script.textContent : null;
    });

    if (nextData) {
        try {
            const data = JSON.parse(nextData);
            function findInNext(o) {
                if (!o) return;
                if (Array.isArray(o)) {
                    for (const x of o) findInNext(x);
                } else if (typeof o === 'object') {
                    if ((o.name || o.title) && (o.id || o.productId)) {
                        productMap[o.name || o.title] = o.id || o.productId;
                    }
                    for (const k in o) findInNext(o[k]);
                }
            }
            findInNext(data);
        } catch (e) { }
    }

    console.log(`Fant ${Object.keys(productMap).length} produkter.`);
    fs.writeFileSync(path.join(__dirname, '..', 'ninito_ids.json'), JSON.stringify(productMap, null, 2));

    await browser.close();
}

scrapeNinito().catch(console.error);
