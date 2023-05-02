const mongoose = require('mongoose');

const levelRolesSchema = mongoose.Schema({
	guildId: {
		type: String,
		required: true,
	},
	roleId: {
		type: String,
		required: true,
	},
	roleType: {
		type: String,
		required: true,
	},
	level: {
		type: Number,
		required: true,
	},
});

module.exports = mongoose.model('levelRoles', levelRolesSchema);
