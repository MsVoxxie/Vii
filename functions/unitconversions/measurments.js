const inchesToFeet = (t) => {
	const iToF = t.split("'")[1] / 12;
	return Number(t.split("'")[0]) + iToF;
};

const pad = (str, char = '0', len = 2) => {
	console.log;
	return char.repeat(Math.max(len - str.length, 0)) + str;
};

const metersToFeet = (m) => {
	const feet = m * 3.281;
	if (feet < 1) return `${(m * 100) / 2.54}"`;
	const inches = (feet % 1) * 12;
	return `${Math.floor(feet)}'${Math.floor(inches)}"`;
};

const unitList = new Map([
	[
		'milliliter',
		{
			regex: /([0-9,.]+)(ml|milliliter|lillileters)/gm,
			convert: (t) => t / 1000,
			conversionUnit: 'liter',
		},
	],
	[
		'liter',
		{
			regex: /([0-9,.]+)(l|liter|liters)/gm,
			convert: (t) => t * 1000,
			conversionUnit: 'milliliter',
		},
	],
	[
		'pounds',
		{
			regex: /([0-9,.]+)(lbs|lb|pounds|pound)/gm,
			convert: (t) => t * 0.45359237,
			decimals: 3,
			conversionUnit: 'kg',
		},
	],
	[
		'kg',
		{
			regex: /([0-9,.]+)(kgs|kg|kilograms|kilogram)/gm,
			convert: (t) => t * 2.205,
			decimals: 3,
			conversionUnit: 'pounds',
		},
	],
	[
		'milligrams',
		{
			regex: /([0-9,.]+)(mg|mgs|milligram|milligrams)/gm,
			convert: (t) => t / 1000,
			conversionUnit: 'grams',
		},
	],
	[
		'grams',
		{
			regex: /([0-9,.]+)(gram|grams)/gm,
			convert: (t) => t * 1000,
			conversionUnit: 'miligrams',
		},
	],
	[
		'cm',
		{
			regex: /([0-9,.]+)(cms|cm|centimeters|centimeter)/gm,
			convert: (t) => {
				return metersToFeet(t / 100);
			},
			conversionUnit: '',
		},
	],
	[
		'feet',
		{
			regex: /([0-9,.]+)(feet|foot|ft)/gm,
			convert: (t) => (t.includes("'") ? inchesToFeet(t) / 3.281 : t / 3.281),
			conversionUnit: 'meters',
		},
	],
	[
		'inches',
		{
			regex: /([0-9,.]+)(inches|inch|" )/gm,
			convert: (t) => t * 2.54,
			conversionUnit: 'centimeters',
		},
	],
	[
		'meters',
		{
			regex: /([0-9,.]+)(meters|meter|m )/gm,
			convert: (t) => metersToFeet(t),
			conversionUnit: '',
		},
	],
	[
		'yards',
		{
			regex: /([0-9,.]+)(yards|yard|yd|yds)/gm,
			convert: (t) => t * 0.9144,
			conversionUnit: 'meters',
		},
	],
	[
		'kilometers',
		{
			regex: /([0-9,.]+)(kilometers|kilometer|km |kms )/gm,
			convert: (t) => t / 1.609,
			conversionUnit: 'miles',
		},
	],
	[
		'miles',
		{
			regex: /([0-9,.]+)(mi |miles|mile)/gm,
			convert: (t) => t * 1.609,
			conversionUnit: 'km',
		},
	],
	[
		'kilometersPerHour',
		{
			regex: /([0-9,.]+)(kph|kmh)/gm,
			convert: (t) => t / 1.609,
			conversionUnit: 'mph',
		},
	],
	[
		'milesPerHour',
		{
			regex: /([0-9,.]+)(mph)/gm,
			convert: (t) => t * 1.609,
			conversionUnit: 'kph',
		},
	],
	[
		'fahrenheit',
		{
			regex: /(-[0-9,.]+|[0-9,.]+)(fahrenheit|f )/gm,
			convert: (t) => ((t - 32) * 5) / 9,
			conversionUnit: '°C',
		},
	],
	[
		'celcius',
		{
			regex: /(-[0-9,.]+|[0-9,.]+)(celcius|c )/gm,
			convert: (t) => (t * 9) / 5 + 32,
			conversionUnit: '°F',
		},
	],
	[
		'24h Clock',
		{
			regex: /([0-2][0-9]:[0-9][0-9])( |(?!(am|pm)))/gm,
			convert: (t) => {
				const [hours, minutes] = t.split(':');
				let unit = Number(hours) <= 12 ? 'AM' : 'PM';
				const convertedHours = hours % 12;
				return `${convertedHours == 0 ? 12 : convertedHours}:${minutes} ${unit}`;
			},
			conversionUnit: '12h Clock',
		},
	],
	[
		'12h Clock',
		{
			regex: /(?= |)((((1[0-2]|[0-9]))|(0?[1-9]|1[0-2]):([0-5]\d))(?<f>am|pm))/gm,
			convert: (t, rMatch) => {
				const format = rMatch.groups.f;
				t = t.slice(0, -2);
				const [hours, minutes] = t.includes(':') ? t.split(':') : [t, 0];
				return `${pad((format == 'pm' ? (hours == 12 ? hours : Number(hours) + 12) : hours == 12 ? 0 : hours).toString())}:${pad(
					minutes.toString()
				)}`;
			},
			conversionUnit: '24h Clock',
		},
	],
]);

const doConversions = (data, user) => {
	const converted = [];
	for (const [name, value] of unitList) {
		const matches = data.matchAll(value.regex);
		for (const match of matches) {
			const unitConversion = value.convert(match[1], match, user);
			if (!unitConversion) continue;
			converted.push({
				from: `**${match[1]}** ${value.name || name}`,
				to: `**${typeof unitConversion == 'number' ? unitConversion.toFixed(value.decimals || 2) : unitConversion}** ${value.conversionUnit}`,
			});
		}
	}
	if (!converted.length) return;
	return converted.reverse();
};

module.exports = { unitList, doConversions };
