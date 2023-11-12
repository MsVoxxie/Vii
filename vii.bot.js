// Configuration File
const dotenv = require('dotenv');
dotenv.config();

// Discord Classes
const cron = require('node-cron');
const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const { SoundCloudPlugin } = require('@distube/soundcloud');
const { YtDlpPlugin } = require('@distube/yt-dlp');
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const TOKEN = process.env.DISCORD_TOKEN;

// Define Client
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildModeration,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildEmojisAndStickers,
	],
	partials: [Partials.Message, Partials.Reaction, Partials.Channel],
	allowedMentions: {
		parse: ['users', 'roles'],
	},
});

// Client Properties
client.debug = false;
client.colors = {
	vii: '#3cdefc',
	starboard: '#eba834',
	success: '#00ff00',
	error: '#ff0000',
	warning: '#ffff00',
};

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

// Giveaway Client
const GiveawaysManager = require('./functions/database/giveaways');
client.giveawayManager = new GiveawaysManager(client, {
	default: {
		botsCanWin: false,
		embedColor: client.colors.vii,
		embedColorEnd: client.colors.vii,
		reaction: '🎁',
	},
});

// Define Collections
client.commands = new Collection();
client.events = new Collection();

// Load Database
client.mongoose = require('./core/loaders/mongooseLoader');
require('./functions/helpers/arrayUtils')(client);
require('./functions/helpers/timeFuncs')(client);
require('./functions/database/util')(client);

// Run Loaders
require('./core/loaders/musicEventLoader')(client);
require('./core/loaders/commandLoader')(client);
require('./core/loaders/eventLoader')(client);
require('./core/api/internalAPI')(client);

// Time based functions

// Every Minute
cron.schedule('* * * * *', () => {
	client.emit('everyMinute');
});

// Login
client.login(TOKEN);
