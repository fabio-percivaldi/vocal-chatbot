var express = require('express')
var watson = require('watson-developer-cloud');
var app = express();
var fs = require('fs');
var bodyParser = require('body-parser')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

var authorization = new watson.AuthorizationV1({
  username: 'f83b60a9-2ada-4d62-a083-696f0de16674',
  password: 'EM14UPlKn2nO',
  url: watson.SpeechToTextV1.URL
});

app.get("/api/fetch-token", function (request, response) {
	authorization.getToken(function (err, token) {
		if (!token) {
			console.log('error:', err);
			response.send("errore");
		} else {
			console.log(token);
			response.send(token);
		}
	});
});

app.use(express.static('index'));



var port = process.env.PORT || 3000
app.listen(port, function() {
    console.log("To view your app, open this link in your browser: http://localhost:" + port);
});