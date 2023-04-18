// Configuration File
const dotenv = require('dotenv');
dotenv.config();

// Discord Classes
const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const { SoundCloudPlugin } = require('@distube/soundcloud');
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
	allowedMentions: {
		parse: ['users', 'roles'],
	},
});

// Music Client
client.distube = new DisTube(client, {
	leaveOnStop: false,
	leaveOnEmpty: true,
	leaveOnFinish: true,
	emitNewSongOnly: true,
	emitAddSongWhenCreatingQueue: true,
	emitAddListWhenCreatingQueue: false,
	plugins: [
		new YtDlpPlugin(),
		new SoundCloudPlugin(),
		new SpotifyPlugin({
			emitEventsAfterFetching: true,
		}),
	],
});

// Define Collections
client.commands = new Collection();
client.events = new Collection();

// Load Database
client.mongoose = require('./core/loaders/mongooseLoader');
require('./functions/helpers/timeFuncs')(client);
require('./functions/database/util')(client);

// Run Loaders
require('./core/loaders/musicEventLoader')(client);
require('./core/loaders/commandLoader')(client);
require('./core/loaders/eventLoader')(client);
require('./core/api/internalAPI')(client);

// Login
client.login(TOKEN);
