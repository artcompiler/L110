/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/* Copyright (c) 2014, Art Compiler LLC */
var _ = require("underscore");
var mjAPI = require("./mj-single.js");
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
    "IS-SIMPLIFIED": isSimplified,
    "IS-EXPANDED": isExpanded,
    "IS-FACTORISED": isFactorised,
    "IS-UNIT": isUnit,
    "IS-TRUE": isTrue,
    "VALID-SYNTAX": validSyntax,
    "INVERSE-RESULT": inverseResult,
    "DECIMAL-PLACES": decimalPlaces,
    "ALLOW-DECIMAL": allowDecimal,
    "IGNORE-ORDER": ignoreOrder,
    "COMPARE-SIDES": compareSides,
    "SET-DECIMAL-SEPARATOR": setDecimalSeparator,
    "SET-THOUSANDS-SEPARATOR": setThousandsSeparator,
    "FIELD": field,
    "ALLOW-THOUSANDS-SEPARATOR": allowThousandsSeparator,
    "ALLOW-INTERVAL": allowInterval,
    "IGNORE-TEXT": ignoreText,
    "IGNORE-TRAILING-ZEROS": ignoreTrailingZeros,
  };
  var nodePool;
  function reset() {
  }
  function error(str, nid) {
    return {
      str: str,
      nid: nid,
    };
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
    resume([], val);
  }

  function num(node, options, resume) {
    var val = node.elts[0];
    resume([], val);
  }

  function ident(node, options, resume) {
    var val = node.elts[0];
    resume([], val);
  }

  function bool(node, options, resume) {
    var val = node.elts[0];
    resume([], val);
  }
  function list(node, options, resume) {
    if (node.elts && node.elts.length > 1) {
      visit(node.elts[0], options, function (err1, val1) {
        node.elts.shift();
        list(node, options, function (err2, val2) {
          resume([].concat(err1).concat(err2), [].concat(val1).concat(val2));
        });
      });
    } else if (node.elts && node.elts.length === 0) {
      visit(node.elts[0], options, function (err1, val1) {
        resume([].concat(err1), [].concat(val1));
      });
    } else {
      resume([], []);
    }
  };
  function binding(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      visit(node.elts[1], options, function (err2, val2) {
        resume([].concat(err1).concat(err2), {key: val1, val: val2});
      });
    });
  };
  function record(node, options, resume) {
    if (node.elts && node.elts.length > 1) {
      visit(node.elts[0], options, function (err1, val1) {
        node.elts.shift();
        record(node, options, function (err2, val2) {
          resume([].concat(err1).concat(err2), [].concat(val1).concat(val2));
        });
      });
    } else if (node.elts && node.elts.length > 0) {
      visit(node.elts[0], options, function (err1, val1) {
        resume([].concat(err1), [].concat(val1));
      });
    } else {
      resume([], []);
    }
  };
  function program(node, options, resume) {
    if (!options) {
      options = {};
    }
    visit(node.elts[0], options, function (err, val) {
      resume(err, val);
    });
  }
  function exprs(node, options, resume) {
    if (node.elts && node.elts.length > 1) {
      visit(node.elts[0], options, function (err1, val1) {
        node.elts.shift();
        exprs(node, options, function (err2, val2) {
          resume([].concat(err1).concat(err2), [].concat(val1).concat(val2));
        });
      });
    } else if (node.elts && node.elts.length > 0) {
      visit(node.elts[0], options, function (err1, val1) {
        resume([].concat(err1), [].concat(val1));
      });
    } else {
      resume([], []);
    }
  };

  // Get or set an option on a node.
  function option(options, id, val) {
    var old = options[id];
    if (val !== undefined) {
      options[id] = val;
    }
    return old;
  }

  function escapeStr(str) {
    return str;
//    return String(str)
//      .replace(/\\/g, "\\\\")
  }

  function composeValidation(method, options, value) {
    delete options.dontExpandPowers;
    delete options.dontFactorDenominators;
    delete options.dontFactorTerms;
    delete options.dontConvertDecimalToFraction;
    delete options.dontSimplifyImaginary;
    return {
      "validation": {
        "scoring_type": "exactMatch",
        "valid_response": {
          "score": 1,
          "value": [{
            "method": method,
            "options": options,
            "value": value,
          }]
        }
      }
    };
  }
  function equivSyntax(node, options, resume) {
    var errs = [];
    visit(node.elts[1], options, function (err, val) {
      errs = errs.concat(err);
      var reference = val;
      visit(node.elts[0], options, function (err, val) {
        errs = errs.concat(err);
        var response = val;
        if (response) {
          MathCore.evaluateVerbose({
            method: "equivSyntax",
            options: options,
            value: reference,
          }, response, function (err, val) {
            if (err) {
              errs = errs.concat(error(err, node.elts[0]));
            }
            resume(errs, {
              score: val ? (val.result ? 1 : -1) : 0,
              response: response,
              value: reference,
              objectCode: composeValidation("equivSyntax", options, reference)
            });
          });
        }
      });
    });
  }
  function equivLiteral(node, options, resume) {
    var errs = [];
    visit(node.elts[1], options, function (err, val) {
      errs = errs.concat(err);
      var reference = val;
      visit(node.elts[0], options, function (err, val) {
        errs = errs.concat(err);
        var response = val;
        if (response) {
          MathCore.evaluateVerbose({
            method: "equivLiteral",
            options: options,
            value: reference,
          }, response, function (err, val) {
            if (err) {
              errs = errs.concat(error(err, node.elts[0]));
            }
            response = escapeStr(response);
            reference = escapeStr(reference);
            resume(errs, {
              score: val ? (val.result ? 1 : -1) : 0,
              response: response,
              value: reference,
              objectCode: composeValidation("equivLiteral", options, reference)
            });
          });
        }
      });
    });
  }
  function equivSymbolic(node, options, resume) {
    var errs = [];
    visit(node.elts[1], options, function (err, val) {
      errs = errs.concat(err);
      var reference = val;
      visit(node.elts[0], options, function (err, val) {
        errs = errs.concat(err);
        var response = val;
        if (response) {
          MathCore.evaluateVerbose({
            method: "equivSymbolic",
            options: options,
            value: reference,
          }, response, function (err, val) {
            if (err) {
              errs = errs.concat(error(err, 0));
            }
            response = escapeStr(response);
            reference = escapeStr(reference);
            resume(errs, {
              score: val ? (val.result ? 1 : -1) : 0,
              response: response,
              value: reference,
              objectCode: composeValidation("equivSymbolic", options, reference)
            });
          });
        }
      });
    });
  }
  function equivValue(node, options, resume) {
    var errs = [];
    visit(node.elts[1], options, function (err, val) {
      errs = errs.concat(err);
      var reference = val;
      visit(node.elts[0], options, function (err, val) {
        errs = errs.concat(err);
        var response = val;
        if (response) {
          MathCore.evaluateVerbose({
            method: "equivValue",
            options: options,
            value: reference,
          }, response, function (err, val) {
            if (err) {
              err = errs.concat(error(err, node.elts[0]));
            }
            response = escapeStr(response);
            reference = escapeStr(reference);
            resume(errs, {
              score: val ? (val.result ? 1 : -1) : 0,
              response: response,
              value: reference,
              objectCode: composeValidation("equivValue", options, reference)
            });
          });
        }
      });
    });
  }
  function isFactorised(node, options, resume) {
    var errs = [];
    visit(node.elts[0], options, function (err, val) {
      errs = errs.concat(err);
      var response = val;
      if (response) {
        MathCore.evaluateVerbose({
          method: "isFactorised",
          options: options,
        }, response, function (err, val) {
          if (err) {
            err = errs.concat(error(err, node.elts[0]));
          }
          response = escapeStr(response);
          resume(errs, {
            score: val ? (val.result ? 1 : -1) : 0,
            response: response,
            objectCode: composeValidation("isFactorised", options)
          });
        });
      }
    });
  }
  function isSimplified(node, options, resume) {
    var errs = [];
    visit(node.elts[0], options, function (err, val) {
      errs = errs.concat(err);
      var response = val;
      if (response) {
        MathCore.evaluateVerbose({
          method: "isSimplified",
          options: options,
        }, response, function (err, val) {
          if (err) {
            err = errs.concat(error(err, node.elts[0]));
          }
          response = escapeStr(response);
          resume(errs, {
            score: val ? (val.result ? 1 : -1) : 0,
            response: response,
            objectCode: composeValidation("isSimplified", options)
          });
        });
      }
    });
  }
  function isExpanded(node, options, resume) {
    var errs = [];
    visit(node.elts[0], options, function (err, val) {
      errs = errs.concat(err);
      var response = val;
      if (response) {
        MathCore.evaluateVerbose({
          method: "isExpanded",
          options: options,
        }, response, function (err, val) {
          if (err) {
            err = errs.concat(error(err, node.elts[0]));
          }
          response = escapeStr(response);
          resume(errs, {
            score: val ? (val.result ? 1 : -1) : 0,
            response: response,
            objectCode: composeValidation("isExpanded", options)
          });
        });
      }
    });
  }
  function isTrue(node, options, resume) {
    var errs = [];
    visit(node.elts[0], options, function (err, val) {
      errs = errs.concat(err);
      var response = val;
      if (response) {
        MathCore.evaluateVerbose({
          method: "isTrue",
          options: options,
        }, response, function (err, val) {
          if (err) {
            err = errs.concat(error(err, node.elts[0]));
          }
          response = escapeStr(response);
          resume(errs, {
            score: val ? (val.result ? 1 : -1) : 0,
            response: response,
            objectCode: composeValidation("isTrue", options)
          });
        });
      }
    });
  }
  function validSyntax(node, options, resume) {
    var errs = [];
    visit(node.elts[0], options, function (err, val) {
      errs = errs.concat(err);
      var response = val;
      if (response) {
        MathCore.evaluateVerbose({
          method: "validSyntax",
          options: options,
        }, response, function (err, val) {
          if (err) {
            errs = errs.concat(error(err, node.elts[0]));
          }
          response = escapeStr(response);
          resume(errs, {
            score: val ? (val.result ? 1 : -1) : 0,
            response: response,
            objectCode: composeValidation("validSyntax", options)
          });
        });
      }
    });
  }
  function isUnit(node, options, resume) {
    var errs = [];
    visit(node.elts[1], options, function (err, val) {
      errs = errs.concat(err);
      var reference = val;
      visit(node.elts[0], options, function (err, val) {
        errs = errs.concat(err);
        var response = val;
        if (response) {
          MathCore.evaluateVerbose({
            method: "isUnit",
            options: options,
            value: reference,
          }, response, function (err, val) {
            if (err) {
              errs = errs.concat(error(err, node.elts[0]));
            }
            response = escapeStr(response);
            reference = escapeStr(reference);
            resume(errs, {
              score: val ? (val.result ? 1 : -1) : 0,
              response: response,
              value: reference,
              objectCode: composeValidation("isUnit", options)
            });
          });
        }
      });
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

  function allowThousandsSeparator(node, options, resume) {
    option(options, "allowThousandsSeparator", true);
    visit(node.elts[0], options, function (err, val) {
      resume(err, val);
    });
  }

  function allowInterval(node, options, resume) {
    option(options, "allowInterval", true);
    visit(node.elts[0], options, function (err, val) {
      resume(err, val);
    });
  }

  function ignoreOrder(node, options, resume) {
    option(options, "ignoreOrder", true);
    visit(node.elts[0], options, function (err, val) {
      resume(err, val);
    });
  }

  function ignoreText(node, options, resume) {
    option(options, "ignoreText", true);
    visit(node.elts[0], options, function (err, val) {
      resume(err, val);
    });
  }

  function ignoreTrailingZeros(node, options, resume) {
    option(options, "ignoreTrailingZeros", true);
    visit(node.elts[0], options, function (err, val) {
      resume(err, val);
    });
  }

  function compareSides(node, options, resume) {
    option(options, "compareSides", true);
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
    visit(node.elts[1], options, function (err, val) {
      option(options, "field", val);
      visit(node.elts[0], options, function (err, val) {
        resume(err, val);
      });
    });
  }

  function setDecimalSeparator(node, options, resume) {
    visit(node.elts[1], options, function (err, val) {
      option(options, "allowThousandsSeparator", true);
      option(options, "setDecimalSeparator", val);
      visit(node.elts[0], options, function (err, val) {
        resume(err, val);
      });
    });
  }

  function setThousandsSeparator(node, options, resume) {
    visit(node.elts[1], options, function (err, val) {
      option(options, "allowThousandsSeparator", true);
      option(options, "setThousandsSeparator", val);
      visit(node.elts[0], options, function (err, val) {
        resume(err, val);
      });
    });
  }

  return {
    transform: transform,
  };
}();

mjAPI.config({
  MathJax: {
    SVG: {
      font: "Tex"
    }
  }
});
mjAPI.start();

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

  function tex2SVG(str, resume) {
    mjAPI.typeset({
      math: str,
      format: "inline-TeX",
      svg: true,
      ex: 6,
      width: 100,
    }, function (data) {
      if (!data.errors) {
        resume(null, data.svg);
      } else {
        resume(null, "");
      }
    });
  }

  function escapeXML(str) {
    return String(str)
      .replace(/&(?!\w+;)/g, "&amp;")
      .replace(/\n/g, " ")
      .replace(/\\/g, "\\\\")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function render(node, resume) {
    node = node[0];
    if (!node.response) {
      resume("ERROR Invalid input: " + JSON.stringify(node));
    } else {
      tex2SVG(String(node.response), function (err, val) {
        node.responseSVG = escapeXML(val);
        if (node.value) {
          tex2SVG(String(node.value), function (err, val) {
            node.valueSVG = escapeXML(val);
            resume(null, node);
          });
        } else {
          resume(null, node);
        }
      });
    }
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
      transformer.transform(src, function (err, val) {
        if (err.length) {
          resume(err, val);
        } else {
          renderer.render(val, function (err, val) {
            resume(err, val);
          });
        }
      });
    } catch (x) {
      console.log("ERROR with code");
      console.log(x.stack);
      resume("Compiler error", {
        score: 0
      });
    }
  }
}();
