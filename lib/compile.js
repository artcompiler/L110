/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/* Copyright (c) 2014, Art Compiler LLC */

var _ = require("underscore");
var requirejs = require("requirejs");
var MathCore = requirejs("./lib/mathcore.js");
var Model = MathCore.Model;
var Ast = MathCore.Ast;
var trace = console.log;
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
    "LIST" : list,
    "CALL" : callExpr,
    "BOOL" : bool,
    "NUM" : num,
    "STR" : str,
    "PARENS" : parens,
    "IDENT" : ident,

    "EQUIVSYM" : equivSymbolic,
    "SIMPLIFY" : simplify,
    "EXPAND" : expand,

    "MATH-RAND" : random,
    "RAND" : random,
    "PLUS" : plus,
    "CONCAT" : concat,
    "MINUS" : minus,
    "TIMES" : times,
    "FRAC" : frac,
    "EXPO" : expo,

    "ADD" : add,
    "SUB" : sub,
    "MUL" : mul,
    "DIV" : div,

    "PI": pi,
    "COS": cos,
    "SIN": sin,
    "ATAN": atan,

    "SELECT": select,
    "SELECTALL": select_all,
    "NTH-CHILD": nth_child,
  }

  var RADIUS = 100;
  var STEP_LENGTH = .1745;
  var leftX = 0, leftY = 0, rightX = 0, rightY = 0;
  var angle = 0;
  var penX, penY;
  var penState;
  var trackState;

  var mathValueVisitor = MathValueVisitor();
  

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
    var node;
    if (nid === +nid) {
      node = nodePool[nid];
    } else {
      node = nid;
    }
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
      // There is a default visitor method for this node, so call it.
      return table[node.tag](node);
    } else {
      console.log("Missing method for " + node.tag);
//      throw "missing visitor method for " + node.tag;
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

  function program(node) {
    var elts = [ ]
    elts.push(visit(node.elts[0]))
    return MathCore.getRecord();
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

  function list(node) {
    var elts = []
    if (node.elts) {
      for (var i = 0; i < node.elts.length; i++) {
        elts.push(visit(node.elts[i]))
      }
    }
    return elts[0].elts;
  }

  function callExpr(node) {
    var name = visit(node.elts.pop())
    var elts = []
    for (var i = node.elts.length-1; i >= 0; i--) {
      elts.push(visit(node.elts[i]))
    }
    return {
      "tag": name,
      "elts": elts
    }
  }
  
  function random(node) {
    var elts = [];
    var min = +visit(node.elts[0]);
    var max = +visit(node.elts[1]);
    if (max < min) {
      var t = max;
      max = min;
      min = t;
    }
    var rand = Math.random();
    var num = min + Math.floor((max-min)*rand);
    return num;
  }

  function concat(node) {
    var v2 = visit(node.elts[0]);
    var v1 = visit(node.elts[1]);
    return "" + v2 + v1;
  }

  function plus(node) {
    var v2 = visit(node.elts[0]);
    var v1 = visit(node.elts[1]);
    return v1 + "+" + v2;
  }

  function minus(node) {
    var v2 = visit(node.elts[0]);
    var v1 = visit(node.elts[1]);
    return v1 + "-" + v2;
  }

  function times(node) {
    var v2 = visit(node.elts[0]);
    var v1 = visit(node.elts[1]);
    return v1 + " \\times " + v2;
  }

  function frac(node) {
    var v1 = visit(node.elts[1]);
    var v2 = visit(node.elts[0]);
    return "\\frac{" + v1 + "}{" + v2 + "}";
  }

  function add(node) {
    return visit(node, mathValueVisitor);
  }

  function sub(node) {
    return visit(node, mathValueVisitor);
  }

  function mul(node) {
    return visit(node, mathValueVisitor);
  }

  function div(node) {
    return visit(node, mathValueVisitor);
  }

  function expo(node) {
    var v2 = visit(node.elts[0]);
    var v1 = visit(node.elts[1]);
    return v1 + "^{" + v2 + "}";
  }

  function toHexString(n, size) {
    if (n < 0 && n > -0x8000) {
      // Encode negatives as signed integers
      n = 0x10000 + n;
    }
    var str = n.toString(16).toUpperCase();
    if (str.length > size) {
      console.log("ERROR toHexString() value to large: " + n);
    }
    var padding = "";
    for (var i = size - str.length; i > 0; i--) {
      padding += "0";
    }
    return padding + str;
  }

  function equivSymbolic(node) {
    try {
      var nd1 = Model.create(visit(node.elts[0]));
      var nd2 = Model.create(visit(node.elts[1]));
      var val = nd1.equivSymbolic(nd2);
    } catch (x) {
      console.log(x);
      console.log(x.stack);
    }
  }

  function simplify(node) {
    try {
      var nd1 = Model.create(visit(node.elts[0]));
      var val = nd1.isSimplified();
    } catch (x) {
      console.log(x);
      console.log(x.stack);
    }
  }

  function expand(node) {
    try {
      var nd1 = Model.create(visit(node.elts[0]));
      var val = nd1.isExpanded();
    } catch (x) {
      console.log(x);
      console.log(x.stack);
    }
  }

  function penUp() {
    penState = false;
  }

  function penDown() {
    penState = true;
  }

  function showTrack() {
    trackState = true;
  }

  function polarToCartesian(centerX, centerY, radiusX, radiusY, angleInDegrees) {
    var angleInRadians = angleInDegrees * Math.PI / 180.0;
    var x = centerX + radiusX * Math.cos(angleInRadians);
    var y = centerY + radiusY * Math.sin(angleInRadians);
    return [x,y];
  }

  function text(node) {
    var elts = []
    var str = ""+visit(node.elts[0])
    elts.push(str)
    return {
      "tag": "text",
      "elts": elts,
    }
  }

  function genSym(str) {
    ticket += 1
    return str+"-"+ticket
  }

  function ident(node) {
    return node.elts[0]
  }

  function bool(node) {
    return node.elts[0]
  }

  function num(node) {
    return node.elts[0]
  }

  function str(node) {
    return node.elts[0]
  }

  function parens(node) {
    var v1 = visit(node.elts[0]);
    return "(" + v1 + ")";
  }

  function pi(node) {
    return "\\pi"
  }

  function cos(node) {
    var v1 = visit(node.elts[0]);
    return "\\cos" + v1;
  }

  function sin(node) {
    var v1 = visit(node.elts[0]);
    return "\\sin" + v1;
  }

  function atan(node) {
    var v1 = visit(node.elts[0]);
    return "\\atan" + v1;
  }

  function stub(node) {
    return ""
  }

  function select(node) {
    var args = [];
    node.elts.forEach(function (arg) {
      args.push(visit(arg));
    });
    var selector = args[1];
    var list = args[0];
    var result = "";
    switch (selector[0]) {
    case "nth-child":
      result = list[selector[1]];
      break;
    default:
      break;
    }
    return result;
  };

  function select_all(node) {
    var args = [];
    node.elts.forEach(function (arg) {
      args.push(visit(arg, d3Visitor));
    });
    var target = args[0];
    return target + ".selectAll(" + args[1] + ")";
  };

  function nth_child(node) {
    var args = [];
    node.elts.forEach(function (arg) {
      args.push(visit(arg));
    });
    var index = args[0];
    return ["nth-child", index];
  };

  function MathValueVisitor () {
    function expo(node) {
      var args = [];
      node.elts.forEach(function (arg) {
        args.push(visit(arg, mathValueVisitor));
      });
      return Math.pow(+args[1], +args[0]);
    }
    function mul(node) {
      var args = [];
      node.elts.forEach(function (arg) {
        args.push(visit(arg, mathValueVisitor));
      });
      return +args[1] * +args[0];
    }
    function div(node) {
      var v1 = visit(node.elts[0], mathValueVisitor);
      var v2 = visit(node.elts[1], mathValueVisitor);
      return +v1 / +v2;
    }
    function add(node) {
      var args = [];
      node.elts.forEach(function (arg) {
        args.push(visit(arg, mathValueVisitor));
      });
      return +args[1] + +args[0];
    }
    function sub(node) {
      var args = [];
      node.elts.forEach(function (arg) {
        args.push(visit(arg, mathValueVisitor));
      });
      return +args[1] - +args[0];
    }
    function num (node) {
      return +node.elts[0];
    }
    function pi(node) {
      return Math.PI;
    }
    function cos(node) {
      var v1 = visit(node.elts[0], mathValueVisitor);
      return Math.cos(+v1);
    }
    function sin(node) {
      var v1 = visit(node.elts[0], mathValueVisitor);
      return Math.sin(+v1);
    }
    function atan(node) {
      var v1 = visit(node.elts[0], mathValueVisitor);
      return Math.atan(+v1);
    }
    function parens(node) {
      var v1 = visit(node.elts[0], mathValueVisitor);
      return +v1;
    }
    return {
      "visitor-name": "MathValueVisitor",
      "EXPO": expo,
      "NUM": num,
      "MUL": mul,
      "DIV": div,
      "ADD": add,
      "SUB": sub,
      "PI": pi,
      "COS": cos,
      "SIN": sin,
      "ATAN": atan,
      "PARENS": parens,
    };
  }

}()


var renderer = function() {

  var scripts;

  return {
    render: render,
  }

  // CONTROL FLOW ENDS HERE
  function print(str) {
    console.log(str)
  }
  
  var nodePool

  function render(node) {
    var str = ""
    str += visit(node, "  ")
    return str
  }

  function visit(node) {
    if (typeof node === "string") {
      return node
    }
    var tagName = node.tag
    var elts = ""
    if (node.elts) {
      for (var i = 0; i < node.elts.length; i++) {
        if (node.elts[i]) {  // skip empty elts
          elts += visit(node.elts[i])
        }
      }
    }
    return tagName + elts
  }

}();

exports.compiler = function () {
  exports.compile = compile;
  function compile(src) {
    try {
      return renderer.render(transformer.transform(src));
    } catch (x) {
    }
  }
}();


