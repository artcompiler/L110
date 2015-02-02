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
    describe("Errors", function() {
      describe("evaluateVerbose() errorCode", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1] + " | " + JSON.stringify(v[2]), function() {
              expect(MathCore.evaluateVerbose({
                method: v[0],
                value: v[1][1],
                options: v[2]
              }, v[1][0]).errorCode).toEqual(v[3]);
            });
          });
        }
        describe("various", function() {
          var tests = [
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
            ["equivLiteral", ["10", "10..."], {}, 1007],
=======
            ["isFactorised", ["3xy(x^2-3y^2+4xy)"], {field: "integer"}, 2001],          
>>>>>>> 3fca0da35a76588e060373f14426342a744d9193
=======
            ["isFactorised", ["3xy(x^2-3y^2+4xy)"], {field: "integer"}, 2001],          
>>>>>>> dd6f049af25d51145e2f7ba59448406009607b2a
=======
            ["equivLiteral", ["1.000", "10,00"], {
              allowThousandsSeparator: true,
              setThousandsSeparator: ['.'],
            }, 2008],
            ["equivLiteral", ["1,000", "1000"], {
              allowThousandsSeparator: true,
              setThousandsSeparator: [','],
              setDecimalSeparator: ',',
            }, 2008],
            ["equivLiteral", ["1,000", "1000"], {
              allowThousandsSeparator: true,
              setThousandsSeparator: [','],
              setDecimalSeparator: [',', '.'],
            }, 3007],
>>>>>>> e45c5b331071291e6cf63b411b582f19b302f06c
            ["equivLiteral", ["(1+2]", "(1+2)"], {}, 1001],
            ["equivLiteral", ["\\text{Range: }\\left[-\\infty,0\\right)",
                              "\\text{Range: }\\left(-\\infty,0\\right)"], {}, 1001],
            ["isFactorised", ["==============="], {}, 1006],
            ["equivLiteral", ["", "10"], {}, 3002],
            ["equivLiteral", ["10", ""], {}, 3003],
            ["isFactorised", ["4k^2+9m^2"], {}, 2001],
            ["isFactorised", ["xy+2ab"], {}, 2001],
            ["isFactorised", ["(10x"], {}, 1001],
            ["isFactorised", ["(xy^3+2z^2)(x-1)"], {}, 2001],
            ["equivValue", ["x", "|x|"], {}, 2005],
            ["equivValue", ["5x^2+3x+2", "1"], {}, 2005],
            ["equivValue", ["10g", "10"], {}, 2009],
            ["equivValue", ["1000", "10,00"], {allowThousandsSeparator: true}, 1005],
            ["isFactorised", ["x^2-25"], {Field: "integer"}, 3006],
            ["isFactorised", ["x^2-25"], {field: "Integer"}, 3007],
          ];
          run(tests);
        });
        describe("evaluateVerbose() location", function() {
          function run(tests) {
            forEach(tests, function (v, i) {
              it(v[0] + " | " + v[1], function() {
                expect(MathCore.evaluateVerbose({
                  method: v[0],
                  value: v[1][1]
                }, v[1][0]).location).toEqual(v[2]);
              });
            });
          }
          describe("various", function() {
            var tests = [
              ["equivLiteral", ["", "10"], "user"],
              ["equivLiteral", ["10", ""], "spec"],
              ["isFactorised", ["4k^2+9m^2"], "user"],
              ["isFactorised", ["x^2+xy+3y^2"], "user"],
              ["isFactorised", ["(10x"], "user"],
              ["isFactorised", ["x^y+1"], "user"],
              ["isFactorised", ["(xy^3+2z^2)(x-1)"], "user"],
              ["isFactorised", ["(x^y+1)(x-1)"], "user"],
              ["equivValue", ["1", "5x^2+3x+2"], "spec"],
            ];
            run(tests);
          });
        });
      });
    });
  });
});
