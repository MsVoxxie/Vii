const { nanoid } = require('nanoid');
module.exports = (length = 8) => {
	return nanoid(length);
};
