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

define(["mathcore"], function (MathCore) {
  describe("Math Core", function() {
    describe("Miscellaneous Syntax", function() {
      describe("equivLiteral", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivLiteral",
                value: v[0]
              }, v[1])).toBe(true);
            });
          });
        }
        run([
          ["mg", "mg"],
          ["\\mug", "\\mug"],
          ["\\mus", "\\mus"],
          ["\\mum", "\\mum"],
          ["\\muL", "\\muL"],
          ["{1+2}", "(1+2)"],
          ["[1+2]", "(1+2)"],
          ["\\ \\:\\;\\,\\!\\quad\\qquad xyz", "xyz"],
          ["\\vec{a}", "\\vec{a}"],
          ["f(x)=(2x+1)(x-5)","f(x)=(2x+1)(x-5)"],
          ["x_y^z", "x_y^z"],
          ["=x", "=x"],
          ["<=x=y=", "<=x=y="],
          [">=x", ">=x"],
          ["x=", "x="],
          ["x<", "x<"],
          ["x_{y-1}^z", "x_{y-1}^z"],
          ["10 \\lt 20", "10 \\lt 20"],
          ["10 \\le 20", "10 \\le 20"],
          ["10 \\gt 20", "10 \\gt 20"],
          ["10 \\ge 20", "10 \\ge 20"],
          ["y \\le \\epsilon", "y \\le \\epsilon"],
          ["\\forall x \\in X, \\exists y \\lt \\epsilon", "\\forall x \\in X, \\exists y \\lt \\epsilon"],
          ["\\cos (2\\theta) = \\cos^2 \\theta - \\sin^2 \\theta", "\\cos (2\\theta) = \\cos^2 \\theta - \\sin^2 \\theta"],
          ["\\lim_{x \\to \\infty} \\exp(x) = 0", "\\lim_{x \\to \\infty} \\exp x = 0"],
          ["\\sum_{i=1}^{10} t_i", "\\sum_{i=1}^{10} t_i"],
          ["\\int_0^\\infty \\mathrm{e}^{-x}\\,\\mathrm{d}x", "\\int_0^\\infty \\mathrm{e}^{-x}\\,\\mathrm{d}x"],
          ["\\prod_{i=1}^{n} x_i","\\prod_{i=1}^{n} x_i"],
          ["\\text{foo bar abc}", "\\text{foo bar abc}"],
          ["\\text{foo bar abc}^2", "\\textbf{foo bar abc}^2"],
          ["\\left(A\\right)'", "\\left(A\\right)'"],
          ["\\frac{\\text{increase}}{\\text{original value}}\\times100\\%=\\frac{1386.49}{4188.79}\\times100\\%=33.1\\%", "\\frac{\\text{increase}}{\\text{original value}}\\times100\\%=\\frac{1386.49}{4188.79}\\times100\\%=33.1\\%"],
          ["(1, 3)", "(1, 3)"],
          ["(-1, 3)", "(-1, 3)"]
        ]);
      });
      describe("equivLiteral", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivLiteral",
                options: {
                  allowInterval: true,
                },
                value: v[0]
              }, v[1])).toBe(true);
            });
          });
        }
        run([
          ["(1,2]", "(1,2]"],
          ["[1,2]", "[1,2]"],
        ]);
      });
      describe("NOT equivLiteral allowInterval", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivLiteral",
                options: {
                  allowInterval: true,
                },
                value: v[0]
              }, v[1])).toBe(false);
            });
          });
        }
        run([
          ["(1,2]", "(1,2)"],
          ["[1,2]", "(1,2)"],
        ]);
      });
      describe("NOT equivLiteral", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivLiteral",
                value: v[0]
              }, v[1])).not.toBe(true);
            });
          });
        }
        run([
          [".", "."],
          ["558x3=\\text{6\\ and\\ it\\ is\\ position\\ 25\\ or\\ 28\\ or\\ something\\ like\\ that.\\ }65", "(-2,-16), (-1,-4), (0,0), (1,-4), (2,-16)"],
          ["558x3=6\\ and\\ it\\ is\\ position\\ 25\\ or\\ 28\\ or\\ something\\ like\\ that.\\ 65", "(-2,-16), (-1,-4), (0,0), (1,-4), (2,-16)"],
          ["[1,2]", "(1,2)"],
          ["10 \\text{foo bar abc}", "\\text{foo bar abc} 10"],
          ["x_y^z", "x_y_z"],
          ["10 \\lt 20", "10 \\le 20"],
          ["10 \\le 20", "10 \\lt 20"],
          ["10 \\gt 20", "10 \\ge 20"],
          ["10 \\ge 20", "10 \\gt 20"],
          ["(1, 3)", "1, 3"],
          ["(-1, 3)", "-1, 3"]
        ]);
      });
      describe("equivLiteral ignoreText", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivLiteral",
                options: {
                  "ignoreText": true
                },
                value: v[0],
              }, v[1])).toBe(true);
            });
          });
        }
        run([
          ["\\text{ignore this}1+2", "1+2"],
        ]);
      });
      describe("equivSyntax", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivSyntax",
                value: v[0],
              }, v[1])).toBe(true);
            });
          });
        }
        run([
          [["\\format{\\nonMixedFraction}"], "1/2"],
          [["\\format{\\nonMixedFraction}"], "\\frac{1}{2}"],
          [["\\format{\\nonMixedFraction}"], "\\frac{1}{2}"],
          [["\\format{\\variable{1}}\\format{\\variable}\\format{\\variable{1}}"], "aaa"],
          [["\\format{\\integer}"], "1"],
          [["\\format{\\variable}"], "a"],
          [["\\format{\\variable{1}}"], "a"],
          [["\\format{\\variable{1}}\\format{\\variable}\\format{\\variable{1}}"], "aba"],
          [["\\format{\\variable{1}}\\format{\\variable}\\format{\\variable{1}}"], "aba"],
          [["\\format{\\variable}\\format{\\variable}\\format{\\variable}"], "abc"],
          [["\\format{\\variable{1}}\\format{\\variable{1}}"], "aa"],
          [["\\format{\\decimal{2}, integer}"], "1.23"],
          [["\\format{\\decimal{2}}"], "1.23"],
          [["\\format{\\decimal}"], "1.23"],
          [["\\format{\\number{2}, \\integer}"], "1.23"],
          [["\\format{\\number{2}}"], "1.23"],
          [["\\format{\\number}"], "1.23"],
          [["\\format{\\fractionOrDecimal}"], "1.23"],
          [["\\format{\\decimal{2}, \\integer}"], "1"],
          [["\\format{\\integer}"], "1"],
          [["\\format{\\fractionOrDecimal}"], "\\frac{1}{2}"],
          [["\\format{\\fractionOrDecimal}"], "1\\frac{1}{2}"],
          [["\\format{\\mixedFraction}"], "1 1/2"],
          [["\\format{\\mixedFraction}"], "1\\frac{1}{2}"],
          ["\\format{\\variable{1}}\\format{\\variable}\\format{\\variable{1}}", "xxx"],
          [["\\format{\\decimal}"], "1."],
          [["\\format{\\decimal}"], "221.23"],
          [["\\format{\\decimal{0}}"], "1."],
          [["\\format{\\decimal{1}}"], "1.2"],
          [["\\format{\\decimal{4}}"], "1.2000"],
          [["(x+y)(x+\\format{\\integer})", "(x+\\format{\\integer})(x+y)"], "(x+2)(x+y)"],
          [["(\\format{\\variable{0}}+\\format{\\integer})(\\format{\\variable{1}}+\\format{\\integer})"], "(x+2)(y+3)"],
          [["\\format{\\variable{0}}\\format{\\variable{1}}"], "xy"],
          [["\\format{\\scientific}"], "1.0\\times10^2"],
          [["\\format{\\scientific{1}}"], "1.0\\times10^2"],
          [["\\format{\\scientific{4}}"], "1.0123\\times10^{10}"],
          [["\\format{\\number}"], "1"],
          [["\\format{\\number}"], "221.23"],
          [["\\format{\\number{0}}"], "1"],
          [["\\format{\\number{1}}"], "1.2"],
          [["\\format{\\number{4}}"], "1.2000"],
          [["\\frac{\\format{\\integer}}{\\format{\\integer}}"], "1/3"],
          [["\\frac{\\format{\\integer}}{\\format{\\integer}}"], "\\frac{1}{3}"],
          [["x+\\format{\\integer{3}}+1.2", "x+\\format{\\integer{2}}"], "x+100+1.2"],
          [["x+\\format{\\integer{3}}", "x+\\format{\\integer{2}}"], "x+10"],
          [["x+\\format{\\integer{2}}"], "x+10"],
          [["x+\\format{\\integer}"], "x+1"],
          ["x+1", "x+1"],
          ["1/2", "1/2"],
          [["1/2", "1.3"], "1/2"],
          [["1/2", "1.3"], "1.3"],
          [["1/2", "1"], "1"],
          ["1/2", "1/2"],
          [".1", ".1"],
          ["0.1", "0.1"],
          ["0.100", "0.100"],
          ["1 1/2", "1 1/2"],
          ["(1/2)/(1/2)", "(1/2)/(1/2)"],
          [".1/2", ".1/2"],
          ["2^1", "2^1"],
          ["2:1", "2:1"],
          ["100%", "100%"],
          ["1.0\\times10^2", "1.0*10^2"],
          [["x+1"], "x+1"],
          [".3", "0.3"],
          [["\\frac{1}{2}", "1\\frac{1}{2}"], "\\frac{1}{2}"],
          [["\\frac{1}{2}", "1\\frac{1}{2}"], "1\\frac{1}{2}"],
          [["1.5", "\\frac{1}{2}", "1\\frac{1}{2}"], "1.5"],
        ]);
      });
      describe("NOT equivSyntax", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivSyntax",
                options: {
                },
                value: v[0],
              }, v[1])).toBe(false);
            });
          });
        }
        run([
          [["\\format{\\nonMixedFraction}"], "1.23\\frac{1}{2}"],
          [["\\format{\\nonMixedFraction}"], "1 1/2"],
          [["\\format{\\nonMixedFraction}"], "1\\frac{1}{2}"],
          [["\\format{\\nonMixedFraction}"], "1.23\\frac{1}{2}"],
          [["\\format{\\scientific}"], "1.0\\div10"],
          ["\\format{\\variable{1}}\\format{\\variable{1}}", "xy"],
          [["\\format{\\decimal}"], "1,000.0"],
          [["\\format{\\integer}"], "1,000"],
          [["\\format{\\number}"], "1,000.0"],
          [["\\format{\\decimal}"], "1"],
          [["\\format{\\decimal{0}}"], "1"],
          [["\\format{\\decimal{1}}"], "1.20"],
          [["(\\format{\\variable{0}}+\\format{\\integer})(\\format{\\variable{1}}+\\format{\\integer})"], "(x+2)(x+3)"],
          ["0.3", "0.300"],
          ["x*1", "x+1"],
          ["(1/2)/(1/2)", "1 2/3"],
          ["1/2", "0.5"],
          ["1 1/2", "1.5"],
          ["2:1", "3=2"],
          ["2:1", "3/2"],
          ["7 1/2", "0.3"],
        ]);
      });
      describe("equivSyntax", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivSyntax",
                options: {
                  allowThousandsSeparator: true,
                },
                value: v[0],
              }, v[1])).toBe(true);
            });
          });
        }
        run([
          [["\\format{\\decimal}"], "1,000.0"],
          [["\\format{\\integer}"], "1,000"],
          [["\\format{\\number}"], "1,000.0"],
        ]);
      });
    });
  });
});
