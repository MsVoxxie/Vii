const Package = require('../../package.json');

module.exports.USER_AGENT = `Mozilla/5.0 (compatible; ${Package.name}/${Package.version}; +${Package.homepage}; Node.js/${process.version})`;
module.exports.GENERIC_USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.0.0 Safari/537.36';

module.exports.TIKTOK_HOME = 'https://www.tiktok.com';

module.exports.MAX_DISCORD_UPLOAD = 26214400;
module.exports.MAX_DISCORD_UPLOAD_TIER_2 = 52428800;
module.exports.MAX_DISCORD_UPLOAD_TIER_3 = 104857600;
module.exports.MAX_DISCORD_MESSAGE_LENGTH = 2000;

module.exports.URLRegexes = {
	TWITTER: /https?:\/\/(?:(?:www|m(?:obile)?)\.)?(fx|vx|sx|ayy)?twitter\.com\/(?:(?:i\/web|[^\/]+)\/status|statuses)\/(\d+)/,
	X_DOT_COM: /https?:\/\/(?:(?:www|m(?:obile)?)\.)?()x\.com\/(?:(?:i\/web|[^/]+)\/status|statuses)\/(\d+)/,
};

module.exports.Favicons = {
	TWITTER: 'https://abs.twimg.com/icons/apple-touch-icon-192x192.png',
};

module.exports.Colors = {
	TWITTER: 0x1da1f2,
};
