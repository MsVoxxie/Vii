const QuickChart = require('quickchart-js');

module.exports = async (labels = [], labelData = []) => {
	// Check if labels and labelData are arrays
	if (!Array.isArray(labels) || !Array.isArray(labelData)) throw new TypeError('labels and labelData must be arrays');

	// Generate an outlabeledPie chart
	const chart = new QuickChart();

	chart.setBackgroundColor('transparent');
	chart.setWidth(1024);
	chart.setHeight(1024);
	chart.setVersion('2');

	chart.setConfig({
		type: 'outlabeledPie',
		data: {
			labels: labels,
			datasets: [
				{
					borderWidth: 5,
					backgroundColor: [
						'#FF3784',
						'#36A2EB',
						'#4BC0C0',
						'#F77825',
						'#9966FF',
						'#CCFF66',
						'#FF0000',
						'#FF00FF',
						'#FFCC00',
						'#FF9900',
						'#FF6600',
						'#ABCDEF',
					],
					data: labelData,
				},
			],
		},
		options: {
			plugins: {
				legend: false,
				outlabels: {
					text: '%l %p',
					color: '#1e1f22',
					stretch: 35,
					font: {
						resizable: true,
						minSize: 12,
						maxSize: 24,
					},
				},
			},
		},
	});

	const chartUrl = await chart.getUrl();
	return chartUrl;
};
