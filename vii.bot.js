// Configuration File
const dotenv = require('dotenv');
dotenv.config();

// Discord Classes
const cron = require('node-cron');
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
require('events').EventEmitter.defaultMaxListeners = 16;
const TOKEN = process.env.DISCORD_TOKEN;

// Define Client
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildInvites,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildModeration,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildExpressions,
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
client.invites = new Collection();
client.events = new Collection();

// Load Database
client.mongoose = require('./core/loaders/mongooseLoader');
require('./functions/helpers/arrayUtils')(client);
require('./functions/helpers/timeFuncs')(client);
require('./functions/database/util')(client);

// Run Loaders
require('./core/loaders/commandLoader')(client);
require('./core/loaders/eventLoader')(client);
require('./core/api/internalAPI')(client);

// Time based functions

// Every Minute
client.emit('everyMinute');
cron.schedule('* * * * *', () => {
	client.emit('everyMinute');
});

// Every 5 Minutes
client.emit('everyFiveMinutes');
cron.schedule('*/5 * * * *', () => {
	client.emit('everyFiveMinutes');
});

// Login
client.login(TOKEN);
