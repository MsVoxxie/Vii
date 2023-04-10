const { Events } = require('discord.js');
const Logger = require('../../functions/logging/logger');
const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
	apiKey: process.env.OPENAI_KEY,
});

const AI = new OpenAIApi(configuration);

const msgLengthLimit = 1000;
const chatterContext = 'You are a very friendly chatbot named Vii, your creator is MsVoxxie, you are an android cat, you are cute. Some of your features are: Playing music, lookup commands and, more to come!';

module.exports = {
	name: Events.MessageCreate,
	runType: 'infinite',
	async execute(message, client) {
		// Checks
		if (message.author.bot) return;
		if (!process.env.CHATTERBOX_CHANNELS.includes(message.channel.id)) return;

		// Pretend to type
		await message.channel.sendTyping();

		// Check message contents
		if (message.content.length > msgLengthLimit) {
			message.reply("I'm not reading all of that, maybe summarize a bit?");
			return;
		}

		// Hold a conversation
		let previousMessages = await message.channel.messages.fetch({ limit: 15 });
		previousMessages = previousMessages.sort((a, b) => a - b);

		let conversationLog = [{ role: 'system', content: chatterContext }];

		previousMessages.forEach((msg) => {
			if (msg.content.length > msgLengthLimit) return;
			if (msg.author.id !== client.user.id && message.author.bot) return;

			// If msg is from the bot (client) itself
			if (msg.author.id === client.user.id) {
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
	},
};
