/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2013 Learnosity Ltd. All Rights Reserved.
 *
 */

"use strict";

var TEST_LIB = false;
if (TEST_LIB) {
  requirejs.config({
    baseUrl: "../../lib",
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
    baseUrl: "../../src",
    paths: {
      'backward': '../lib/model/src/backward',
      'assert': '../lib/model/src/assert',
      'trace': '../lib/model/src/trace',
      'ast': '../lib/model/src/ast',
      'model': '../lib/model/src/model',
      'bigdecimal': '../lib/BigDecimal',
      'mathmodel': 'mathmodel',
      'sympy': 'sympy',
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
        deps: ['mathmodel', 'sympy'],
        exports: 'MathCore'
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
              }, v[1])).toBe(true);
            });
          });
        }
        run([
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
    });
  });
});
