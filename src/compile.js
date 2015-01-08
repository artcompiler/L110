/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/* Copyright (c) 2014, Art Compiler LLC */
var _ = require("underscore");
import MathCore from "./mathcore/lib/mathcore";

var transformer = function() {
  function print(str) {
    console.log(str);
  }
  var table = {
    "PROG" : program,
    "EXPRS" : exprs,
    "STR": str,
    "NUM": num,
    "IDENT": ident,
    "BOOL": bool,
    "LIST" : list,
    "NOT": not,
    "EQUIV-SYNTAX": equivSyntax,
    "EQUIV-LITERAL": equivLiteral,
    "EQUIV-SYMBOLIC": equivSymbolic,
    "EQUIV-VALUE": equivValue,
    "IS-FACTORISED": isFactorised,
    "IS-SIMPLIFIED": isSimplified,
    "IS-EXPANDED": isExpanded,
    "INVERSE-RESULT": inverseResult,
    "DECIMAL-PLACES": decimalPlaces,
  };
  var nodePool;
  function reset() {
  }
  function transform(pool) {
    reset();
    nodePool = pool;
    return visit(pool.root);
  }
  function visit(nid, options) {
    // Get the node from the pool of nodes.
    var node = nodePool[nid];
    if (node == null) {
      return null;
    } else if (node.tag === void 0) {
      return [ ];  // clean up stubs
    }
    if (isFunction(table[node.tag])) {
      // There is a visitor method for this node, so call it.
      return table[node.tag](node, options);
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

  function str(node, options) {
    return node.elts[0]
  }

  function num(node, options) {
    return node.elts[0]
  }

  function ident(node, options) {
    return node.elts[0]
  }

  function bool(node, options) {
    return node.elts[0]
  }

  function list(node, options) {
    var elts = visit(node.elts[0], options);
    if (!(elts instanceof Array)) {
      elts = [elts];
    }
    return elts;
  }

  function program(node) {
    var options = {};
    return visit(node.elts[0], options);
  }

  function exprs(node, options) {
    var elts = []
    if (node.elts) {
      for (var i = 0; i < node.elts.length; i++) {
        elts.push(visit(node.elts[i], options));
      }
    }
    return elts;
  }

  // Get or set an option on a node.
  function option(options, id, val) {
    var old = options[id];
    if (val !== undefined) {
      options[id] = val;
    }
    return old;
  }

  function equivSyntax(node, options) {
    var reference = visit(node.elts[1], options);
    var response = visit(node.elts[0], options);
    var result = false;
    if (response) {
      result = MathCore.evaluateVerbose({
        method: "equivSyntax",
        options: options,
        value: reference,
      }, response);
    }
    return {
      score: result.result ? 1 : -1,
      response: response,
      json: {
        "validation": {
          "scoring_type": "exactMatch",
          "valid_response": {
            "score": 1,
            "value": [{
              "method": "equivSyntax",
              "value": reference,
              "options": options,
            }]
          }
        }
      },
    };
  }

  function equivLiteral(node, options) {
    var reference = visit(node.elts[1], options);
    var response = visit(node.elts[0], options);
    var result = false;
    if (response) {
      result = MathCore.evaluateVerbose({
        method: "equivLiteral",
        options: options,
        value: reference,
      }, response);
    }
    return {
      score: result.result ? 1 : -1,
      response: response,
      json: {
        "validation": {
          "scoring_type": "exactMatch",
          "valid_response": {
            "score": 1,
            "value": [{
              "method": "equivLiteral",
              "value": reference,
              "options": options,
            }]
          }
        }
      },
    };
  }

  function equivSymbolic(node, options) {
    var reference = visit(node.elts[1], options);
    var response = visit(node.elts[0], options);
    var result = false;
    if (response) {
      result = MathCore.evaluateVerbose({
        method: "equivSymbolic",
        options: options,
        value: reference,
      }, response);
    }
    return {
      score: result.result ? 1 : -1,
      response: response,
      json: {
        "validation": {
          "scoring_type": "exactMatch",
          "valid_response": {
            "score": 1,
            "value": [{
              "method": "equivSymbolic",
              "value": reference,
              "options": options,
            }]
          }
        }
      },
    };
  }

  function equivValue(node, options) {
    var reference = visit(node.elts[1], options);
    var response = visit(node.elts[0], options);
    var result = false;
    if (response) {
      result = MathCore.evaluateVerbose({
        method: "equivValue",
        options: options,
        value: reference,
      }, response);
    }
    return {
      score: result.result ? 1 : -1,
      response: response,
      json: {
        "validation": {
          "scoring_type": "exactMatch",
          "valid_response": {
            "score": 1,
            "value": [{
              "method": "equivValue",
              "value": reference,
              "options": options,
            }]
          }
        }
      },
    };
  }

  function isFactorised(node, options) {
    var response = visit(node.elts[0], options);
    var result = false;
    if (response) {
      result = MathCore.evaluateVerbose({
        method: "isFactorised",
        options: options,
      }, response);
    }
    return {
      score: result.result ? 1 : -1,
      response: response,
      json: {
        "validation": {
          "scoring_type": "exactMatch",
          "valid_response": {
            "score": 1,
            "value": [{
              "method": "isFactorised",
              "options": options,
            }]
          }
        }
      },
    };
  }

  function isSimplified(node, options) {
    var response = visit(node.elts[0], options);
    var result = false;
    if (response) {
      result = MathCore.evaluateVerbose({
        method: "isSimplified",
        options: options,
      }, response);
    }
    return {
      score: result.result ? 1 : -1,
      response: response,
      json: {
        "validation": {
          "scoring_type": "exactMatch",
          "valid_response": {
            "score": 1,
            "value": [{
              "method": "isSimplified",
              "options": options,
            }]
          }
        }
      },
    };
  }

  function isExpanded(node, options) {
    var response = visit(node.elts[0], options);
    var result = false;
    if (response) {
      result = MathCore.evaluateVerbose({
        method: "isExpanded",
        options: options,
      }, response);
    }
    return {
      score: result.result ? 1 : -1,
      response: response,
      json: {
        "validation": {
          "scoring_type": "exactMatch",
          "valid_response": {
            "score": 1,
            "value": [{
              "method": "isExpanded",
              "options": options,
            }]
          }
        }
      },
    };
  }

  function allow_trailing_zeros(node, options) {
    var n2 = visit(node.elts[0], options);
    option(options, "allow_trailing_zeros", true);
    return n2;
  }

  function allow_decimal(node, options) {
    var n2 = visit(node.elts[0], options);
    option(options, "allow_decimal", true);
    return n2;
  }

  function not(node, options) {
    option(options, "inverseResult", true);  // Synthetic option
    var n1 = visit(node.elts[0], options);
    return n1;
  }

  function inverseResult(node, options) {
    option(options, "inverseResult", true);  // Synthetic option
    var n1 = visit(node.elts[0], options);
    return n1;
  }

  function decimalPlaces(node, options) {
    var n1 = visit(node.elts[1], options);
    var n0 = visit(node.elts[0], options);
    console.log("decimalPlaces() n1=" + n1);
    option(options, "decimalPlaces", n1);
    return n0;
  }

  return {
    transform: transform,
  };
}();

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
    //node = visit(node, "  ")
    return node;
  }

  function visit(node, padding) {

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

}();

exports.compiler = function () {
  exports.compile = compile;
  function compile(src) {
    try {
      return renderer.render(transformer.transform(src));
    } catch (x) {
      console.log("ERROR with code");
      console.log(x.stack);
      return {
        score: 0
      };
    }
  }
}();
