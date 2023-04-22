const { SlashCommandBuilder, PermissionsBitField, AttachmentBuilder } = require('discord.js');
const calculateLevelXp = require('../../functions/helpers/calculateLevelXp');
const { Level } = require('../../models/index');
const { Rank } = require('canvacord');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('level')
		.setDescription('Get current level of a user or yourself')
		.addUserOption((option) => option.setName('user').setDescription('User to get level of').setRequired(false))
		.setDefaultMemberPermissions(PermissionsBitField.SendMessages),
	options: {
		devOnly: false,
		disabled: false,
	},
	async execute(client, interaction, settings) {
		// Defer, Things take time.
		await interaction.deferReply();

		// Get user
		const mentioneduserId = interaction.options.getMember('user');
		const targetUserId = mentioneduserId || interaction.user.id;
		const fetchedMember = await interaction.guild.members.fetch(targetUserId);

		// Get Level
		const userLevel = await Level.findOne({ userId: fetchedMember.id, guildId: interaction.guild.id });

		// Make sure user has a level
		if (!userLevel) return interaction.followUp(mentioneduserId ? `${fetchedMember.user.tag} does not have a level` : 'You do not have a level');

		// Get all levels and sort by rankings
		const allUserLevels = await Level.find({ guildId: interaction.guild.id }).sort({ level: -1, xp: -1 }).limit(10).lean();

		// Set Ranks
		for await (const user of allUserLevels) {
			user.rank = allUserLevels.indexOf(user) + 1;
		}

		// Get mentioned user rank
		const mentionedUserLevel = await allUserLevels.find((level) => level.userId === fetchedMember.id);

		// Build rank card
		const rankCard = new Rank()
			.setStatus(fetchedMember?.presence?.status ? fetchedMember.presence.status : 'offline')
			.setAvatar(fetchedMember.user.displayAvatarURL({ format: 'png', size: 512 }))
			.setDiscriminator(fetchedMember.user.discriminator)
			.setRequiredXP(calculateLevelXp(userLevel.level))
			.setProgressBar(`#${settings.guildColorHex}`, 'COLOR')
			.setUsername(fetchedMember.user.username)
			.setRank(mentionedUserLevel.rank)
			.setCurrentXP(userLevel.xp)
			.setLevel(userLevel.level);

		const builtRankCard = await rankCard.build();
		const rankCardAttachment = new AttachmentBuilder(builtRankCard);

		// Send rank card
		return interaction.followUp({ files: [rankCardAttachment] });
	},
};
