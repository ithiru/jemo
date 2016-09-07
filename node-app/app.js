var express = require('express');
var path = require('path');
var mysql = require('mysql');
var async = require('async');
var app = express();
var exphbs  = require('express-handlebars');
var logger = require('morgan');
require('dotenv').config();

var chapterSelect = 'SELECT bk.name bk_name, bk.slug book_slug, ' +
					' vol.name vol_name, vol.slug vol_slug, ' +
					'pt.name part_name, cpt.chapter_no, cpt.name chapter_name, cpt.id, cpt.content ';
					
var bookDetailSql = 
				'  FROM thiru.book_detail bd ' + 
				' INNER JOIN thiru.book bk ' + 
				'    ON bd.book_id = bk.id ' + 
				'  LEFT OUTER JOIN thiru.volume vol ' + 
				'    ON vol.id = bd.volume_id ' + 
				'  LEFT OUTER JOIN thiru.part pt ' + 
				'    ON pt.id = bd.part_id ' + 
				'  LEFT OUTER JOIN thiru.chapter cpt '+
				'    ON cpt.id = bd.chapter_id ';
				
var bookSelect = 'SELECT bk.name bk_name, bk.slug book_slug, ' +
					' vol.name vol_name, vol.slug vol_slug, ' +
					'pt.name part_name, cpt.chapter_no, cpt.name chapter_name, cpt.id ';
					
var bookSql =   bookSelect +
				bookDetailSql +
				' WHERE bk.slug = ? ' + 
				' ORDER BY bd.id';
					
var bookVolumeSql =   bookSelect +
				bookDetailSql +
				' WHERE bk.slug = ? ' + 
				'   AND vol.slug = ? ' + 
				' ORDER BY bd.id';
				
var chapterSql = chapterSelect +
				 bookDetailSql +
				' WHERE bk.slug = ? ' + 
				'   AND vol.slug = ? ' + 
				'   AND cpt.chapter_no >= ? '+
				'   AND cpt.chapter_no <= ? ' + 
				' ORDER BY bd.id';
				
var volumesSql = 'SELECT DISTINCT bk.slug book_slug, vol.name vol_name, vol.slug vol_slug ' + 
				bookDetailSql +
				' WHERE bk.slug = ? ' + 
				'   AND vol.name IS NOT NULL' +
				' ORDER BY bd.id';				

var pool = mysql.createPool({
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASS,
  database : process.env.DB_NAMS
});

app.use(express.static(path.join(__dirname, '/public'), {etag: false}));;
app.use(logger("combined"));
app.set('port', process.env.PORT || 8082);
app.engine('handlebars', exphbs({defaultLayout: 'zurbf'}));
//app.engine('handlebars', exphbs({defaultLayout: 'zurbf'}));
app.set('view engine', 'handlebars');


function getData(sql, book, volume, chapter, callback) {
	var data = {};
	var conn = null;
	async.waterfall([
		function(callback) {
			//console.log("Getting Connection");
			pool.getConnection(callback);
		},
		function(connection, callback) {
			conn = connection;
			//console.log("Running Query " + sql);
			connection.query(sql, [book, volume, chapter - 1, chapter + 1], callback);
		},
		function(row, fields, callback) {
			//console.log("Getting Data");
			callback(null, row)
		}
	], function(err, result) {
		//console.log("Completed");
		//console.log(err);
		//console.log(result);
		if (conn != null) {
			conn.release();
		}
		callback(err, result);
	});
}

function getTitle(row) {
}

app.get('/', function(req, res){
	res.render('home', {
		caption: 'ஜெயமோகன்',
		smallcaption: 'படைப்புகள்'
	});
});

app.get('/jeyamohan', function(req, res){
	res.render('jeyamohan', {
		caption: 'ஜெயமோகன்',
		smallcaption: 'அறிமுகம்',
		title: 'ஜெயமோகன் - அறிமுகம்'
	});
});


