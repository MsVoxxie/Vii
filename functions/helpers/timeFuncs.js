const moment = require('moment');

module.exports = (client) => {
	// Timestamp
	client.currentTime = (date) => {
		return moment(date).format('h:mm A');
	};

	client.currentLongDate = (date) => {
		return moment(date).format('MMMM Do YYYY, h:mm A');
	};

	client.currentShortDate = (date) => {
		return moment(date).format('MMMM Do YYYY');
	};

	client.relativeTimestamp = (date) => {
		return `<t:${Math.floor(date / 1000)}:R>`;
	};
};
