// Script simples para gerar placeholders de ícones PWA
// Em produção, use ferramentas como sharp ou ImageMagick para converter SVG para PNG

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');
const svgPath = path.join(iconsDir, 'icon.svg');

// Lê o SVG
const svgContent = fs.readFileSync(svgPath, 'utf8');

// Cria um canvas HTML simples para cada tamanho (placeholder)
sizes.forEach((size) => {
  const canvas = createCanvasPlaceholder(size);
  const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);

  // Em um ambiente real, você usaria uma biblioteca como sharp:
  // await sharp(svgPath).resize(size, size).png().toFile(outputPath);

  console.log(`Placeholder created for ${size}x${size} at ${outputPath}`);
  console.log(
    'Note: Install and use "sharp" or "pngjs" for real PNG generation'
  );
});

function createCanvasPlaceholder(size) {
  // Este é apenas um placeholder para documentação
  // Para gerar PNGs reais, instale: npm install sharp
  // E use: await sharp(svgPath).resize(size, size).png().toFile(outputPath);
  return null;
}

console.log('\n=== ICON GENERATION INFO ===');
console.log('To generate real PNG icons from SVG, you have two options:\n');
console.log('Option 1 - Use online tool:');
console.log(
  '1. Open https://realfavicongenerator.net/ or https://www.pwabuilder.com/imageGenerator'
);
console.log('2. Upload the icon.svg file');
console.log('3. Download all sizes and place in public/icons/\n');
console.log('Option 2 - Use Sharp (recommended):');
console.log('npm install --save-dev sharp');
console.log('Then uncomment the sharp code in this script and run again.\n');
