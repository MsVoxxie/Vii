module.exports = {
	apps: [
		{
			name: 'ViiBot',
			script: './vii.bot.js',
			cwd: __dirname,
			instances: 1,
			exec_mode: 'fork',
			node_args: '--no-deprecation',
			autorestart: true,
			watch: true,
			max_memory_restart: '300M',
			env: {
				NODE_ENV: 'production',
			},
		},
	],
};
