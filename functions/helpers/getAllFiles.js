const { readdirSync } = require('fs');
const { join } = require('path');

module.exports = (directory, foldersOnly = false) => {
	// Declare an empty array to store all file names
	let fileNames = [];
	// Read the directory
	const files = readdirSync(directory, { withFileTypes: true });

	// Loop through all files in the directory
	for (const file of files) {
		const filePath = join(directory, file.name);
		if (foldersOnly) {
			if (file.isDirectory()) fileNames.push(filePath);
		} else {
			if (file.isFile()) fileNames.push(filePath);
		}
	}
	return fileNames;
};
