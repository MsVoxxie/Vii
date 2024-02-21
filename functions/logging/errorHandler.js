const { EmbedBuilder, Embed, AttachmentBuilder } = require('discord.js');

const errorHandler = async (client, interaction, err) => {
	if (!interaction) throw new Error('No, or Invalid interaction provided.');

	// Definitions
	const issueURL = 'https://github.com/MsVoxxie/Vii/issues';
	const errMessage = err.message;
	const errStack = err.stack;

	// Check if this is a permission issue.
	if (errMessage.toLowerCase() === 'missing permissions') {
		// Generate embed
		const embed = new EmbedBuilder()
			.setTitle('Permission Error')
			.setDescription(`There was an issue executing \`${interaction.commandName}\`\nI seem to be missing permissions.`)
			.setColor(client.colors.warning);

		return (await interaction.followUp({ embeds: [embed] })) || (await interaction.reply({ embeds: [embed] }));
	}

	// Otherwise, provide a stack to report.
	// Generate Embed
	const embed = new EmbedBuilder()
		.setTitle('Command Error')
		.setColor(client.colors.error)
		.setDescription(`There was an issue executing \`${interaction.commandName}\`\nPlease report the contents of the attached file **[To my Issues Page](${issueURL})**.`);

	// Generate Logs
	const formattedLogs = `Error Executing ${interaction.commandName}\n\n${errStack}`;
	const errBuffer = Buffer.from(formattedLogs, 'utf8');
	const attachFile = new AttachmentBuilder(errBuffer, { name: 'Error Logs.txt' });

	// Send it off
	return (await interaction.followUp({ embeds: [embed], files: [attachFile] })) || (await interaction.reply({ embeds: [embed], files: [attachFile] }));
};

module.exports = {
	errorHandler,
};
