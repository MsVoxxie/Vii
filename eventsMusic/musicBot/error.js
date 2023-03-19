module.exports = {
	name: 'error',
	runType: 'infinite',
	execute(error, client) {
		console.log(`General player error event: ${error.message}`);
		console.log(error);
	},
};
