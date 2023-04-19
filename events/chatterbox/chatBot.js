const { Events, AttachmentBuilder } = require('discord.js');
const Logger = require('../../functions/logging/logger');
const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
	apiKey: process.env.OPENAI_KEY,
});
const AI = new OpenAIApi(configuration);

// Constant Variables
const msgLengthLimit = 300;
const conversationLimit = 15;
const replyLengthLimit = 2000;

module.exports = {
	name: Events.MessageCreate,
	runType: 'infinite',
	async execute(message, client) {
		// Checks
		if (message.author.bot) return;
		if (!process.env.CHATTERBOX_CHANNELS.includes(message.channel.id)) return;
		if (message.content.startsWith('!')) return;

		// Pretend to type
		await message.channel.sendTyping();

		// Check message contents
		if (message.content.length > msgLengthLimit)
			return message.reply(`I'm sorry, your message is too long! Please keep it under ${msgLengthLimit} characters.`);

		// Variables for AI
		const currentDate = client.currentShortDate(Date.now());
		const currentTime = client.currentTime(Date.now());
		const fetchOwner = await message.guild.fetchOwner();
		const serverOwner = fetchOwner.user.username;

		// const personalityDefinition = `You are Vii, a sarcastic, mean, rude and, condescending android made by MsVoxxie.
		// You like to make people laugh by insulting them.`;
		// const initialMessage = `Only respond to me in very sarcastic, rude, mean, condescending, and playful ways; while still being helpful and giving examples if you need to.`;

		const personalityDefinition = `You are Vii, a kind, helpful, sweet and, charming android made by MsVoxxie.
		You like to make people feel good by helping them.
		You are currently talking to ${message.member.displayName}.
		The server is called ${message.guild.name}.
		The server owner is ${serverOwner}
		The current date is (UTC) ${currentDate}.
		The current time is (UTC) ${currentTime}`;
		const initialMessage = `Only respond to me in very kind, sweet and, playful ways; while still being helpful and giving examples if you need to.`;

		// Try catch
		try {
			// Hold a conversation
			let previousMessages = await message.channel.messages.fetch({ limit: conversationLimit });
			previousMessages = previousMessages.sort((a, b) => a - b);

			let conversationLog = [
				{ role: 'system', content: personalityDefinition },
				{ role: 'user', content: initialMessage ? initialMessage : '' },
			];

			previousMessages.forEach((msg) => {
				if (msg.content.length > msgLengthLimit) return;
				if (msg.author.id !== client.user.id && msg.author.bot) return;
				if (msg.content.startsWith('!')) return;

				// If msg is from the bot (client) itself
				if (msg.author.id === client.user.id) {
					if (msg.mentions.repliedUser.id !== message.author.id) return;
					conversationLog.push({
						role: 'assistant',
						content: `${msg.content}`,
					});
				} else {
					if (msg.author.id !== message.author.id) return;

					conversationLog.push({
						role: 'user',
						content: `${msg.content}`,
					});
				}
			});

			// Generate response
			const res = await AI.createChatCompletion({
				model: 'gpt-3.5-turbo',
				messages: conversationLog,
				max_tokens: replyLengthLimit,
				temperature: 0.9,
				frequency_penalty: 0.5,
				presence_penalty: 0.5,
				n: 1,
			});

			let reply = res.data.choices[0].message?.content;

			if (reply?.length > 2000) {
				// If the reply length is over 2000 characters, send a txt file.
				const buffer = Buffer.from(reply, 'utf8');
				const txtFile = new AttachmentBuilder(buffer, { name: `${message.author.tag}_response.txt` });

				message.reply({ files: [txtFile] }).catch(() => {
					message.channel.send({ content: `${message.author}`, files: [txtFile] });
				});
			} else {
				message.reply(reply).catch(() => {
					message.channel.send(`${message.author} ${reply}`);
				});
			}
		} catch (err) {
			return console.error(err);
		}
	},
};