app.get('/help', function(req, res){
	res.render('joyride', {
		caption: 'ஜெயமோகன்',
		smallcaption: 'அறிமுகம்',
		title: 'ஜெயமோகன் - அறிமுகம்',
		help: true
	});
});

app.get('/:book/', function(req, res){
  console.log('Book ' + req.params.book);
  
	var data = {};
	async.waterfall([
		function(callback) {
			console.log("Getting Connection");
			getData(volumesSql, req.params.book, null, null, callback);
		},
		function(rows, callback) {
			data.volumes = rows;
			getData(bookSql, req.params.book, null, null, callback);
		},
		function(rows, callback) {
			data.chapters = rows;
			callback(null, data);
		},
		function(data, callback) {
			if (data.volumes.length > 0 && data.chapters.length > 0) {
				res.render('book',  { 	
						caption: data.chapters[0].bk_name,
						smallcaption: 'ஜெயமோகன்',
						data: data.chapters,
						volumes: data.volumes,
						book_slug : data.volumes[0].book_slug,
						title: data.chapters[0].bk_name
					});		
			} else {
				res.render('404');
			}
			callback(null);
		}
	]);
});

app.get('/:book/:volume/', function(req, res){
  console.log('Book ' + req.params.book + " ==> " + req.params.volume);
  getData(bookVolumeSql, req.params.book, req.params.volume, null, function(err, rows) {
		if (rows.length > 0) {	
			//console.log(rows);
			res.render('volume',  { 	
					caption: rows[0].bk_name + " - " + rows[0].vol_name,
					smallcaption: 'ஜெயமோகன்',
					data: rows,
					book: { slug: rows[0].book_slug, name: rows[0].bk_name },
					title: rows[0].bk_name + " - " + rows[0].vol_name,
					volume: req.params.volume
				});
		} else {
			res.render('404');		
		}
  });
});

app.get('/:book/:volume/:chapter', function(req, res){
  console.log('Book ' + req.params.book + " ==> " + req.params.volume + " ==> " + req.params.chapter);
  getData(chapterSql, req.params.book, req.params.volume, req.params.chapter, function(err, row) {
  
		if (row.length > 0) {	  
			//console.log(row);
			var data = {};
			var loc = 0;

			if (row.length > 0) {
				if (row[loc].chapter_no <  req.params.chapter) {
					data.prev = row[loc++];
					//console.log("Prev Chapter " + data.prev.chapter_no);
				}
				if (row.length > loc && row[loc].chapter_no ==  req.params.chapter) {
					data.current = row[loc++];
					//console.log("Current Chapter " + data.current.chapter_no);
				}
				if (row.length > loc && row[loc].chapter_no >  req.params.chapter) {
					data.next = row[loc];
					//console.log("Next Chapter " + data.next.chapter_no);		
				}			
				//console.log(data);
			} 
			res.render('index',  { 	
					caption: 'வெண்முரசு',
					smallcaption: 'ஜெயமோகன்',
					title: data.current.bk_name + " - " + data.current.vol_name + " - " + 
							(data.current.part_name ? data.current.part_name : "") + 
							(data.current.chapter_name == null ? "" : " - " + data.current.chapter_name), 
					content: data.current.content,
					current: data.current,
					prevLink: (data.prev ? data.prev.book_slug + "/" + data.prev.vol_slug + "/" + data.prev.chapter_no : null),
					nextLink: (data.next ? data.next.book_slug + "/" + data.next.vol_slug + "/" + data.next.chapter_no : null),
					prev: data.prev,
					next: data.next
				});
		} else {
			res.render('404');		
		}				
  });
});

var server = app.listen(process.env.PORT || 8082, function() {
	console.log('Listening on port %d', server.address().port);
});

app.use(function(err, req, res, next){
	console.error(err.stack);
	res.send(500, 'An error has occurred. Please try again later.');
});

function errorHandler(err, req, res, next) {
	res.status(500);
	res.render('app_error', { error: err });
}
