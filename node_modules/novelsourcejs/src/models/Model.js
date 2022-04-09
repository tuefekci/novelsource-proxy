class Model {

	constructor(args = {}) {
		if(args) {
			for(let i in args) {
				this[i] = args[i];
			}
		}
	}

	/*
  constructor(data) {
	this.data = data;
  }

  get(key) {
	return this.data[key];
  }

  set(key, value) {
	this.data[key] = value;
  }

  toJSON() {
	return this.data;
  }
  */

}

module.exports = Model;