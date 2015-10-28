/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2013 Learnosity Ltd. All Rights Reserved.
 *
 */

"use strict";

// if using Karma use the karma base url
var setBaseUrl = (window.__karma__) ? "/base/lib" : "../../lib";
var setBaseUrlSrc = (window.__karma__) ? "/base/src" : "../../src";


var TEST_LIB = false;
if (TEST_LIB) {
  requirejs.config({
    baseUrl: setBaseUrl,
    paths: {
      'mathcore': 'mathcore',
    },
    shim: {
      'mathcore': {
        exports: 'MathCore'
      },
    }
  });
} else {
  requirejs.config({
    baseUrl: setBaseUrlSrc,
    paths: {
      'backward': 'backward',
      'assert': 'assert',
      'trace': 'trace',
      'ast': 'ast',
      'model': 'model',
      'bigdecimal': '../lib/BigDecimal',
      'mathmodel': 'mathmodel',
      'sympy': 'sympy',
      'mathcore': 'mathcore',
      'chemcore': 'chemcore',
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
        deps: ['mathmodel', 'sympy'],
        exports: 'MathCore'
      },
      'chemcore': {
        deps: ['mathmodel'],
        exports: 'ChemCore'
      },
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
    describe("Debug", function() {
      describe("equivSymbolic", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivSymbolic",
                value: v[0],
                options: {
                  strict: true
                }
              }, v[1])).toBe(true);
            });
          });
        }
        run([
          ["\\frac{\\log_e\\left(\\frac{-c}{A}\\right)}{k}",
           "\\frac{\\log_e\\left(\\frac{-c}{A}\\right)}{k}"],
          ["4(2+3e^{3x})(2x+e^{3x})^3",
           "4(2+3e^{3x})(2x+e^{3x})^3"],
          ["5-\\frac{2}{x+3}", "5-\\frac{2}{x+3}"],
          ["x+2=8(x+12)", "\\frac{(x+2)}{(x+12)}=8"],
          ["\\frac{b+c}{bx-1}\\frac{b+c}{bx-1}", "\\frac{-b-c}{1-bx}\\frac{b+c}{bx-1}"],
          ["\\frac{b+c}{bx-1}\\frac{b+c}{bx-1}", "\\frac{b+c}{bx-1}\\frac{-b-c}{1-bx}"],
          ["-\\frac{-1(c+b)}{1(xb-1)}", "\\frac{-b-c}{1-bx}"],
          ["-\\frac{1(c+b)}{-1(xb-1)}", "\\frac{-b-c}{1-bx}"],
          ["\\frac{-1(c+b)}{-1(xb-1)}", "\\frac{-b-c}{1-bx}"],
          ["-\\frac{-1(c+b)}{1(xb-1)}", "\\frac{b+c}{bx-1}"],
          ["-\\frac{1(c+b)}{-1(xb-1)}", "\\frac{b+c}{bx-1}"],
          ["\\frac{-1(c+b)}{-1(xb-1)}", "\\frac{b+c}{bx-1}"],
          ["\\frac{-1}{-1(1-bx)}", "\\frac{1}{1-bx}"],
          ["\\frac{-b-c}{1-bx}", "\\frac{-b-c}{1-bx}"],
          ["\\frac{b+c}{bx-1}", "\\frac{-b-c}{1-bx}"],
          ["\\frac{5}{2x-3}", "-\\frac{5}{3-2x}"],
          ["\\frac{5}{2x-3}", "\\frac{-5}{3-2x}"],
          ["\\frac{5}{2x-3}", "\\frac{5}{-(3-2x)}"],
          ["\\frac{391t^2+0.112}{0.218t^4+0.991t^2+1}+\\frac{391\\left(t-1\\right)^2+0.112}{0.218\\left(t-1\\right)^4+0.991\\left(t-1\\right)^2+1}",
           "\\frac{391t^2+0.112}{0.218t^4+0.991t^2+1}+\\frac{391\\left(t-1\\right)^2+0.112}{0.218\\left(t-1\\right)^4+0.991\\left(t-1\\right)^2+1}"],
        ]);
      });
    });
  });
});
