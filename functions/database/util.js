const { Guild } = require('../../models');

module.exports = (client) => {
	client.getGuild = async (guild) => {
		if (!guild) throw new Error('No guildId was provided.');
		const data = await Guild.findOneAndUpdate(
			{ guildId: guild.id },
			{ $setOnInsert: { guildId: guild.id } },
			{ upsert: true, new: true }
		);
		return data;
	};
};
