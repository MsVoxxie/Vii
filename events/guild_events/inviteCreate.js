const { Events } = require('discord.js');

module.exports = {
	name: Events.InviteDelete,
	runType: 'infinity',
	async execute(client, invite) {
		client.invites.get(invite.guild.id).set(invite.code, invite.uses);
	},
};
