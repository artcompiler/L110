/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2013 Learnosity Ltd. All Rights Reserved.
 *
 */
"use strict";
var MathCore = (function () {
  Assert.reserveCodeRange(3000, 3999, "mathcore");
  var messages = Assert.messages;
  var message = Assert.message;
  var assert = Assert.assert;
  messages[3001] = "No Math Core spec provided.";
  messages[3002] = "No Math Core solution provided.";
  messages[3003] = "No Math Core spec value provided.";
  messages[3004] = "Invalid Math Core spec method '%1'.";
  messages[3005] = "Operation taking too long.";
  messages[3006] = "Invalid option name '%1'.";
  messages[3007] = "Invalid option value '%2' for option '%1'.";

  var u = 1;
  var k = 1000;
  var c = Math.pow(10, -2);
  var m = Math.pow(10, -3);
  var mu = Math.pow(10, -6); // micro, \\mu
  var n = Math.pow(10, -9);
  var env = {
    "g": { type: "unit", value: u, base: "g" },
    "s": { type: "unit", value: u, base: "s" },
    "m": { type: "unit", value: u, base: "m" },
    "L": { type: "unit", value: u, base: "L" },
    "kg": { type: "unit", value: k, base: "g" },
    "km": { type: "unit", value: k, base: "m" },
    "ks": { type: "unit", value: k, base: "s" },
    "kL": { type: "unit", value: k, base: "L" },
    "cg": { type: "unit", value: c, base: "g" },
    "cm": { type: "unit", value: c, base: "m" },
    "cs": { type: "unit", value: c, base: "s" },
    "cL": { type: "unit", value: c, base: "L" },
    "mg": { type: "unit", value: m, base: "g" },
    "mm": { type: "unit", value: m, base: "m" },
    "ms": { type: "unit", value: m, base: "s" },
    "mL": { type: "unit", value: m, base: "L" },
    "\\mu": mu,
    "\\mug": { type: "unit", value: mu, base: "g" },
    "\\mus": { type: "unit", value: mu, base: "s" },
    "\\mum": { type: "unit", value: mu, base: "m" },
    "\\muL": { type: "unit", value: mu, base: "L" },
    "ng": { type: "unit", value: n, base: "g" },
    "nm": { type: "unit", value: n, base: "m" },
    "ns": { type: "unit", value: n, base: "s" },
    "nL": { type: "unit", value: n, base: "L" },
    "in": { type: "unit", value: 1 / 12, base: "ft" },
    "ft": { type: "unit", value: u, base: "ft" },
    "mi": { type: "unit", value: 5280, base: "ft" },
    "fl": { type: "unit", value: 1, base: "fl" },  // fluid ounce
    "cup": { type: "unit", value: 8, base: "fl" },
    "pt": { type: "unit", value: 16, base: "fl" },
    "qt": { type: "unit", value: 32, base: "fl" },
    "gal": { type: "unit", value: 128, base: "fl" },
    "oz": { type: "unit", value: 1 / 16, base: "lb" },
    "lb": { type: "unit", value: 1, base: "lb" },
    "st": { type: "unit", value: 1 / 1614, base: "lb" },
    "qtr": { type: "unit", value: 28, base: "lb" },
    "cwt": { type: "unit", value: 112, base: "lb" },
    "t": { type: "unit", value: 2240, base: "lb" },
    "$": { type: "unit", value: u, base: "$" },
    "i": { type: "unit", value: null, base: "i" },
    "\\radian": u,
    "\\degree": Math.PI / 180,
    "\\pi": Math.PI,
    "R": { name: "reals" },   // special math symbol for real space
    "matrix": {},
    "pmatrix": {},
    "bmatrix": {},
    "Bmatrix": {},
    "vmatrix": {},
    "Vmatrix": {},
    "array": {},
  };

  function evaluate(spec, solution) {
    try {
      assert(spec, message(3001, [spec]));
      assert(solution, message(3002, [solution]));
      Assert.setCounter(1000000, message(3005));
      var evaluator = makeEvaluator(spec);
      var result = evaluator.evaluate(solution);
    } catch (e) {
      trace(e + "\n" + e.stack);
      result = undefined;
    }
    return result;
  }
  function evaluateVerbose(spec, solution) {
    try {
      assert(spec, message(3001, [spec]));
      Assert.setCounter(1000000, message(3005));
      var evaluator = makeEvaluator(spec);
      var result, errorCode = 0, msg = "Normal completion", stack, location;
      result = evaluator.evaluate(solution);
    } catch (e) {
      result = undefined;
      errorCode = parseErrorCode(e.message);
      msg = parseMessage(e.message);
      stack = e.stack;
      location = e.location;
    }
    return {
      result: result,
      errorCode: errorCode,
      message: msg,
      stack: stack,
      location: location,
      toString: function () {
        return this.errorCode + ": (" + location + ") " + msg + "\n" + this.stack;
      }
    }
    function parseErrorCode(e) {
      var code = +e.slice(0, e.indexOf(":"));
      if (!isNaN(code)) {
        return code;
      }
      return 0;
    }
    function parseMessage(e) {
      var code = parseErrorCode(e);
      if (code) {
        return e.slice(e.indexOf(":")+2);
      }
      return e;
    }
  }
  function validateOption(p, v) {
    switch (p) {
    case "field":
      switch (v) {
      case void 0: // undefined means use default
      case "integer":
      case "real":
      case "complex":
        break;
      default:
        assert(false, message(3007, [p, v]));
        break;
      }
      break;
    case "numberFormat":
      switch (v) {
      case void 0: // undefined means use default
      case "integer":
      case "decimal":
      case "real":
      case "complex":
        break;
      default:
        assert(false, message(3007, [p, v]));
        break;
      }
      break;
    case "decimalPlaces":
      if (v === void 0 || +v >= 0 && +v <= 20) {
        break;
      }
      assert(false, message(3007, [p, v]));
      break;
    case "allowDecimal":
    case "allowInterval":
    case "requireScientific":
    case "dontExpandPowers":
    case "dontFactorDenominators":
    case "dontFactorTerms":
    case "ignoreOrder":
    case "inverseResult":
    case "requireThousandsSeparator":
    case "ignoreText":
    case "ignoreTrailingZeros":
    case "allowThousandsSeparator":
      if (typeof v === "undefined" || typeof v === "boolean") {
        break;
      }
      assert(false, message(3007, [p, v]));
      break;
    case "setThousandsSeparator":
      if (typeof v === "undefined" ||
          v instanceof Array) {
        break;
      }
      assert(false, message(3007, [p, v]));
      break;
    case "setDecimalSeparator":
      if (typeof v === "undefined" ||
          typeof v === "string" && v.length === 1) {
        break;
      }
      assert(false, message(3007, [p, JSON.stringify(v)]));
      break;
    case "class":
      switch (v) {
      case "polynomial":
      case "number":
      case "mixedFraction":
      case "fraction":
      case "binomial":
      case "matrix":
      case "equation":
      case "interval":
        break;
      default:
        assert(false, message(3007, [p, v]));
        break;
      }
      break;
    case "variables":
      if (!(v instanceof Array)) {
        assert(false, message(3007, [p, v]));
      }
      break;
    default:
      assert(false, message(3006, [p]));
      break;
    }
    // If we get this far, all is well.
    return;
  }
  function validateOptions(options) {
    if (options) {
      forEach(keys(options), function (option) {
        validateOption(option, options[option]);
      });
    }
  }
  function makeEvaluator(spec) {
    var method = spec.method;
    var value = spec.value;
    var options = Model.options = spec.options;
    Assert.setLocation("spec");
    validateOptions(options);
    Model.pushEnv(env);
    var valueNode = value ? Model.create(value, "spec") : undefined;
    Model.popEnv();
    var evaluate = function evaluate(solution) {
      Ast.clearPool();
      Assert.setLocation("user");
      assert(solution, message(3002));
      Model.pushEnv(env);
      var solutionNode = Model.create(solution, "user");
      Assert.setLocation("spec");
      var result;
      switch (method) {
      case "equivValue":
        assert(value, message(3003));
        result = valueNode.equivValue(solutionNode);
        break;
      case "equivLiteral":
        assert(value, message(3003));
        result = valueNode.equivLiteral(solutionNode);
        break;
      case "equivSyntax":
        assert(value, message(3003));
        if (!(valueNode instanceof Array)) {
          valueNode = [valueNode];
        }
        result = some(valueNode, function (n) {
          return n.equivSyntax(solutionNode);
        });
        break;
      case "equivSymbolic":
        assert(value, message(3003));
        result = valueNode.equivSymbolic(solutionNode);
        break;
      case "isFactorised":
        result = solutionNode.isFactorised();
        break;
      case "isSimplified":
        result = solutionNode.isSimplified();
        break;
      case "isExpanded":
        result = solutionNode.isExpanded();
        break;
      case "isUnit":
        result = valueNode.isUnit(solutionNode);
        break;
      case "isTrue":
        result = solutionNode.isTrue();
        break;
      case "hasSyntax":
        result = solutionNode.hasSyntax();
        break;
      default:
        assert(false, message(3004, [method]));
        break;
      }
      Model.popEnv();
      return result;
    }
    return {
      evaluate: evaluate,
      evaluateVerbose: evaluateVerbose,
    };
  }

  // Exports
  return {
    evaluate: evaluate,
    evaluateVerbose: evaluateVerbose,
    makeEvaluator: makeEvaluator,
    Model: Model,
    Ast: Ast,
  };
})();

