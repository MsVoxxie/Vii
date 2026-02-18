const { AttachmentBuilder, ContextMenuCommandBuilder, ApplicationCommandType, ApplicationIntegrationType, InteractionContextType } = require('discord.js');
const generateQuote = require('../../functions/helpers/generateQuote');

module.exports = {
	data: new ContextMenuCommandBuilder()
		.setName('Quote')
		.setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
		.setContexts([InteractionContextType.PrivateChannel, InteractionContextType.Guild])
		.setType(ApplicationCommandType.Message),
	options: {
		devOnly: false,
		disabled: false,
	},
	async execute(client, interaction, settings) {
		await interaction.deferReply();
		const target = interaction.targetMessage;
		const member = target.member;
		const user = target.author;
		const side = Math.random() < 0.5 ? 'left' : 'right';
		const cleanMessage = target.cleanContent.replace(/[*_`~|#\-\s]/g, '');

		await generateQuote({
			text: cleanMessage,
			authorName: member ? member.displayName : user.username,
			authorHandle: member ? member.user.username : user.username,
			avatarURL: member ? member.displayAvatarURL({ extension: 'png', size: 512 }) : user.displayAvatarURL({ extension: 'png', size: 512 }),
			side: side,
		}).then((buffer) => {
			const attachment = new AttachmentBuilder(buffer, { name: `quote-${target.id}.png` });
			interaction.editReply({ files: [attachment] });
		});
	},
};
