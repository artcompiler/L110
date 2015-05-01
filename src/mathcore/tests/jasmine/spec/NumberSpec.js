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
    describe("Numbers", function() {
      describe("equivLiteral", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivLiteral",
                value: v[0],
              }, v[1])).toBe(true);
            });
          });
        }
        run([
          ["1/2/3/4", "\\frac{\\frac{\\frac{1}{2}}{3}}{4}"],
          ["1/2\\div1/2", "\\frac{1}{2}\\div\\frac{1}{2}"],
          ["1/2 \\div x_1/2", "\\frac{1}{2}\\div\\frac{x_1}{2}"],
          ["3-(-2)", "3-(-2)"],
          ["-(-2)", "-(-2)"],
          [".12", "0.12"],
          [".12", "00.12"],
          ["10^{\\circ}", "10^{\\circ}"],
          ["10^{\\circ}", "10\\degree"],
          ["9_P_6=\\frac{9!}{(9-6)!}", "9_P_6=\\frac{9!}{(9-6)!}"],
          ["^9P_6=\\frac{9!}{(9-6)!}", "^9P_6=\\frac{9!}{(9-6)!}"],
          ["1,000", "1,000"],
          ["3, \\infty", "3, \\infty"],
          ["|-3|", "|-3|"],
          ["\\vert-3\\vert", "\\vert-3\\vert"],
          ["\\lvert-3\\rvert", "\\lvert-3\\rvert"],
          ["\\mid-3\\mid", "\\mid-3\\mid"],
          ["A_{\\text{r}}\\text{(O)}=\\frac{15.995 \\times1+1 \\times0.04+17.999 \\times0.20}{100}", "A_{\\text{r}}\\text{(O)}=\\frac{15.995 \\times1+1 \\times0.04+17.999 \\times0.20}{100}"],
        ]);
      });
      describe("equivLiteral ignoreTrailingZeros", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivLiteral",
                value: v[0],
                options: {
                  ignoreTrailingZeros: true
                },
              }, v[1])).toBe(true);
            });
          });
        }
        run([
          ["2.0", "2"],
          [".12", ".120"],
          [".12", "0.120000"],
        ]);
      });
      describe("NOT equivLiteral", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivLiteral",
                value: v[0],
              }, v[1])).not.toBe(true);
            });
          });
        }
        run([
          ["5", "----5"],
          ["5", "-(-5)"],
          ["1 \\div 2", "\\frac{1}{2}"],
          [".12", ".120"],
          [".12", "0.120000"],
          ["1,000", "1000"],
          ["1\\times2", "2\\times1"],
          ["1\\times2", "2\\times2"],
          ["1\\div2", "2\\times1"],
          ["1\\div2", "2\\div4"]
        ]);
      });
      describe("equivLiteral allowThousandsSeparator=true", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivLiteral",
                value: v[0],
                options: {
                  allowThousandsSeparator: true
                }
              }, v[1])).toBe(true);
            });
          });
        }
        run([
          ["1,000", "1000"],
          ["1000", "1,000"],
          ["1,000,000", "1000000"],
          ["1,234,567", "1234567"],
        ]);
      });
      describe("NOT equivLiteral allowThousandsSeparator=false", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivLiteral",
                value: v[0],
                options: {
                  allowThousandsSeparator: false
                }
              }, v[1])).not.toBe(true);
            });
          });
        }
        run([
          ["1,000", "1000"],
          ["1000", "1,000"],
          ["1,000,000", "1000000"],
          ["1,234,567", "1234567"],
        ]);
      });
      describe("equivLiteral setThousandsSeparator=[' '] setDecimalSeparator=[',']", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivLiteral",
                value: v[0],
                options: {
                  allowThousandsSeparator: true,
                  setThousandsSeparator: [' '],
                  setDecimalSeparator: ',',
                }
              }, v[1])).toBe(true);
            });
          });
        }
        run([
          ["1 000", "1000"],
          ["1 000 000", "1000000"],
          ["1 000 000,00", "1000000,00"],
          ["1999", "1\\ 999"]
        ]);
      });
      describe("NOT equivLiteral allowThousandsSeparator=[' '] setDecimalSeparator=undefined", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivLiteral",
                value: v[0],
                options: {
                  allowThousandsSeparator: true,
                  setThousandsSeparator: [' ', '\''],
                }
              }, v[1])).not.toBe(true);
            });
          });
        }
        run([
          ["1,000", "1000"],
          ["1 000'000", "1000000"],
          ["1 000 000.00", "1000000,00"],
        ]);
      });
      describe("NOT equivLiteral allowThousandsSeparator=['.'] setDecimalSeparator=undefined", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivLiteral",
                value: v[0],
                options: {
                  allowThousandsSeparator: true,
                  setThousandsSeparator: [' ', '\''],
                }
              }, v[1])).not.toBe(true);
            });
          });
        }
        run([
          ["1.000.0", "1000"],
        ]);
      });
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
          ["\\sqrt[3]{8}", "2"],
          ["\\sqrt[3]{27}", "3"],
          ["\\sqrt[3]{64}", "4"],
          ["5!", "2*3*4*5"],
          ["\\pm\\sqrt{180}", "\\pm3\\sqrt{20}"],
          ["1\\pm\\sqrt{180}", "1\\pm3\\sqrt{20}"],
          ["2>1", "1<2"],
          ["2=1", "1=2"],
          ["\\pm\\sqrt{180}", "\\pm3\\sqrt{20}"],
          ["1\\pm\\sqrt{180}", "1\\pm3\\sqrt{20}"],
          ["0.2", "0.2+0.1-0.1"],
          ["0.2", "0.2+0.1-0.1+0.3-0.3"],
          ["\\frac{5}{2}+\\frac{5}{2}=5", "\\frac{5}{2}+\\frac{5}{2}=5"],
          ["\\frac{5}{2}+\\frac{5}{2}=5", "2.5+2.5=5"],
          ["|-10|", "10"],
          ["\\left|-10\\right|", "10"],
          ["3.06\\div3=1.02", "3.06\\div3=1.02"],
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
          ["2+2i", "2-2i"],
          ["12+10i", "12-10i"],
          ["1+2i", "1-2i"],
          ["1+i", "1-i"],
          ["\\frac{1}{2}=\\frac{1}{6}", "\\frac{1}{2}=1"],
          ["\\frac{1}{2}\\div3=\\frac{1}{6}", "\\frac{1}{2}\\div3=16"],
          ["3.06\\div3=1.02", "3.06\\div3=5"],
          ["3.06\\div3=5", "3.06\\div3=1.02"],
          ["3.06\\div3=1.9", "3.06\\div3=1.02"],
          ["2\\div1=2", "2\\div1=5"],
          ["2.5", "\\frac{5}{2}"],
        ]);
      });
      describe("NOT equivSymbolic allowDecimal=true", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivSymbolic",
                options: {
                  allowDecimal: true,
                },
                value: v[0]
              }, v[1])).not.toBe(true);
            });
          });
        }
        run([
          ["\\frac{1}{2}=\\frac{1}{6}", "\\frac{1}{2}=1"],
          ["\\frac{1}{2}\\div3=\\frac{1}{6}", "\\frac{1}{2}\\div3=16"],
        ]);
      });
      describe("equivSymbolic allowThousandsSeparator allowDecimal", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivSymbolic",
                value: v[0],
                options: {
                  allowThousandsSeparator: true,
                  allowDecimal: true
                }
              }, v[1])).toBe(true);
            });
          });
        }
        run([
          ["1234\\frac{1}{2}", "1234.5"],
          ["1234\\frac{1}{2}", "1,234.5"],
        ]);
      });
      describe("NOT equivSymbolic allowThousandsSeparator", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivSymbolic",
                value: v[0],
                options: {
                  allowThousandsSeparator: true
                }
              }, v[1])).not.toBe(true);
            });
          });
        }
        run([
          ["10,00", "1000"],  //Should fail as not a thousand separator
        ]);
      });
      describe("equivSymbolic allowDecimal", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivSymbolic",
                value: v[0],
                options: {
                  allowDecimal: true
                }
              }, v[1])).toBe(true);
            });
          });
        }
        run([
          ["0.2", "0.2+0.1-0.1"],
          ["0.2", "0.2+0.1-0.1+0.3-0.3"],
          ["\\frac{33}{8}in^3", "\\frac{33}{8}in^3"],
          ["\\frac{33}{8}in^3", "4\\frac{1}{8}in^3"],
          ["(x+2)6\\frac{1}{2}\\times\\frac{1}{4}", "(x+2)*(6+1/2)\\times\\frac{1}{4}"],
          ["6\\frac{1}{2}\\times\\frac{1}{4}", "(6+1/2)\\times\\frac{1}{4}"],
          ["6\\frac{1}{2}", "6+1/2"],
          ["-3+6.5", "3.5"],
          ["|-3|+|6.5|", "9.5"],
          ["12.5=\\frac{100}{v}", "12.5v=100"],
          ["12.5=\\frac{100}{v}", "12.5\\times v=100"],
          ["|-10|", "10"],
          ["3\\sqrt{8}-6\\sqrt{32}", "-18\\sqrt{2}"],
          ["5^3/5^7", "1/625"],
          ["3*5-7/2", "11+1/2"],
          ["3(5-7)/2", "-3"],
          ["8/2(10+15)", "100"],
          ["\\frac{7}{-2}-11(-2)+2", "20+1/2"],
          ["3.141592653589793", "2\\pi/2"],
          ["\\frac{1}{2}x", ".5x"],
          ["0.2x", "\\frac{1}{5}x"],
          ["\\frac{3}{2}", "1+\\frac{1}{2}"],
          ["0.6x", "0.6x"],
          ["0.6x", "\\frac{6}{10}x"],
          ["0.6x", "\\frac{6x}{10}"],
          ["0.2", "0.20"],
          ["0.2", "20\\%"],
          ["A_{\\text{r}}\\text{(O)}=\\frac{15.995 \\times1+1 \\times0.04+17.999 \\times0.20}{100}", "A_{\\text{r}}\\text{(O)}=\\frac{15.995 \\times1+1 \\times0.04+17.999 \\times0.20}{100}"],
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
          ["\\sqrt[3]{8}", "2"],
          ["\\sqrt[3]{27}", "3"],
          ["\\sqrt[3]{64}", "4"],
          ["5!", "2*3*4*5"],
          ["\\pm\\sqrt{180}", "\\pm3\\sqrt{20}"],
          ["1\\pm\\sqrt{180}", "1\\pm3\\sqrt{20}"],
          ["1=2", "1>4"],
          ["2>1", "2>1"],
          ["2>1", "4>1"],
          ["2>1", "1<2"],
          ["1000000{\\mu}m", "1m"],
          ["1000000{\\mu}g", "1g"],
          ["1000000{\\mu}s", "1s"],
          ["1000000{\\mu}L", "1L"],
          ["1{\\mu}L", "1*10^-6L"],
          ["1{\\mu}L", "1\\times10^-6L"],
          ["1000000\\mum", "1m"],
          ["1000000\\mug", "1g"],
          ["1000000\\mus", "1s"],
          ["1000000\\muL", "1L"],
          ["1\\muL", "1*10^-6L"],
          ["1\\muL", "1\\times10^-6L"],
          ["1\\times10^6\\muL", "1L"],
          ["\\pm\\sqrt{180}", "\\pm3\\sqrt{20}"],
          ["1\\pm\\sqrt{180}", "1\\pm3\\sqrt{20}"],
          ["1/(1/2)", "2"],
          ["1 \\div (1/2)", "2"],
          ["4.225\\pm0.025", "4.2"],
          ["4.225\\pm0.025", "4.25"],
          ["-4.225\\pm0.025", "-4.2"],
          ["-4.225\\pm0.025", "-4.249"],
          ["-4.225\\pm0.025", "-4.25"],
          ["-\\frac{1}{2}", "\\frac{-1}{2}"],
          ["-2\\frac{1}{2}", "\\frac{-5}{2}"],
          ["-2\\frac{1}{2}", "-\\frac{5}{2}"],
          ["\\frac{2}{3}\\times6\\frac{1}{4}",
           "\\frac{2}{3}\\times(6+\\frac{1}{4})"],
          ["0.5x + 0.5x", "x"],
          ["17\\frac{1}{5}", "\\frac{86}{5}"],
          ["17\\frac{1}{5} m", "\\frac{86}{5} m"],
          ["\\frac{33}{8}in^3", "\\frac{33}{8}in^3"],
          ["\\frac{33}{8}in^3", "4\\frac{1}{8}in^3"],
          ["6\\frac{1}{2}+6\\frac{1}{2}*2", "19.5"],
          ["39\\pm1in", "1m"],
          ["6\\pm0.5mL", "6.0mL"],
          ["6L\\pm5mL", "6.004L"],
          ["|-3|+|6.5|", "9.5"],
          ["6\\frac{1}{2}", "6.5"],
          ["6\\frac{2}{3}", "6+2/3"],
          ["\\binom{3}{1}", "3"],
          ["\\binom{7}{2}", "21"],
          ["\\binom{20}{3}", "1140"],
          ["|-10|", "10"],
          ["3\\sqrt{8}-6\\sqrt{32}", "-18\\sqrt{2}"],
          ["5^3/5^7", "1/625"],
          ["9/3", "3/1"],
          ["2*\\$2+8*\\$0.50", "\\$8"],
          ["\\frac{7}{-2}-11(-2)+2", "20+1/2"],
          ["360\\degree", "2\\pi\\radian"],
          ["90\\degree", "\\pi/2\\radian"],
          ["250\\times40%", "100"],
          ["100%", "1"],
          ["10%", ".1"],
          ["23%", ".23"],
          ["100\\%", "1"],
          ["10\\%", ".1"],
          ["23\\%", ".23"],
          ["\\$1", "\\$1"],
          ["\\frac{6+3*2}{6^2-30}", "2"],
          ["20-3*5+4", "9"],
          ["10 \\pm 2", "11"],
          ["10.1 \\pm .2", "10.2"],
          [".5", "1/2"],
          ["1cup", "8fl"],
          ["3cm^2/cm", "3cm"],
          ["128fl", "1gal"],
          ["1000mg", "1g"],
          ["1000000000nL", "1L"],
          ["1cm^3", "1cm^3"],
          // FUTURE compound units not currently supported
          //["1000mg/cm^3", "1g/cm^3"],
          //["1000mg/ft^3", "1g/ft^3"],
          //["2240lb/ft^3", "1t/ft^3"],
          //["56mgL^{-1}","56mgL^{-1}"],
          //["56\\pm2mgL^{-1}","54mgL^{-1}"],
          //["56\\pm2mgL^{-1}","58mgL^{-1}"],
          //["56\\pm2mgL^{-1}","55mgL^{-1}"],

          ["56\\text{ mgL}^{-1}","56\\text{ mgL}^{-1}"],
          //["56\\pm2\\text{mg}\\text{L}^{-1}","56\\text{mg}\\text{L}^{-1}"],
          //["56\\pm2\\text{mg}\\text{L}^{-1}","55\\text{mg}\\text{L}^{-1}"],
          //["56\\pm2\\text{mg}\\text{L}","56\\text{mg}\\text{L}"],


          ["12in", "1ft"],
          ["5280ft", "1mi"],
          ["1km", "1000m"],
          ["1000mm", "1m"],
          ["1s", "1000ms"],
          ["1kg", "1000g"],
          ["1000000000ns", "1s"],
          ["1", "1"],
          ["1+2", "3"],
          ["1/2", ".5"],
          ["1/10", ".1"],
          ["9^(1/2)", "3.0"],
          ["\\sqrt{9}", "3.0"],
          ["1^{10}", "1"],
          ["x^0", "1"],
          ["10^-1", ".1"],
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
                  decimalPlaces: "10"
                }
              }, v[1])).toBe(false);
            });
          });
        }
        run([
          ["1000000\\mum", "10m"],
          ["1\\times10^7\\muL", "1L"],
          ["4.225\\pm0.025", "4.199"],
          ["4.225\\pm0.025", "4.251"],
          ["-4.225\\pm0.025", "-4.199"],
          ["-4.225\\pm0.025", "-4.251"],
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
          ["10^(1/2)", "3.0"],
          ["10 \\pm 2", "13"],
        ]);
      });
      describe("equivValue inverseResult", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivValue",
                value: v[0],
                options: {
                  inverseResult: true
                }
              }, v[1])).toBe(true);
            });
          });
        }
        run([
          ["10^(1/2)", "3.0"],
          ["10 \\pm 2", "13"],
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
          ["e", "2.718", "3"],
          ["e", "2.718281828459045", "10"],
          ["\\frac{\\pi}{2}", "1.57", "2"],
          ["\\pi", "3.14", "2"],
          [".375", "3/8", undefined],
          [".375", "3/8", "20"],
          [".38", "3/8", "2"],
          [".5", "1/2", "1"],
          [".3333333333", "1/3", undefined],
          [".3333333333333333", "1/3", "16"],
          [".33", "1/3", "2"],
          [".3", "1/3", "1"],
          ["0", "1/3", "0"],
          ["100gal", "378.541L", "0"],
          ["378.541L", "100gal", "0"],
          ["1/7", "0.142857142857", "12"],
          ["(245.367+543.789)/37.35+45.782^2", "2117.120199", "5"],
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
          [".33", "1/3", "3"],
          [".38", "1/3", "3"],
          ["100gal", "378.541L", "2"],
        ]);
      });
      describe("equivLiteral allowThousandsSeparator", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivLiteral",
                value: v[0],
                options: {
                  allowThousandsSeparator: true,
                  setThousandsSeparator: [",", " "],
                  setDecimalSeparator: "."
                }
              }, v[1])).toBe(true);
            });
          });
        }
        run([
          ["\\$500+\\$26000\\times0.06=\\$2060", "\\$500+\\$26000\\times0.06=\\$2060"],
          ["\\$500+\\$26000\\times0.06=\\$2060", "\\$500+\\$26,000\\times0.06=\\$2060"],
          ["\\$500+\\$26000\\times0.06=\\$2060", "\\$500+\\$26 000\\times0.06=\\$2060"],
          ["\\$500+\\$26000\\times0.06=\\$2060", "\\$500+\\$26\\ 000\\times0.06=\\$2060"],
          ["200000-150000=50000", "200000-150000=50000"],
          ["200000-150000=50000", "200000-150,000=50000"],
          ["200000-150000=50000", "200000-150 000=50000"],
          ["200000-150000=50000", "200000-150\\ 000=50000"],
          ["5\\times10^7=50000000", "5\\times10^7=50000000"],
          ["5\\times10^7=50000000", "5\\times10^7=50,000,000"],
          ["5\\times10^7=50000000", "5\\times10^7=50 000 000"],
          ["5\\times10^7=50000000", "5\\times10^7=50\\ 000\\ 000"],
          ["1\\times\\$19800\\times\\frac{2.9}{100}", "1\\times\\$19800\\times\\frac{2.9}{100}"],
          ["1\\times\\$19800\\times\\frac{2.9}{100}", "1\\times\\$19,800\\times\\frac{2.9}{100}"],
          ["1\\times\\$19800\\times\\frac{2.9}{100}", "1\\times\\$19 800\\times\\frac{2.9}{100}"],
          ["1\\times\\$19800\\times\\frac{2.9}{100}", "1\\times\\$19\\ 800\\times\\frac{2.9}{100}"],
          ["Q=75\\times4200\\times-20=-6300000\\text{ J lost}", "Q=75\\times4200\\times-20=-6300000\\text{ J lost}"],
          ["Q=75\\times4200\\times-20=-6300000\\text{ J lost}", "Q=75\\times4,200\\times-20=-6,300,000\\text{ J lost}"],
          ["Q=75\\times4200\\times-20=-6300000\\text{ J lost}", "Q=75\\times4 200\\times-20=-6 300 000\\text{ J lost}"],
          ["Q=75\\times4200\\times-20=-6300000\\text{ J lost}", "Q=75\\times4\\ 200\\times-20=-6\\ 300\\ 000\\text{ J lost}"],
          ["0.1\\times\\$40000=\\$4000", "0.1\\times\\$40000=\\$4000"],
          ["0.1\\times\\$40000=\\$4000", "0.1\\times\\$40000=\\$4,000"],
          ["0.1\\times\\$40000=\\$4000", "0.1\\times\\$40000=\\$4 000"],
          ["0.1\\times\\$40000=\\$4000", "0.1\\times\\$40000=\\$4\\ 000"],
          ["\\$1900\\times52=\\$98800", "\\$1900\\times52=\\$98800"],
          ["\\$1900\\times52=\\$98800", "\\$1,900\\times52=\\$98,800"],
          ["\\$1900\\times52=\\$98800", "\\$1 900\\times52=\\$98 800"],
          ["\\$1900\\times52=\\$98800", "\\$1\\ 900\\times52=\\$98\\ 800"],
          ["9\\times26\\times26\\times9\\times26\\times26=37015056", "9\\times26\\times26\\times9\\times26\\times26=37015056"],
          ["9\\times26\\times26\\times9\\times26\\times26=37015056", "9\\times26\\times26\\times9\\times26\\times26=37,015,056"],
          ["9\\times26\\times26\\times9\\times26\\times26=37015056", "9\\times26\\times26\\times9\\times26\\times26=37 015 056"],
          ["9\\times26\\times26\\times9\\times26\\times26=37015056", "9\\times26\\times26\\times9\\times26\\times26=37\\ 015\\ 056"],
          ["0.10\\times\\$18899=\\$1889.90", "0.10\\times\\$18899=\\$1889.90"],
          ["0.10\\times\\$18899=\\$1889.90", "0.10\\times\\$18,899=\\$1,889.90"],
          ["0.10\\times\\$18899=\\$1889.90", "0.10\\times\\$18 899=\\$1 889.90"],
          ["0.10\\times\\$18899=\\$1889.90", "0.10\\times\\$18\\ 899=\\$1\\ 889.90"],
          ["A_{10}=\\$15510", "A_{10}=\\$15510"],
          ["A_{10}=\\$15510", "A_{10}=\\$15,510"],
          ["A_{10}=\\$15510", "A_{10}=\\$15 510"],
          ["A_{10}=\\$15510", "A_{10}=\\$15\\ 510"],
          ["A_n=9400\\left(1+0.065n\\right)", "A_n=9400\\left(1+0.065n\\right)"],
          ["A_n=9400\\left(1+0.065n\\right)", "A_n=9,400\\left(1+0.065n\\right)"],
          ["A_n=9400\\left(1+0.065n\\right)", "A_n=9 400\\left(1+0.065n\\right)"],
          ["A_n=9400\\left(1+0.065n\\right)", "A_n=9\\ 400\\left(1+0.065n\\right)"],
          ["k^2=40000", "k^2=40000"],
          ["k^2=40000", "k^2=40,000"],
          ["k^2=40000", "k^2=40 000"],
          ["k^2=40000", "k^2=40\\ 000"],
          ["1:20000", "1:20000"],
          ["1:20000", "1:20,000"],
          ["1:20000", "1:20 000"],
          ["1:20000", "1:20\\ 000"],
          ["1:1500", "1:1500"],
          ["1:1500", "1:1,500"],
          ["1:1500", "1:1 500"],
          ["1:1500", "1:1\\ 500"],
          ["1:100000", "1:100000"],
          ["1:100000", "1:100,000"],
          ["1:100000", "1:100 000"],
          ["1:100000", "1:100\\ 000"],
        ]);
      });
      describe("equivSymbolic allowThousandsSeparator", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivSymbolic",
                value: v[0],
                options: {
                  allowThousandsSeparator: true,
                  setThousandsSeparator: [",", " "],
                  setDecimalSeparator: "."
                }
              }, v[1])).toBe(true);
            });
          });
        }
        run([
          ["\\$500+\\$26000\\times0.06=\\$2060", "\\$500+\\$26000\\times0.06=\\$2060"],
          ["\\$500+\\$26000\\times0.06=\\$2060", "\\$500+\\$26,000\\times0.06=\\$2060"],
          ["\\$500+\\$26000\\times0.06=\\$2060", "\\$500+\\$26 000\\times0.06=\\$2060"],
          ["\\$500+\\$26000\\times0.06=\\$2060", "\\$500+\\$26\\ 000\\times0.06=\\$2060"],
          ["200000-150000=50000", "200000-150000=50000"],
          ["200000-150000=50000", "200000-150,000=50000"],
          ["200000-150000=50000", "200000-150 000=50000"],
          ["200000-150000=50000", "200000-150\\ 000=50000"],
          ["5\\times10^7=50000000", "5\\times10^7=50000000"],
          ["5\\times10^7=50000000", "5\\times10^7=50,000,000"],
          ["5\\times10^7=50000000", "5\\times10^7=50 000 000"],
          ["5\\times10^7=50000000", "5\\times10^7=50\\ 000\\ 000"],
          ["1\\times\\$19800\\times\\frac{2.9}{100}", "1\\times\\$19800\\times\\frac{2.9}{100}"],
          ["1\\times\\$19800\\times\\frac{2.9}{100}", "1\\times\\$19,800\\times\\frac{2.9}{100}"],
          ["1\\times\\$19800\\times\\frac{2.9}{100}", "1\\times\\$19 800\\times\\frac{2.9}{100}"],
          ["1\\times\\$19800\\times\\frac{2.9}{100}", "1\\times\\$19\\ 800\\times\\frac{2.9}{100}"],
          ["Q=75\\times4200\\times-20=-6300000\\text{ J lost}", "Q=75\\times4200\\times-20=-6300000\\text{ J lost}"],
          ["Q=75\\times4200\\times-20=-6300000\\text{ J lost}", "Q=75\\times4,200\\times-20=-6,300,000\\text{ J lost}"],
          ["Q=75\\times4200\\times-20=-6300000\\text{ J lost}", "Q=75\\times4 200\\times-20=-6 300 000\\text{ J lost}"],
          ["Q=75\\times4200\\times-20=-6300000\\text{ J lost}", "Q=75\\times4\\ 200\\times-20=-6\\ 300\\ 000\\text{ J lost}"],
          ["0.1\\times\\$40000=\\$4000", "0.1\\times\\$40000=\\$4000"],
          ["0.1\\times\\$40000=\\$4000", "0.1\\times\\$40000=\\$4,000"],
          ["0.1\\times\\$40000=\\$4000", "0.1\\times\\$40000=\\$4 000"],
          ["0.1\\times\\$40000=\\$4000", "0.1\\times\\$40000=\\$4\\ 000"],
          ["\\$1900\\times52=\\$98800", "\\$1900\\times52=\\$98800"],
          ["\\$1900\\times52=\\$98800", "\\$1,900\\times52=\\$98,800"],
          ["\\$1900\\times52=\\$98800", "\\$1 900\\times52=\\$98 800"],
          ["\\$1900\\times52=\\$98800", "\\$1\\ 900\\times52=\\$98\\ 800"],
          ["9\\times26\\times26\\times9\\times26\\times26=37015056", "9\\times26\\times26\\times9\\times26\\times26=37015056"],
          ["9\\times26\\times26\\times9\\times26\\times26=37015056", "9\\times26\\times26\\times9\\times26\\times26=37,015,056"],
          ["9\\times26\\times26\\times9\\times26\\times26=37015056", "9\\times26\\times26\\times9\\times26\\times26=37 015 056"],
          ["9\\times26\\times26\\times9\\times26\\times26=37015056", "9\\times26\\times26\\times9\\times26\\times26=37\\ 015\\ 056"],
          ["0.10\\times\\$18899=\\$1889.90", "0.1\\times\\$18899=\\$1889.9"],
          ["0.10\\times\\$18899=\\$1889.90", "0.1\\times\\$18,899=\\$1,889.9"],
          ["0.10\\times\\$18899=\\$1889.90", "0.1\\times\\$18 899=\\$1 889.9"],
          ["0.10\\times\\$18899=\\$1889.90", "0.1\\times\\$18\\ 899=\\$1\\ 889.9"],
          ["A_{10}=\\$15510", "A_{10}=\\$15510"],
          ["A_{10}=\\$15510", "A_{10}=\\$15,510"],
          ["A_{10}=\\$15510", "A_{10}=\\$15 510"],
          ["A_{10}=\\$15510", "A_{10}=\\$15\\ 510"],
          ["A_n=9400\\left(1+0.065n\\right)", "A_n=9400\\left(1+0.065n\\right)"],
          ["A_n=9400\\left(1+0.065n\\right)", "A_n=9,400\\left(1+0.065n\\right)"],
          ["A_n=9400\\left(1+0.065n\\right)", "A_n=9 400\\left(1+0.065n\\right)"],
          ["A_n=9400\\left(1+0.065n\\right)", "A_n=9\\ 400\\left(1+0.065n\\right)"],
          ["k^2=40000", "k^2=40000"],
          ["k^2=40000", "k^2=40,000"],
          ["k^2=40000", "k^2=40 000"],
          ["k^2=40000", "k^2=40\\ 000"],
          ["1:20000", "1:20000"],
          ["1:20000", "1:20,000"],
          ["1:20000", "1:20 000"],
          ["1:20000", "1:20\\ 000"],
          ["1:1500", "1:1500"],
          ["1:1500", "1:1,500"],
          ["1:1500", "1:1 500"],
          ["1:1500", "1:1\\ 500"],
          ["1:100000", "1:100000"],
          ["1:100000", "1:100,000"],
          ["1:100000", "1:100 000"],
          ["1:100000", "1:100\\ 000"],
        ]);
      });
      describe("equivValue allowThousandsSeparator", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1] + " | " + v[2], function() {
              expect(MathCore.evaluate({
                method: "equivValue",
                value: v[0],
                options: {
                  allowThousandsSeparator: true
                }
              }, v[1])).toBe(true);
            });
          });
        }
        run([
          ["10,000", "5,000 + 5,000"],
        ]);
      });
      describe("isTrue", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0], function() {
              expect(MathCore.evaluate({
                method: "isTrue",
              }, v[0])).toBe(true);
            });
          });
        }
        run([
          ["2>1"],
          ["1>=1"],
          ["1<=1"],
          ["1<2"],
          ["x<2x"],
          ["1.5x <= x + x"],
          ["2x <= x + x"],
          ["2x >= x + x"],
          ["2x > 0.5x + 0.5x"],
          ["x = 0.5x + 0.5x"],
          ["\\binom{3}{1}=3"],
          ["\\binom{7}{2}=21"],
          ["\\binom{20}{3}=1140"],
          ["|-10|=10"],
          ["3\\sqrt{8}-6\\sqrt{32}=-18\\sqrt{2}"],
          ["5^3/5^7=1/625"],
          ["9/3=3/1"],
          ["2*\\$2+8*\\$0.50=\\$8"],
          ["\\frac{7}{-2}-11(-2)+2=20+1/2"],
          ["360\\degree=2\\pi\\radian"],
          ["90\\degree=\\pi/2\\radian"],
          ["250\\times40%=100"],
          ["100%=1"],
          ["10%=.1"],
          ["23%=.23"],
          ["100\\%=1"],
          ["10\\%=.1"],
          ["23\\%=.23"],
          ["\\$1=\\$1"],
          ["\\frac{6+3*2}{6^2-30}=2"],
          ["20-3*5+4=9"],
          ["10 \\pm 2=11"],
          ["10.1 \\pm .2=10.2"],
          [".5=1/2"],
          ["1cup=8fl"],
          ["3cm^2/cm=3cm"],
          ["128fl=1gal"],
          ["1000mg=1g"],
          ["1cm^3=1cm^3"],
          ["12in=1ft"],
          ["4yd", "12ft"],
          ["5280ft=1mi"],
          ["1km=1000m"],
          ["1000mm=1m"],
          ["1s=1000ms"],
          ["1kg=1000g"],
          ["1000000000ns=1s"],
          ["1<2"],
          ["1+2<=3"],
          ["1/2>.4"],
          ["1/10<=.2"],
          ["9^(1/2)<=3.0"],
          ["\\sqrt{9}>=3.0"],
          ["1^10<1.1"],
          ["x^0=1"],
          ["10^-1=.1"],
        ]);
      });
      describe("NOT isTrue", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0], function() {
              expect(MathCore.evaluate({
                method: "isTrue",
              }, v[0])).toBe(false);
            });
          });
        }
        run([
          ["\\frac{1}{2}\\div3=16"],
          ["16=12"],
          ["x < 0.5x + 0.5x"],
        ]);
      });
      describe("isTrue evaluateVerbose with error", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0], function() {
              var result = MathCore.evaluateVerbose({
                method: "isTrue",
              }, v[0]);
              expect(result.result).not.toBe(true);
              expect(result.location).toEqual('user');
            });
          });
        }
        run([
          ["x>1"],
        ]);
      });
      describe("isUnit", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "isUnit",
                value: v[0]
              }, v[1])).toBe(true);
            });
          });
        }
        run([
          ["in", "10in"],
          ["cm", "10cm"],
          ["cm, m, ns", "10cm"],
          ["cm, m, g, kg, ns, s", "(1cm, 2m, 3g)"],
        ]);
      });
      describe("NOT isUnit", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "isUnit",
                value: v[0]
              }, v[1])).toBe(false);
            });
          });
        };
        run([
          ["in", "10ft"],
          ["m", "10cm"],
          ["m, ns", "10cm"],
          ["cm, m, kg, ns, s", "(1cm, 2m, 3g)"],
          ["cm", "10m"],
          ["(cm, mm, ns)", "10m"],
        ]);
      });
    });  // END Numbers
  });
});
