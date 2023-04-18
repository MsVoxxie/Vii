const ascii = require('ascii-table');
const { readdirSync } = require('fs');
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
					commandTable.addRow(dir, `${command?.data?.name ? command.data.name : 'Unknown'}`, '✕ » Errored');
					continue;
			}
		}
	});
	console.log(commandTable.toString());
};
