// Configuration File
const dotenv = require('dotenv');
dotenv.config();

// Discord Classes
const { DisTube } = require('distube');
const { YtDlpPlugin } = require('@distube/yt-dlp');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const TOKEN = process.env.DISCORD_TOKEN;

//D efine Client
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildVoiceStates,
	],
});

// Music Client
client.distube = new DisTube(client, {
	leaveOnStop: false,
	leaveOnEmpty: true,
	leaveOnFinish: true,
	emitNewSongOnly: true,
	emitAddSongWhenCreatingQueue: true,
	emitAddListWhenCreatingQueue: false,
	plugins: [new YtDlpPlugin()],
});

// Define Collections
client.commands = new Collection();
client.events = new Collection();

// Load Database
client.mongoose = require('./core/mongooseLoader');
require('./functions/database/util')(client);

// Run Loaders
require('./core/musicEventLoader')(client);
require('./core/commandLoader')(client);
require('./core/eventLoader')(client);
require('./core/internalAPI')(client);

// Login
client.login(TOKEN);
