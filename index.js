const NSJS = require('novelsourcejs');
const NovelSource = new NSJS();

// ======================================================
// Express
// ======================================================
// install express with `npm install express` 
const express = require('express');
const compression = require('compression');
const cors = require('cors');
const { base64_decode } = require('locutus/php/url');
const app = express();

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

	let url = base64_decode(req.params.url);
	
	try {
		let chapter;
		const source = NovelSource.locateSource(url);

		if(source) {
			chapter = await source.chapter(url);
		}

		if(chapter) {
			res.writeHead(200, {'Content-Type':  'application/json' });
			res.write(JSON.stringify({
				live: true,
				title: chapter.title,
				paragraphs: chapter.content,
				url: chapter.url,
			}));
			res.end();
		} else {
			res.status(404);
			res.send('');
		}

		delete source;
		delete chapter;


	} catch (error) {
		res.status(404);
		res.send('');
	}


});

app.listen(3000);

// export 'app'
module.exports = app