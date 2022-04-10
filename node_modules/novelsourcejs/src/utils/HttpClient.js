const empty = require('locutus/php/var/empty');
const serialize = require('locutus/php/var/serialize');
const sha1 = require('locutus/php/strings/sha1');
const delay = require('delay');
const Humanoid = require("humanoid-js");
const rand = require('locutus/php/math/rand');
const { fstat } = require('fs');
const fs = require('fs');
const os = require('os');

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
	}

	async request(method, url, args = {}) {

		try {

			let humanoid = new Humanoid();
			let response = await humanoid.sendRequest(url);

			if(response.statusCode === 200) {
				return Promise.resolve(response.body);
			} else {
				if(args.retry < 5) {
					args.retry ? args.retry++ : args.retry = 1;
					await delay(args.retry * 100);
					return this.request(method, url, args);
				} else {
					return Promise.reject(response);
				}
			}
		} catch (error) {
			if(args.retry < 5) {
				args.retry ? args.retry++ : args.retry = 1;
				await delay(args.retry * 100);
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