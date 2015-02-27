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
    "ALLOW-DECIMAL": allowDecimal,
    "SET-DECIMAL-SEPARATOR": setDecimalSeparator,
    "SET-THOUSANDS-SEPARATOR": setThousandsSeparator,
    "FIELD": field,
  };
  var nodePool;
  function reset() {
  }
  function transform(pool, resume) {
    reset();
    nodePool = pool;
    return visit(pool.root, {}, resume);
  }
  function visit(nid, options, resume) {
    if (typeof resume !== "function") {
      throw new Error("no resume");
    }
    // Get the node from the pool of nodes.
    var node = nodePool[nid];
    console.log("visit() node=" + JSON.stringify(node, null, 2));
    if (node == null) {
      return null;
    } else if (node.tag === void 0) {
      return [ ];  // clean up stubs
    }
    if (isFunction(table[node.tag])) {
      // There is a visitor method for this node, so call it.
      return table[node.tag](node, options, resume);
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

  function str(node, options, resume) {
    var val = node.elts[0];
    resume(null, val);
  }

  function num(node, options, resume) {
    var val = node.elts[0];
    resume(null, val);
  }

  function ident(node, options, resume) {
    var val = node.elts[0];
    resume(null, val);
  }

  function bool(node, options, resume) {
    var val = node.elts[0];
    resume(null, val);
  }

  function list(node, options, resume) {
    visit(node.elts[0], options, function (err, val) {
      if (!(val instanceof Array)) {
        val = [val];
      }
      resume(null, val);
    });
  }

  function program(node, options, resume) {
    var options = {};
    return visit(node.elts[0], options, resume);
  }

  function exprs(node, options, resume) {
    var elts = []
    if (node.elts) {
      for (var i = 0; i < node.elts.length; i++) {
        elts.push(visit(node.elts[i], options, resume));
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

  function equivSyntax(node, options, resume) {
    visit(node.elts[1], options, function (err, val) {
      var reference = val;
      visit(node.elts[0], options, function (err, val) {
        var response = val;
        if (response) {
          MathCore.evaluateVerbose({
            method: "equivSyntax",
            options: options,
            value: reference,
          }, response, function (err, val) {
            resume(null, {
              score: val.result ? 1 : -1,
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
              }
            });
          });
        }
      });
    });
  }

  function equivLiteral(node, options, resume) {
    visit(node.elts[1], options, function (err, val) {
      var reference = val;
      visit(node.elts[0], options, function (err, val) {
        var response = val;
        if (response) {
          MathCore.evaluateVerbose({
            method: "equivLiteral",
            options: options,
            value: reference,
          }, response, function (err, val) {
            resume(null, {
              score: val.result ? 1 : -1,
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
              }
            });
          });
        }
      });
    });
  }

  function equivSymbolic(node, options, resume) {
    visit(node.elts[1], options, function (err, val) {
      var reference = val;
      visit(node.elts[0], options, function (err, val) {
        var response = val;
        if (response) {
          MathCore.evaluateVerbose({
            method: "equivSymbolic",
            options: options,
            value: reference,
          }, response, function (err, val) {
            resume(null, {
              score: val.result ? 1 : -1,
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
              }
            });
          });
        }
      });
    });
  }

  function equivValue(node, options, resume) {
    visit(node.elts[1], options, function (err, val) {
      var reference = val;
      visit(node.elts[0], options, function (err, val) {
        var response = val;
        if (response) {
          MathCore.evaluateVerbose({
            method: "equivValue",
            options: options,
            value: reference,
          }, response, function (err, val) {
            resume(null, {
              score: val.result ? 1 : -1,
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
              }
            });
          });
        }
      });
    });
  }

  function isFactorised(node, options, resume) {
    visit(node.elts[0], options, function (err, val) {
      var response = val;
      if (response) {
        MathCore.evaluateVerbose({
          method: "isFactorised",
          options: options,
        }, response, function (err, val) {
          resume(err, {
            score: val.result ? 1 : -1,
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
            }
          });
        });
      }
    });
  }

  function isSimplified(node, options, resume) {
    visit(node.elts[0], options, function (err, val) {
      var response = val;
      if (response) {
        MathCore.evaluateVerbose({
          method: "isSimplified",
          options: options,
        }, response, function (err, val) {
          resume(err, {
            score: val.result ? 1 : -1,
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
            }
          });
        });
      }
    });
  }

  function isExpanded(node, options, resume) {
    visit(node.elts[0], options, function (err, val) {
      var response = val;
      if (response) {
        MathCore.evaluateVerbose({
          method: "isExpanded",
          options: options,
        }, response, function (err, val) {
          resume(err, {
            score: val.result ? 1 : -1,
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
            }
          });
        });
      }
    });
  }

  function allowTrailingZeros(node, options, resume) {
    option(options, "allowTrailingZeros", true);
    visit(node.elts[0], options, function (err, val) {
      resume(err, val);
    });
  }

  function allowDecimal(node, options, resume) {
    option(options, "allowDecimal", true);
    visit(node.elts[0], options, function (err, val) {
      resume(err, val);
    });
  }

  function not(node, options, resume) {
    option(options, "inverseResult", true);  // Synthetic option
    visit(node.elts[0], options, function (err, val) {
      resume(err, val);
    });
  }

  function inverseResult(node, options, resume) {
    option(options, "inverseResult", true);  // Synthetic option
    visit(node.elts[0], options, function (err, val) {
      resume(err, val);
    });
  }

  function decimalPlaces(node, options, resume) {
    visit(node.elts[1], options, function (err, val) {
      option(options, "decimalPlaces", val);
      visit(node.elts[0], options, function (err, val) {
        resume(err, val);
      });
    });
  }

  function field(node, options, resume) {
    var n1 = visit(node.elts[1], options, resume);
    var n0 = visit(node.elts[0], options, resume);
    option(options, "field", n1);
    return n0;
  }

  function setDecimalSeparator(node, options) {
    var n1 = visit(node.elts[1], options);
    var n0 = visit(node.elts[0], options);
    option(options, "allowThousandsSeparator", true);
    option(options, "setDecimalSeparator", n1);
    return n0;
  }

  function setThousandsSeparator(node, options) {
    var n1 = visit(node.elts[1], options);
    var n0 = visit(node.elts[0], options);
    option(options, "allowThousandsSeparator", true);
    option(options, "setThousandsSeparator", n1);
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

  function render(node, resume) {
    //node = visit(node, "  ")
    resume(null, node);
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
  function compile(src, resume) {
    try {
      resume(null, transformer.transform(src, function (err, val) {
        renderer.render(val, function (err, val) {
          resume(err, val);
        });
      }));
    } catch (x) {
      console.log("ERROR with code");
      console.log(x.stack);
      resume("Compiler error", {
        score: 0
      });
    }
  }
}();
