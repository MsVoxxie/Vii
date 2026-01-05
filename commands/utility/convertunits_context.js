const { ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder, MessageFlags } = require('discord.js');
const { doConversions } = require('../../functions/unitconversions/measurments');

module.exports = {
	data: new ContextMenuCommandBuilder().setName('Auto Convert Units').setType(ApplicationCommandType.Message),
	options: {
		devOnly: false,
		disabled: false,
	},
	async execute(client, interaction, settings) {

		// Grab the targetMessage's member
		const targetMember = await interaction.guild.members.fetch(interaction.targetMessage.author.id).catch(() => null);

		// Message Parser
		const parseMessage = (data, user) => {
			const concatenated =
				data
					.replace('°', '')
					.replace(/(?<=\d) /gm, '')
					.toLowerCase() + ' ';
			const result = doConversions(concatenated, user);
			if (!result) return { success: false };

			const embed = new EmbedBuilder();
			embed
				.addFields(
					{ name: `From`, value: `${result.map((f) => f.from).join('\n')}`, inline: true },
					{ name: 'To', value: `${result.map((f) => f.to).join('\n')}`, inline: true }
				)
				.setTitle(`${targetMember.displayName}`)
				.setDescription(data)
				.setColor(client.colors.vii)
				.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png');
			return { embed, success: true };
		};

		const parseResult = parseMessage(interaction.targetMessage.content, interaction.user);

		if (parseResult.success) {
			interaction.reply({ embeds: [parseResult.embed] });
		} else {
			interaction.reply({ content: 'Nothing to Convert!', flags: MessageFlags.Ephemeral });
		}
	},
};
