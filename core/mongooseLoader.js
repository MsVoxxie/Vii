const mongoose = require('mongoose');
const Key = process.env.DATABASE_TOKEN;
const Logger = require('../functions/logging/logger');

module.exports = {
	init: () => {
		const dbOptions = {
			connectTimeoutMS: 10 * 1000,
			useNewUrlParser: true,
			autoIndex: false,
			family: 4,
		};

		// Login to Mongoose
		mongoose.connect(Key, dbOptions);
		mongoose.Promise = global.Promise;

		mongoose.connection.on('connected', () => {
			Logger.success('Mongo DB Connected!');
		});

		mongoose.connection.on('err', (err) => {
			Logger.error('Mongo DB Ran into an error!');
		});

		mongoose.connection.on('disconnect', () => {
			Logger.warn('Mongo DB Disconnected');
		});
	},
};
