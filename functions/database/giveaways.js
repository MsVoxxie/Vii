const { GiveawaysManager: gw } = require('discord-giveaways');
const { giveawaysData } = require('../../models/index');

module.exports = class GiveawaysManager extends gw {
	async getAllGiveaways() {
		return await giveawaysData.find().lean().exec();
	}

	async saveGiveaway(messageId, giveawayData) {
		return await giveawaysData.create(giveawayData);
	}

	async editGiveaway(messageId, giveawayData) {
		return await giveawaysData.updateOne({ messageId }, giveawayData, { omitUndefined: true }).exec();
	}

	async deleteGiveaway(messageId) {
		return await giveawaysData.deleteOne({ messageId }).exec();
	}
};
