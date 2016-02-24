/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2013 Learnosity Ltd. All Rights Reserved.
 *
 */

"use strict";

// if using Karma use the karma base url
var setBaseUrl = (window.__karma__) ? "/base/lib" : "../../lib";

var TEST_LIB = true;
if (TEST_LIB) {
  requirejs.config({
    baseUrl: setBaseUrl,
    paths: {
      'mathcore': 'mathcore'
    },
    shim: {
      'mathcore': {
        exports: 'MathCore'
      }
    }
  });
} else {
  requirejs.config({
    baseUrl: "../../src",
    paths: {
      'backward': '../lib/model/src/backward',
      'assert': '../lib/model/src/assert',
      'trace': '../lib/model/src/trace',
      'ast': '../lib/model/src/ast',
      'model': '../lib/model/src/model',
      'bigdecimal': '../lib/BigDecimal',
      'mathmodel': 'mathmodel',
      'mathcore': 'mathcore'
    },
    shim: {
      'backward': {
        exports: 'backward'
      },
      'assert': {
        exports: 'assert'
      },
      'trace': {
        exports: 'trace'
      },
      'ast': {
        deps: ['assert', 'trace'],
        exports: 'Ast'
      },
      'model': {
        deps: ['assert', 'trace', 'ast'],
        exports: 'Model'
      },
      'bigdecimal': {
        exports: 'BigDecimal'
      },
      'mathmodel': {
        deps: ['backward', 'assert', 'trace', 'ast', 'model', 'bigdecimal'],
        exports: 'MathModel'
      },
      'mathcore': {
        deps: ['mathmodel'],
        exports: 'MathCore'
      }
    }
  });
}

/*
  Copied from ../lib/model/src/backward.js to support testing on IE8.
*/

// ES5 15.4.4.18
// http://es5.github.com/#x15.4.4.18
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/forEach

// Check failure of by-index access of string characters (IE < 9)
// and failure of `0 in boxedString` (Rhino)
var boxedString = Object("a"),
splitString = boxedString[0] != "a" || !(0 in boxedString);

var forEach = function forEach(array, fun) {
  var thisp = arguments[2];
  if (Array.prototype.forEach) {
	  return array.forEach(fun);
  }
  var object = toObject(array),
  self = splitString && _toString(object) == "[object String]" ? object.split("") : object,
  i = -1,
  length = self.length >>> 0;
  // If no callback function or if callback is not a callable function
  if (_toString(fun) != "[object Function]") {
    throw new TypeError(); // TODO message
  }
  while (++i < length) {
    if (i in self) {
      // Invoke the callback function with call, passing arguments:
      // context, property value, property key, thisArg object
      // context
      fun.call(thisp, self[i], i, object);
    }
  }
};

// ES5 9.9
// http://es5.github.com/#x9.9
var toObject = function (o) {
  if (o == null) { // this matches both null and undefined
    throw new TypeError("can't convert "+o+" to object");
  }
  return Object(o);
};

var prototypeOfObject = Object.prototype;

// Having a toString local variable name breaks in Opera so use _toString.
var _toString = function (val) { return prototypeOfObject.toString.apply(val); }; //call.bind(prototypeOfObject.toString);

