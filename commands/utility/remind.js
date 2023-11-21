const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { reminderData } = require('../../models/index');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reminder')
		.setDescription('Remind you of something after a certain amount of time')
		.addSubcommand((subcommand) =>
			subcommand
				.setName('add')
				.setDescription('Add a reminder')
				.addStringOption((option) => option.setName('reminder').setDescription('What do you want to be reminded of?').setRequired(true))
				.addIntegerOption((option) =>
					option.setName('minutes').setDescription('How many minutes from now do you want to be reminded?').setMinValue(0).setMaxValue(59).setRequired(true)
				)
				.addIntegerOption((option) =>
					option.setName('hours').setDescription('How many hours from now do you want to be reminded?').setMinValue(0).setMaxValue(23).setRequired(false)
				)
				.addIntegerOption((option) => option.setName('days').setDescription('How many days from now do you want to be reminded?').setMinValue(0).setRequired(false))
		),
	options: {
		devOnly: false,
		disabled: false,
	},
	async execute(client, interaction, settings) {
		// Defer, Things take time.
		await interaction.deferReply();

		// Variables
		const { options, guild } = interaction;
		const reminder = options.getString('reminder');
		const minutes = options.getInteger('minutes') || 0;
		const hours = options.getInteger('hours') || 0;
		const days = options.getInteger('days') || 0;
		const reminderTime = Date.now() + days * 1000 * 60 * 60 * 24 + hours * 1000 * 60 * 60 + minutes * 1000 * 60;

		// Create reminder
		await reminderData.create({
			userId: interaction.user.id,
			timeData: reminderTime,
			remindData: reminder,
		});

		const embed = new EmbedBuilder()
			.setColor(client.colors.vii)
			.setTitle('Reminder Set 📨')
			.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png')
			.setDescription(`Your reminder has been set for ${client.relTimestamp(reminderTime)} from now.\n**Reminder›** ${reminder}`);

		await interaction.followUp({ embeds: [embed] });
	},
};
