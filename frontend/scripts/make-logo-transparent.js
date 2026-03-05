const sharp = require('sharp');
const path = require('path');

const inputPath = path.join(__dirname, '../public/oscars-pizzeria-logo.png');
const outputPath = path.join(__dirname, '../public/oscars-pizzeria-logo.png');

sharp(inputPath)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })
  .then(({ data, info }) => {
    const { width, height, channels } = info;
    const threshold = 35;
    
    for (let i = 0; i < data.length; i += channels) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (r < threshold && g < threshold && b < threshold) {
        data[i + 3] = 0;
      }
    }
    
    return sharp(data, { raw: { width, height, channels } })
      .png()
      .toFile(outputPath);
  })
  .then(() => console.log('Logo saved with transparent background'))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
