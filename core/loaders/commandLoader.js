const ascii = require('ascii-table');
const { readdirSync } = require('fs');
const Logger = require('../../functions/logging/logger');
const commandTable = new ascii().setTitle('Command Loader').setHeading('Category', 'Command', 'Load Status');

module.exports = (client) => {
	readdirSync('./commands/').forEach((dir) => {
		const commands = readdirSync(`./commands/${dir}/`).filter((file) => file.endsWith('.js'));
		for (const file of commands) {
			const command = require(`../../commands/${dir}/${file}`);

			switch ('data' in command && 'execute' in command) {
				case true:
					client.commands.set(command.data.name, command);
					commandTable.addRow(dir, command.data.name, '✔ » Loaded');
					break;

				case false:
					Logger.warn(`The command at ${filePath} is missing a required "data" or "execute" property.`);
					commandTable.addRow(dir, command.data.name, '✕ » Errored');
					continue;
			}
		}
	});
	console.log(commandTable.toString());
};
