const { Schema, model } = require('mongoose');

const levelRolesSchema = Schema({
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

module.exports = model('levelRoles', levelRolesSchema);
