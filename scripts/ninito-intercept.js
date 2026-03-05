const puppeteer = require('puppeteer');
const fs = require('fs');

async function main() {
  const url = 'https://order.ninito.com/no/group/oscars-pizzeria/holter';
  console.log('Starter Puppeteer for å fange all menydata inkludert størrelser...');
  
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });
  
  const page = await browser.newPage();
  
  let allProducts = [];
  let allCategories = [];
  
  page.on('response', async (response) => {
    try {
      const reqUrl = response.url();
      // Ninito henter data fra bl.a. firestore eller custom API. Vi prøver å fange all JSON-trafikk knyttet til produkter
      if (reqUrl.includes('firestore.googleapis.com') || reqUrl.includes('/api/')) {
        const text = await response.text();
        if (text && text.length > 100) {
          fs.appendFileSync('/tmp/ninito_raw_traffic.txt', `\n\n--- URL: ${reqUrl} ---\n` + text.substring(0, 10000));
        }
      }
    } catch (e) {
      // ignore
    }
  });

  // Also hook into IndexedDB or localStorage to see if data is cached
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  
  await new Promise(r => setTimeout(r, 5000)); // wait for full render
  
  // Prøv å lese ut fra state
  const extractedData = await page.evaluate(async () => {
    return new Promise((resolve) => {
      // Let's try to extract from IndexedDB if Firebase uses it
      const dump = { html: document.body.innerText.substring(0, 5000) };
      resolve(dump);
    });
  });
  
  fs.writeFileSync('/tmp/ninito_page_text.txt', extractedData.html);
  console.log('Ferdig med scraping!');
  
  await browser.close();
}

main().catch(console.error);
