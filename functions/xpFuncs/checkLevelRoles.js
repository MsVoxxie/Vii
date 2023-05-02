const { levelRoles } = require('../../models/index');

module.exports = async (guild, member, level) => {
	// Variables
	const guildLevelRoles = await levelRoles.find({ guildId: guild.id, level: level });
	if (!guildLevelRoles) return;
	const addedRoles = [];
	const removedRoles = [];

	// Loop through levelRoles
	for (const levelRole of guildLevelRoles) {
		switch (levelRole.roleType) {
			case 'add':
				if (member.roles.cache.has(levelRole.roleId)) continue;
				const addRole = guild.roles.cache.get(levelRole.roleId);
				if (!addRole) continue;
				await member.roles.add(addRole);
				addedRoles.push(addRole);
				break;

			case 'remove':
				if (!member.roles.cache.has(levelRole.roleId)) continue;
				const removeRole = guild.roles.cache.get(levelRole.roleId);
				if (!removeRole) continue;
				await member.roles.remove(removeRole);
				removedRoles.push(removeRole);
				break;
		}
	}
	return { addedRoles, removedRoles };
};
