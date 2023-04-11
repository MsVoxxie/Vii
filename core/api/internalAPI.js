const Logger = require('../../functions/logging/logger');
const RateLimit = require('express-rate-limit');
const { botData } = require('../../models');
const Port = process.env.API_PORT;
const moment = require('moment');
require('moment-duration-format');
const e = require('express');
const cors = require('cors');
const srv = e();

module.exports = (client) => {
	// Rate Limit
	const limiter = RateLimit({
		windowMs: 1 * 60 * 1000,
		max: 5,
	});

	// Set "Use"
	srv.use(limiter);
	srv.use(cors());

	// Statistics Route
	srv.get('/v1/client/statistics', async (req, res) => {
		const databaseData = await botData.findOne({});
		client.clientData = {
			SESSION: {
				SESSION_COUNT: databaseData.session,
				UPTIME: moment.duration(client.uptime).format('Y[Y] M[M] W[W] D[D] H[h] m[m] s[s]'),
				START_TIME: databaseData.startTime,
				START_TIME_UTC: databaseData.startTimeUTC,
			},
			CLIENT: {
				STATUS: 'ONLINE',
				DISCORD_API_LATENCY: `${Math.round(client.ws.ping)}ms`,
				CLIENT_MEMORY_USAGE: formatMemoryUsage(process.memoryUsage().heapUsed),
			},
			MUSIC: {
				CURRENT_CONNECTIONS: client.distube.voices.size,
			},
			HANDLERS: {
				COMMANDS: {
					TOTAL_COMMANDS: client.commands.size,
					COMMANDS_EXECUTED: databaseData.commandsExecuted,
					COMMANDS_FAILED: databaseData.commandsFailed,
				},
				EVENTS: {
					TOTAL_EVENTS: client.events.size,
				},
			},
		};
		res.send(client.clientData);
	});

	srv.listen(Port, () => {
		Logger.success(`API Running on port ${Port}`);
	});
};

const formatMemoryUsage = (data) => `${Math.round((data / 1024 / 1024) * 100) / 100} MB`;
