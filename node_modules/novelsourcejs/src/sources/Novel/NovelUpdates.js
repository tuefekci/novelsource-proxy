const { last } = require("cheerio/lib/api/traversing");
const SourceNovel = require("../SourceNovel");

const Novel = require("../../models/Novel");
const Metadata = require("../../models/Metadata");
const trim = require("locutus/php/strings/trim");
const empty = require("locutus/php/var/empty");
const Chapter = require("../../models/Chapter");


class NovelUpdates extends SourceNovel {
	base_urls = ["https://www.novelupdates.com/"];
	last_updated = "2022-03-13";
	name = "novelupdates.com";

	constructor(args = {}) {
		super(args);
	}
	
	async novels(args = {}) {
		return await this.search("", args);
	}
	
	async novel(url, args = {}) {

		try {
			const dom = await this.dom(url, args);
			const novel = new Novel();

			novel.title = dom(".seriestitlenu").first().text();
			novel.image = this.toAbsolute(dom(".seriesimg img").first().attr("src"));
			novel.id = dom('a[href*="rank-graph"]').first().attr("href").split("pid=")[1]; 
			novel.description = this.cleanContent(dom("#editdescription").first().html());
			novel.url = url;


			// alternative_names
			let alternative_names = dom("#editassociated").first().html().split("<br>");
			for(let i in alternative_names) {
				novel.metadata.push(
					new Metadata({
						name: "title",
						value: trim(alternative_names[i]),
					})
				);
			}

			// recommendation
			dom('.genre[id*="sid"]').each((i, el) => {
				novel.metadata.push(new Metadata({
					name: "recommendation",
					value: trim(dom(el).text()),
				}));
			});

			// Type
			novel.metadata.push(new Metadata({
				name: "type",
				value: trim(dom("#showtype a").first().text()),
			}));

			// Genre
			dom("#seriesgenre a").each((i, el) => {
				novel.metadata.push(new Metadata({
					name: "genre",
					value: trim(dom(el).text()),
				}));
			});

			// Tags
			dom("#showtags a").each((i, el) => {
				novel.metadata.push(new Metadata({
					name: "tag",
					value: trim(dom(el).text()),
				}));
			});


			// Rating
			let ratings = dom(".seriesother .uvotes").first().text().match(/(-\d+|\d+)(,\d+)*(\.\d+)*/g);

			novel.metadata.push(new Metadata({
				name: "rating",
				value: parseFloat(ratings[0])*2
			}));

			novel.metadata.push(new Metadata({
				name: "ratings",
				value: parseInt(ratings[2])
			}));

			// OG Language
			novel.language = dom("#showlang a").first().text();

			// Author
			dom("#showauthors").find("a").each((i, el) => {
				novel.author.push(trim(dom(el).text()));
			});

			// Artist
			dom("#showartists a").each((i, el) => {
				novel.metadata.push(new Metadata({
					name: "artist",
					value: trim(dom(el).text()),
				}));
			});

			// Year
			novel.metadata.push(new Metadata({
				name: "year",
				value: parseInt(dom("#edityear").first().text()),
			}));


			// Status
			novel.status = this.parseStatus(dom("#editstatus").first().text());

			// Status COO
			if(dom("#editstatus").first().text().match(/(-\d+|\d+)(,\d+)*(\.\d+)*/g) && dom("#editstatus").first().text().match(/(-\d+|\d+)(,\d+)*(\.\d+)*/g).length > 0) {
				novel.metadata.push(new Metadata({
					name: "chapters_coo",
					value: dom("#editstatus").first().text().match(/(-\d+|\d+)(,\d+)*(\.\d+)*/g).reduce(function(a, b) { return parseInt(a) + parseInt(b); }, 0),
				}));
			}

			// Ranks
			dom(".userrate.rank").each((i, el) => {

				let name;
				if(i == 0) {
					name = "rank_weekly";
				} else if(i == 1) {
					name = "rank_monthly";
				} else if(i == 2) {
					name = "rank_all";
				} else if(i == 3) {
					name = "rank_reader_monthly";
				} else if(i == 4) {
					name = "rank_reader_all";
				}

				if(name) {
					novel.metadata.push(new Metadata({
						name: name,
						value: parseInt(dom(el).text().match(/(-\d+|\d+)(,\d+)*(\.\d+)*/g)[0]),
					}));
				}

			});

			// Readers
			novel.metadata.push(new Metadata({
				name: "readers",
				value: parseInt(dom(".rlist").first().text()),
			}));





			return Promise.resolve(novel);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	
	async search(query, args = {}) {

		try {
			const dom = await this.dom(this.toAbsolute(this.base_urls[0])+"?s="+query, args);

			const novels = [];
			const results = [];

			dom(".l-content").first().find(".search_main_box_nu").each((i, el) => {
				results.push(el);
			});

			if(!empty(dom(".pagination .nav-links a").last().prev().attr("href"))) {
				let lastPage = dom(".pagination .nav-links a").last().prev().attr("href").match(/\d+/)[0];

				for(let i = 2; i <= lastPage; i++) {
					try {
						const dom = await this.dom(this.toAbsolute(this.base_urls[0])+"page/"+i+"/?s="+query, args);

						dom(".l-content").first().find(".search_main_box_nu").each((i, el) => {
							results.push(el);
						});

					} catch (error) {
						return Promise.reject(error);
					}
				}
			}

			results.map((el) => {
				novels.push(new Novel({
					title: dom(el).find(".search_title a").first().text(),
					url: this.toAbsolute(dom(el).find(".search_title a").first().attr("href"))
				}));
			});

			return Promise.resolve(novels);

		} catch (error) {
			return Promise.reject(error);
		}
	}
	
}


module.exports = NovelUpdates;