const { readdirSync } = require('fs');
const ascii = require('ascii-table');
const eventTable = new ascii().setTitle('Music Event Loader').setHeading('Directory', 'Event', 'Load Status', 'Run Type');

module.exports = (client) => {
	readdirSync('./eventsMusic/').forEach((dir) => {
		const events = readdirSync(`./eventsMusic/${dir}/`).filter((file) => file.endsWith('.js'));
		for (const file of events) {
			const event = require(`../../eventsMusic/${dir}/${file}`);

			if (event.name) client.events.set(event.name, event);

			switch (event.runType) {
				case 'on':
					client.distube.on(event.name, (...args) => event.execute(...args, client));
					eventTable.addRow(dir, event.name, '✔ » Loaded', '«  On  »');
					break;

				default:
					eventTable.addRow(dir, event.name, '✕ » Errored');
					continue;
			}
		}
	});
	console.log(eventTable.toString());
};
