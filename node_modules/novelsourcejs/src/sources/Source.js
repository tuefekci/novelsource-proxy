const rtrim = require("locutus/php/strings/rtrim");
const strpos = require("locutus/php/strings/strpos");
const empty = require("locutus/php/var/empty");

const { Readability } = require('@mozilla/readability');
const { JSDOM } = require('jsdom');

class SourceClass {

	base_urls = [];
	last_updated = "";

	constructor(args = {}) {
		if(!empty(args)) {
			for(let i in args) {
				this[i] = args[i];
			}
		}
	}

	getName() {
		return this.constructor.name.toString();
	}

	parseStatus(status) {
		if(status.includes("Completed") || status.includes("completed")) {
			return "completed";
		} else if(status.includes("Ongoing") || status.includes("ongoing")) {
			return "ongoing";
		} else if(status.includes("Hiatus") ||	status.includes("hiatus")) {
			return "hiatus";
		} else if(status.includes("Cancelled") || status.includes("cancelled") || status.includes("Dropped") || status.includes("dropped")) {
			return "cancelled";
		} else {
			return "unknown";
		}
	}

	async dom(url, args = {}) {
		
		try {
			let response = await this.client.get(url, args);

			if(!empty(response)) {
				return Promise.resolve(this.parser.load(response));
			} else {
				return Promise.reject("Empty response");
			}
			
		} catch (error) {
			return Promise.reject(error);
		}
	}

	cleanContent(content) {

		var COMMENT_PSEUDO_COMMENT_OR_LT_BANG = new RegExp(
			'<!--[\\s\\S]*?(?:-->)?'
			+ '<!---+>?'  // A comment with no body
			+ '|<!(?![dD][oO][cC][tT][yY][pP][eE]|\\[CDATA\\[)[^>]*>?'
			+ '|<[?][^>]*>?',  // A pseudo-comment
			'g');

		content = content.replace(COMMENT_PSEUDO_COMMENT_OR_LT_BANG, '');

		// Remove any tags that are not allowed
		let dom = new JSDOM(content);
		let reader = new Readability(dom.window.document);
		let article = reader.parse();
	
		return article.content;
	}



	of(url) {
		for(let i in this.base_urls) {
			if(strpos(url, this.base_urls[i]) !== false) {
				return true;
			}
		}

		return false;
	}

	toAbsolute(url) {

		let base_url = rtrim(this.base_urls[0], "/");

		if(strpos(url, "http") === 0) {
			return url;
		}

		if(strpos(url, "/") === 0) {
			return base_url + url;
		}

		return base_url + "/" + url;
	}
}

module.exports = SourceClass;