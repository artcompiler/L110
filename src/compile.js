/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/* Copyright (c) 2014, Art Compiler LLC */
var _ = require("underscore");
var mjAPI = require("mathjax-node/lib/mj-single.js");
import MathCore from "./mathcore.js";
import {Core} from "./spokenmath.js";

function error(str, nid) {
  return {
    str: str,
    nid: nid,
  };
}
var transformer = function() {
  function print(str) {
    console.log(str);
  }
  var table = [{
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
    "CALCULATE": calculate,
    "TRANSLATE": trans,
    "SPEAK": speak,
    "VALID-SYNTAX": validSyntax,
    "INVERSE-RESULT": inverseResult,
    "DECIMAL-PLACES": decimalPlaces,
    "ALLOW-DECIMAL": allowDecimal,
    "IGNORE-ORDER": ignoreOrder,
    "IGNORE-COEFFICIENT-ONE": ignoreCoefficientOne,
    "COMPARE-SIDES": compareSides,
    "SET-DECIMAL-SEPARATOR": setDecimalSeparator,
    "SET-THOUSANDS-SEPARATOR": setThousandsSeparator,
    "FIELD": field,
    "ALLOW-THOUSANDS-SEPARATOR": allowThousandsSeparator,
    "ALLOW-INTERVAL": allowInterval,
    "IGNORE-TEXT": ignoreText,
    "IGNORE-TRAILING-ZEROS": ignoreTrailingZeros,
    "HIDE-EXPECTED": hideExpected,
  }, {
    "PROG" : program,
    "EXPRS" : exprs,
    "STR": str,
    "NUM": num,
    "IDENT": ident,
    "BOOL": bool,
    "LIST" : list,
    "NOT": not,
    "CONCAT": concat,
    "EQUIV-SYNTAX": equivSyntax,
    "EQUIV-LITERAL": equivLiteral,
    "EQUIV-SYMBOLIC": equivSymbolic,
    "EQUIV-VALUE": equivValue,
    "IS-SIMPLIFIED": isSimplified,
    "IS-EXPANDED": isExpanded,
    "IS-FACTORISED": isFactorised,
    "IS-UNIT": isUnit,
    "IS-TRUE": isTrue,
    "CALCULATE": calculate,
    "TRANSLATE": trans,
    "SPEAK": speak,
    "VALID-SYNTAX": validSyntax,
    "INVERSE-RESULT": inverseResult,
    "DECIMAL-PLACES": decimalPlaces,
    "ALLOW-DECIMAL": allowDecimal,
    "IGNORE-ORDER": ignoreOrder,
    "IGNORE-COEFFICIENT-ONE": ignoreCoefficientOne,
    "COMPARE-SIDES": compareSides,
    "SET-DECIMAL-SEPARATOR": setDecimalSeparator,
    "SET-THOUSANDS-SEPARATOR": setThousandsSeparator,
    "FIELD": field,
    "ALLOW-THOUSANDS-SEPARATOR": allowThousandsSeparator,
    "ALLOW-INTERVAL": allowInterval,
    "IGNORE-TEXT": ignoreText,
    "IGNORE-TRAILING-ZEROS": ignoreTrailingZeros,
    "HIDE-EXPECTED": hideExpected,
    "IN": inData,
    "ALLOW-EULERS-NUMBER": allowEulersNumber,
    "TREAT-AS-VARIABLE": treatAsVariable,
  }];

  var nodePool;
  let version;
  function getVersion(pool) {
    return pool.version ? +pool.version : 0;
  }
  function transform(pool, options, resume) {
    nodePool = pool;
    version = getVersion(pool);
    return visit(pool.root, options, resume);
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
    if (isFunction(table[version][node.tag])) {
      // There is a visitor method for this node, so call it.
      return table[version][node.tag](node, options, resume);
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
  function concat(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      let str = "";
      if (val1 instanceof Array) {
        val1.forEach(v => {
          str += v;
        });
      } else {
        str = val1.toString();
      }
      resume(err1, str);
    });
  }
  function list(node, options, resume) {
    if (node.elts && node.elts.length > 1) {
      visit(node.elts[0], options, function (err1, val1) {
        node = {
          tag: "LIST",
          elts: node.elts.slice(1),
        };
        list(node, options, function (err2, val2) {
          let val = [].concat(val2);
          val.unshift(val1);
          resume([].concat(err1).concat(err2), val);
        });
      });
    } else if (node.elts && node.elts.length > 0) {
      visit(node.elts[0], options, function (err1, val1) {
        let val = [val1];
        resume([].concat(err1), val);
      });
    } else {
      resume([], []);
    }
  }
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
        node = {
          tag: "RECORD",
          elts: node.elts.slice(1),
        };
        record(node, options, function (err2, val2) {
          val2[val1.key] = val1.val;
          resume([].concat(err1).concat(err2), val2);
        });
      });
    } else if (node.elts && node.elts.length > 0) {
      visit(node.elts[0], options, function (err1, val1) {
        let val = {};
        val[val1.key] = val1.val;
        resume([].concat(err1), val);
      });
    } else {
      resume([], {});
    }
  }
  function exprs(node, options, resume) {
    if (node.elts && node.elts.length > 1) {
      visit(node.elts[0], options, function (err1, val1) {
        node = {
          tag: "EXPRS",
          elts: node.elts.slice(1),
        };
        exprs(node, options, function (err2, val2) {
          let val = [].concat(val2);
          val.unshift(val1);
          resume([].concat(err1).concat(err2), val);
        });
      });
    } else if (node.elts && node.elts.length > 0) {
      visit(node.elts[0], options, function (err1, val1) {
        let val = [val1];
        resume([].concat(err1), val);
      });
    } else {
      resume([], []);
    }
  }
  function program(node, options, resume) {
    if (!options) {
      options = {};
    }
    visit(node.elts[0], options, function (err, val) {
      resume(err, val);
    });
  }
  function inData(node, options, resume) {
    resume([], options.data.val || "0");
  }

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
      "scoring_type": "exactMatch",
      "valid_response": {
        "score": 1,
        "value": [{
          "method": method,
          "options": options,
          "value": value,
        }]
      }
    };
  }
  function equivSyntax(node, options, resume) {
    var errs = [];
    visit(node.elts[0], options, function (err, val) {
      errs = errs.concat(err);
      var reference = val.result ? val.result : val;
      visit(node.elts[1], options, function (err, val) {
        errs = errs.concat(err);
        let response = options.data && options.data.response || val.response || val;
        let score = val.score || 1;
        let methods = "equivSyntax " + (val.methods || "");
        if (response) {
          options.strict = true;
          delete options.data;
          MathCore.evaluateVerbose({
            method: "equivSyntax",
            options: options,
            value: reference,
          }, response, function (err, val) {
            delete options.strict;
            if (err && err.length) {
              errs = errs.concat(error(err, node.elts[1]));
            }
            resume(errs, {
              score: score > 0 && val && val.result ? 1 : -1,
              response: response,
              value: reference,
              methods: methods,
              validation: composeValidation("equivSyntax", options, reference)
            });
          });
        }
      });
    });
  }
  function equivLiteral(node, options, resume) {
    var errs = [];
    visit(node.elts[0], options, function (err, val) {
      errs = errs.concat(err);
      var reference = val.result ? val.result : val;
      visit(node.elts[1], options, function (err, val) {
        errs = errs.concat(err);
        let response = options.data && options.data.response || val.response || val;
        let score = val.score || 1;
        let methods = "equivLiteral " + (val.methods || ""); 
        var hideExpected = options.hideExpected;
        delete options.hideExpected;
        delete options.data;
        if (response) {
          options.strict = true;
          options.keepTextWhitespace = true;
          MathCore.evaluateVerbose({
            method: "equivLiteral",
            options: options,
            value: reference,
          }, response, function (err, val) {
            delete options.strict;
            delete options.keepTextWhitespace;
            if (err && err.length) {
              errs = errs.concat(error(err, node.elts[1]));
            }
            //response = response.split(" ");
            reference = escapeStr(reference);
            if (hideExpected) {
              reference = undefined;
            }
            resume(errs, {
              score: score > 0 && val && val.result ? 1 : -1,
              response: response,
              value: reference,
              methods: methods,
              validation: composeValidation("equivLiteral", options, reference)
            });
          });
        } else {
          delete options.strict;
          if (err && err.length) {
            errs = errs.concat(error(err, node.elts[1]));
          }
          response = "";
          reference = escapeStr(reference);
          if (hideExpected) {
            reference = undefined;
          }
          resume(errs, {
            score: 0,
            response: response,
            value: reference,
            methods: methods,
            validation: composeValidation("equivLiteral", options, reference)
          });
        }
      });
    });
  }
  function equivSymbolic(node, options, resume) {
    var errs = [];
    visit(node.elts[0], options, function (err, val) {
      errs = errs.concat(err);
      var reference = val.result ? val.result : val;
      visit(node.elts[1], options, function (err, val) {
        errs = errs.concat(err);
        let response = options.data && options.data.response || val.response || val;
        let score = val.score || 1;
        let methods = "equivSymbolic " + (val.methods || ""); 
        if (response) {
          options.strict = true;
          delete options.data;  // cleanup.
          MathCore.evaluateVerbose({
            method: "equivSymbolic",
            options: options,
            value: reference,
          }, response, function (err, val) {
            delete options.strict;
            if (err && err.length) {
              errs = errs.concat(error(err, 0));
            }
            response = escapeStr(response);
            reference = escapeStr(reference);
            resume(errs, {
              score: score > 0 && val && val.result ? 1 : -1,
              response: response,
              value: reference,
              methods: methods,
              validation: composeValidation("equivSymbolic", options, reference)
            });
          });
        }
      });
    });
  }
  function equivValue(node, options, resume) {
    var errs = [];
    visit(node.elts[0], options, function (err, val) {
      errs = errs.concat(err);
      var reference = val.result ? val.result : val;
      visit(node.elts[1], options, function (err, val) {
        errs = errs.concat(err);
        let response = options.data && options.data.response || val.response || val;
        let score = val.score || 1;
        let methods = "equivValue " + (val.methods || ""); 
        if (response) {
          options.strict = true;
          delete options.data;
          MathCore.evaluateVerbose({
            method: "equivValue",
            options: options,
            value: reference,
          }, response, function (err, val) {
            delete options.strict;
            if (err && err.length) {
              errs = errs.concat(error(err, node.elts[1]));
            }
            response = escapeStr(response);
            reference = escapeStr(reference);
            resume(errs, {
              score: score > 0 && val && val.result ? 1 : -1,
              response: response,
              value: reference,
              methods: methods,
              validation: composeValidation("equivValue", options, reference)
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
      let response = options.data && options.data.response || val.response || val;
      let score = val.score || 1;
      let methods = "isFactorised " + (val.methods || ""); 
      if (response) {
        options.strict = true;
        delete options.data;
        MathCore.evaluateVerbose({
          method: "isFactorised",
          options: options,
        }, response, function (err, val) {
          delete options.strict;
          if (err && err.length) {
            errs = errs.concat(error(err, node.elts[0]));
          }
          response = escapeStr(response);
          resume(errs, {
            score: score > 0 && val && val.result ? 1 : -1,
            response: response,
            methods: methods,
            validation: composeValidation("isFactorised", options)
          });
        });
      }
    });
  }
  function isSimplified(node, options, resume) {
    var errs = [];
    visit(node.elts[0], options, function (err, val) {
      console.log("isSimplified() val=" + JSON.stringify(val));
      errs = errs.concat(err);
      let response = options.data && options.data.response || val.response || val;
      let score = val.score || 1;
      let methods = "isSimplified " + (val.methods || ""); 
      if (response) {
        options.strict = true;
        delete options.data;
        MathCore.evaluateVerbose({
          method: "isSimplified",
          options: options,
        }, response, function (err, val) {
          delete options.strict;
          if (err && err.length) {
            errs = errs.concat(error(err, node.elts[0]));
          }
          response = escapeStr(response);
          resume(errs, {
            score: score > 0 && val && val.result ? 1 : -1,
            response: response,
            methods: methods,
            validation: composeValidation("isSimplified", options)
          });
        });
      }
    });
  }
  function isExpanded(node, options, resume) {
    var errs = [];
    visit(node.elts[0], options, function (err, val) {
      errs = errs.concat(err);
      let response = options.data && options.data.response || val.response || val;
      let score = val.score || 1;
      let methods = "isExpanded " + (val.methods || ""); 
      if (response) {
        options.strict = true;
        delete options.data;
        MathCore.evaluateVerbose({
          method: "isExpanded",
          options: options,
        }, response, function (err, val) {
          delete options.strict;
          if (err && err.length) {
            errs = errs.concat(error(err, node.elts[0]));
          }
          response = escapeStr(response);
          resume(errs, {
            score: score > 0 && val && val.result ? 1 : -1,
            response: response,
            methods: methods,
            validation: composeValidation("isExpanded", options)
          });
        });
      }
    });
  }
  function isTrue(node, options, resume) {
    var errs = [];
    visit(node.elts[0], options, function (err, val) {
      errs = errs.concat(err);
      let response = options.data && options.data.response || val.response || val;
      let score = val.score || 1;
      let methods = "isTrue " + (val.methods || ""); 
      if (response) {
        options.strict = true;
        delete options.data;
        MathCore.evaluateVerbose({
          method: "isTrue",
          options: options,
        }, response, function (err, val) {
          delete options.strict;
          if (err && err.length) {
            errs = errs.concat(error(err, node.elts[0]));
          }
          response = escapeStr(response);
          resume(errs, {
            score: score > 0 && val && val.result ? 1 : -1,
            response: response,
            methods: methods,
            validation: composeValidation("isTrue", options)
          });
        });
      }
    });
  }
  function calculate(node, options, resume) {
    var errs = [];
    visit(node.elts[0], options, function (err, val) {
      errs = errs.concat(err);
      let response = options.data && options.data.response || val.response || val;
      let score = val.score || 1;
      let methods = "calculate " + (val.methods || ""); 
      if (response) {
        options.strict = true;
        delete options.data;
        MathCore.evaluateVerbose({
          method: "calculate",
          options: options,
        }, response, function (err, val) {
          delete options.strict;
          if (err && err.length) {
            errs = errs.concat(error(err, node.elts[0]));
          }
          response = escapeStr(response);
          resume(errs, {
            score: score > 0 && val && val.result !== "ERROR" ? 1 : -1,
            value: response,
            response: val.result,
            result: val.result,
            methods: methods,
            validation: composeValidation("calculate", options, val)
          });
        });
      }
    });
  }
  function translate(val, options, resume) {
    var errs = [];
    var source = val;
    if (source) {
      Core.translate(options, source, function (err, val) {
        delete options.strict;
        if (err && err.length) {
          errs = errs.concat(error(err, node.elts[0]));
        }
        resume(errs, val);
      });
    }
  }
  function speak(node, options, resume) {
    //options.dialect = "clearSpeak";
    return trans(node, options, resume);
  }
  function trans(node, options, resume) {
    var errs = [];
    visit(node.elts[0], options, function (err, val) {
      errs = errs.concat(err);
      let latex = val;
      let opts;
      if (latex) {
        if (options) {
          // Add item options to global options.
          opts = Object.assign({}, options, options);
        } else {
          opts = dialect.options;
        }
        translate(latex, opts, function (err, val) {
          if (err && err.length) {
            errs = errs.concat(error(err, node.elts[0]));
          }
          latex = escapeStr(latex);
          val = "\\text{" + val + "}";
          resume(errs, {
            value: latex,
            response: val,
            result: val,
            methods: methods,
            validation: composeValidation("speak", options, val)
          });
        });
      }
    });
  }
  function validSyntax(node, options, resume) {
    var errs = [];
    visit(node.elts[0], options, function (err, val) {
      errs = errs.concat(err);
      let response = options.data && options.data.response || val.response || val;
      let score = val.score || 1;
      let methods = "validSyntax " + (val.methods || ""); 
      if (response) {
        options.strict = true;
        delete options.data;
        MathCore.evaluateVerbose({
          method: "validSyntax",
          options: options,
        }, response, function (err, val) {
          delete options.strict;
          if (err && err.length) {
            errs = errs.concat(error(err, node.elts[0]));
          }
          response = escapeStr(response);
          resume(errs, {
            score: score > 0 && val && val.result ? 1 : -1,
            response: response,
            methods: methods,
            validation: composeValidation("validSyntax", options)
          });
        });
      }
    });
  }
  function isUnit(node, options, resume) {
    var errs = [];
    visit(node.elts[0], options, function (err, val) {
      errs = errs.concat(err);
      var reference = val;
      visit(node.elts[1], options, function (err, val) {
        errs = errs.concat(err);
        let response = options.data && options.data.response || val.response || val;
        let score = val.score || 1;
        let methods = "isUnit " + (val.methods || ""); 
        if (response) {
          options.strict = true;
          delete options.data;
          MathCore.evaluateVerbose({
            method: "isUnit",
            options: options,
            value: reference,
          }, response, function (err, val) {
            delete options.strict;
            if (err && err.length) {
              errs = errs.concat(error(err, node.elts[1]));
            }
            response = escapeStr(response);
            reference = escapeStr(reference);
            resume(errs, {
              score: score > 0 && val && val.result ? 1 : -1,
              response: response,
              value: reference,
              methods: methods,
              validation: composeValidation("isUnit", options)
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

  function ignoreCoefficientOne(node, options, resume) {
    option(options, "ignoreCoefficientOne", true);
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

  function hideExpected(node, options, resume) {
    option(options, "hideExpected", true);
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
    visit(node.elts[0], options, function (err, val) {
      option(options, "decimalPlaces", val);
      visit(node.elts[1], options, function (err, val) {
        resume(err, val);
      });
    });
  }

  function field(node, options, resume) {
    visit(node.elts[0], options, function (err, val) {
      option(options, "field", val);
      visit(node.elts[1], options, function (err, val) {
        resume(err, val);
      });
    });
  }

  function setDecimalSeparator(node, options, resume) {
    visit(node.elts[0], options, function (err, val) {
      option(options, "setDecimalSeparator", val);
      visit(node.elts[1], options, function (err, val) {
        resume(err, val);
      });
    });
  }

  function setThousandsSeparator(node, options, resume) {
    visit(node.elts[0], options, function (err, val) {
      option(options, "setThousandsSeparator", val);
      visit(node.elts[1], options, function (err, val) {
        resume(err, val);
      });
    });
  }

  function treatAsVariable(node, options, resume) {
    visit(node.elts[0], options, function (err, val) {
      option(options, "treatAsVariable", val);
      visit(node.elts[1], options, function (err, val) {
        resume(err, val);
      });
    });
  }

  function allowEulersNumber(node, options, resume) {
    visit(node.elts[0], options, function (err, val) {
      option(options, "allowEulersNumber", true);
      resume(err, val);
    });
  }

  return {
    transform: transform,
  };
}();

mjAPI.config({
  MathJax: {
    SVG: {
      font: "Tex",
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
      format: "TeX",
      svg: true,
      ex: 6,
      width: 50,
      linebreaks: true,
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

  function breakText(val) {
    if (val.indexOf("\\text") === 0 && val.lastIndexOf("}") === val.length - 1) {
      // We have a special case of a single text block, so break it.
      val = val.substring("\\text{".length, val.lastIndexOf("}"));
    } else {
      // If not the special case, then do nothing.
      return val;
    }
    var totalSize = val.length;
    var brkSize;
    if (totalSize > 55) {
      brkSize = totalSize / Math.ceil(totalSize / 55);
    }
    val = val.split(" ");
    var str = "";
    var size = 0;
    val.forEach(v => {
      size += v.length;
      if (size > brkSize) {
        str += " \\\\";
        //brkSize = size - v.length;
        size = v.length;
      }
      str += "\\text{" + v + " }" ;
    });
    return str;
  }
  function render(node, resume) {
    node = node[0];
    if (node.response == undefined) {
      resume([error("ERROR Invalid input: " + JSON.stringify(node))]);
    } else {
      tex2SVG(String(breakText(node.response)), function (err, val) {
        node.responseSVG = escapeXML(val);
        if (node.value) {
          tex2SVG(String(breakText(node.value)), function (err, val) {
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
  exports.version = "v1.0.0";
  exports.compile = compile;
  function compile(src, data, resume) {
    let options = {
      data: data,
    };
    try {
      transformer.transform(src, options, function (err, val) {
        if (err.length) {
          console.log("ERROR transform() err=" + JSON.stringify(err));
          resume(err, null);
        } else {
          renderer.render(val, function (err, val) {
            resume(err, val);
          });
        }
      });
    } catch (x) {
      console.log("ERROR with code");
      console.log(x.stack);
      resume([error("Internal compiler error")], {
        score: 0
      });
    }
  }
}();
