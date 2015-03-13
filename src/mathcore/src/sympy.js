/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2015 Learnosity Ltd. All Rights Reserved.
 *
 */
"use strict";
var express = require('express');
var util = require('util');
var _ = require('underscore');
var fs = require('fs');
var http = require('http');

// This module has no exports. It is executed to define Model.fn plugins.
var SymPy = (function () {
  var messages = Assert.messages;
  // Add messages here.
  Assert.reserveCodeRange(5000, 5999, "sympy");
  messages[5001] = "Operation not supported.";

  var worker;
  var server;

  function retrieve(str, resume) {
    //var port = "5" + language.substring(1);  // e.g. L103 -> 5103
    //var host = "localhost";
    var host = "frozen-inlet-8220.herokuapp.com";
    var port = "80";
    var data = [];
    var options = {
      host: host,
      port: port,
      path: "/eval?" + str,
    };
    var val;
    var req = http.get("http://" + options.host + options.path, function(res) {
      res.on("data", function (chunk) {
        console.log("retrieve() chunk=" + chunk);
        data.push(chunk);
      }).on("end", function () {
        console.log("retrieve() status=" + res.statusCode + " data=" + data);
        resume(null, data.join(""));
      }).on("error", function () {
        console.log("error() status=" + res.statusCode + " data=" + data);
      });
    });
  }

  function evaluate(str, resume) {
    var val;
    if (worker) {
      worker.addEventListener('message', resume, false);
      worker.postMessage(str);
    } else {
      retrieve(str, resume);
    }
    return val
  }

  function renderPython(node) {
  }

  function simplify(node, resume) {
    console.log("SymPy.simplify() node = " + JSON.stringify(node, null, 2));
    var args = node.toLaTex();
    console.log("SymPy.simplify() args = " + args);
    var result = evaluate("v=simplify(" + args + ")", resume);
    //return parsePython(result);
    return result;
  }

  return {
    simplify: simplify,
  }

  var RUN_SELF_TESTS = false;
  if (RUN_SELF_TESTS) {
    var env = {
    };
    trace("\nSymPy self testing");
    (function () {
    })();
  }
})();
