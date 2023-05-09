const { SlashCommandBuilder, PermissionFlagsBits, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const calculateLevelXp = require('../../functions/xpFuncs/calculateLevelXp');
const { Level } = require('../../models/index');
const { Rank } = require('canvacord');
const { join } = require('path');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('level')
		.setDescription('Get current level of a user or yourself')
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
		.addSubcommand((subCommand) => subCommand.setName('leaderboard').setDescription('Get the leaderboard of the server'))
		.addSubcommand((subCommand) =>
			subCommand
				.setName('card')
				.addUserOption((option) => option.setName('user').setDescription('User to get level of'))
				.setDescription('Get the rank card of a user or yourself')
		),
	options: {
		devOnly: false,
		disabled: false,
	},
	async execute(client, interaction, settings) {
		// Get subcommand
		const subCommand = interaction.options.getSubcommand();

		// Get Background image
		const backgroundImage = join(__dirname, '../../images/level/background.png');

		// Defer, Things take time.
		await interaction.deferReply();

		// Switch subcommand
		switch (subCommand) {
			// Card
			case 'card':
				// Get user
				const mentioneduserId = interaction.options.getMember('user');
				const targetUserId = mentioneduserId || interaction.user.id;
				const fetchedMember = await interaction.guild.members.fetch(targetUserId);

				// Get Level
				const userLevel = await Level.findOne({ userId: fetchedMember.id, guildId: interaction.guild.id });

				// Make sure user has a level
				if (!userLevel)
					return interaction.followUp(mentioneduserId ? `${fetchedMember.user.tag} does not have a level` : 'You do not have a level');

				// Get all levels and sort by rankings
				const allUserLevels = await Level.find({ guildId: interaction.guild.id }).sort({ level: -1, xp: -1 }).lean();

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
					.setProgressBar([`#${client.colors.vii}`, '#1abef3'], 'GRADIENT')
					.setDiscriminator(fetchedMember.user.discriminator)
					.setRequiredXP(calculateLevelXp(userLevel.level))
					.setUsername(fetchedMember.user.username)
					.setBackground('IMAGE', backgroundImage)
					.setRank(mentionedUserLevel.rank)
					.setOverlay('#000000', 0, false)
					.setCurrentXP(userLevel.xp)
					.setLevel(userLevel.level);

				const builtRankCard = await rankCard.build();
				const rankCardAttachment = new AttachmentBuilder(builtRankCard);

				// Send rank card
				await interaction.followUp({ files: [rankCardAttachment] });
				break;

			// Leaderboard
			case 'leaderboard':
				// Users
				const guildMembers = [];

				// Get all levels and sort by rankings
				const allLevels = await Level.find({ guildId: interaction.guild.id }).sort({ level: -1, xp: -1 }).limit(10).lean();

				// Set Ranks
				for await (const user of allLevels) {
					user.rank = allLevels.indexOf(user) + 1;
					guildMembers.push(user);
				}

				//Get top 5 of guild
				const guildTop = guildMembers.sort((a, b) => b.level - a.level).slice(0, 10);

				// Build leaderboard embed
				const embed = new EmbedBuilder()
					.setAuthor({ name: `${interaction.guild.name}'s Top 10 Members` })
					.setColor(client.colors.vii)
					.setThumbnail(interaction.guild.iconURL({ dynamic: true }))
					.addFields(
						{ name: 'Guild Member', value: guildTop.map((m) => `<@${m.userId}> | Level» ${m.level}`).join('\n'), inline: true },
						{ name: 'Guild Rank', value: guildTop.map((m) => `# ${m.rank}`).join('\n'), inline: true }
					);

				// Send leaderboard
				await interaction.followUp({ embeds: [embed] });
				break;
		}
	},
};
