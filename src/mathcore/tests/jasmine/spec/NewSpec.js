/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2013 Learnosity Ltd. All Rights Reserved.
 *
 */
/*
  Add new mathcore test cases here. After they have been triaged, they will be
  moved to the appropriate test spec.

  Various test drivers are provided, by feel free to modify them or add new ones
  as needed.
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
  describe("MathCore", function() {
    describe("New", function() {
      describe("equivLiteral", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivLiteral",
                options: {
                  ignoreOrder: true,
                  inverseResult: false
                },
                value: v[0],
              }, v[1])).toBe(true);
            });
          });
        }
        run([
        ]);
      });
      describe("NOT equivLiteral", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivLiteral",
                value: v[0],
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
        ]);
      });
      describe("NOT equivSymbolic", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivSymbolic",
                options: {
                  allowDecimal: false,
                  decimalPlaces: 10,
                },
                value: v[0],
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
                options: {
                  allowDecimal: false,
                  decimalPlaces: 10,
                },
                value: v[0],
              }, v[1])).toBe(true);
            });
          });
        }
        run([
        ]);
      });
      describe("NOT equivSymbolic", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(MathCore.evaluate({
                method: "equivSymbolic",
                options: {
                  allowDecimal: false,
                  decimalPlaces: 10,
                },
                value: v[0],
              }, v[1])).toBe(false);
            });
          });
        }
        run([
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
      describe("equivValue decimalPlaces", function() {
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
        ]);
      });
      describe("NOT isExpanded", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0], function() {
              expect(MathCore.evaluate({
                method: "isExpanded",
              }, v[0])).toBe(false);
            });
          });
        }
        run([
        ]);
      });
      describe("isFactorised field:integer", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0], function() {
              expect(MathCore.evaluate({
                method: "isFactorised",
                options: { field: "integer" },
              }, v[0])).toBe(true);
            });
          });
        }
        run([
        ]);
      });
      describe("NOT isFactorised field:integer", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0], function() {
              expect(MathCore.evaluate({
                method: "isFactorised",
                options: { field: "integer" },
              }, v[0])).toBe(false);
            });
          });
        }
        run([
        ]);
      });
      describe("isFactorised field:real", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0], function() {
              expect(MathCore.evaluate({
                method: "isFactorised",
                options: { field: "real" },
              }, v[0])).toBe(true);
            });
          });
        }
        run([
        ]);
      });
      describe("NOT isFactorised field:real", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0], function() {
              expect(MathCore.evaluate({
                method: "isFactorised",
                options: { field: "real" },
              }, v[0])).toBe(false);
            });
          });
        }
        run([
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
        ]);
      });
    });
  });
});
