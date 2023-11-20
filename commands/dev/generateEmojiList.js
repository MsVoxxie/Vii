const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder().setName('generate_emoji_list').setDescription('Generate a Formatted List of Emojis'),
	options: {
		devOnly: true,
		disabled: false,
	},
	async execute(client, interaction, settings) {
		// Grab Emojis and Format
		const guildEmojis = await interaction.guild.emojis.cache;
		const formattedEmojis = `const ViiEmojis = { ${guildEmojis.map((e) => `${e.name.toUpperCase()}: '<:${e.name}:${e.id}>'`).join(',\n')} }\nmodule.exports = { ViiEmojis, };`;

		// Send List
		let reply = formattedEmojis;
		if (reply?.length > 2000) {
			// If the reply length is over 2000 characters, send a txt file.
			const buffer = Buffer.from(reply, 'utf8');
			const txtFile = new AttachmentBuilder(buffer, { name: `formatted_emoji_list.txt` });

			interaction.reply({ files: [txtFile] });
		} else {
			interaction.reply(`${reply}`);
		}
	},
};
