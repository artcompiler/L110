/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2013 Learnosity Ltd. All Rights Reserved.
 *
 */

"use strict";

var TEST_LIB = true;
if (TEST_LIB) {
  requirejs.config({
    baseUrl: "../../lib",
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
    describe("Lists", function() {
      describe("equivSymbolic", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivSymbolic",
                value: v[0],
              }, v[1])).toBe(true);
            });
          });
        }
        run([
          ["\\left(-2,-16\\right),\\left(-1,-4\\right),\\left(0,0\\right),\\left(1,-4\\right),\\left(2,-16\\right)", "(-2,-16), (-1,-4), (0,0), (1,-4), (2,-16)"]
        ]);
      });
    });
    describe("Matricies", function() {
      describe("equivLiteral", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivLiteral",
                options: {ignoreText: true},
                value: v[0],
              }, v[1])).toBe(true);
            });
          });
        }
        run([
            [
                "\\begin{bmatrix}0-1&-3-\\left(-2\\right)\\\\7-6&5-7\\\\5-\\left(-1\\right)&-2-0\\\\9-2&-4-4\\end{bmatrix}",
                "\\begin{bmatrix}0-1&-3-\\left(-2\\right)\\\\7-6&5-7\\\\5-\\left(-1\\right)&-2-0\\\\9-2&-4-4\\end{bmatrix}"
            ],
            [
                "\\begin{bmatrix}0-1&-3-(-2)\\\\7-6&5-7\\\\5-(-1)&-2-0\\\\9-2&-4-4\\end{bmatrix}",
                "\\begin{bmatrix}0-1&-3-(-2)\\\\7-6&5-7\\\\5-(-1)&-2-0\\\\9-2&-4-4\\end{bmatrix}"
            ],
            [
                "\\begin{bmatrix}0-1&-3-(-2)\\\\7-6&5-7\\\\5-(-1)&-2-0\\\\9-2&-4-4\\end{bmatrix}",
                "\\begin{bmatrix}0-1&-3-\\left(-2\\right)\\\\7-6&5-7\\\\5-\\left(-1\\right)&-2-0\\\\9-2&-4-4\\end{bmatrix}"
            ],
            [
                "\\begin{bmatrix}0-1&-3-\\left(-2\\right)\\\\7-6&5-7\\\\5-\\left(-1\\right)&-2-0\\\\9-2&-4-4\\end{bmatrix}",
                "\\begin{bmatrix}0-1&-3-(-2)\\\\7-6&5-7\\\\5-(-1)&-2-0\\\\9-2&-4-4\\end{bmatrix}"
            ]
        ]);
      });
      describe("equivLiteral", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivLiteral",
                value: v[0],
                options: {
                  decimalPlaces: "1"
                }
              }, v[1])).toBe(true);
            });
          });
        }
        run([
          [
            "\\begin{bmatrix}0&0\\\\0&0\\end{bmatrix}\\times2",
            "\\begin{bmatrix}0&0\\\\0&0\\end{bmatrix}\\times2"
          ],
          [
            "\\begin{bmatrix}0&0\\\\0&0\\end{bmatrix}\\times2=0",
            "\\begin{bmatrix}0&0\\\\0&0\\end{bmatrix}\\times2=0"
          ],
          [
            "\\begin{bmatrix}0&0\\\\0&0\\end{bmatrix}\\times2=\\begin{bmatrix}0&0\\\\0&0\\end{bmatrix}",
            "\\begin{bmatrix}0&0\\\\0&0\\end{bmatrix}\\times2=\\begin{bmatrix}0&0\\\\0&0\\end{bmatrix}"
          ],
          ["\\begin{matrix} a & b & c \\end{matrix}",
           "\\begin{matrix} a & b & c \\end{matrix}",
          ],
          ["\\begin{matrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{matrix}",
           "\\begin{matrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{matrix}",
          ],
          ["\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix}",
           "\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix}",
          ],
          // matrix types
          ["\\begin{matrix}x\\end{matrix}", "\\begin{matrix}x\\end{matrix}"],
          ["\\begin{bmatrix}x\\end{bmatrix}", "\\begin{bmatrix}x\\end{bmatrix}"],
          ["\\begin{Bmatrix}x\\end{Bmatrix}", "\\begin{Bmatrix}x\\end{Bmatrix}"],
          ["\\begin{pmatrix}x\\end{pmatrix}", "\\begin{pmatrix}x\\end{pmatrix}"],
          ["\\begin{vmatrix}x\\end{vmatrix}", "\\begin{vmatrix}x\\end{vmatrix}"],
          ["\\begin{Vmatrix}x\\end{Vmatrix}", "\\begin{Vmatrix}x\\end{Vmatrix}"],
        ]);
      });
      describe("NOT equivLiteral", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivLiteral",
                value: v[0]
              }, v[1])).toBe(false);
            });
          });
        }
        run([
        ]);
      });
      describe("equivSymbolic allowDecimal", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivSymbolic",
                options: {
                  allowDecimal: true,
                  decimalPlaces: 10,
                },
                value: v[0],
              }, v[1])).toBe(true);
            });
          });
        }
        run([
            [
                "\\begin{bmatrix}0-1&-3-\\left(-2\\right)\\\\7-6&5-7\\\\5-\\left(-1\\right)&-2-0\\\\9-2&-4-4\\end{bmatrix}",
                "\\begin{bmatrix}0-1&-3-\\left(-2\\right)\\\\7-6&5-7\\\\5-\\left(-1\\right)&-2-0\\\\9-2&-4-4\\end{bmatrix}"
            ],
            [
                "\\begin{bmatrix}0-1&-3-(-2)\\\\7-6&5-7\\\\5-(-1)&-2-0\\\\9-2&-4-4\\end{bmatrix}",
                "\\begin{bmatrix}0-1&-3-(-2)\\\\7-6&5-7\\\\5-(-1)&-2-0\\\\9-2&-4-4\\end{bmatrix}"
            ],
            [
                "\\begin{bmatrix}0-1&-3-(-2)\\\\7-6&5-7\\\\5-(-1)&-2-0\\\\9-2&-4-4\\end{bmatrix}",
                "\\begin{bmatrix}0-1&-3-\\left(-2\\right)\\\\7-6&5-7\\\\5-\\left(-1\\right)&-2-0\\\\9-2&-4-4\\end{bmatrix}"
            ],
            [
                "\\begin{bmatrix}0-1&-3-\\left(-2\\right)\\\\7-6&5-7\\\\5-\\left(-1\\right)&-2-0\\\\9-2&-4-4\\end{bmatrix}",
                "\\begin{bmatrix}0-1&-3-(-2)\\\\7-6&5-7\\\\5-(-1)&-2-0\\\\9-2&-4-4\\end{bmatrix}"
            ]
        ]);
      });
      describe("equivSymbolic", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivSymbolic",
                value: v[0]
              }, v[1])).toBe(true);
            });
          });
        }
        run([
          ["\\begin{matrix} 1 & 2 & 3 \\end{matrix} + \\begin{matrix} 1 & 2 & 3 \\end{matrix}",
           "\\begin{matrix} 2 & 4 & 6 \\end{matrix}",
          ],
          ["\\begin{matrix} 1 & 2 & 3 \\\\ 4 & 5 & 6 \\\\ 7 & 8 & 9 \\end{matrix} + " +
           "\\begin{matrix} 9 & 8 & 7 \\\\ 6 & 5 & 4 \\\\ 3 & 2 & 1 \\end{matrix}",
           "\\begin{matrix} 10 & 10 & 10 \\\\ 10 & 10 & 10 \\\\ 10 & 10 & 10 \\end{matrix}",
          ],
          // specific examples
          // comparison against self
          ["\\begin{bmatrix}1&2x\\\\x^2&y\\end{bmatrix}", "\\begin{bmatrix}1&2x\\\\x^2&y\\end{bmatrix}"],
          ["\\begin{bmatrix}a_{11}&a_{12}&\\ldots&a_{1n}\\\\a_{21}&a_{22}&\\ldots&a_{2n}\\\\\\vdots&\\vdots&\\ddots&\\vdots\\\\a_{m1}&a_{m2}&\\ldots&a_{mn}\\end{bmatrix}", "\\begin{bmatrix}a_{11}&a_{12}&\\ldots&a_{1n}\\\\a_{21}&a_{22}&\\ldots&a_{2n}\\\\\\vdots&\\vdots&\\ddots&\\vdots\\\\a_{m1}&a_{m2}&\\ldots&a_{mn}\\end{bmatrix}"],
          // multiplication
          ["2\\times\\begin{bmatrix}1&x\\\\2x&x^2\\end{bmatrix}",
           "\\begin{bmatrix}2&2x\\\\4x&2x^2\\end{bmatrix}"],
          ["x\\times\\begin{matrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{matrix}",
           "\\begin{matrix} ax & bx & cx \\\\ dx & ex & fx \\\\ gx & hx & ix \\end{matrix}"],
          ["\\begin{bmatrix}x&y&z\\end{bmatrix}\\times\\begin{bmatrix}2\\\\3\\\\4\\end{bmatrix}",
           "\\begin{bmatrix}2x+3y+4z\\end{bmatrix}"],
        ]);
      });
      describe("equivValue", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivValue",
                value: v[0]
              }, v[1])).toBe(true);
            });
          });
        }
        run([
          ["\\left(-\\frac{3}{4},-\\frac{3}{4}\\right)", "(-\\frac{3}{4},-\\frac{3}{4})"],
          ["\\left(-\\frac{3}{4},-\\frac{3}{4}\\right)", "(-\\frac{6}{8},-\\frac{6}{8})"],
          ["\\left(\\frac{3}{4},\\frac{3}{4}\\right)", "(\\frac{6}{8},\\frac{6}{8})"],
          ["\\left(-\\frac{3}{4},-\\frac{3}{4}\\right)", "(-\\frac{12}{16},-\\frac{12}{16})"],
          ["\\left(\\frac{3}{4},\\frac{3}{4}\\right)", "(\\frac{12}{16},\\frac{12}{16})"],
        ]);
      });
      describe("NOT equivValue", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivValue",
                value: v[0],
                options: {
                  decimalPlaces: "1"
                }
              }, v[1])).toBe(false);
            });
          });
        }
        run([
        ]);
      });
      describe("equivValue decimalPlaces", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1] + " | " + v[2], function() {
              expect(MathCore.evaluate({
                method: "equivValue",
                value: v[0],
                options: {
                  decimalPlaces: v[2]
                }
              }, v[1])).toBe(true);
            });
          });
        }
        run([
        ]);
      });
      describe("NOT equivValue decimalPlaces", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1] + " | " + v[2], function() {
              expect(MathCore.evaluate({
                method: "equivValue",
                value: v[0],
                options: {
                  decimalPlaces: v[2]
                }
              }, v[1])).toBe(false);
            });
          });
        }
        run([
        ]);
      });
      describe("equivSymbolic", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivSymbolic",
                value: v[0]
              }, v[1])).toBe(true);
            });
          });
        }
        run([
          ["1, 2, 3", "1, 2, 3"],
          ["(1, 2, 3)", "(1, 2, 3)"],
          ["\\text{Midpoint: }\\left(1,3\\right)", "\\text{Midpoint: }\\left(1,3\\right)"],
          ["100, 200, 300", "10^2, 2*100, 3*100"],
        ]);
      });
      describe("NOT equivSymbolic", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivSymbolic",
                value: v[0],
              }, v[1])).toBe(false);
            });
          });
        }
        run([
          ["\\text{Midpoint: }\\left(1,3\\right)", "\\text{Midpoint: }\\left(3,1\\right)"],
        ]);
      });
    });  // END Matricies
    describe("Intervals", function() {
      describe("equivLiteral", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivValue",
                value: v[0],
                options: {
                  allowInterval: true,
                }
              }, v[1])).toBe(true);
            });
          });
        }
        run([
          ["(1, 3)", "(1, 3)"],
          ["(1, 3]", "(1, 3]"],
          ["[1, 3]", "[1, 3]"],
          ["[1, 3)", "[1, 3)"],
        ]);
      });
      describe("NOT equivLiteral", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivLiteral",
                options: {
                  allowInterval: true,
                },
                value: v[0],
              }, v[1])).toBe(false);
            });
          });
        }
        run([
            ["[-1,0)", "[-1,0]"],
        ]);
      });
      describe("equivSymbolic", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivSymbolic",
                value: v[0],
                options: {
                  allowInterval: true,
                },
              }, v[1])).toBe(true);
            });
          });
        }
        run([
          ["(1, 2]", "(1, 2]"],
          ["(1, 2)", "(1, 2)"],
          ["(1, 10)", "(1, 9+1)"],
          ["(1, 100]", "(1, 101-1]"],
        ]);
      });
      describe("equivValue", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivValue",
                value: v[0],
                options: {
                  allowInterval: true,
                },
              }, v[1])).toBe(true);
            });
          });
        }
        run([
        ]);
      });
      describe("NOT equivValue", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivValue",
                value: v[0],
                options: {
                  allowInterval: true,
                },
              }, v[1])).toBe(false);
            });
          });
        }
        run([
        ]);
      });
      describe("equivValue decimalPlaces", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1] + " | " + v[2], function() {
              expect(MathCore.evaluate({
                method: "equivValue",
                value: v[0],
                options: {
                  decimalPlaces: v[2],
                  options: {
                    allowInterval: true,
                  }
                }
              }, v[1])).toBe(true);
            });
          });
        }
        run([
        ]);
      });
      describe("NOT equivValue decimalPlaces", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1] + " | " + v[2], function() {
              expect(MathCore.evaluate({
                method: "equivValue",
                value: v[0],
                options: {
                  decimalPlaces: v[2],
                  options: {
                    allowInterval: true,
                  }
                }
              }, v[1])).toBe(false);
            });
          });
        }
        run([
        ]);
      });
      describe("equivSymbolic", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivSymbolic",
                value: v[0],
                options: {
                  allowInterval: true,
                }
              }, v[1])).toBe(true);
            });
          });
        }
        run([
        ]);
      });
    });  // END Intervals
    describe("Functions : Trigonometric", function() {
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
          ["\\sin^{-1} 0", "\\sin^{-1}(0)"],
          ["\\cos^{-1} 0", "\\cos^{-1}(0)"],
          ["\\tan^{-1} 0", "\\tan^{-1}(0)"],
          ["\\arcsin 0", "\\arcsin (0)"],
          ["\\arccos 0", "\\arccos (0)"],
          ["\\arctan 0", "\\arctan (0)"],
          ["sin(u-v)=sin(u)cos(u)-cos(u)sin(v)", "sin(u-v)=sin(u)cos(u)-cos(u)sin(v)"],
          ["\\frac{\\sin x}{\\cos x}", "\\frac{\\sin x}{\\cos x}"],
          ["\\tan x", "\\tan x"],
          ["10\\frac{\\sin x}{\\cos x}", "10(\\sin x / \\cos x)"],
        ]);
      });
      describe("NOT equivLiteral", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivLiteral",
                value: v[0]
              }, v[1])).toBe(false);
            });
          });
        }
        run([
        ]);
      });
      describe("equivLiteral ignoreOrder", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivLiteral",
                value: v[0],
                options: {
                  ignoreOrder: true
                }
              }, v[1])).toBe(true);
            });
          });
        }
        run([
          ["sin^2 x + cos^2 x", "cos^2 x + sin^2 x"],
        ]);
      });
      describe("equivValue", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivValue",
                value: v[0]
              }, v[1])).toBe(true);
            });
          });
        }
        run([
          ["\\sin\\frac{\\pi}{2}", "1"],
          ["\\cos\\frac{\\pi}{2}", "0"],
          ["\\tan\\pi", "0"],
          ["\\arcsin(1)", "\\frac{\\pi}{2}"],
          ["\\arccos(1)", "0"],
          ["\\arctan(1)", ".78539816339"],
        ]);
      });
      describe("equivSymbolic", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivSymbolic",
                value: v[0]
              }, v[1])).toBe(true);
            });
          });
        }
        run([
          ["5=y+x", "5+\\arcsin(x)=y+x+\\arcsin(x)"],
          ["5=y+x", "5+\\arcsin(x)=y+x+\\sin^{-1}(x)"],
          ["5=x+y", "5+\\sin^{-1}(-1)=x+y+\\arcsin(-1)"],
          ["5=x+y", "5+\\arcsin(-1)=x+y+\\arcsin(-1)"],
          ["5=x+y", "5+\\arcsin(30)=x+y+\\arcsin(30)"],
          ["5=x+y", "5+\\sin^{-1}(30)=x+y+\\arcsin(30)"],
          ["5=x+y", "5+\\sin^{-1}(30)=x+y+\\sin^{-1}(30)"],
          ["5=x+y", "5+\\sin(30)=x+y+\\sin(30)"],
          ["5=x+y", "5+\\sin(x)=x+y+\\sin(x)"],
          ["\\sin x", "\\sin(x)"],
          ["\\tan x", "\\frac{\\sin x}{\\cos x}"],
          ["\\tan x", "\\frac{1}{\\cot x}"],
          ["\\cot x", "\\frac{1}{\\tan x}"],
          ["\\cot x", "\\frac{\\cos x}{\\sin x}"],
          ["\\sec x", "\\frac{1}{\\cos x}"],
          ["\\csc x", "\\frac{1}{\\sin x}"],
          ["\\sin^{-1} 0", "\\sin^{-1}(0)"],
        ]);
      });
      describe("NOT equivSymbolic", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivSymbolic",
                value: v[0]
              }, v[1])).toBe(false);
            });
          });
        }
        run([
          ["\\sin x", "\\cos x"],
          ["\\tan x", "\\frac{1}{\\cos x}"],
          ["\\sin^2 x + \\cos^2 x", "cos^2 x + sin^2 x"],  //not matching because s * i * n != to \sin
          ["\\sin x", "sin x"],  //not matching because s * i * n != to \sin

        ]);
      });
    });
    describe("Functions : Logarithmic", function() {
      describe("equivValue", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivValue",
                value: v[0]
              }, v[1])).toBe(true);
            });
          });
        }
        run([
          ["\\log_2(16)", "4"],
          ["\\log_2(1/2)", "-1"],
        ]);
      });
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
          ["\\log_e 10", "\\log_e 10"],
          ["\\log 10", "\\log_e 10"],
          ["\\log 10", "\\log 10"],
          ["\\log_10 10", "\\lg 10"],
          ["\\lg x", "\\lg x"],
          ["\\ln \\theta", "\\ln \\theta"],
          ["\\log_e 10", "\\log_e 10"],
          ["\\log 10", "\\log_e 10"],
          ["\\log 10", "\\log 10"],
          ["\\log_10 10", "\\lg 10"],
        ]);
      });
      describe("NOT equivLiteral", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivLiteral",
                value: v[0]
              }, v[1])).toBe(false);
            });
          });
        }
        run([
        ]);
      });
      describe("equivSymbolic", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivSymbolic",
                value: v[0]
              }, v[1])).toBe(true);
            });
          });
        }
        run([
          ["\\lg(\\sqrt{x})", "\\frac{\\frac{\\ln(x)}{\\ln(10)}}{2}"],
          ["\\lg(\\sqrt{x})", "\\frac{\\lg(x)}{2}"],
          ["\\lg(x)", "\\frac{\\ln(x)}{\\ln(10)}"],
          ["\\frac{\\lg(x)}{2}", "\\frac{\\frac{\\ln(x)}{\\ln(10)}}{2}"],
          ["\\ln(\\sqrt{x})", "\\frac{\\ln(x)}{2}"],
          ["\\log_e(\\sqrt{x})", "\\frac{\\log_e(x)}{2}"],
          ["\\ln(\\frac{x}{y})", "\\ln(x)-\\ln(y)"],
          ["\\lg(1)", "\\ln(1)"],
          ["\\log_e(1)", "0"],
          ["\\log_2(1/2)", "-1"],
          ["\\log(xy)", "\\log(x)+\\log(y)"],
          ["\\log_b(xy)", "\\log_b(x)+\\log_b(y)"],
          ["\\log(\\sqrt{x})", "\\frac{\\log(x)}{2}"],
          ["\\ln(x/y)", "\\ln(x)-\\ln(y)"],
          ["\\ln x", "\\ln x"],
          ["\\ln(10*20)", "\\ln(10)+\\ln(20)"],
          ["\\ln(xy)", "\\ln(x)+\\ln(y)"],
          ["10^(x+y)", "10^x*10^y"],
          ["\\log_10(x)", "\\frac{\\log_e(x)}{\\log_e(10)}"],
          ["5x \\div (5x)", "1"],
        ]);
      });
      describe("NOT equivSymbolic", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivSymbolic",
                value: v[0]
              }, v[1])).toBe(false);
            });
          });
        }
        run([
        ]);
      });
    });
  });
});
