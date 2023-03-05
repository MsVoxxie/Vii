const { Guild } = require('../../models');

module.exports = (client) => {
	client.getGuild = async (guild) => {
		if (!guild) throw new Error('No guildId was provided.');
		const data = await Guild.findOne({ guildId: guild.id });
		return data;
	};
};
