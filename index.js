// Allocating os module
const os = require('os');

const cacheFile = os.tmpdir()+'/novelsourcejs-cache';

const cache = require('node-file-cache').create({ 
	file: cacheFile,
	life: 60*15,
});

console.log("cacheFile:", cacheFile);

cache.expire((record) => {
    // hook your logic here
    return true; // if record should be removed
});
console.log("cacheCleaned!");


const NSJS = require('novelsourcejs');
let NovelSource = new NSJS();	







// ======================================================
// Express
// ======================================================
// install express with `npm install express` 
const express = require('express');
const compression = require('compression');
const cors = require('cors');
const { base64_decode } = require('locutus/php/url');
const app = express();
const port = process.env.PORT || 3000;

app.use(compression());

const allowedOrigins = [
	'capacitor://localhost',
	'ionic://localhost', 
	'http://localhost',
	'http://localhost:8080',
	'http://localhost:8100',
	'http://192.168.10.99:8080',
	'*',
  ];
  
// Reflect the origin if it's in the allowed list or not defined (cURL, Postman, etc.)
const corsOptions = {
	origin: (origin, callback) => {
	  if (allowedOrigins.includes(origin) || !origin) {
		callback(null, true);
	  } else {
		callback(new Error('Origin not allowed by CORS'));
	  }
	},
  };
  
// Enable preflight requests for all routes
app.options('*', cors(corsOptions));
// ======================================================

// ======================================================
// ===================== ROUTES =========================
// ======================================================

app.get('/', cors(corsOptions), async (req, res) => {
	res.send('NovelNinja CORS Proxy OK!')
});

app.get('/:url', cors(corsOptions), async (req, res) => {

	console.log("----------------------------------------------------");
	console.log("request:", req.params.url);

	let chapter;
	let url = base64_decode(req.params.url);

	if(cache.get(req.params.url) !== null) {
		
		console.log("Cache hit!", url);

		try {

			chapter = cache.get(req.params.url);
			res.writeHead(200, {'Content-Type':  'application/json' });
			res.write(JSON.stringify({
				live: true,
				title: chapter.title,
				paragraphs: chapter.content,
				url: chapter.url,
			}));

		} catch (error) {
			res.status(404);
			res.send('');
		}

		res.end();

	} else {

		console.log("Cache miss!", url);

		try {

			let source = NovelSource.locateSource(url);
	
			if(source) {
				chapter = await source.chapter(url);
			}
	
			if(chapter) {

				cache.set(req.params.url, chapter);

				res.writeHead(200, {'Content-Type':  'application/json' });
				res.write(JSON.stringify({
					live: true,
					title: chapter.title,
					paragraphs: chapter.content,
					url: chapter.url,
				}));
			} else {
				res.status(404);
				res.send('');
			}
	
		} catch (error) {
			res.status(404);
			res.send('');
		}

		res.end();

	}

	const used = process.memoryUsage().heapUsed / 1024 / 1024;
	console.log(`The request uses approximately ${Math.round(used * 100) / 100} MB`);

	console.log("----------------------------------------------------");


});

app.listen(port, () => {
	console.log(`novelsource-proxy listening at http://localhost:${port}`);
});