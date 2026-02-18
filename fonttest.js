const { createCanvas, registerFont } = require('@napi-rs/canvas');
const { join } = require('path');
const fs = require('fs');

try {
	registerFont(join(__dirname, '../fonts/JetBrainsMonoNLNerdFontMono-Regular.ttf'), { family: 'ViiMono' });
	console.log('registerFont OK');
} catch (e) {
	console.warn('registerFont failed:', e.message || e);
}

const c = createCanvas(600, 120);
const ctx = c.getContext('2d');
ctx.fillStyle = '#000';
ctx.fillRect(0, 0, 600, 120);
ctx.fillStyle = '#fff';
ctx.font = '36px ViiMono, monospace';
ctx.fillText('0123456789 ABC !@#', 12, 60);
fs.writeFileSync('font-test.png', c.toBuffer('image/png'));
console.log('wrote font-test.png');
