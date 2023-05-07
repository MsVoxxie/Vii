module.exports = (client) => {
	// Chunk Array
	client.chunkArray = (arr, size) => {
		return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));
	};
};
