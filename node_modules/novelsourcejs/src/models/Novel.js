const Model = require("./Model");


class Novel extends Model {

	id = "";
	title = "";
	url = "";
	description = "";
	image = "";
	status = "";
	language = "";

	author = [];
	chapters = [];
	metadata = [];

	constructor(args = {}) {
		super(args);

		if(args) {
			for(let i in args) {
				this[i] = args[i];
			}
		}
	}

}

module.exports = Novel;