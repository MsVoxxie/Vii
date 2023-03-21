const { readdirSync } = require('fs');
const { REST, Routes } = require('discord.js');
const Logger = require('./functions/logging/logger');

// Configuration File
const dotenv = require('dotenv');
dotenv.config();

const commands = [];
// Grab all the command files from the commands directory you created earlier
readdirSync('./commands/').forEach((dir) => {
	const cmds = readdirSync(`./commands/${dir}/`).filter((file) => file.endsWith('.js'));
	for (const file of cmds) {
		const command = require(`./commands/${dir}/${file}`);
		commands.push(command.data.toJSON());
	}
});

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

// and deploy your commands!
(async () => {
	try {
		Logger.info(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
		Logger.success(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		Logger.error(error);
	}
})();
