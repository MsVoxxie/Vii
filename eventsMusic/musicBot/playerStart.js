module.exports = {
	name: 'playerStart',
	runType: 'infinite',
	execute(queue, track, client) {
		queue.metadata.channel.send(`Started playing **${track.title}**!`);
	},
};
