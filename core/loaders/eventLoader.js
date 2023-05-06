const ascii = require('ascii-table');
const eventTable = new ascii().setTitle('Event Loader').setHeading('Directory', 'Event', 'Load Status', 'Run Type');
const getAllFiles = require('../../functions/helpers/getAllFiles');
const { join } = require('path');

module.exports = (client) => {
	// Read the events directory
	const eventFolders = getAllFiles(join(__dirname, '../', '../events'), true);
	// Loop over the events directory to retrieve all event files
	for (const eventFolder of eventFolders) {
		const eventFolderName = eventFolder.replace(/\\/g, '/').split('/').pop();
		// Get event files and sort them by load order
		const eventFiles = getAllFiles(eventFolder);
		eventFiles.sort((a, b) => a > b);
		// Loop over the event files to retrieve all events
		for (const eventFile of eventFiles) {
			const loadedEvent = require(eventFile);
			if (loadedEvent.name) client.events.set(loadedEvent.name, loadedEvent);

			// Switch statement to determine how to load the event
			switch (loadedEvent.runType) {
				case 'single':
					client.once(loadedEvent.name, (...args) => loadedEvent.execute(client, ...args));
					eventTable.addRow(eventFolderName, loadedEvent.name, '✔ » Loaded', '«  Once  »');
					break;

				case 'infinity':
					client.on(loadedEvent.name, (...args) => loadedEvent.execute(client, ...args));
					eventTable.addRow(eventFolderName, loadedEvent.name, '✔ » Loaded', '«infinity»');
					break;

				case 'disabled':
					eventTable.addRow(eventFolderName, loadedEvent.name, '✕ » Skipped', '«Disabled»');
					continue;

				default:
					eventTable.addRow(eventFolderName, loadedEvent.name, '✕ » Errored', '« Unknown »');
					continue;
			}
		}
	}
	console.log(eventTable.toString());
};
