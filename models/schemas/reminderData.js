const { Schema, model } = require('mongoose');

const reminderDataSchema = Schema({
	userId: {
		type: String,
		required: true,
	},
	timeData: {
		type: String,
		required: true,
	},
	remindData: {
		type: String,
		required: true,
	},
});

module.exports = model('ReminderData', reminderDataSchema);
