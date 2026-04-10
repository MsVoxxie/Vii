const http = require('http');
const https = require('https');
const Parser = require('rss-parser');

const parser = new Parser();

const DEFAULT_HEADERS = {
	'User-Agent': 'Vii YouTube Watcher',
	Accept: 'application/rss+xml, application/atom+xml, text/xml;q=0.9, */*;q=0.8',
};
const MAX_REDIRECTS = 5;
const REQUEST_TIMEOUT = 60000;

function buildYoutubeFeedUrl(ytChannelId) {
	return `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(ytChannelId)}`;
}

function createRequestError(message, details = {}) {
	const error = new Error(message);
	if (details.status != null) {
		error.status = details.status;
		error.statusCode = details.status;
	}
	if (details.url) error.url = details.url;
	return error;
}

function fetchFeedXml(requestUrl, redirectCount = 0) {
	return new Promise((resolve, reject) => {
		const targetUrl = new URL(requestUrl);
		const transport = targetUrl.protocol === 'http:' ? http : https;
		const request = transport.get(
			{
				protocol: targetUrl.protocol,
				hostname: targetUrl.hostname,
				port: targetUrl.port,
				path: `${targetUrl.pathname}${targetUrl.search}`,
				headers: DEFAULT_HEADERS,
			},
			(response) => {
				const status = response.statusCode;

				if (status >= 300 && status < 400 && response.headers.location) {
					response.resume();

					if (redirectCount >= MAX_REDIRECTS) {
						reject(createRequestError('Too many redirects', { status, url: requestUrl }));
						return;
					}

					const nextUrl = new URL(response.headers.location, requestUrl).toString();
					resolve(fetchFeedXml(nextUrl, redirectCount + 1));
					return;
				}

				if (status >= 300) {
					response.resume();
					reject(createRequestError(`Status code ${status}`, { status, url: requestUrl }));
					return;
				}

				let xml = '';
				response.setEncoding('utf8');
				response.on('data', (chunk) => {
					xml += chunk;
				});
				response.on('end', () => {
					resolve({ status, requestUrl, xml });
				});
			}
		);

		request.on('error', reject);
		request.setTimeout(REQUEST_TIMEOUT, () => {
			request.destroy(createRequestError(`Request timed out after ${REQUEST_TIMEOUT}ms`, { url: requestUrl }));
		});
	});
}

async function fetchYoutubeFeed(ytChannelId) {
	const requestUrl = buildYoutubeFeedUrl(ytChannelId);
	const { xml, status } = await fetchFeedXml(requestUrl);

	try {
		const feed = await parser.parseString(xml);
		return { feed, requestUrl, status };
	} catch (error) {
		error.status = status;
		error.statusCode = status;
		error.url = requestUrl;
		throw error;
	}
}

module.exports = {
	buildYoutubeFeedUrl,
	fetchYoutubeFeed,
};
