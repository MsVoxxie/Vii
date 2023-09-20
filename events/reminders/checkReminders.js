const { EmbedBuilder } = require('discord.js');
const { reminderData } = require('../../models/index');

module.exports = {
	name: 'everyMinute',
	runType: 'infinity',
	async execute(client) {
		// Fetch all reminders
		const currentReminders = await reminderData.find({});
		if (!currentReminders) return;

		// Loop through reminders
		for (const reminder of currentReminders) {
			if (reminder.timeData > Date.now()) continue;

			// Fetch user
			const user = await client.users.fetch(reminder.userId);
			if (!user) continue;

			// Build embed
			const embed = new EmbedBuilder()
				.setColor(client.colors.vii)
				.setTitle('Reminder 📬')
				.setDescription(`**Reminder›** ${reminder.remindData}`)
				.setImage('https://vii.voxxie.me/v1/client/static/util/divider.png');

			// Send embed
			await user?.send({ embeds: [embed] }).catch((err) => {
				return;
			});

			// Delete reminder
			await reminderData.deleteOne({ userId: reminder.userId, timeData: reminder.timeData, remindData: reminder.remindData });
		}
	},
};
