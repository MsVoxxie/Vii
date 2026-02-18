const { AttachmentBuilder, ContextMenuCommandBuilder, ApplicationCommandType, ApplicationIntegrationType, InteractionContextType } = require('discord.js');
const generateQuote = require('../../functions/helpers/generateQuote');

module.exports = {
	data: new ContextMenuCommandBuilder()
		.setName('devctx')
		.setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
		.setContexts([InteractionContextType.PrivateChannel, InteractionContextType.Guild])
		.setType(ApplicationCommandType.Message),
	options: {
		devOnly: true,
		disabled: false,
	},
	async execute(client, interaction, settings) {
		await interaction.deferReply();
		// Support DM-context where `member` may be null by falling back to message author
		const target = interaction.targetMessage;
		const member = target.member;
		const user = target.author;

		// randomize left or right side for side
		const side = Math.random() < 0.5 ? 'left' : 'right';

		await generateQuote({
			text: target.content,
			authorName: member ? member.displayName : user.username,
			authorHandle: member ? member.user.username : user.username,
			avatarURL: member ? member.displayAvatarURL({ extension: 'png', size: 512 }) : user.displayAvatarURL({ extension: 'png', size: 512 }),
			side: side,
		}).then((buffer) => {
			const attachment = new AttachmentBuilder(buffer, { name: 'quote.png' });
			interaction.editReply({ files: [attachment] });
		});
	},
};
