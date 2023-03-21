const { readdirSync } = require('fs');
const ascii = require('ascii-table');
const eventTable = new ascii().setTitle('Event Loader').setHeading('Directory', 'Event', 'Load Status', 'Run Type');

module.exports = (client) => {
	readdirSync('./events/').forEach((dir) => {
		const events = readdirSync(`./events/${dir}/`).filter((file) => file.endsWith('.js'));
		for (const file of events) {
			const event = require(`../../events/${dir}/${file}`);

			if (event.name) client.events.set(event.name, event);

			switch (event.runType) {
				case 'single':
					client.once(event.name, (...args) => event.execute(...args, client));
					eventTable.addRow(dir, event.name, '✔ » Loaded', '«  Once  »');
					break;

				case 'infinite':
					client.on(event.name, (...args) => event.execute(...args, client));
					eventTable.addRow(dir, event.name, '✔ » Loaded', '«Infinite»');
					break;

				default:
					eventTable.addRow(dir, event.name, '✕ » Errored');
					continue;
			}
		}
	});
	console.log(eventTable.toString());
};