define(["mathcore"], function (MathCore) {
  describe("Math Core", function() {
    describe("Errors", function() {
      describe("evaluateVerbose() errorCode", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1] + " | " + JSON.stringify(v[2]), function() {
              expect(MathCore.evaluateVerbose({
                method: v[0],
                value: v[1][0],
                options: v[2]
              }, v[1][1]).errorCode).toEqual(v[3]);
            });
          });
        }
        describe("various", function() {
          var tests = [
            ["equivLiteral", ["2 3", "2 3"], {}, 1010],
            ["equivValue", ["3 \\gt x \\ge 2", "2 \\le x \\lt 3"], {}, 2005],
            ["equivLiteral", [".", "."], {}, 1004],
            ["equivLiteral", ["<", "<"], {strict: true}, 1006],
            ["equivLiteral", ["10", "10..."], {}, 1007],
            ["isFactorised", ["3xy(x^2-3y^2+4xy)"], {field: "integer"}, 2001],          
            ["isFactorised", ["3xy(x^2-3y^2+4xy)"], {field: "integer"}, 2001],          
            ["equivLiteral", ["10", "10..."], {}, 1007],
            ["equivLiteral", ["1.000", "10,00"], {
              allowThousandsSeparator: true,
              setThousandsSeparator: ['.']
            }, 1008],
            ["equivLiteral", ["1,000", "1000"], {
              allowThousandsSeparator: true,
              setThousandsSeparator: [','],
              setDecimalSeparator: ','
            }, 1008],
            ["equivLiteral", ["1,000", "1000"], {
              allowThousandsSeparator: true,
              setThousandsSeparator: [','],
              setDecimalSeparator: [',', '.']
            }, 1008],
            ["isFactorised", [undefined, "3xy(x^2-3y^2+4xy)"], {field: "integer"}, 2001],          
            ["equivLiteral", ["(1+2]", "(1+2)"], {}, 1001],
            ["equivLiteral", ["\\text{Range: }\\left[-\\infty,0\\right)",
                              "\\text{Range: }\\left(-\\infty,0\\right)"], {}, 1001],
            ["equivLiteral", ["10", undefined], {}, 3002],
            ["equivLiteral", [undefined, "10"], {}, 3003],
            ["isFactorised", [undefined, "4k^2+9m^2"], {}, 2001],
            ["isFactorised", [undefined, "xy+2ab"], {}, 2001],
            ["isFactorised", [undefined, "(10x"], {}, 1001],
            ["isFactorised", [undefined, "(xy^3+2z^2)(x-1)"], {}, 2001],
            ["equivValue", ["x", "|x|"], {}, 2005],
            ["equivValue", ["5x^2+3x+2", "1"], {}, 2005],
            ["equivValue", ["10g", "10"], {}, 2009],
            ["equivValue", ["1000", "10,00"], {allowThousandsSeparator: true}, 1005],
            ["equivValue", ["9ft + 500m", "9.5km"], {}, 2017],
            ["isFactorised", [undefined, "x^2-25"], {Field: "integer"}, 3006],
            ["isFactorised", [undefined, "x^2-25"], {field: "Integer"}, 3007],
          ];
          run(tests);
        });
        describe("evaluateVerbose() location", function() {
          function run(tests) {
            forEach(tests, function (v, i) {
              it(v[0] + " | " + v[1], function() {
                expect(MathCore.evaluateVerbose({
                  method: v[0],
                  value: v[1][0]
                }, v[1][1]).location).toEqual(v[2]);
              });
            });
          }
          describe("various", function() {
            var tests = [
              ["equivValue", ["10cm", "foobar"], "user"],
              ["equivLiteral", [undefined, "10"], "spec"],
              ["equivLiteral", ["10", undefined], "user"],
              ["isFactorised", [undefined, "4k^2+9m^2"], "user"],
              ["isFactorised", [undefined, "x^2+xy+3y^2"], "user"],
              ["isFactorised", [undefined, "(10x"], "user"],
              ["isFactorised", [undefined, "x^y+1"], "user"],
              ["isFactorised", [undefined, "(xy^3+2z^2)(x-1)"], "user"],
              ["isFactorised", [undefined, "(x^y+1)(x-1)"], "user"],
              ["equivValue", ["1", "5x^2+3x+2"], "user"],
              ["equivValue", ["5x^2+3x+2", "1"], "spec"],
            ];
            run(tests);
          });
        });
        describe("validSyntax variables()", function() {
          function run(tests) {
            forEach(tests, function (v, i) {
              it(v[0], function() {
                expect(MathCore.evaluateVerbose({
                  method: "validSyntax"
                }, v[0]).model.variables()).toEqual(v[1]);
              });
            });
          }
          run([
            ["\\ne", []],
            ["\\approx", []],
            ["mg", ["mg"]],
            ["\\pi", ["\\pi"]],
            ["\\forall x \\in X, \\exists y \\lt \\epsilon", ["x", "X", "y", "\\epsilon"]],
            ["x \\times \\cos (2\\theta) = x \\times (\\cos^2 \\theta - \\sin^2 \\theta)", ["x", "\\theta"]],
          ]);
        });
        describe("validSyntax unknown()", function() {
          function run(tests) {
            forEach(tests, function (v, i) {
              it(v[0], function() {
                expect(MathCore.evaluateVerbose({
                  method: "validSyntax"
                }, v[0]).model.unknown()).toEqual(v[1]);
              });
            });
          }
          run([
            ["\\ne", []],
            ["\\approx", []],
            ["mg", []],
            ["\\pi", []],
            ["\\pix \\foo \\bar x", ["\\pix", "\\foo", "\\bar", "x"]],
            ["\\pix \\foo \\bar", ["\\pix", "\\foo", "\\bar"]],
            ["\\forall x \\in X, \\exists y \\lt \\epsilon", ["x", "X", "y"]],
            ["x \\times \\cos (2\\theta) = x \\times (\\cos^2 \\theta - \\sin^2 \\theta)", ["x"]],
          ]);
        });
        describe("validSyntax unknown('latex')", function() {
          function run(tests) {
            forEach(tests, function (v, i) {
              it(v[0], function() {
                expect(MathCore.evaluateVerbose({
                  method: "validSyntax"
                }, v[0]).model.unknown('latex')).toEqual(v[1]);
              });
            });
          }
          run([
            ["\\ne", []],
            ["\\approx", []],
            ["mg", []],
            ["\\pi", []],
            ["\\pix \\foo \\bar x", ["\\pix", "\\foo", "\\bar"]],
            ["\\pix \\foo \\bar", ["\\pix", "\\foo", "\\bar"]],
            ["\\forall x \\in X, \\exists y \\lt \\epsilon", []],
            ["x \\times \\cosx (2\\theta) = x \\times (\\cos^2 \\theta - \\sin^2 \\theta)", ["\\cosx"]],
          ]);
        });
        describe("validSyntax known()", function() {
          function run(tests) {
            forEach(tests, function (v, i) {
              it(v[0], function() {
                expect(MathCore.evaluateVerbose({
                  method: "validSyntax"
                }, v[0]).model.known()).toEqual(v[1]);
              });
            });
          }
          run([
            ["\\ne", []],
            ["\\approx", []],
            ["mg", ["mg"]],
            ["\\pi", ["\\pi"]],
            ["\\pix \\foo \\bar x", []],
            ["\\pix \\foo \\bar", []],
            ["\\forall x \\in X, \\exists y \\lt \\epsilon", ["\\epsilon"]],
            ["x \\times \\cos (2\\theta) = x \\times (\\cos^2 \\theta - \\sin^2 \\theta)", ["\\theta"]],
          ]);
        });
        describe("validSyntax known('latex')", function() {
          function run(tests) {
            forEach(tests, function (v, i) {
              it(v[0], function() {
                expect(MathCore.evaluateVerbose({
                  method: "validSyntax"
                }, v[0]).model.known('latex')).toEqual(v[1]);
              });
            });
          }
          run([
            ["\\ne", []],
            ["\\approx", []],
            ["mg", []],
            ["\\pi", ["\\pi"]],
            ["\\pix \\foo \\bar x", []],
            ["\\pix \\foo \\bar", []],
            ["\\forall x \\in X, \\exists y \\lt \\epsilon", ["\\epsilon"]],
            ["x \\times \\cos (2\\theta) = x \\times (\\cos^2 \\theta - \\sin^2 \\theta)", ["\\theta"]],
          ]);
        });
        describe("evaluateVerbose() hint()", function() {
          function run(tests) {
            forEach(tests, function (v, i) {
              it(v[0] + " | " + v[1], function() {
                expect(MathCore.evaluateVerbose({
                  method: v[0],
                  value: v[1][0]
                }, v[1][1]).model.hint()).toEqual(v[2]);
              });
            });
          }
          var tests = [
            ["validSyntax", [undefined, "x^23"], ["2016: Exponents should be wrapped in braces."]],
            ["equivValue", ["x=10", "x=10"], ["2005: Non-numeric expressions cannot be compared with equivValue."]],
          ];
          run(tests);
        });
        describe("various", function() {
          function run(tests) {
            forEach(tests, function (v, i) {
              it(v[0] + " | " + v[1] + " | " + JSON.stringify(v[2]), function() {
                MathCore.setTimeoutDuration(50);
                expect(MathCore.evaluateVerbose({
                  method: v[0],
                  value: v[1][0],
                  options: v[2]
                }, v[1][1]).errorCode).toEqual(v[3]);
                MathCore.setTimeoutDuration(0);
              });
            });
          }
          var tests = [
            ["isSimplified", [undefined, "\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{y\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{\\frac{yy\\frac{\\frac{yyyyy\\frac{\\frac{\\frac{\\frac{yy\\frac{\\frac{yyyy\\frac{\\frac{\\frac{\\frac{yyyy\\frac{yy\\frac{\\frac{\\frac{ }{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }}{ }"], {}, 3005],
          ];
          run(tests);
        });
      });
    });
  });
});
