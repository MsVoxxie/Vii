const ascii = require('ascii-table');
const commandTable = new ascii().setTitle('Command Loader').setHeading('Category', 'Command', 'Load Status');
const getAllFiles = require('../../functions/helpers/getAllFiles');
const { join } = require('path');
module.exports = (client) => {
	// Read the commands directory
	const commandFolders = getAllFiles(join(__dirname, '../', '../commands'), true);
	// Loop over the commands directory to retrieve all command files
	for (const commandFolder of commandFolders) {
		const commandFolderName = commandFolder.replace(/\\/g, '/').split('/').pop();
		// Get command files and sort them by load order
		const commandFiles = getAllFiles(commandFolder);
		commandFiles.sort((a, b) => a > b);
		// Loop over the command files to retrieve all commands
		for (const commandFile of commandFiles) {
			const loadedCommand = require(commandFile);
			if (loadedCommand.data) client.commands.set(loadedCommand.data.name, loadedCommand);
			// Switch statement to determine how to load the command
			switch ('data' in loadedCommand && 'execute' in loadedCommand) {
				case true:
					client.commands.set(loadedCommand.data.name, loadedCommand);
					commandTable.addRow(commandFolderName, loadedCommand.data.name, '✔ » Loaded');
					break;

				case false:
					commandTable.addRow(commandFolderName, `${loadedCommand?.data?.name ? loadedCommand.data.name : 'Unknown'}`, '✕ » Errored');
					continue;
			}
		}
	}
	console.log(commandTable.toString());
};
