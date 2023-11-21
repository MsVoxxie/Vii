const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { Connect4, RockPaperScissors, TicTacToe, Trivia, TwoZeroFourEight, Minesweeper, Snake } = require('discord-gamecord');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('games')
		.setDescription('General Games Command')
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('connect4')
				.setDescription('Create a game of Connect4')
				.addUserOption((option) => option.setName('opponent').setDescription('Who you would like to play against').setRequired(true))
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('rockpaperscissors')
				.setDescription('Create a game of Rock Paper Scissors')
				.addUserOption((option) => option.setName('opponent').setDescription('Who you would like to play against').setRequired(true))
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('tiktactoe')
				.setDescription('Create a game of TikTacToe')
				.addUserOption((option) => option.setName('opponent').setDescription('Who you would like to play against').setRequired(true))
		)
		.addSubcommand((subcommand) => subcommand.setName('trivia').setDescription('Create a game of Trivia'))
		.addSubcommand((subcommand) => subcommand.setName('2048').setDescription('Create a game of 2048'))
		.addSubcommand((subcommand) => subcommand.setName('minesweeper').setDescription('Create a game of Minesweeper'))
		.addSubcommand((subcommand) => subcommand.setName('snake').setDescription('Create a game of Snake')),
	options: {
		devOnly: false,
		disabled: false,
	},
	async execute(client, interaction, settings) {
		// Get Subcommands
		const subCommand = interaction.options.getSubcommand();

		// Switch between games
		switch (subCommand) {
			case 'connect4':
				const connect4Game = new Connect4({
					message: interaction,
					isSlashGame: true,
					opponent: interaction.options.getUser('opponent'),
					embed: {
						title: 'Connect4',
						statusTitle: 'Status',
						color: client.colors.vii,
					},
					emojis: {
						board: '⚪',
						player1: '🔴',
						player2: '🟡',
					},
					mentionUser: true,
					timeoutTime: 60000,
					buttonStyle: 'PRIMARY',
					turnMessage: '{emoji} | Its turn of player **{player}**.',
					winMessage: '{emoji} | **{player}** won Connect4.',
					tieMessage: 'The Game tied! No one won!',
					timeoutMessage: 'The Game went unfinished! No one won!',
					playerOnlyMessage: 'Only {player} and {opponent} can use these buttons.',
				});

				connect4Game.startGame();
				connect4Game.on('gameOver', (result) => null);
				break;

			case 'rockpaperscissors':
				const rpsGame = new RockPaperScissors({
					message: interaction,
					isSlashGame: true,
					opponent: interaction.options.getUser('opponent'),
					embed: {
						title: 'Rock Paper Scissors',
						color: client.colors.vii,
						description: 'Press a button below to make a choice.',
					},
					buttons: {
						rock: 'Rock',
						paper: 'Paper',
						scissors: 'Scissors',
					},
					emojis: {
						rock: '🌑',
						paper: '📰',
						scissors: '✂️',
					},
					mentionUser: true,
					timeoutTime: 60000,
					buttonStyle: 'PRIMARY',
					pickMessage: 'You choose {emoji}.',
					winMessage: '**{player}** won! Congratulations!',
					tieMessage: 'The Game tied! No one won!',
					timeoutMessage: 'The Game went unfinished! No one won!',
					playerOnlyMessage: 'Only {player} and {opponent} can use these buttons.',
				});

				rpsGame.startGame();
				rpsGame.on('gameOver', (result) => null);
				break;

			case 'tiktactoe':
				const tiktactoeGame = new TicTacToe({
					message: interaction,
					isSlashGame: true,
					opponent: interaction.options.getUser('opponent'),
					embed: {
						title: 'Tic Tac Toe',
						color: client.colors.vii,
						statusTitle: 'Status',
						overTitle: 'Game Over',
					},
					emojis: {
						xButton: '❌',
						oButton: '🔵',
						blankButton: '➖',
					},
					mentionUser: true,
					timeoutTime: 60000,
					xButtonStyle: 'DANGER',
					oButtonStyle: 'PRIMARY',
					turnMessage: '{emoji} | Its turn of player **{player}**.',
					winMessage: '{emoji} | **{player}** won the TicTacToe.',
					tieMessage: 'The Game tied! No one won!',
					timeoutMessage: 'The Game went unfinished! No one won!',
					playerOnlyMessage: 'Only {player} and {opponent} can use these buttons.',
				});

				tiktactoeGame.startGame();
				tiktactoeGame.on('gameOver', (result) => null);
				break;

			case 'trivia':
				const difficulty = ['easy', 'medium', 'hard'];
				const randDiff = difficulty[Math.floor(Math.random() * difficulty.length)];
				const triviaGame = new Trivia({
					message: interaction,
					isSlashGame: true,
					embed: {
						title: 'Trivia',
						color: client.colors.vii,
						description: 'You have 60 seconds to guess the answer.',
					},
					timeoutTime: 60000,
					buttonStyle: 'PRIMARY',
					trueButtonStyle: 'SUCCESS',
					falseButtonStyle: 'DANGER',
					mode: 'multiple', // multiple || single
					difficulty: randDiff, // easy || medium || hard
					winMessage: 'You won! The correct answer is {answer}.',
					loseMessage: 'You lost! The correct answer is {answer}.',
					errMessage: 'Unable to fetch question data! Please try again.',
					playerOnlyMessage: 'Only {player} can use these buttons.',
				});

				triviaGame.startGame();
				triviaGame.on('gameOver', (result) => null);
				break;

			case '2048':
				const twozerofoureightGame = new TwoZeroFourEight({
					message: interaction,
					isSlashGame: true,
					embed: {
						title: '2048',
						color: client.colors.vii,
					},
					emojis: {
						up: '⬆️',
						down: '⬇️',
						left: '⬅️',
						right: '➡️',
					},
					timeoutTime: 60000,
					buttonStyle: 'PRIMARY',
					playerOnlyMessage: 'Only {player} can use these buttons.',
				});

				twozerofoureightGame.startGame();
				twozerofoureightGame.on('gameOver', (result) => null);
				break;

			case 'minesweeper':
				const minesweeperGame = new Minesweeper({
					message: interaction,
					isSlashGame: true,
					embed: {
						title: 'Minesweeper',
						color: client.colors.vii,
						description: 'Click on the buttons to reveal the blocks except mines.',
					},
					emojis: { flag: '🚩', mine: '💣' },
					mines: 5,
					timeoutTime: 60000,
					winMessage: 'You won! You successfully avoided all the mines.',
					loseMessage: 'You lost! Beaware of the mines next time.',
					playerOnlyMessage: 'Only {player} can use these buttons.',
				});

				minesweeperGame.startGame();
				minesweeperGame.on('gameOver', (result) => null);
				break;

			case 'snake':
				const snakeGame = new Snake({
					message: interaction,
					isSlashGame: true,
					embed: {
						title: 'Snake Game',
						overTitle: 'Game Over',
						color: client.colors.vii,
					},
					emojis: {
						board: '⬛',
						food: '🍎',
						up: '⬆️',
						down: '⬇️',
						left: '⬅️',
						right: '➡️',
					},
					snake: { head: '🟢', body: '🟩', tail: '🟢', skull: '💀' },
					foods: ['🍎', '🍇', '🍊', '🫐', '🥕', '🥝', '🌽'],
					stopButton: 'Stop',
					timeoutTime: 60000,
					playerOnlyMessage: 'Only {player} can use these buttons.',
				});

				snakeGame.startGame();
				snakeGame.on('gameOver', (result) => null);
				break;
		}
	},
};
