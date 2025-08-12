// Simple icon generation using canvas in Node.js environment would require additional packages
// For now, let's create a simple SVG that can be used as PNG
const fs = require('fs');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(size => {
  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size/8}" fill="#1e40af"/>
  <rect x="${size*0.25}" y="${size*0.5}" width="${size*0.08}" height="${size*0.25}" fill="white"/>
  <rect x="${size*0.41}" y="${size*0.4}" width="${size*0.08}" height="${size*0.35}" fill="white"/>
  <rect x="${size*0.57}" y="${size*0.6}" width="${size*0.08}" height="${size*0.15}" fill="white"/>
  <rect x="${size*0.73}" y="${size*0.3}" width="${size*0.08}" height="${size*0.45}" fill="white"/>
  <circle cx="${size/2}" cy="${size*0.25}" r="${size*0.08}" fill="white"/>
</svg>`;
  
  fs.writeFileSync(`icon-${size}x${size}.svg`, svg);
  console.log(`Created icon-${size}x${size}.svg`);
});