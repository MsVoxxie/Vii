const ascii = require('ascii-table');
const eventTable = new ascii().setTitle('Music Event Loader').setHeading('Directory', 'Event', 'Load Status', 'Run Type');
const getAllFiles = require('../../functions/helpers/getAllFiles');
const { join } = require('path');

module.exports = (client) => {
	// Read the music events directory
	const eventFolders = getAllFiles(join(__dirname, '../', '../eventsMusic'), true);
	// Loop over the music events directory to retrieve all music event files
	for (const eventFolder of eventFolders) {
		const eventFolderName = eventFolder.replace(/\\/g, '/').split('/').pop();
		// Get music event files and sort them by load order
		const eventFiles = getAllFiles(eventFolder);
		eventFiles.sort((a, b) => a > b);
		// Loop over the music event files to retrieve all music events
		for (const eventFile of eventFiles) {
			const loadedEvent = require(eventFile);
			if (loadedEvent.name) client.events.set(loadedEvent.name, loadedEvent);
			
			// Switch statement to determine how to load the music event
			switch (loadedEvent.runType) {
				case 'on':
					client.distube.on(loadedEvent.name, (...args) => loadedEvent.execute(...args, client));
					eventTable.addRow(eventFolderName, loadedEvent.name, '✔ » Loaded', '«  On  »');
					break;

				default:
					eventTable.addRow(eventFolderName, loadedEvent.name, '✕ » Errored');
					continue;
			}
		}
	}
	console.log(eventTable.toString());
};
