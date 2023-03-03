// Console colors
const colors = require('colors');

// [INFO] console out
const info = function (message) {
	console.log(colors.cyan('[INFO]'), message);
};

// [WARN] console out
const warn = function (message) {
	console.log(colors.yellow('[WARN]'), message);
};
// [ERROR] console out
const error = function (message) {
	console.log(colors.red('[ERROR]'), message);
};

// [SUCCESS] console out
const success = function (message) {
	console.log(colors.green('[SUCCESS]'), message);
};

// Module exports
module.exports = {
	info: info,
	warn: warn,
	error: error,
	success: success,
};
