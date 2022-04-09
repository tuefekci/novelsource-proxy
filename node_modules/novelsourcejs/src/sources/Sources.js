
const NovelUpdates = require("./Novel/NovelUpdates");
const ReadNovelFull = require("./Novel/ReadNovelFull");
const ReadLightNovelMe = require("./Novel/ReadLightNovelMe");

class Sources {

	constructor(args) {
		this.novel = [
			new NovelUpdates(args),
			new ReadNovelFull(args),
			new ReadLightNovelMe(args),
		];
	}

}
module.exports = Sources;