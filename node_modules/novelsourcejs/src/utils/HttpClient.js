const empty = require('locutus/php/var/empty');
const level = require('level');
const ttl = require('level-ttl');
const serialize = require('locutus/php/var/serialize');
const sha1 = require('locutus/php/strings/sha1');
const delay = require('delay');
const Humanoid = require("humanoid-js");
const rand = require('locutus/php/math/rand');
const { fstat } = require('fs');
const fs = require('fs');
const os = require('os');

function isCloudflareResponse(response) {

	if(typeof response.headers['cf-ray'] !== 'undefined' && typeof response.headers['server'] !== 'undefined' && response.headers['server'] === 'cloudflare') {
		response.$ = cheerio.load(response.data);

		//console.log(response.data);

		if(response.$('#challenge-form input[name=vc]').length > 0)
			return true;
	}

	return false;
}

class HttpClient {

	headers = {
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36',
		"Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.8",
	};

	constructor(args = {}) {
		if(!empty(args)) {
			for(let i in args) {
				this[i] = args[i];
			}
		}

		// check if browser or node etc.
		let cachePath = os.tmpdir() + "/tmp/http-cache";
		fs.mkdirSync(cachePath, { recursive: true });
		this.cache = ttl(level(cachePath), {defaultTTL: 60 * 60 * 24 * 1000});

	}

	async isCached(url, args = {}) {
		let key = sha1(url);

		try {
			let cachedResult = await this.cache.get(cacheKey);
			return cachedResult;
		} catch(e) {
		}
	}

	async request(method, url, args = {}) {

		let cacheKey = sha1(url);

		try {
			let cachedResult = await this.cache.get(cacheKey);
			return cachedResult;
		} catch(e) {
		}

		try {

			let humanoid = new Humanoid();
			let response = await humanoid.sendRequest(url);

			await delay(rand(100, 250));
			
			if(response.statusCode === 200) {
				this.cache.put(cacheKey, response.body);
				return Promise.resolve(response.body);
			} else {
				if(args.retry < 5) {
					args.retry ? args.retry++ : args.retry = 1;
					await delay(args.retry * 1000);
					return this.request(method, url, args);
				} else {
					return Promise.reject(response);
				}
			}
		} catch (error) {
			if(args.retry < 5) {
				args.retry ? args.retry++ : args.retry = 1;
				await delay(args.retry * 1000);
				return this.request(method, url, args);
			} else {
				return Promise.reject(error);
			}
		}


	}

	async get(url, args = {}) {
		return await this.request("GET", url, args);
	}

	async post(url, args = {}) {
		return await this.request("POST", url, args);
	}

	async put(url, args = {}) {
		return await this.request("PUT", url, args);
	}

	async delete(url, args = {}) {
		return await this.request("DELETE", url, args);
	}

	async head(url, args = {}) {
		return await this.request("HEAD", url, args);
	}

	async options(url, args = {}) {
		return await this.request("OPTIONS", url, args);
	}

	async patch(url, args = {}) {
		return await this.request("PATCH", url, args);
	}

	async trace(url, args = {}) {
		return await this.request("TRACE", url, args);
	}

	async connect(url, args = {}) {
		return await this.request("CONNECT", url, args);
	}

}

module.exports = HttpClient;