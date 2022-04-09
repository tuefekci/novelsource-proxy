const empty = require("locutus/php/var/empty");
const Sources = require("./sources/Sources");
const HttpClient = require("./utils/HttpClient");



class NovelSource {

	constructor(args = {}) {
		if(!empty(args)) {
			for(let i in args) {
				this[i] = args[i];
			}
		}

		if(!this.parser) {
			this.parser = require('cheerio');
		}

		if(!this.client) {
			this.client = new HttpClient({parser: this.parser});
		}


		this.sources = new Sources({
			client: this.client,
			parser: this.parser,
		});

	}

	isBrowser() {
		return typeof window !== 'undefined';
	}

	isNode() {
		return typeof window === 'undefined';
	}

	getSources() {
		return this.sources.novel;
	}

	locateSource(url) {
		for(let i in this.sources.novel) {
			let source = this.sources.novel[i];

			if(source.of(url)) {
				return source;
			}
		}
		return false;
	}


}

module.exports = NovelSource;