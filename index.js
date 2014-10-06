/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
   Web service for compiling L102.
*/

var express = require('express')
var app = express();
var http = require('http');

app.set('port', (process.env.PORT || 5102));
app.use(express.static(__dirname + '/lib'));

app.get('/', function(req, res) {
  res.send("Hello, L102!");
});

var compiler = require("./lib/compile.js");

app.get('/compile', function(req, res) {
  var data = "";
  req.on("data", function (chunk) {
    data += chunk;
  });
  req.on('end', function () {
    console.log("/compile data=" + data);
    var src = JSON.parse(data).src;
    var obj = compiler.compile(src);
    res.send(obj);
  });
  req.on('error', function(e) {
    console.log(e);
    res.send(e);
  });
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
});
