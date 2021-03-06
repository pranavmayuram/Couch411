//login.js

//modules ====================================
var couchbase 		= require('couchbase');
var N1qlQuery 		= require('couchbase').N1qlQuery;
var express			= require('express');
var app 			= express();
var bodyParser		= require('body-parser');
var methodOverride 	= require('method-override');
var morgan 			= require('morgan');
//var forge 			= require("node-forge");

app.use(bodyParser.urlencoded({extended:true, limit: '3mb'}));
app.use(bodyParser.json({limit: '3mb'}));
{limit: '3mb'}
//config =====================================
var port 		= process.env.PORT || 8080;
var cluster 	= new couchbase.Cluster('http://localhost:8091');	// could later add this to a config folder OR file
var bucket		= cluster.openBucket('loginData');
var imageBucket	= cluster.openBucket('userImages');
bucket.enableN1ql("http://localhost:8093");

//user operations ============================
console.log("hello couchbase");

app.post('/addUser', function(req, res) {
	console.log("hello");
	console.log(req.body);
	var primIndex=N1qlQuery.fromString("CREATE PRIMARY INDEX ON loginData");
	bucket.query(primIndex, function(err, result) {
		if (err) {
			console.log("Index already made on loginData, OK");
		}
		console.log(result);
		});
	var makelog=N1qlQuery.fromString("INSERT INTO loginData (KEY, VALUE) VALUES (\"" + req.body.uuid + "\"," + JSON.stringify(req.body) + ")");
	console.log(makelog);
	bucket.query(makelog, function(err, result) {
		if (err) {
			console.log(err);
			console.log("ERROR ON NODE QUERY");
		}
		res.json(result);
		});
});

app.post('/postImage', function (req, res) {
	console.log("in Node postImage");
	imageBucket.insert((req.body.uuid + "_pic"), req.body.base64, function (err, res) {
		if (err) {
		    console.log('operation failed', err);
		    return;
  		}
  		console.log('success');
	});
});

app.get('/getPic', function(req, res) {
	console.log("getting Node Image");
	imageBucket.get((req.query.metaID + "_pic"), function (err, result) {
		if(err) {
			console.log('image retrieval failed in Node', err);
			return;
		}
		res.send(result.value);
		console.log('image retrieved successfully in Node!');
	});
});

app.get('/checkLogin', function(req, res) {
	var checkEmailAddress=N1qlQuery.fromString("SELECT COUNT(*) AS numEmails FROM loginData WHERE email=\"" + req.query.email + "\" AND `securePassword`=\""+req.query.securePassword + "\"");
	console.log(checkEmailAddress);
	bucket.query(checkEmailAddress, function (err, result) {
		if (err) {
			console.log(err);
		}
		/*else {
			if (result.numEmails==0) {
				res.send("The username and password combination you entered does not exist.");
			}
			if (result.numEmails>0) {
				res.send("The")
			}
		} */
		res.json(result);
	});
});

app.post('/addLoginTime', function(req, res) {
	var addTime = N1qlQuery.fromString("UPDATE loginData SET loginTimes=ARRAY_PREPEND(\"" + req.body.currentTime + "\", loginTimes) WHERE email=\"" + req.body.email + "\"");
	console.log(addTime);
	bucket.query(addTime, function(err, result) {
		if(err) {
			console.log(err);
		}
		res.json(result);
	});
});

app.get('/emailAvailable', function(req, res) {
	var checkEmailAddress=N1qlQuery.fromString("SELECT COUNT(*) AS numEmails FROM loginData WHERE email=\"" + req.query.email + "\"");
	console.log(checkEmailAddress);
	bucket.query(checkEmailAddress, function (err, result) {
		if (err) {
			console.log(err);
		}
		/*else {
			if (result.numEmails==0) {
				res.send("The username and password combination you entered does not exist.");
			}
			if (result.numEmails>0) {
				res.send("The")
			}
		} */
		res.json(result);
	});
});

app.get('/emailAvailaboolean', function(req, res) {
	var checkEmailAddress=N1qlQuery.fromString("SELECT COUNT(*) AS numEmails FROM loginData WHERE email=\"" + req.query.email + "\"");
	console.log(checkEmailAddress);
	bucket.query(checkEmailAddress, function (err, result) {
		if (err) {
			console.log(err);
		}
		/*else {
			if (result.numEmails==0) {
				res.send("The username and password combination you entered does not exist.");
			}
			if (result.numEmails>0) {
				res.send("The")
			}
		} */
		res.json(result);
	});
});

app.get('/getUserInfo', function(req, res) {
	var hobbyQuery = N1qlQuery.fromString("SELECT * FROM loginData WHERE email=\"" + req.query.email + "\"");
	console.log(hobbyQuery);
	bucket.query(hobbyQuery, function (err, result) {
		if (err) {
			console.log(err);
		}
		res.json(result);
	});
});


app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules/node-forge'));
app.use(express.static(__dirname + '/node_modules/node-uuid'));
//Store all HTML files in public folder.

// start app =================================
app.get('*', function(req, res) {
	    console.log("getting to index.html"); // load the single view file (angular will handle the page changes on the front-end)
        res.sendfile('index.html');
    });
// startup our app at http://localhost:8080
app.listen(port);               

// inform user of IP                     
console.log('Login at localhost:8080');