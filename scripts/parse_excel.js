const xlsx = require('xlsx');
const fs = require('fs');

const workbook = xlsx.readFile('/Users/samehyousufi/Downloads/Book 6.xlsx');
const sheet_name = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheet_name];
const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

// The header row is likely the first non-empty row or we can just parse by index assuming it looks like the subagent read.
// A: Navn (index 0)
// B: Beskrivelse (index 1)
// C: pris Stor (index 2)
// D: Pris medium (index 3)
// E: kategori (index 4)
// F: størrelse (index 5) - may not be present on all rows

const menuCategories = {};

// We should skip the first row usually if it's headers. Wait, are headers in row 1?
let headerFound = false;

for (let r = 0; r < data.length; r++) {
    const row = data[r];

    if (!row || row.length === 0) continue;

    const colA = (row[0] || '').toString().trim();
    const colB = (row[1] || '').toString().trim();
    const colC = (row[2] || '').toString().trim(); // pris Stor
    const colD = (row[3] || '').toString().trim(); // Pris medium
    const colE = (row[4] || '').toString().trim(); // kategori
    const colF = (row[5] || '').toString().trim(); // størrelse

    if (colA.toLowerCase() === 'navn') {
        headerFound = true;
        continue;
    }

    if (!colA && !colB && !colC && !colD && !colE) continue;

    const name = colA;
    const description = colB;
    let priceStor = colC.replace(/[^\d.,]/g, '');
    let priceMedium = colD.replace(/[^\d.,]/g, '');
    const category = colE;
    const targetSize = colF;

    // Let's make sure category exists
    // If category is missing but we have name, we'll try to guess or skip. Wait, usually category is filled. Let's fallback to "Annet"
    // Wait, if it's empty, maybe it's just a spacer.
    if (!category && !name) continue;

    const catName = category || 'Annet';

    if (!menuCategories[catName]) {
        menuCategories[catName] = { name: catName, items: [] };
    }

    // Create item
    const item = { name, description };

    let pMedium = parseFloat(priceMedium) || null;
    let pStor = parseFloat(priceStor) || null;

    // Now, manage sizes based on size column, OR just Medium/Stor price columns
    const sizes = [];

    // Excel logic:
    // If targetSize is provided (like "100g", "3 stk") and we have a medium price, use targetSize as size name.
    // Wait, if the Excel sheet has multiple rows for "Bare Burger", each row has its own "størrelse" and "Pris medium".
    // We need to group them if they have the same name.

    // Let's add all items to category items, then group them later.
    item.pMedium = pMedium;
    item.pStor = pStor;
    item.targetSize = targetSize;

    menuCategories[catName].items.push(item);
}

// Now group items by name within each category
const finalCategories = [];

for (const cat of Object.values(menuCategories)) {
    const itemsMap = {}; // name -> item

    for (const rawItem of cat.items) {
        // Fjern tall foran som f.eks "33. " for å gruppere varer under samme navn (som f.eks "Bare Burger")
        const strippedName = rawItem.name.replace(/^\d+[a-zA-Z]?[\.\-]?\s*/, '').trim();

        if (!itemsMap[strippedName]) {
            itemsMap[strippedName] = {
                name: rawItem.name, // Behold originalnavnet fra Excel på hoved-tittelen!
                description: rawItem.description,
                sizes: [],
                price: null // single price if no size
            };
        }

        const item = itemsMap[strippedName];

        if (rawItem.targetSize) {
            if (rawItem.pMedium) {
                item.sizes.push({ name: rawItem.targetSize, price: rawItem.pMedium });
            } else if (rawItem.pStor) {
                item.sizes.push({ name: rawItem.targetSize, price: rawItem.pStor });
            }
        } else {
            // If we have Stor and Medium
            if (rawItem.pMedium && rawItem.pStor) {
                item.sizes.push({ name: 'Medium', price: rawItem.pMedium });
                item.sizes.push({ name: 'Stor', price: rawItem.pStor });
            } else if (rawItem.pMedium) {
                // If it's a calzone or something with just one price, just use 'price' directly or sizes if we want to be uniform.
                item.price = rawItem.pMedium;
            } else if (rawItem.pStor) {
                item.price = rawItem.pStor;
            }
        }
    }

    // Convert map to array
    const finalizedItems = Object.values(itemsMap).map(i => {
        // cleanup empty lists
        if (i.sizes.length === 0) delete i.sizes;
        return i;
    });

    finalCategories.push({
        name: cat.name,
        items: finalizedItems
    });
}

// Clean up "Annet" if it has empty names
for (let i = 0; i < finalCategories.length; i++) {
    finalCategories[i].items = finalCategories[i].items.filter(it => it.name && it.name.trim() !== '');
}

console.log(JSON.stringify(finalCategories, null, 2));

const outPath1 = '/Users/samehyousufi/Downloads/oscars-pizzeria/frontend/src/data/menu.json';
const outPath2 = '/Users/samehyousufi/Downloads/oscars-pizzeria/backend/static_menu.json';

try { fs.writeFileSync(outPath1, JSON.stringify(finalCategories, null, 2)); } catch (e) { }
try { fs.writeFileSync(outPath2, JSON.stringify(finalCategories, null, 2)); } catch (e) { }

