const { nanoid } = require('nanoid');
module.exports = (length = 8) => {
	if (length.typeof !== 'number') throw new TypeError('Length must be a number');
	return nanoid(length);
};
