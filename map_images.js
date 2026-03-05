const fs = require('fs');
const menuPath = '/Users/samehyousufi/Downloads/oscars-pizzeria/frontend/src/data/menu.json';
const menuPath2 = '/Users/samehyousufi/Downloads/oscars-pizzeria/backend/static_menu.json';
let data = JSON.parse(fs.readFileSync(menuPath, 'utf8'));

const imageMap = {
  "01. Margarita": "/images/products/1.Margrethe.jpg",
  "02. Napoli": "/images/products/2.Napoli.jpg",
  "03. Pepperoni": "/images/products/3.Pepperoni.jpg",
  "04. Capi": "/images/products/4.Capi.jpg",
  "05. Hawaii": "/images/products/5.Hawaii.jpg",
  "09. Vegetar": "/images/products/9.Vegetar.jpg",
  "10. India": "/images/products/10.India.jpg",
  "11. Kylling pizza": "/images/products/11.Kylling pizza.jpg",
  "12. Kebabpizza": "/images/products/12.Kebabpizza.jpg"
};

for (const cat of data) {
  for (const item of cat.items) {
    if (imageMap[item.name]) {
      item.image = imageMap[item.name];
    }
  }
}

fs.writeFileSync(menuPath, JSON.stringify(data, null, 2));
fs.writeFileSync(menuPath2, JSON.stringify(data, null, 2));
console.log("Images mapped");
