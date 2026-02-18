const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const { join } = require('path');

// Register custom fonts using GlobalFonts (no guards - expected to exist)
GlobalFonts.registerFromPath(join(__dirname, '../../fonts/JetBrainsMonoNLNerdFontMono-Regular.ttf'), 'JBMN');
GlobalFonts.registerFromPath(join(__dirname, '../../fonts/gg sans Regular.ttf'), 'GGSans');
GlobalFonts.registerFromPath(join(__dirname, '../../fonts/SourceHanSansSC-Regular.otf'), 'SHSCS');
const globalFonts = `JBMN, GGSans, SHSCS, monospace`;

/**
 * Generate a content-aware quote image.
 * Options:
 * - text: quoted text (string)
 * - authorName: display name (string)
 * - authorHandle: small handle/at (string)
 * - avatarURL: avatar image URL (prefer png, 512)
 * - side: 'left' or 'right' (avatar side)
 * - width, height: canvas size
 * - bgColor, accentColor
 *
 * Returns: Buffer (PNG)
 */
async function generateQuote(options = {}) {
	const { text = '', authorName = '', authorHandle = '', avatarURL = '', side = 'left', width = 1200, height = 630, bgColor = '#000000', accentColor = '#ffffff' } = options;

	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext('2d');

	// Background
	ctx.fillStyle = bgColor;
	// ctx.fillRect(0, 0, width, height);

	// Make sure avatar url is png to avoid unsupported formats
	let avatar = avatarURL || '';
	try {
		if (avatar && !/format=/.test(avatar)) {
			avatar += (avatar.includes('?') ? '&' : '?') + 'format=png&size=512';
		}
	} catch (e) {}

	// Layout: avatar will occupy exactly half the canvas (full height) so an overlay
	// can fade it into the text area.
	const padding = Math.round(width * 0.06);
	const avatarAreaWidth = Math.round(width * 0.5);
	const avatarX = side === 'left' ? 0 : width - avatarAreaWidth;
	const avatarY = 0;
	const avatarAreaHeight = height;

	// Draw avatar as an unrounded, grayscale rectangle (covering half the canvas)
	try {
		const img = await loadImage(avatar);
		// draw into temp canvas sized to avatar area so we can cover & crop like object-fit:cover
		const tmp = createCanvas(avatarAreaWidth, avatarAreaHeight);
		const tctx = tmp.getContext('2d');
		// cover logic: scale image so it fills tmp and center it
		const scale = Math.max(avatarAreaWidth / img.width, avatarAreaHeight / img.height);
		const dw = Math.round(img.width * scale);
		const dh = Math.round(img.height * scale);
		const dx = Math.round((avatarAreaWidth - dw) / 2);
		const dy = Math.round((avatarAreaHeight - dh) / 2);
		tctx.drawImage(img, dx, dy, dw, dh);
		// attempt grayscale conversion
		try {
			const imageData = tctx.getImageData(0, 0, avatarAreaWidth, avatarAreaHeight);
			const d = imageData.data;
			for (let i = 0; i < d.length; i += 4) {
				const r = d[i],
					g = d[i + 1],
					b = d[i + 2];
				const v = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
				d[i] = d[i + 1] = d[i + 2] = v;
			}
			tctx.putImageData(imageData, 0, 0);
		} catch (e) {
			// some backends may not support pixel access; ignore in that case
		}
		// draw processed avatar area onto main canvas
		ctx.drawImage(tmp, avatarX, avatarY, avatarAreaWidth, avatarAreaHeight);

		// Add fade overlay so avatar transitions into text area.
		// Reduce fadeWidth to pull the overlay away from the avatar and avoid overlap.
		const fadeWidth = Math.round(width) / 2;
		const overlayTry = async () => {
			const overlayName = side === 'left' ? 'overlay_left.png' : 'overlay_right.png';
			const overlayPath = join(__dirname, '../../images/util', overlayName);

			try {
				const overlayImg = await loadImage(overlayPath);
				// draw overlay stretched to cover the avatar edge into the content area
				if (side === 'left') {
					// pull overlay edge slightly into the content area (smaller overlap)
					const drawX = avatarX + avatarAreaWidth - fadeWidth;
					ctx.drawImage(overlayImg, drawX, 0, avatarAreaWidth + fadeWidth, height);
				} else {
					const drawX = avatarX - fadeWidth;
					ctx.drawImage(overlayImg, drawX, 0, avatarAreaWidth + fadeWidth, height);
				}
				return true;
			} catch (e) {
				return false;
			}
		};
		// attempt to draw overlay (silently ignore if missing)
		await overlayTry();
	} catch (err) {}

	// Content area (where text goes)
	const contentX = side === 'left' ? avatarAreaWidth + padding : padding;
	const contentWidth = width - avatarAreaWidth - padding * 2;
	const contentY = padding;
	const contentHeight = height - padding * 2;

	// Quote text: fit to area with wrapping and truncation
	function wrapText(ctx, text, maxWidth) {
		const words = text.split(' ');
		const lines = [];
		let line = '';
		for (let n = 0; n < words.length; n++) {
			const testLine = line ? line + ' ' + words[n] : words[n];
			const metrics = ctx.measureText(testLine);
			if (metrics.width > maxWidth && line) {
				lines.push(line);
				line = words[n];
			} else {
				line = testLine;
			}
		}
		if (line) lines.push(line);
		return lines;
	}

	// Scale text size to fit width and height (reserve space for meta)
	const maxLines = 10;
	let fontSize = Math.round(height * 0.11);
	let lines = [];
	ctx.fillStyle = accentColor;

	const nameFontGuess = Math.round(height * 0.055);
	const handleFontGuess = Math.round(height * 0.035);
	const reservedMetaHeight = nameFontGuess + handleFontGuess + 16;
	const maxTextHeight = contentHeight - reservedMetaHeight;

	// Decrease font until text fits width and height
	while (fontSize >= 16) {
		ctx.font = `${fontSize}px ${globalFonts}`;
		lines = wrapText(ctx, text, contentWidth);
		const lh = Math.round(fontSize * 1.1);
		const totalH = lines.length * lh;
		if (lines.length <= maxLines && totalH <= maxTextHeight) break;
		fontSize -= 2;
	}

	// Final adjustment: if still too tall, truncate by allowed lines
	ctx.font = `${fontSize}px ${globalFonts}`;
	const textLineHeight = Math.round(fontSize * 1.1);
	const allowedLines = Math.max(1, Math.floor(maxTextHeight / textLineHeight));
	if (lines.length > allowedLines) {
		lines = lines.slice(0, allowedLines);
		let last = lines[lines.length - 1];
		while (ctx.measureText(last + '...').width > contentWidth && last.length > 0) last = last.slice(0, -1);
		lines[lines.length - 1] = last.trim() + '...';
	}

	// Draw the quote lines (center-aligned)
	ctx.fillStyle = accentColor;
	ctx.textBaseline = 'top';
	ctx.font = `${fontSize}px ${globalFonts}`;
	ctx.textAlign = 'center';
	const centerX = contentX + Math.round(contentWidth / 2);
	const lineHeight = textLineHeight;
	let startY = contentY + Math.round((contentHeight - lines.length * lineHeight - 80) / 2);
	if (startY < contentY) startY = contentY;
	for (let i = 0; i < lines.length; i++) {
		ctx.fillText(lines[i], centerX, startY + i * lineHeight);
	}

	// Draw author name and handle at bottom of content area
	const nameFont = Math.round(height * 0.055);
	const handleFont = Math.round(height * 0.035);
	const metaY = contentY + contentHeight - nameFont - handleFont - 8;

	// Author meta (centered). Display name italic.
	ctx.textAlign = 'center';
	ctx.fillStyle = accentColor;
	ctx.font = `italic ${nameFont}px ${globalFonts}`;
	ctx.fillText(authorName ? `- ${authorName}` : '', centerX, metaY);

	ctx.fillStyle = 'rgba(255,255,255,0.6)';
	ctx.font = `${handleFont}px ${globalFonts}`;
	ctx.fillText(authorHandle ? `@${authorHandle.replace(/^@/, '')}` : '', centerX, metaY + nameFont + 6);

	return canvas.toBuffer('image/png');
}

module.exports = generateQuote;
