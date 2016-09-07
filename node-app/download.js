var fs = require('fs'),
    request = require('request');
var mysql = require('mysql');
var async = require('async');
var cheerio = require('cheerio');
var url = require('url');
var path = require('path');
var easyImg = require('easyimage');
require('dotenv').config();

var chapterSelect = 'SELECT bk.slug book_slug, ' +
					' vol.slug vol_slug, ' +
					' cpt.id, cpt.hash ' +
				'  FROM thiru.book_detail bd ' + 
				' INNER JOIN thiru.book bk ' + 
				'    ON bd.book_id = bk.id ' + 
				'  LEFT OUTER JOIN thiru.volume vol ' + 
				'    ON vol.id = bd.volume_id ' + 
				'  LEFT OUTER JOIN thiru.part pt ' + 
				'    ON pt.id = bd.part_id ' + 
				'  LEFT OUTER JOIN thiru.chapter cpt '+
				'    ON cpt.id = bd.chapter_id ' +
				' WHERE bk.slug = ? ' + 
				"   AND vol.slug = 'mazhaippadal'" + 
				' ORDER BY bd.id';	
				
var pool = mysql.createPool({
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASS,
  database : process.env.DB_NAMS
});
				
function getData(sql, book, callback) {
	var data = [{ hash: '7aa66fe57612229897ca19b4ac7eeb2f', book_slug: 'venmurasu', vol_slug: 'mutharkanal', id: 345}];
	var conn = null;
	//callback(null, data);

	async.waterfall([
		function(callback) {
			console.log("Getting Connection");
			pool.getConnection(callback);
		},
		function(connection, callback) {
			conn = connection;
			console.log("Running Query " + sql);
			connection.query(sql, [book], callback);
		},
		function(row, fields, callback) {
			console.log("Getting Data");
			callback(null, row)
		}
	], function(err, result) {
		if (conn != null) {
			conn.release();
		}
		callback(err, result);
	});
}
				
var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    //console.log('content-type:', res.headers['content-type']);
    //console.log('content-length:', res.headers['content-length']);
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

getData(chapterSelect, 'venmurasu', function(err, data) {
	async.eachSeries(data, function(chapter, acallback) {
		async.waterfall([
			function(callback) {
				console.log("Processing " + chapter.hash);
				var page = fs.readFileSync("offline/" + chapter.hash);
				callback(null, page);
			},
			function(page, callback) {
				$ = cheerio.load(page);
				var images = $('img', 'div[class=entry-content]').toArray();
				async.eachSeries(images, function(image, scallback) {
					if (!fs.existsSync("public/" + chapter.book_slug)) {
						fs.mkdirSync("public/" + chapter.book_slug);
					}					
					async.waterfall([
						function(callback) {
							var imageUrl = image.parent.attribs.href == null ? image.attribs.src : image.parent.attribs.href;
							console.log(chapter.book_slug, chapter.vol_slug, chapter.id, imageUrl);
							var folder = "public/" + chapter.book_slug + "/" + chapter.vol_slug;
							if (!fs.existsSync(folder)) {
								fs.mkdirSync(folder);
							}
							if (!fs.existsSync(folder + "/tn")) {
								fs.mkdirSync(folder + "/tn");
							}							
							var extn = path.extname(url.parse(imageUrl).path);	
							var file = folder + "/" + chapter.id + extn; 
							if (!fs.existsSync(file)) {
								download(imageUrl, folder + "/" + chapter.id + extn, function() {
									console.log('Downloaded and Sleeping ' + imageUrl);
									//sleep(5000);
									callback(null, folder, chapter.id, extn);
								});
							} else {
								console.log('Already downloaded ' + imageUrl);
								callback(null, folder, chapter.id, extn);
							}
						},
						function(folder, id, extn, callback) {
							console.log("Resizing...", chapter.book_slug, chapter.vol_slug, 
								chapter.id, folder + "/" + id + extn, folder + "/tn/" + id + extn);
							easyImg.info(folder + "/" + id + extn).then(
							  function(file) {
								console.log(file);
								easyImg.resize({
									src:folder + "/" + id + extn,
									dst:folder + "/tn/" + id + extn,
									width:700, height:700,
									x:0, y:0
								});									
							  }, function (err) {
								console.log(id, err);
							  }
							);								
							callback(null, null);
						}
					],
					function(err, result) {
						scallback();
					});
				});				
				callback(null, null);
			}
		], function(err, result) {
			//console.log("Completed async");
			acallback();
		});
	});
});
