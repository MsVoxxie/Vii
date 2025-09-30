const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('define')
		.setDescription('Search the Dictonary for a definition!')
		.addStringOption((option) => option.setName('query').setDescription('What would you like to search for?').setRequired(true))
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
	options: {
		devOnly: false,
		disabled: false,
	},
	async execute(client, interaction, settings) {
		// Defer, Things take time.
		await interaction.deferReply();

		// Get options
		const searchQuery = interaction.options.getString('query').replace(/\s/g, '');
		const result = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${searchQuery}`).then((res) => res.json());
		const definition = result[0];
		if (!definition) return interaction.followUp({ content: `Unable to find the definition for ${searchQuery}...` });

		// Map out first 3 definitions for addFields
		const mappedDefinitions = [
			...definition.meanings.map((meaning) =>
				meaning.definitions.map((def) => ({
					partOfSpeech: meaning.partOfSpeech,
					definition: def.definition,
					example: def.example || 'N/A',
				}))
			),
		]
			.flat(2)
			.slice(0, 3);

		// Build Embeds
		const embed = new EmbedBuilder()
			.setTitle(`**Dictionary Search** » ${definition.word}`)
			.setColor(client.colors.vii)
			.addFields(
				mappedDefinitions.map((def, index) => ({
					name: `**${index + 1}. (${def.partOfSpeech})**`,
					value: `**Definition»** ${def.definition}\n**Example»** ${def.example}`,
				}))
			)
			.setTimestamp();

		interaction.followUp({ embeds: [embed] });
	},
};

// [{"word":"hello","phonetics":[{"audio":"https://api.dictionaryapi.dev/media/pronunciations/en/hello-au.mp3","sourceUrl":"https://commons.wikimedia.org/w/index.php?curid=75797336","license":{"name":"BY-SA 4.0","url":"https://creativecommons.org/licenses/by-sa/4.0"}},{"text":"/həˈləʊ/","audio":"https://api.dictionaryapi.dev/media/pronunciations/en/hello-uk.mp3","sourceUrl":"https://commons.wikimedia.org/w/index.php?curid=9021983","license":{"name":"BY 3.0 US","url":"https://creativecommons.org/licenses/by/3.0/us"}},{"text":"/həˈloʊ/","audio":""}],"meanings":[{"partOfSpeech":"noun","definitions":[{"definition":"\"Hello!\" or an equivalent greeting.","synonyms":[],"antonyms":[]}],"synonyms":["greeting"],"antonyms":[]},{"partOfSpeech":"verb","definitions":[{"definition":"To greet with \"hello\".","synonyms":[],"antonyms":[]}],"synonyms":[],"antonyms":[]},{"partOfSpeech":"interjection","definitions":[{"definition":"A greeting (salutation) said when meeting someone or acknowledging someone’s arrival or presence.","synonyms":[],"antonyms":[],"example":"Hello, everyone."},{"definition":"A greeting used when answering the telephone.","synonyms":[],"antonyms":[],"example":"Hello? How may I help you?"},{"definition":"A call for response if it is not clear if anyone is present or listening, or if a telephone conversation may have been disconnected.","synonyms":[],"antonyms":[],"example":"Hello? Is anyone there?"},{"definition":"Used sarcastically to imply that the person addressed or referred to has done something the speaker or writer considers to be foolish.","synonyms":[],"antonyms":[],"example":"You just tried to start your car with your cell phone. Hello?"},{"definition":"An expression of puzzlement or discovery.","synonyms":[],"antonyms":[],"example":"Hello! What’s going on here?"}],"synonyms":[],"antonyms":["bye","goodbye"]}],"license":{"name":"CC BY-SA 3.0","url":"https://creativecommons.org/licenses/by-sa/3.0"},"sourceUrls":["https://en.wiktionary.org/wiki/hello"]}]
