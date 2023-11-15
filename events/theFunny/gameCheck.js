const { Events } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	runType: 'disabled',
	async execute(client) {
		// Definitions
		const allGuilds = await client.guilds.cache;
		const GAME_TO_CHECK = 'league of legends';

		// Loop Guilds
		for await (const guild of allGuilds) {
			const curGuild = guild[1];
			const allMembers = await curGuild.members.fetch();
			for await (const member of allMembers) {
				const curMember = member[1];

				// Get the current members presence.
				const allActivities = await curMember?.presence?.activities.filter((a) => a.type === 0);
				if (!allActivities?.length) continue;
				const currentActivity = allActivities[0];

				// Check for game
				if (currentActivity.name.toLowerCase() === GAME_TO_CHECK) {
					const activityTimestamp = new Date(currentActivity.createdAt).getTime();
					const timeDiff = 1000 * 60 * 30;
					if (new Date().getTime() - activityTimestamp > timeDiff) {
						console.log(`${curMember.displayName} is playing ${currentActivity.name} for over 30 minutes`);
					}
				}
			}
		}
	},
};
