const strpos = require("locutus/php/strings/strpos");
const empty = require("locutus/php/var/empty");
const Source = require("./Source");



class SourceNovel extends Source {
	constructor (args = {}) {
		super(args);
	}

	novels(args = {}) {
		console.error("Novels not implemented");
	}

	novel(url, args = {}) {
		console.error("Novel not implemented");
	}

	chapter(url, args = {}) {
		console.error("Chapter not implemented");
	}

	search(query, args = {}) {
		console.error("Search not implemented");
	}

	login(args = {}) {
		console.error("Login not implemented");
	}

	logout(args = {}) {
		console.error("Logout not implemented");
	}
}

module.exports = SourceNovel;