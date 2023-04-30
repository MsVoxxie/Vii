module.exports = (value, maxValue, size) => {
	const percentage = value / maxValue; // Calculate the percentage of the bar
	const progress = Math.round(size * percentage); // Calculate the number of square caracters to fill the progress side.
	const emptyProgress = size - progress; // Calculate the number of dash caracters to fill the empty progress side.

	const progressText = '▇'.repeat(progress); // Repeat is creating a string with progress * caracters in it
	const emptyProgressText = '—'.repeat(emptyProgress); // Repeat is creating a string with empty progress * caracters in it
	const percentageText = `${Math.round(percentage * 100)}%`; // Displaying the percentage of the bar

	const bar = `[${progressText}${emptyProgressText}]${percentageText}`; // Creating the bar
	return bar;
};
