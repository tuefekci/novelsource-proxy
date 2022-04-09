const Model = require("./Model");

class Chapter extends Model {

	index = null;
	title = "";
	url = "";
	date = "";
	content = "";

	constructor(args = {}) {
		super(args);

		if(args) {
			for(let i in args) {
				this[i] = args[i];
			}
		}
	}

}

module.exports = Chapter;