// Configuration File
const dotenv = require('dotenv');
dotenv.config();

// Discord Classes
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const TOKEN = process.env.DISCORD_TOKEN;

//Define Client
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences] });

//Define Collections
client.commands = new Collection();
client.events = new Collection();

//Load Database
client.mongoose = require('./core/mongooseLoader');
require('./functions/database/util')(client);

//Run Loaders
require('./core/commandLoader')(client);
require('./core/eventLoader')(client);
require('./core/internalAPI')(client);

//Login
client.login(TOKEN);
