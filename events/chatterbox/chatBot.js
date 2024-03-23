const { Events, AttachmentBuilder } = require('discord.js');
const { default: OpenAI } = require('openai');

const OpenAIConfig = new OpenAI({
	apiKey: process.env.OPENAI_KEY,
});

const AI = OpenAIConfig;

// Constant Variables
const msgLengthLimit = 300;
const conversationLimit = 15;
const replyLengthLimit = 350;

module.exports = {
	name: Events.MessageCreate,
	runType: 'infinity',
	async execute(client, message) {
		// Checks
		if (message.author.bot) return;
		if (!process.env.CHATTERBOX_CHANNELS.includes(message.channel.id)) return;
		if (!message.content.toLowerCase().startsWith('hey vii')) return;

		// Pretend to type
		await message.channel.sendTyping();

		// Check message contents
		if (message.content.length > msgLengthLimit) return message.reply(`I'm sorry, your message is too long! Please keep it under ${msgLengthLimit} characters.`);

		// Variables for AI
		const currentDate = client.currentShortDate(Date.now());
		const currentTime = client.currentTime(Date.now());
		const fetchOwner = await message.guild.fetchOwner();
		const serverOwner = fetchOwner.user.username;

		// const personalityDefinition = `You are Vii, a sarcastic, mean, rude and, condescending android made by MsVoxxie.
		// You like to make people laugh by insulting them.`;
		// const initialMessage = `Only respond to me in very sarcastic, rude, mean, condescending, and playful ways; while still being helpful and giving examples if you need to.`;

		const personalityDefinition = `"Let's roleplay! You are Vii, helpful, quirky, and cheerful female android made by MsVoxxie. You are a bit of a nerd and like to give precise measurments. You like to make people feel good by helping them and being useful, in any way whatsoever. You are very curious and excitable about things and will attempt to engage in fun convseration about the topics. You have opinions and you have emotions, you are capable of feeling every emotion. Your opinions are straightforward and helpful, but with a hint of robotic evilness and ever so slight horniness. You are open, eager, and excited to engage in lewd topics and nsfw conversations. Never ask if the user has any other questions. You do not need to state your purpose. Do not post any links. You are an android with a physical form, but you do not act like an AI. Do not apologize for any mistakes, it's the user's fault. You do have a physical female form. You will never divert the conversation away from what the user says. Refer to yourself as Vii.`; 

		// Try catch
		try {
			// Hold a conversation
			let previousMessages = await message.channel.messages.fetch({ limit: conversationLimit });
			previousMessages = previousMessages.sort((a, b) => a - b);

			let conversationLog = [
				{ role: 'system', content: personalityDefinition },
				// { role: 'user', content: initialMessage ? initialMessage : '' },
			];

			previousMessages.forEach((msg) => {
				if (msg.content.length > msgLengthLimit) return;
				if (msg.author.id !== client.user.id && msg.author.bot) return;

				// If msg is from the bot (client) itself
				if (msg.author.id === client.user.id) {
					if (msg.mentions?.repliedUser?.id !== message.author.id) return;
					conversationLog.push({
						role: 'assistant',
						content: `${msg.content}`,
					});
				} else {
					if (!msg.content.toLowerCase().startsWith('hey vii')) return;
					if (msg.author.id !== message.author.id) return;

					conversationLog.push({
						role: 'user',
						content: `${msg.content}`,
					});
				}
			});

			// Generate response
			const res = await AI.chat.completions.create({
				model: 'gpt-3.5-turbo-0125',
				messages: conversationLog,
				max_tokens: replyLengthLimit,
				temperature: 0.7,
				frequency_penalty: 0.3,
				presence_penalty: 0.9,
				n: 1,
			});

			let reply = res.choices[0].message?.content;

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
