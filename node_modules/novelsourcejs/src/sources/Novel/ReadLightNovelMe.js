
const SourceNovel = require("../SourceNovel");

const Novel = require("../../models/Novel");
const Metadata = require("../../models/Metadata");
const trim = require("locutus/php/strings/trim");
const empty = require("locutus/php/var/empty");
const Chapter = require("../../models/Chapter");
const ltrim = require("locutus/php/strings/ltrim");
const sha1 = require("locutus/php/strings/sha1");

class ReadLightNovelMe extends SourceNovel {
	base_urls = ["https://www.readlightnovel.me/"];
	last_updated = "2022-04-01";

	async novels(args = {}) {
		try {

			const novels = {};
			const promises = [];
			const dom = await this.dom(this.toAbsolute("novel-list"), args);

			dom(".pagination.alphabet li a").each((i, el) => {


				promises.push(new Promise(async (resolve, reject) => {

					const subDom = await this.dom(this.toAbsolute(dom(el).attr("href")), args);

					subDom(".list-by-word-body ul").first().find("li").each(async(i, el) => {

						if(subDom(el).find("a").attr("href").includes("#")) return;


						let title = trim(subDom(el).find("a").first().text().normalize());
						title = ltrim(title, "-");
						title.replace(/[^\u0000-\u007E]/g, "");

						let url = this.toAbsolute(subDom(el).find("a").first().attr("href"));
						novels[sha1(url)] = new Novel({
							title: title,
							url: url
						});
					});

					resolve(true);
				}));

			});


			await Promise.all(promises);
			return Promise.resolve(Object.values(novels));
	
		} catch (error) {
			return Promise.reject(error);
		}

	}

	async novel(url, args = {}) {

		try {
			const dom = await this.dom(url, args);
				
			const novel = new Novel();

			novel.title = trim(dom(".block-title h1").first().text().normalize());
			novel.title = ltrim(novel.title, "-");
			novel.title.replace(/[^\u0000-\u007E]/g, "");
			novel.image = this.toAbsolute(dom(".novel-cover img").first().attr("src"));
			novel.description = this.cleanContent(dom(".novel-right .novel-detail-item .novel-detail-body").first().html());
			novel.url = url;

			dom(".novel-detail-item").each((i, el) => {

				let name = trim(dom(el).find(".novel-detail-header").first().text());
				let content = dom(el).find(".novel-detail-body").first();

				if(name == "Genre") {
					content.find("a").each((i, el) => {
						novel.metadata.push(new Metadata({
							name: "genre",
							value: trim(dom(el).text()),
						}));
					});
				} 

				if(name == "Tags") {
					content.find("a").each((i, el) => {
						novel.metadata.push(new Metadata({
							name: "tag",
							value: trim(dom(el).text()),
						}));
					});
				}

				if(name == "Language") {
					novel.metadata.push(new Metadata({
						name: "language",
						value: trim(content.text()),
					}));
				}	

				if(name == "Author(s)") {
					content.find("a").each((i, el) => {
						novel.author.push(trim(dom(el).text()));
					});
				}

				if(name == "Artist(s)") {
					content.find("a").each((i, el) => {
						novel.metadata.push(new Metadata({
							name: "artist",
							value: trim(dom(el).text()),
						}));
					});
				}

				if(name == "Status") {
					novel.status = this.parseStatus(content.text());
				} 

				if(name == "Alternative Names") {
					content.find("a").each((i, el) => {
						novel.metadata.push(new Metadata({
							name: "title",
							value: trim(dom(el).text()),
						}));
					});
				}


				if(name == "Related Series") {
					content.find("a").each((i, el) => {
						novel.metadata.push(new Metadata({
							name: "relation",
							value: trim(dom(el).text()),
						}));
					});
				}


				if(name == "You May Also Like") {
					content.find("a").each((i, el) => {
						novel.metadata.push(new Metadata({
							name: "recommendation",
							value: trim(dom(el).text()),
						}));
					});
				}

				if(name == "Total Views") {
					novel.metadata.push(new Metadata({
						name: "views",
						value: trim(content.text()),
					}));
				}

				if(name == "Rating") {
					novel.metadata.push(
						new Metadata({
							name: "rating",
							value: parseFloat(trim(content.text())),
						})
					);
				}

			});

			dom(".chapter-chs").find("li a").each((i, el) => {
				novel.chapters.push(new Chapter({
					index: i,
					title: trim(dom(el).text()),
					url: this.toAbsolute(dom(el).attr("href")),
				}));
			});

			return Promise.resolve(novel);

		} catch (error) {
			return Promise.reject(error);
		}

	}

	async chapter(url, args = {}) {

		console.log(url);

		try {
			const dom = await this.dom(url, args);

			const chapter = new Chapter();

			chapter.title = dom(".chapter-content3 .desc").find("h1").first().text();
			chapter.url = url;

			chapter.content = "";

			dom(".chapter-content3 .desc").find("p").each((i, el) => {

				let content = trim(dom(el).text());
				
				if(!content) return;

				chapter.content += "<p>"+trim(dom(el).text()) + "</p>";
			});



			return Promise.resolve(chapter);

		} catch (error) {
			return Promise.reject(error);
		}





	}

}

module.exports = ReadLightNovelMe;