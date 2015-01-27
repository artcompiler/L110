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
    describe("Algebra : Quadratic", function() {
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
          ["10\\times2", "10\\cdot2"],
          ["cos(10)", "cos 10"],
          ["cos10", "cos 10"],
          ["x+1", "x+1"],
          ["(x+2)", "x+2"],
          ["(x+y)-1", "x+y-1"],
          ["1\\times2", "1\\times2"],
          ["1\\times 2", "1\\times 2"],
          ["1\\times x", "1\\times x"],
          ["1\\div2", "1\\div2"],
          ["1\\div 2", "1\\div 2"],
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
          ["x+1", "x+2"],
          ["x+1", "x+2-1"],
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
          ["10 \\text{foo bar abc}", "\\text{foo bar abc} 10"],
          ["\\left(x+2\\right)^2+\\left(y-7\\right)^2=53", "\\left(x+2\\right)^2+\\left(-7+y\\right)^2=53"],
          ["1+2+3", "3+2+1"],
          ["1*2*3", "3*2*1"],
          ["2*(8+7)", "(8+7)*2"],
          ["2x+3y", "3y+2x"],
          ["2x+3x", "3x+2x"],
          ["2+3", "3+2"]
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
          ["(2x+y)(x+3z)", "2x^2+xy+6xz+3yz"],
          ["(1+x)^{4}", "(1+x)^{4}"],
          ["(1+x)^{4}", "(1+x)(1+x)(1+x)(1+x)"],
          ["(1+3)^{12}", "(4)^{12}"],
          ["(1\\frac{0.022}{12})^{12}", "(1\\frac{0.022}{12})^{12}"],
          ["(1\\frac{0.022}{12})^{12x}", "(1\\frac{0.022}{12})^{12x}"],
          ["x=1/0", "x=1/0"],
          ["x=3/0", "551441014100000000000488874586225745559996325445558714888599955558874452212336998885256698811778523698555511233\\div0=x"],
          ["5=y+x", "5-2y=-y+x"],
          ["5=y+x", "5=-y+(x+2y)"],
          ["5=y+x", "-5=y+(-x-2y)"],
          ["|-10|x", "10x"],
          // TODO work in progress
          //["\\frac{x^2+5x+6}{x+2}", "x+3"],
          //["\\frac{(x+3)(x+2)}{x+2}", "x+3"],
          ["3\\sqrt{8}-6\\sqrt{32}", "-18\\sqrt{2}"],
          ["a^3b^3-5ab^4+2a^3b-a^3b^3+3ab^4-a^2b", "-2ab^4+2a^3b-a^2b"],
          ["\\frac{x^(1/2)y^(5/2)}{x^(3/2)y^(3/2)}", "x^-1y"],
          ["(3x^2)(4x^4)/(2y)^2", "3x^6y^-2"],
          ["a^(1/2)a^(1/3)", "a^(5/6)"],
          ["x^4/x^4", "x^0"],
          ["5^3/5^7", "1/625"],
          ["(x^3/y^2)^4", "x^12/y^8"],
          ["\\frac{a^2b^6}{a^5b}", "b^5/a^3"],
          ["x^4/x^7", "x^-3"],
          ["3x^2y^3*4xy^2", "12x^3y^5"],
          ["2^2*2^3", "32"],
          ["(-3)(-3)(-3)", "-27"],
          ["2*2", "2^2"],
          ["xxxxxxx", "x^7"],
          ["y=7/6(x+4)-2", "y=7/6(x-8)+12"],
          ["y \\lt 7/6(x+4)-2", "y \\lt 7/6(x-8)+12"],
          ["\\sqrt{16}", "4"],
          ["\\sqrt{\\sqrt{16}}", "2"],
          ["\\sqrt{8}", "2\\sqrt{2}"],
          ["(1/4)/(1/5)/(x/6)/(1/7)", "105/(2x)"],
          ["(1/4)/(1/5)/(1/6)/(1/7)", "105/2"],
          ["(((1/4)/5)/6)/7", "1/840"],
          ["1/4(2x+8)", "2+x/2"],
          ["12/25\\cdot35/42", "2/5"],
          ["5/19+2/27", "173/513"],
          ["9/3", "3/1"],
          ["2(\\frac{(11+(3-2(-2)))}{(1+2)^2}-1)", "2"],
          ["3*5-7/2", "11+1/2"],
          ["3(5-7)/2", "-3"],
          ["41/2", "40/2+1/2"],
          ["\\frac{7}{-2}-11(-2)+2", "20+1/2"],
          ["\\pi", "2\\pi/2"],
          // Work in progress
          ["2+\\frac{2x}{2}-2","x"],
          ["4x/(2x-10)", "2x/(x-5)"],
          //["6x-\\frac{5}{9}x+\\frac{11}{9}x-6x-(-\\frac{3}{9}x)", "x"],
          ["4x=2x-10", "x+x+x+x=x+x-10"],
          ["4x \\le 2x-10", "x+x+x+x \\le x+x-10"],
          ["x/10=4", "x=40"],
          ["3x+2x-5x+12x-7x", "5x"],
          ["3x^7+2x^7-5x^7+12x^7-7x^7", "5x^7"],
          ["33xyz+21x-5xy+42xyz-(-7xy)", "x(y(75z+2)+21)"],
          ["-2(x^2+x-1)-5(x^2-x+2)+3(x^2-7x+4)", "-2x^2-2x+2-5x^2+5x-10+3x^2-21x+12"],
          ["-2(x^2+x-1)-5(x^2-x+2)+3(x^2-7x+4)", "-4x^2-18x+4"],
          ["20-3*5+4", "9"],
          ["1\\frac{1}{2}= \\frac{3}{2}", "1+\\frac{2-1}{2}= \\frac{3}{2}"],
          ["(xy)^z", "x^zy^z"],
          ["(x-1)(x-2)", "(-1+x)(-2+x)"],
          ["(x+2)^-2", "(x^2+4x+4)^-1"],
          ["(x+2)^2", "x^2+4x+4"],
          ["(x+2)(2x^2-3)", "2x^3+4x^2-3x-6"],
          ["12\\times4", "48"],
          ["x^2+10x+25", "(x+5)^2"],
          ["6x^2+14x-12", "2(3x-2)(x+3)"],
          ["3x^2+7x-6", "(3x-2)(x+3)"],
          ["1\\frac{x}{2}", "x/2"],
          ["\\frac{x}{2}", "x/2"],
          ["1\\frac{1}{2}", "3/2"],
          ["2(\\frac{x}{2})", "x"],
          ["2\\frac{x}{2}", "x"],
          ["\\frac{2x}{2}", "x"],
          ["x+1-1", "x+0"],
          ["x+1-1", "x"],
          ["x + 0", "x"],
          ["(x/2)+(x/2)", "x"],
          ["2x/2", "x"],
          ["x^(1-1)", "1"],
          ["3xx^-1", "3"],
          ["x+1", "1+x"],
          ["(x-1)(x-2)", "(-1+x)(-2+x)"],
          ["(x-1)(x-2)", "(x-2)(x-1)"],
          ["(x-1)(x-2)", "(-2+x)(-1+x)"],
          ["x^2+6x+5", "6x+x^2+5"],
          ["x+-(x+2)", "x-(x+2)"],
          ["x+1", "x+2-1"],
          ["1-1", "0"],
          ["100-10-95", "-5"],
          ['\\text{Label:}(x+y)', '\\text{Label:}(y+x)'],
          //Brackets
          ["\\left(x+2\\right)", "x+2"],
          ["\\big(x+2\\big)", "x+2"],
          ["\\left(x+2\\right)", "(x+2)"],
          ["\\Bigg\\left(x+2\\Bigg\\right)", "(x+2)"],
          ["\\left(x+2\\right)\\left(x+2\\right)", "(x+2)^2"],
          ["(x+2)(x+2)", "(x+2)^2"],
          ["2\\times\\sqrt{3}", "\\sqrt{3}+\\sqrt{3}"],
          ["\\frac{36x}{5}", "\\frac{36}{5}x"],
          ["2\\times7^x", "7^x+7^x"],
          ["2\\times7^x", "(7^x)+(7^x)"],

          //Factor comparisons
          ["x^2-3x+2", "(x-2)(x-1)"],
          ["x^2-3x+2", "(x-1)(x-2)"],
          ["x^2-3x+2", "(-1+x)(-2+x)"],
          ["x^2-3x+2", "(-1+x)(x-2)"],
          ["x^2-2x-1x+2", "(-1+x)(x-2)"],
          ["x^2+2x^2+4x-3", "3x^2+4x-3"],
          //Divide and multiply
          ["1\\times 2", "1\\times 2"],
          ["1\\times 2", "2\\times 1"],
          ["10\\div 2", "5"],
          ["\\dfrac{10}{2}", "5"],
          ["10\\times 2", "20"],
          ["\\frac{1}{2}","1/2"],
          ["\\dfrac{1}{2}","1/2"],
          ["1/2","2/4"],
          ["1\\div2", "2\\div4"],
          ["\\frac{1x}{2}","(1x)/2"],
          ["\\frac{1x}{2}","(1x)\\div 2"],
          ["\\dfrac{1x}{2}","(1x)\\div 2"],
          ["\\dfrac{1x}{2}","\\frac{1x}{2}"],
          //Other items /To be discussed
          // Document this case as not equivSymbolic. Perhaps is equivValue
          //["1/2", "0.5"],
          ["\\sqrt{x^2}", "x"],
          ["\\sqrt{2+x}","\\sqrt{x+2}"],
          ["2^3", "8"],
          ["2^3^2", "512"],
          ["x^2^3", "x^8"],
          ["(xy)^2", "x^2y^2"],
          ["((xy)^2, 2^3)", "(x^2y^2, 8)"],
          ["y=\\frac{36x}{5}", "y=\\frac{36}{5}x"],
          // compare quadratic formula against itself
          ["\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}", "\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}"],
          ["\\frac{-b+\\sqrt{b^2-4ac}}{2a}", "\\frac{-b+\\sqrt{b^2-4ac}}{2a}"],
          // two formulas for area of equilateral triangle of side a
          ["\\sqrt{\\left(\\frac{3a}{2}\\right)\\left(\\frac{a^3}{8}\\right)}", "\\frac{\\sqrt{3}a^2}{4}"],
          // negative value or subtraction inside square root
          ["\\sqrt{-a}", "\\sqrt{-1a}"],
          ["\\sqrt{x}", "\\sqrt{2x-x}"],
          // Odd number multiplied by fraction
          ["1\\frac{1}{2}", "1\\frac{2}{4}"],
          ["3\\frac{1}{2}", "3\\frac{2}{4}"],
          ["9\\frac{1}{2}", "9\\frac{2}{4}"],
          // Escaped symbols that we want to support
          ["\\$", "\\$"],
          ["10\\%", "10\\%"],
          ["$100", "$(50+50)"],
          // Exponent in denominator
          ["\\frac{x}{y^2}", "\\frac{x}{y^2}"],
          //Future items
          //          ["\\sqrt[3]{x^3}","x"],
          ["\\tan x", "\\sin x/\\cos x"],
          ["1\\frac{1}{2}= \\frac{3}{2}", "1\\frac{1}{2}= \\frac{3}{2}"],
          ["100%", "1"],
          ["10%", "1/10"],
          ["x^{yy}", "x^{yy}"],

          // operations on both sides - addition
          ["5=y+x", "5+1=y+x+1"],
          ["5=y+x", "6=y+x+1"],

          // operations on both sides - subtraction
          ["5=y+x", "5-1=y+x-1"],
          ["5=y+x", "4=y+x-1"],

          // operations on both sides - multiplication
          ["5=y+x", "\\frac{5}{5}=y+\\frac{x}{5}-\\frac{4y}{5}"],

          // operations on both sides - division
          ["5=y+x", "10(5)=y+10x+9y"],
          ["5=y+x", "50=y+10x+9y"],

          ["x=1", "\\frac{x+1}{2}=1"],
          ["x=1", "x+1=2"],

          // Division by infinity is equal to zero (test assumes that division
          // by zero is infinity)
          ["x=0", "x=1/(2/0)"],

        ]);
      });
      describe("equivSymbolic", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivSymbolic",
                options: {
                  allowDecimal: true,
                },
                value: v[0]
              }, v[1])).toBe(true);
            });
          });
        }
        run([
          ["y=\\frac{1}{2}x+1", "y=0.5x+1"],
        ]);
      });
      describe("equivSymbolic", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivSymbolic",
                options: {
                  ignoreText: true,
                },
                value: v[0]
              }, v[1])).toBe(true);
            });
          });
        }
        run([
          // operations containing text
          ["\\text{Equation:}4\\times6+n\\times10=84", "\\text{Equation:}4\\times6+n\\times10=84"],
          ["\\text{Equation:}4\\times6+n\\times10=84", "\\text{Equation:}n\\times10+4\\times6=84"],
          ["\\text{Eq:}5=y+x", "\\text{Eq:}\\frac{5}{5}=y+\\frac{x}{5}-\\frac{4y}{5}"],
          ["\\text{Eq:}5=y+x", "\\text{Eq:}y+\\frac{x}{5}-\\frac{4y}{5}=\\frac{5}{5}"],
        ]);
      });
      describe("equivSymbolic", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivSymbolic",
                options: {
                  ignoreText: false,
                },
                value: v[0]
              }, v[1])).toBe(true);
            });
          });
        }
        run([
          // operations containing text where ignoreTexy is false
          ["\\text{The absolute value of} +5 \\text{&nbsp;is }5.", "\\text{The absolute value of}+5\\text{ is }5."],
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
          ["|-x|", "x"],
          ["x_1", "x_2"],
          ["(((1/4)/5)/6)/7", "1/841"],
          ["x+1", "x+2"],
          ["x^2-3x+2", "(x-1)(x-1)"],
          ["\\frac{1x}{2}","(1x+1)\\div 2"],
          ["\\sqrt{\\left(999x^2\\right)}","x"],
          ["(1\\frac{0.022}{12})^{12x}", "(1\\frac{0.022}{12})^{x}"],

          // Review:
          // Negative infinity vs positive infinity - depends on how we want to
          // treat division by zero. They could, in fact, be equivalent if
          // we treat division by zero as undefined. Note: JS treats them as
          // negative infinity and positive infinity, which are not equivalent
          ["x=-1/0","x=1/0"],

          // Whether division by zero is undefined or negative/positive infinity
          // it is not equivalent to zero
          ["x=0","x=1/0"],
          ["x=0","x=-1/0"],

        ]);
      });
      describe("equivSymbolic inverseResult", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivSymbolic",
                value: v[0],
                options: {
                  inverseResult: true
                }
              }, v[1])).toBe(true);
            });
          });
        }
        run([
          ["|-x|", "x"],
          ["x_1", "x_2"],
          ["(((1/4)/5)/6)/7", "1/841"],
          ["x+1", "x+2"],
          ["x^2-3x+2", "(x-1)(x-1)"],
          ["\\frac{1x}{2}","(1x+1)\\div 2"],
          ["\\sqrt{\\left(999x^2\\right)}","x"],
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
          ["\\frac{x}{x}", "1"],
        ]);
      });
      describe("isExpanded", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0], function() {
              expect(MathCore.evaluate({
                method: "isExpanded"
              }, v[0])).toBe(true);
            });
          });
        }
        run([
          ["x^2"],
          ["x^2-3x+2"],
          ["x+1"],
          ["x+2"],
          ["x^2+5x+5x+25"],
          ["x^2+10x+25"],
        ]);
      });
      describe("NOT isExpanded", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0], function() {
              expect(MathCore.evaluate({
                method: "isExpanded"
              }, v[0])).toBe(false);
            });
          });
        }
        run([
          ["xyxy"],
          ["x(x)"],
          ["(x-2)(x-1)"],
          ["(x-1)(x-2)"],
          ["(-1+x)(-2+x)"],
          ["(-1+x)(x-2)"],
          ["4(x-2)"],
          ["(x+5)^2"],
        ]);
      });
      describe("isSimplified", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0], function() {
              expect(MathCore.evaluate({
                method: "isSimplified"
              }, v[0])).toBe(true);
            });
          });
        };
        run([
          ["x^2 + \\frac{1}{4}x"],
          ["x^2 + \\frac{x}{4}"],
          ["\\frac{1}{2}"],
          ["\\dfrac{1}{2}"],
          ["1/2"],
          ["x^2"],
          ["x"],
          ["10x(1+x)"],
        ]);
      });
      describe("NOT isSimplified", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0], function() {
              expect(MathCore.evaluate({
                method: "isSimplified"
              }, v[0])).toBe(false);
            });
          });
        };
        run([
          ["(x+2)^2"],
          ["(x+2)^-2"],
          ["\\frac{2}{4}"],
          ["\\dfrac{2}{4}"],
          ["2/4"],
          ["x^{2-1}"],
          ["x^{1-1}"],
          ["x^2 \\times x^3"],
          ["\\sqrt{x^2}"],
          ["3x+2x-5x+12x-7x"],
          ["(x+2)(x+2)"],
          ["(2x)^2"],
          ["\\frac{2-1}{2}"],
        ]);
      });
      describe("isFactorised field:integer", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0], function() {
              expect(MathCore.evaluate({
                method: "isFactorised",
                options: {
                  field: "integer"
                },
              }, v[0])).toBe(true);
            });
          });
        };
        run([
          ["xy\\left(x-y\\right)"],
          ["3xy(x-3y^2+4xy)"],
          ["xy\\left(x-y\\right)"],
          ["6xy\\left(5x-4y\\right)"],
          ["\\left(x+2\\right)\\left(y+3\\right)"],
          ["\\left(x-3y+4xy\\right)3xy"],
          ["(3x+2)(3x+2)"],
          ["(x+4)(x-3)"],
          ["x^2"],
          ["15y^10"],
          ["15y^10(3y^2+2)"],
          ["2(s-2\\sqrt{2})(s+2\\sqrt{2})"],
          ["(x+\\sqrt{3})(x-1)"],
          ["(x-1)(x-2)"],
          ["(-1+x)(-2+x)"],
          ["(x-2)(x-1)"],
          ["(x-1)(x-2)"],
          ["(-1+x)(-2+x)"],
          ["(-1+x)(x-2)"],
          ["x+1"],
          ["x+y-1"],
          ["(2x+3)(3x-1)"],
          ["(3x-2)(3x-2)"],
          ["(3x-2)^2"],
          ["2(s^2-8)"],
          ["x^2-3"],
          ["4"],
          ["x^2+x+1"],
          ["5(x-1)(x^2+x+1)"],
          ["(3x+2)^2"],
          ["3x(3x+2)+6x+4"],
          ["(3 + x)(2 + x)"], // factorised of (x+2)x+3x+6
        ]);
      });
      describe("NOT isFactorised field:integer", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0], function() {
              expect(MathCore.evaluate({
                method: "isFactorised",
                options: {
                  field: "integer"
                },
              }, v[0])).toBe(false);
            });
          });
        };
        run([
          ["3y+4xy"],
          ["x(x-3)+2"],
          ["(x+2)x+3x+6"],
          ["x(x-4)+3x-12"],
          ["x(x-3)+4x-12"],
          ["xyxy"],
          ["x(x)"],
          ["x^2+15x+50"],
          ["-x^2+25x-150"],
          ["x^2-100"],
          ["2x+8"],
          ["3a+9b+6"],
          ["2s^2-16"],
          ["x^2+10x+25"],
          ["12x^2-49x"],
          ["12x^2-48x+9"],
          ["x^2-25"],
          ["48x^2-75"],
          ["y^2+7y+10"],
          ["m^2+13m+30"],
          ["n^2-4n-32"],
          ["y^2+y-42"],
          ["x^2+5x+6"],
          ["x^2-10x+24"],
          ["c^2-3c-40"],
          ["x(x+5)+15+3x"],
          ["(x+2)x+3x+6"],
        ]);
      });
      describe("isFactorised field:real", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0], function() {
              expect(MathCore.evaluate({
                method: "isFactorised",
                options: {
                  "field": "real"
                }
              }, v[0])).toBe(true);
            });
          });
        };
        run([
          ["(3x+2)(3x+2)"],
          ["(x+4)(x-3)"],
          ["x^2"],
          ["15y^10"],
          ["15y^10(3y^2+2)"],
          ["2(s-2\\sqrt{2})(s+2\\sqrt{2})"],
          ["(x+\\sqrt{3})(x-1)"],
          ["(x-1)(x-2)"],
          ["(-1+x)(-2+x)"],
          ["(x-2)(x-1)"],
          ["(x-1)(x-2)"],
          ["(-1+x)(-2+x)"],
          ["(-1+x)(x-2)"],
          ["x+1"],
          ["x+y-1"],
          ["(2x+3)(3x-1)"],
          ["(3x-2)(3x-2)"],
          ["(3x-2)^2"],
          ["4"],
          ["x^2+x+1"],
          ["5(x-1)(x^2+x+1)"],
        ]);
      });
      describe("isFactorised field:integer (default)", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0], function() {
              expect(MathCore.evaluate({
                method: "isFactorised",
              }, v[0])).toBe(true);
            });
          });
        };
        run([
          ["(3x+2)(3x+2)"],
        ]);
      });
      describe("NOT isFactorised field:real", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0], function() {
              expect(MathCore.evaluate({
                method: "isFactorised",
                options: {
                  "field": "real"
                }
              }, v[0])).toBe(false);
            });
          });
        };
        run([
          ["3x(3x+2)+6x+4"],
          ["9x^2+12x+4"],
          ["x(x+5)+15+3x"],
          ["2(s^2-8)"],
          ["x^2-3"],
          ["(x+2)x+3x+6"],
        ]);
      });
      describe("isFactorised field:complex", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0], function() {
              expect(MathCore.evaluate({
                method: "isFactorised",
                options: {
                  "field": "complex"
                }
              }, v[0])).toBe(false);
            });
          });
        };
        run([
        ]);
      });
      describe("NOT isFactorised field:complex", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0], function() {
              expect(MathCore.evaluate({
                method: "isFactorised",
                options: {
                  "field": "complex"
                }
              }, v[0])).toBe(false);
            });
          });
        };
        run([
          ["x^2+x+1"],
          ["5(x-1)(x^2+x+1)"],
        ]);
      });
    });
    describe("Algebra : Algebraic", function() {
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
          ["\\binom{1}{3}", "\\binom{1}{3}"],
          ["10:20", "10:20"],
          ["10:20", "10 \\colon 20"],
          ["\\frac{n!}{k!(n-k)!}", "\\frac{n!}{k!(n-k)!}"],
          ["\\binom{n}{k}", "\\binom{n}{k}"],
          ["\\frac{n!}{k!(n-k)!} = \\binom{n}{k}", "\\frac{n!}{k!(n-k)!} = \\binom{n}{k}"],
          ["R^+", "R^+"],
          ["0.98^c={50.99}\\degree", "0.98^c={50.99}\\degree"],
          ["sin(u-v)=sin(u)cos(u)-cos(u)sin(v)", "sin(u-v)=sin(u)cos(u)-cos(u)sin(v)"],
          ["x<\\frac{1}{2}", "x<\\frac{1}{2}"],
          ["\\frac{\\left(-1\\right)^nn!}{x^{n+1}}", "\\frac{\\left(-1\\right)^nn!}{x^{n+1}}"],
          ["f'(x)=3\\times x^2", "f'(x)=3\\times x^2"],
          ["3\\le\\left|z+3-3i\\right|\\le3\\sqrt{2}", "3\\le\\left|z+3-3i\\right|\\le3\\sqrt{2}"],
          ["\\pm(1-2i)", "\\pm(1-2i)"],
          ["x+y+1", "x+y+1"],
          ["(xy+2)", "xy+2"],
          ["(x+xy)-1", "x+xy-1"],
          ["x^3+x^2y+1", "x^3+x^2y+1"],
          ["x^(5)+1/32", "x^5+(1/32)"],
          ["\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}", "\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}"],
          ["\\sqrt{(x_1-x_2)^2+(y_1-y_2)^2}", "\\sqrt{(x_1-x_2)^2+(y_1-y_2)^2}"],
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
          ["x+y", "y+x"],
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
          ["42-m^2", "-m^2+42"],
          ["-m^2+m+42", "m-m^2+42"],
          ["1=-m^2+m+42", "1=m-m^2+42"],
          ["(7-m)(m+6)=-m^2+m+42", "(7-m)(m+6)=m-m^2+42"],
          ["(7-m)(m+6)-(-m^2+m+42)", "(7-m)(m+6)-(m-m^2+42)"],
          ["(7-m)(m+6)+m^2-m-42", "(7-m)(m+6)-m+m^2-42"],
          ["(7-m)(m+6)+m^2-m-42", "(7-m)(m+6)-(m-m^2+42)"],
          ["10:20", "1:2"],
          ["10x:20x", "1x:2x"],
          ["10x:20x/20", "10x:x"],
          ["10x \\colon 20x/20", "10x \\colon x"],
          ["\\left(3-2\\right)!4!", "\\left(3-2\\right)!4!"],
          ["\\left(n-2\\right)!n!", "\\left(n-2\\right)!n!"],
          ["\\left(n-2\\right)!2!", "\\left(n-2\\right)!2!"],
          ["\\left(n\\right)!2!", "\\left(n\\right)!2!"],
          ["\\frac{n!}{k!(n-k)!}", "\\frac{n!}{k!(n-k)!}"],
          ["\\binom{n}{k}", "\\binom{n}{k}"],
          ["\\binom{n}{k}", "\\frac{n!}{k!(n-k)!}"],
          ["x+y", "y+x"],
          ["xy", "yx"],
          ["2x=y", "y=2x"],
          ["4x=2y", "2x=y"],
          ["4x^4 + 5x^5 + 3x^3 + 2x^2", "2x^2 + 3x^3 + 5x^5 + 4x^4"],
          ["12x^3+x^2+6x+5", "6x+12x^3+x^2+5"],
          ["12x^3y^2", "12y^2x^3"],
          ["xy^2", "x^1y^2"],
          ["(x+2)(x^2+4x+5)", "x^3+6x^2+13x+10"],
          ["(x+2)(x^2+4x+5)", "x^3+2x^2+4x^2+13x+10"],
          // subscripts in identifiers not supported yet
          // ["\\sqrt{(x_1-x_2)^2+(y_1-y_2)^2}", "\\sqrt{(x_1-x_2)^2+(y_1-y_2)^2}"],
          ["\\sqrt{(x1-x2)^2+(y1-y2)^2}", "\\sqrt{(x1-x2)^2+(y1-y2)^2}"],
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
          ["\\frac{n}{(n)!}",
           "\\frac{n}{(n+1)!}"],
          ["x+xy", "x-xy"],
          ["\\frac{n\\left(n-1\\right)\\left(n-2\\right)!}{\\left(n\\right)!2!}",
           "\\frac{n\\left(n-1\\right)\\left(n-2\\right)!}{\\left(n-2\\right)!2!}"],
          ["\\frac{n\\left(n-1\\right)\\left(n-2\\right)!}{\\left(1\\right)!2!}",
           "\\frac{n\\left(n-1\\right)\\left(n-2\\right)!}{\\left(n-2\\right)!2!}"],
          ["\\left(1\\right)!2!",
           "\\left(n-2\\right)!2!"],
          ["\\frac{n\\left(n-1\\right)\\left(n-2\\right)!}{\\left(n-1\\right)!2!}",
           "\\frac{n\\left(n-1\\right)\\left(n-2\\right)!}{\\left(n-2\\right)!2!}"],
          ["\\left(1\\right)!2!",
           "\\left(n-2\\right)!2!"],
          ["x^3+x^2y", "x^3-x^2y"],
        ]);
      });
      describe("isExpanded", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0], function() {
              expect(MathCore.evaluate({
                method: "isExpanded"
              }, v[0])).toBe(true);
            });
          });
        }
        run([
          ["x^3+3x^2y+3x^2+3y^2+10xy"],
          ["xy^2-3x+2y"],
          ["x+1y"],
          ["x+y^2"],
          ["x+y-1"],
          ["x^4-3x+2"],
          ["x^6+1"],
          ["x^4+x^4"],
          ["x^3+6x^2+13x+10"],
          ["x^3+2x^2+4x^2+13x+10"],
        ]);
      });
      describe("NOT isExpanded", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0], function() {
              expect(MathCore.evaluate({
                method: "isExpanded"
              }, v[0])).toBe(false);
            });
          });
        }
        run([
          ["(x^3-2)(x^2-1)"],
          ["x(x^4+x^3)"],
        ]);
      });
      describe("isSimplified", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0], function() {
              expect(MathCore.evaluate({
                method: "isSimplified"
              }, v[0])).toBe(true);
            });
          });
        };
        run([
          ["(xy)^2"],
          ["x^5"],
          ["(xy)^z"],
        ]);
      });
      describe("NOT isSimplified", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0], function() {
              expect(MathCore.evaluate({
                method: "isSimplified"
              }, v[0])).toBe(false);
            });
          });
        };
        run([
          ["2xy+3xy"],
          ["2x^3y+3x^3y"],
        ]);
      });
      describe("isFactorised field:integer", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0], function() {
              expect(MathCore.evaluate({
                method: "isFactorised"
              }, v[0])).toBe(true);
            });
          });
        };
        run([
          ["(x+2y)^2"],
          ["(x+y)(x-y)"],
        ]);
      });
      describe("NOT isFactorised field:integer", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0], function() {
              expect(MathCore.evaluate({
                method: "isFactorised"
              }, v[0])).toBe(false);
            });
          });
        };
        run([
          ["xy-25x"],
          ["x^4-x^5"],
          ["x^4+x^5"],
        ]);
      });
    });
    describe("Algebra : Equations and Inequalities", function() {
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
          ["0.1+0.3=0.4", ".1+.3=.4"]
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
          ["x+y", "y+x"],
          ["x \\lt 10", "x < 10"],
          ["x \\le 10", "x <= 10"],
          ["x \\gt 10", "x > 10"],
          ["x \\ge 10", "x >= 10"],
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
          ["20>2+d", "2+d<20"],
          ["20>2+d", "d+2<20"],
          ["3.06\\div3=1.02", "3.06\\div3=1.02"],
          ["x=10", "2x=20"],
          ["x \\lt 10", "2x \\lt 20"],
          ["x \\le 10", "2x \\le 20"],
          ["x \\gt 10", "2x \\gt 20"],
          ["x \\ge 10", "2x \\ge 20"],
          ["x<10", "2x<20"],
          ["x<=10", "2x<=20"],
          ["x>10", "2x>20"],
          ["x>=10", "2x>=20"],
          ["x \\ge 10", "10 \\le x"],
          ["x>=10", "10<=x"],
          ["3+2=5", "\\frac{5}{2}+\\frac{5}{2}=5"],
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
          ["20>2+d", "2+d<=20"],
          ["8=8", "16=12"],
          ["x \\ge 10", "10 \\ge x"],
          ["3+6=6", "\\frac{5}{2}+\\frac{5}{2}=5"],
        ]);
      });
      describe("isExpanded", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0], function() {
              expect(MathCore.evaluate({
                method: "isExpanded"
              }, v[0])).toBe(true);
            });
          });
        }
        run([
        ]);
      });
      describe("NOT isExpanded", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0], function() {
              expect(MathCore.evaluate({
                method: "isExpanded"
              }, v[0])).toBe(false);
            });
          });
        }
        run([
        ]);
      });
      describe("isSimplified", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0], function() {
              expect(MathCore.evaluate({
                method: "isSimplified"
              }, v[0])).toBe(true);
            });
          });
        };
        run([
        ]);
      });
      describe("NOT isSimplified", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0], function() {
              expect(MathCore.evaluate({
                method: "isSimplified"
              }, v[0])).toBe(false);
            });
          });
        };
        run([
        ]);
      });
      describe("isFactorised field:integer", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0], function() {
              expect(MathCore.evaluate({
                method: "isFactorised"
              }, v[0])).toBe(true);
            });
          });
        };
        run([
          ["x^3+2x^2+3x+4"],
        ]);
      });
      describe("NOT isFactorised field:integer", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0], function() {
              expect(MathCore.evaluate({
                method: "isFactorised",
                options: {
                  "field": "real"
                },
              }, v[0])).toBe(false);
            });
          });
        };
        run([
          ["2x^4+x^3-31x^2-26x+24"],
          ["6x^3-37x^2+5x+6"],
        ]);
      });
      describe("evaluateVerbose() errorCode=0", function() {
        // Verify that multiple calls to evaluate doesn't leave internal options state
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1] + " | " + JSON.stringify(v[2]), function() {
              expect((MathCore.evaluateVerbose({
                method: v[0],
                value: v[1][1],
                options: v[2]
              }, v[1][0]), MathCore.evaluateVerbose({
                method: v[0],
                value: v[1][1],
                options: v[2]
              }, v[1][0])).errorCode).toEqual(v[3]);
            });
          });
        }
        describe("various", function() {
          var tests = [
            ["isSimplified", ["x(x+\\frac{3}{12})"], {}, 0],
          ];
          run(tests);
        });
      });
      describe("equivSymbolic isSimplified", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(
                MathCore.evaluate(
                  {
                    method: "equivSymbolic",
                    options: {
                      allowDecimal: false,
                      decimalPlaces: 10,
                    },
                    value: v[0],
                  },
                  v[1]
                )
              ).toBe(true);
              expect(
                MathCore.evaluate(
                  {
                    method: "isSimplified"
                  },
                  v[1]
                )
              ).toBe(true);
            });
          });
        }
        run([
            ["x(x+\\frac{3}{12})", "x^2+\\frac{1}{4}x"],
            ["x(x+\\frac{3}{12})", "x^2+\\frac{x}{4}"],
            ["x(x+\\frac{3}{12})", "x^2+\\frac{1}{4}x"],
            ["x(x+\\frac{3}{12})", "x^2+\\frac{x}{4}"]
        ]);
      });
    });
  });
});
