const { createCanvas } = require('canvas');
const fs = require('fs');

function createIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Gradient background
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#14b8a6');
  gradient.addColorStop(1, '#0ea5e9');

  // Rounded rect
  ctx.fillStyle = gradient;
  ctx.beginPath();
  const r = size * 0.2;
  ctx.moveTo(r, 0);
  ctx.lineTo(size - r, 0);
  ctx.quadraticCurveTo(size, 0, size, r);
  ctx.lineTo(size, size - r);
  ctx.quadraticCurveTo(size, size, size - r, size);
  ctx.lineTo(r, size);
  ctx.quadraticCurveTo(0, size, 0, size - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.fill();

  // Letter A
  ctx.fillStyle = 'white';
  ctx.font = 'bold ' + (size * 0.6) + 'px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('A', size/2, size/2 + 1);

  return canvas.toBuffer('image/png');
}

// Create icons
fs.writeFileSync(__dirname + '/icon16.png', createIcon(16));
fs.writeFileSync(__dirname + '/icon48.png', createIcon(48));
fs.writeFileSync(__dirname + '/icon128.png', createIcon(128));
console.log('Icons created successfully!');
