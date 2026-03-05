const https = require('https');

async function fetchProducts() {
  const shopId = '7104461b-3606-4a6c-88ff-bb5712e6c058';
  return new Promise((resolve, reject) => {
    https.get(`https://firestore.googleapis.com/v1/projects/ns3-no/databases/(default)/documents/shops/${shopId}/products?pageSize=300`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

fetchProducts().then(res => {
  const fs = require('fs');
  fs.writeFileSync('/tmp/products.json', JSON.stringify(res, null, 2));
  console.log("Found products: ", res.documents ? res.documents.length : 0);
}).catch(console.error);
