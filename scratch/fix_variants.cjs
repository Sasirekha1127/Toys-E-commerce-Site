const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../src/data/user');
const files = ['softToys.js', 'educationalToys.js', 'electronicToys.js', 'woodenToys.js'];

files.forEach(file => {
  const filePath = path.join(dataDir, file);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');

  // Fix double commas like:
  // ageGroup: ["0-2", "3-5"],
  // ,
  // variants: [
  content = content.replace(/,\s*,/g, ',');

  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${file}`);
});
