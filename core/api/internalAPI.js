const Logger = require('../../functions/logging/logger');
const Port = process.env.API_PORT;
const moment = require('moment');
require('moment-duration-format');
const e = require('express');
const srv = e();

module.exports = (client) => {
	srv.get('/v1/client/statistics', async (req, res) => {
		client.clientData = {
			status: 'ONLINE',
			uptime: moment.duration(client.uptime).format('Y[Y] M[M] W[W] D[D] H[h] m[m] s[s]'),
			totalCommands: client.commands.size,
			totalEvents: client.events.size,
			discordAPILatency: `${Math.round(client.ws.ping)}ms`,
			clientMemoryUsage: formatMemoryUsage(process.memoryUsage().heapUsed),
		};
		res.send(client.clientData);
	});

	srv.listen(Port, () => {
		Logger.success(`API Running on port ${Port}`);
	});
};

const formatMemoryUsage = (data) => `${Math.round((data / 1024 / 1024) * 100) / 100} MB`;
