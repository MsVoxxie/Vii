const generatePieChart = require('../../functions/helpers/generatePieChart');
const { pollData, pollVoterData } = require('../../models/index');
const { Events, EmbedBuilder } = require("discord.js");

module.exports = {
    name: Events.InteractionCreate,
    runType: 'infinity',
    async execute(client, interaction) {
        if (!interaction.isStringSelectMenu()) return;

        // Split the custom ID
        const customID = interaction.customId.split('-');
		const pollId = customID[customID.length - 1];
        if (customID[0] !== 'PollSelect') return;

        // Get Voters
        const voterList = await pollVoterData.findOne({ userId: interaction.user.id, guildId: interaction.guild.id, pollId: interaction.message.id });
        if (voterList) return interaction.reply({ content: 'You have already voted on this poll.', ephemeral: true });
        await pollVoterData.create({ userId: interaction.user.id, guildId: interaction.guild.id, pollId: interaction.message.id, voted: true });

        // Get Values
        const userChoice = interaction.values[0];

        // Retreive data from the database
        const pollDataObject = await pollData.findOne({ guildId: interaction.guild.id, pollId: pollId }).lean();
        if (!pollDataObject) return interaction.reply({ content: 'An error occurred while retrieving data.', ephemeral: true });

        // Update the database votes
        const newCount = pollDataObject.pollVotes[userChoice] + 1;
        pollDataObject.pollVotes[userChoice] = newCount;

        // Update the database
        const newData = await pollData.updateOne({ guildId: interaction.guild.id, pollId: pollId }, { pollVotes: pollDataObject.pollVotes }, { new: true });

        // Find the embed
        const pollEmbed = interaction.message.embeds[0];
        if (!pollEmbed) return interaction.reply({ content: 'An error occurred while retrieving data.', ephemeral: true });

        // Rebuild Pie Chart
        const pieChart = await generatePieChart(pollDataObject.pollChoices, pollDataObject.pollVotes);

        // Rebuid the embed
        const updatedEmbed = new EmbedBuilder()
            .setTitle(pollEmbed.title)
            .setDescription(pollEmbed.description)
            .setColor(pollEmbed.color)
            .setFooter({ text: pollEmbed.footer.text, iconURL: pollEmbed.footer.iconURL })
            .setImage(pieChart)

        // Reply and edit the message
        await interaction.reply({ content: 'Your vote has been counted.', ephemeral: true });
        await interaction.message.edit({ embeds: [updatedEmbed] });
    }
};