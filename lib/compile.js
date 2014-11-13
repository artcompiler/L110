/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/* Copyright (c) 2014, Art Compiler LLC */

var _ = require("underscore");
var model = require("./lib/model.js");

var transformer = function() {

  function print(str) {
    console.log(str);
  }

  var canvasWidth = 0
  var canvasHeight = 0
  var canvasColor = ""

  var ticket = 1000

  var table = {
    "PROG" : program,
    "EXPRS" : exprs,
    "STR": str,
    "EQUIV-SYNTAX": equiv_syntax,
  }

  var RADIUS = 100;
  var STEP_LENGTH = .1745;
  var leftX = 0, leftY = 0, rightX = 0, rightY = 0;
  var angle = 0;
  var penX, penY;
  var penState;
  var trackState;

  return {
    transform: transform,
    canvasWidth: function() {
      return canvasWidth;
    },
    canvasHeight: function() {
      return canvasHeight;
    },
    canvasColor: function() {
      return canvasColor;
    },
  };
  
  // CONTROL FLOW ENDS HERE

  var nodePool

  function reset() {
    angle = 0;
    leftX = RADIUS/2;
    leftY = 0;
    rightX = -RADIUS/2;
    rightY = 0;
    penX = 0;
    penY = 0;
    penState = false;
    trackState = false;
  }

  function transform(pool) {
    reset();
    nodePool = pool;
    return visit(pool.root);
  }

  function visit(nid, visitor) {
    // Get the node from the pool of nodes.
    var node = nodePool[nid];
    if (node == null) {
      return null;
    } else if (node.tag === void 0) {
      return [ ];  // clean up stubs
    } else if (visitor) {
      var visit = visitor[node.tag];
      if (visit) {
        return visit(node);
      } else {
        print("visit() visitor=" + visitor["visitor-name"] + " tag=" + node.tag + " not found!");
      }
    }

    if (isFunction(table[node.tag])) {
      // There is a visitor method for this node, so call it.
      return table[node.tag](node);
    } else {
      console.log("Missing method for " + node.tag);
      //throw "missing visitor method for " + node.tag;
    }
  }

  function isArray(v) {
    return _.isArray(v);
  }

  function isObject(v) {
    return _isObjet(v);
  }

  function isString(v) {
    return _.isString(v);
  }

  function isPrimitive(v) {
    return _.isNull(v) || _.isString(v) || _.isNumber(v) || _.isBoolean(v);
  }

  function isFunction(v) {
    return _.isFunction(v);
  }

  // BEGIN VISITOR METHODS

  var edgesNode;

  function str(node) {
    return node.elts[0]
  }

  function program(node) {
    var elts = [];
    elts.push(visit(node.elts[0]));
    return {
      "tag": "g",
      "elts": elts,
    };
  }

  function exprs(node) {
    var elts = []
    if (node.elts) {
      for (var i = 0; i < node.elts.length; i++) {
        elts.push(visit(node.elts[i]))
      }
    }
    if (elts.length===1) {
      return elts[0]
    }
    return {
      tag: "",
      //            class: "exprs",
      elts: elts
    }
  }

  function equiv_syntax(node) {
    console.log("equiv_syntax() node=" + JSON.stringify(node));
    var actual = +visit(node.elts[1]);
    var allowed = +visit(node.elts[0]);
    return {
      "tag": "ellipse",
      "cx": "100",
      "cy": "100",
      "rx": "50",
      "ry": "50",
      "style": "fill: red",
    };
  }

}()


var renderer = function() {

//  exports.render = render

  var scripts;

  return {
    render: render,
  }

  // CONTROL FLOW ENDS HERE
  function print(str) {
    console.log(str)
  }
  
  var nodePool

  function prefix() {
    scripts = "";

    return [ //'<?xml version="1.0" standalone="no"?>'
             //, '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" '
             //, '"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">'
             , '<html xmlns="http://www.w3.org/1999/xhtml">'
             , '<head>'
             , '<script src="http://code.jquery.com/jquery-1.11.0.min.js"></script>'
             , '<script src="http://d3js.org/d3.v3.js" charset="utf-8"></script>'
             , '<style>'
             , 'body : {'
             , ' margin: 0;'
             , '}'
             , '</style>'
             , '</head>'
             , '<body>'
             , '<div class="graffiti">'
             , '<svg'
             , '  viewBox="0 0 200 200"'
             , '  width="200" height="200"'
             , '  xmlns:xlink="http://www.w3.org/1999/xlink"'
             , '  xmlns="http://www.w3.org/2000/svg"'
             , '  font-family="Verdana"'
             , '  font-size="12"'
             , '  fill="#fff"'
             , '  stroke="#000"'
             , '  version="1.1"'
             , '  preserveAspectRatio="xMidYMid meet"'
             , '  overflow="hidden"'
             , '  clip="rect(50,50,50,50)"'
             , '  style="background:'+transformer.canvasColor()+'"' + '>'
             , '<g>'
           ].join("\n")
  }

  function suffix() {
    return [ ''
             , '</g>'
             , '</svg>'
             , '</div>'
             , '<script>'
             , '$(document).ready(function () {' + scripts + '})'
             , '</script>'
             , '</body>'
             , '</html>'
           ].join("\n")
  }

  function render(node) {
    //        nodePool = pool
    var str = ""
    str += prefix()
    str += visit(node, "  ")
    str += suffix()
    return str
  }

  function visit(node, padding) {

    console.log("render() node=" + JSON.stringify(node, null, 2));

    if (typeof node === "string") {
      return node
    }

    var tagName = node.tag
    var attrs = ""
    for (var name in node) {   // iterate through attributes
      if (name === "tag" || name === "elts") {
        continue;
      } else if (tagName === "path" && name === "d") {
        attrs += " d='" + node[name] + "'"
        continue;
      }
      attrs += " " + name + "='" + node[name] + "'"
    }

    if (attrs.length === 0) {
      var indent = ""
    } else {
      var indent = "   "
    }

    var elts = ""
    if (node.elts) {
      for (var i = 0; i < node.elts.length; i++) {
        if (node.elts[i]) {  // skip empty elts
          elts += visit(node.elts[i], padding+indent)
        }
      }
    }

    if (tagName === "g" && attrs.length === 0) {   // skip g elements without attrs
      var tag = elts
    } else if (tagName === "script" && node.elts.length === 1) {
      scripts += "\n" + node.elts[0] + ";";
    } else {
      var tag = "\n"+padding+"<" + tagName + attrs + ">" + elts + "\n"+padding+"</" + tagName + ">"
    }
    return tag
  }

}()


exports.compiler = function () {
  exports.compile = compile;
  function compile(src) {
    console.log("compiler.compile() src=" + JSON.stringify(src, null, 2));
    return renderer.render(transformer.transform(src));
  }
}();
