const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { runInNewContext } = require('vm');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('eval')
		.setDescription('Evaluate code')
		.addStringOption((option) => option.setName('code').setDescription('The code to evaluate').setRequired(true)),
	options: {
		devOnly: true,
		disabled: false,
	},
	async execute(client, interaction, settings) {
		// Defer, Things take time
		await interaction.deferReply();

		// Setup
		let wasAsync = false;
		const hrStart = process.hrtime();
		const hrDiff = process.hrtime(hrStart);
		const code = interaction.options.getString('code');
		const runThis = `(async () => {return ${code}})()`;

		// Was it Async?
		if (code.includes('await')) wasAsync = true;

		// Try Evaluation
		try {
			const evaluatedCode = await runInNewContext(runThis, { client, interaction, settings });

			// Success Embed
			const embed = new EmbedBuilder()
				.setTitle('__**Evaluation Successful**__')
				.setColor('#32a852')
				.setFooter({ text: `Async: ${wasAsync} | Took ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms` })
				.addFields(
					{ name: '📥 Input', value: `\`\`\`js\n${cleanText(code)}\n\`\`\`` },
					{ name: '📤 Output', value: `\`\`\`js\n${cleanText(evaluatedCode)}\n\`\`\`` }
				);
			await interaction.followUp({ embeds: [embed] });
		} catch (error) {
			console.error(error);
			// Error Embed
			const embed = new EmbedBuilder()
				.setTitle('__**Evaluation Failed**__')
				.setColor('#a83232')
				.setFooter({ text: `Async: ${wasAsync} | Took ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms` })
				.addFields(
					{ name: '📥 Input', value: `\`\`\`js\n${cleanText(code)}\n\`\`\`` },
					{ name: '📤 Output', value: `\`\`\`js\n${cleanText(evaluatedCode)}\n\`\`\`` }
				);
			await interaction.followUp({ embeds: [embed] });
		}
	},
};

function cleanText(text) {
	if (typeof text === 'string') {
		return text.replace(/`/g, `\`${String.fromCharCode(8203)}`).replace(/@/g, `@${String.fromCharCode(8203)}`);
	} else {
		return text;
	}
}
