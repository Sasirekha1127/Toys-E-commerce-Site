const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../src/data/user');
const files = ['softToys.js', 'educationalToys.js', 'electronicToys.js', 'woodenToys.js'];

files.forEach(file => {
  const filePath = path.join(dataDir, file);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');

  // Regex to match product objects in the array. 
  // It looks for objects starting with { and having an id: '...' field.
  // We'll replace the closing brace of each object if it doesn't already have variants.
  
  const productRegex = /\{[\s\S]*?id:\s*['"]([^'"]+)['"][\s\S]*?\}/g;
  
  content = content.replace(productRegex, (match, id) => {
    if (match.includes('variants:')) {
      return match; // Already has variants
    }

    // Find the last comma before the closing brace or the last property
    // To make it simple, we'll just insert before the final }
    
    // Extract price and image to use in variants
    const priceMatch = match.match(/price:\s*["']?(\d+)["']?/);
    const imageMatch = match.match(/image:\s*["']([^"']+)["']/);
    
    const price = priceMatch ? priceMatch[1] : "1000";
    const image = imageMatch ? imageMatch[1] : "";

    const variantsStr = `
    variants: [
      {
        sku: '${id}-BLUE',
        variant_value: 'Default Blue',
        price: ${price},
        stock_quantity: 25,
        image_url: '${image}',
        gallery_images: ['${image}']
      },
      {
        sku: '${id}-RED',
        variant_value: 'Classic Red',
        price: ${price},
        stock_quantity: 15,
        image_url: '${image}',
        gallery_images: ['${image}']
      }
    ]`;

    // Insert before the last }
    return match.replace(/\}\s*$/, `,${variantsStr}\n  }`);
  });

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
});
