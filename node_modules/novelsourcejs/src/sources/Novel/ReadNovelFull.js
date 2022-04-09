
const SourceNovel = require("../SourceNovel");

const Novel = require("../../models/Novel");
const Metadata = require("../../models/Metadata");
const trim = require("locutus/php/strings/trim");
const empty = require("locutus/php/var/empty");
const Chapter = require("../../models/Chapter");

class ReadNovelFull extends SourceNovel {
	base_urls = ["https://readnovelfull.com/"];
	last_updated = "2022-03-02";

	async novels(args = {}) {
		return await this.search("*");
	}

	async novel(url, args = {}) {
		try {
			const dom = await this.dom(url, args);
				
			const novel = new Novel();

			novel.title = dom("h3.title").first().text();
			novel.image = this.toAbsolute(dom("div.book img").first().attr("src"));
			novel.id = dom("#rating").first().attr("data-novel-id");
			novel.description = this.cleanContent(dom("div[itemprop=description]").first().html());
			novel.url = url;

			novel.metadata.push(
				new Metadata({
					name: "rating",
					value: dom("input#rateVal").first().attr("value"),
				})
			);

			novel.metadata.push(
				new Metadata({
					name: "ratings",
					value: dom("span[itemprop=reviewCount]").first().text(),
				})
			);

			dom("ul.info.info-meta li").each((i, el) => {

				let name = dom(el).find("h3").text();
				dom(el).find("h3").remove();
				let value = dom(el).text();
		
				if(name.includes("Alternative names")) {

					let alternative_names = value.split(",");

					for(let i in alternative_names) {
						novel.metadata.push(
							new Metadata({
								name: "title",
								value: trim(alternative_names[i]),
							})
						);
					}
				}

				if(name.includes("Author")) {
					dom(el).find("a").each((i, el) => {
						novel.author.push(trim(dom(el).text()));
					});
				}
				

				if(name.includes("Genre")) {
					dom(el).find("a").each((i, el) => {
						novel.metadata.push(
							new Metadata({
								name: "genre",
								value: trim(dom(el).text()),
							})
						);
					});
				}

				if(name.includes("Source")) {
					dom(el).find("a").each((i, el) => {
						novel.metadata.push(
							new Metadata({
								name: "source",
								value: trim(dom(el).text()),
							})
						);
					});
				}

				if(name.includes("Status")) {
					novel.status = this.parseStatus(value);
				}

			});

			const chapters_url = this.base_urls[0]+"/ajax/chapter-archive?novelId=" + novel.id;

			if(!args.skipChapters) {
				try {
					const chaptersDom = await this.dom(chapters_url);

					chaptersDom("li a").each((i, el) => {
						novel.chapters.push(new Chapter({
							index: i,
							title: trim(dom(el).attr("title")),
							url: this.toAbsolute(dom(el).attr("href")),
						}));
					});
				} catch (error) {
					return Promise.reject(error);
				}
			}

			return Promise.resolve(novel);

		} catch (error) {
			return Promise.reject(error);
		}

	}

	async chapter(url, args = {}) {

		try {
			const dom = await this.dom(url, args);
		} catch (error) {
			return Promise.reject(error);
		}


		const chapter = new Chapter();

		chapter.title = dom("h2 a.chr-title").first().text();
		chapter.url = url;
		chapter.content = this.cleanContent(dom("#chr-content").first().html());

		return Promise.resolve(chapter);
	}

	async search(query, args = {}) {
		try {
			const dom = await this.dom(this.toAbsolute(this.base_urls[0])+"search?keyword="+query+"&page=1", args);

			const novels = [];
			const results = [];


			dom(".list-novel").first().find(".row").each((i, el) => {
				results.push(el);
			});

			if(dom(".pagination .last a").first().attr("href")) {
				const lastPage = dom(".pagination .last a").first().attr("href").split("page=")[1];

				for(let i = 2; i <= lastPage; i++) {
					try {
						const dom = await this.dom(this.toAbsolute(this.base_urls[0])+"search?keyword="+query+"&page="+i, args);

						dom(".list-novel").first().find(".row").each((i, el) => {
							results.push(el);
						});

					} catch (error) {
						return Promise.reject(error);
					}
				}
			}

			results.map((el) => {
				novels.push(new Novel({
					title: dom(el).find("h3.novel-title a").first().text(),
					url: this.toAbsolute(dom(el).find("h3.novel-title a").first().attr("href"))
				}));
			});

			return Promise.resolve(novels);
		} catch (error) {
			return Promise.reject(error);
		}
	}


}

module.exports = ReadNovelFull;