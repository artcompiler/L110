/*
   Web service for compiling L106.
*/

var http = require('http');
var express = require('express')
var app = express();

app.set('port', (process.env.PORT || 5106));
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.send("Hello, L106!");
});

var compiler = require("./lib/compile.js");

app.get('/version', function(req, res) {
  console.log("GET /version " + compiler.version);
  res.send(compiler.version ? compiler.version : "v0.0.0");
});
app.get('/compile', function(req, res) {
  var data = "";
  req.on("data", function (chunk) {
    data += chunk;
  });
  req.on('end', function () {
    var src = JSON.parse(data).src;
    var obj = compiler.compile(src, function (err, val) {
      if (err) {
        res.send({
          error: err
        });
      } else {
        res.send(val);
      }
    });
  });
  req.on('error', function(e) {
    console.log(e);
    res.send(e);
  });
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
});

process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
});
