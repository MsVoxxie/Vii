const { readdirSync } = require('fs');
const { REST, Routes } = require('discord.js');
const Logger = require('./functions/logging/logger');

// Configuration File
const dotenv = require('dotenv');
dotenv.config();

// Empty Commands, Let's Clear em'
const commands = [];

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

// and deploy your commands!
(async () => {
	try {
		Logger.info(`Started clearing application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
		await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.DEV_ID), { body: commands });
		Logger.success(`Successfully cleared application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		Logger.error(error);
	}
})();
