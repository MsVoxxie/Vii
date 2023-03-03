// Configuration File
const dotenv = require('dotenv');
dotenv.config();

// Discord Classes
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const SECRET = process.env.DISCORD_TOKEN;

//Define Client
const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences],
});

//Define Collections
client.commands = new Collection();

//Run Loaders
require('./core/eventLoader')(client);
require('./core/commandLoader')(client);

//Login
client.login(SECRET);
