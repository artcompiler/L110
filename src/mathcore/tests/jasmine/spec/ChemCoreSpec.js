/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2014 Learnosity Ltd. All Rights Reserved.
 *
 */

"use strict";

var TEST_LIB = true;
if (TEST_LIB) {
  requirejs.config({
    baseUrl: "../../lib",
    paths: {
      'chemcore': 'chemcore'
    },
    shim: {
      'chemcore': {
        exports: 'ChemCore'
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
      'chemcore': 'chemcore'
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
      'chemcore': {
        deps: ['mathmodel'],
        exports: 'ChemCore'
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

define(["chemcore"], function (ChemCore) {
  describe("Chem Core", function() {
    describe("Numbers", function() {
      describe("equivSymbolic allowDecimal, decimalPlaces:3", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(ChemCore.evaluate({
                method: "equivSymbolic",
                value: v[0],
                options: {
                  allowDecimal: true,
                  decimalPlaces: 4,
                },
              }, v[1])).toBe(true);
            });
          });
        }
        run([
          ["M(C):M(H)", "12.011g:1.008g"],
          ["M(C):M(H_2)", "12.011g:1.008g*2"],
        ]);
      });
      describe("equivSymbolic allowDecimal, decimalPlaces:4", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(ChemCore.evaluate({
                method: "equivSymbolic",
                value: v[0],
                options: {
                  allowDecimal: true,
                  decimalPlaces: 4,
                },
              }, v[1])).toBe(true);
            });
          });
        }
        run([
          ["\\frac{10g}{24.3g mol^-1}", "0.4115mol"],
        ]);
      });
      describe("equivValue decimalPlaces:3", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(ChemCore.evaluate({
                method: "equivValue",
                value: v[0],
                options: {decimalPlaces: 3},
              }, v[1])).toBe(true);
            });
          });
        }
        run([
          ["\\frac{60.4}{64.6}", "93.5%", 3],
          ["\\frac{10g}{24.3g mol^-1}", "0.4115mol"],
          ["M(C):M(H)", "12.011g:1.008g"],
          ["M(C):M(H_2)", "12.011g:1.008g*2"],
        ]);
      });
    });
    describe("Expressions", function() {
      describe("equivLiteral", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(ChemCore.evaluate({
                method: "equivLiteral",
                value: v[0]
              }, v[1])).toBe(true);
            });
          });
        }
        run([
          ["H^+\\left(aq\\right)+SO_4^{2-}\\left(aq\\right)+K^+\\left(aq\\right)+OH^-\\left(aq\\right)\\rightarrow SO_{4^{2-}}\\left(aq\\right)+K^+\\left(aq\\right)+H_2O\\left(l\\right)",
           "H^+\\left(aq\\right)+SO_4^{2-}\\left(aq\\right)+K^+\\left(aq\\right)+OH^-\\left(aq\\right)\\rightarrow SO_{4^{2-}}\\left(aq\\right)+K^+\\left(aq\\right)+H_2O\\left(l\\right)"],
          ["H^+\\left(aq\\right)+SO_4^{2-}",
           "H^+\\left(aq\\right)+SO_4^{2-}"],
          ["H^+\\left(aq\\right)+SO_4^2-\\left(aq\\right)+K^+\\left(aq\\right)+OH^-\\left(aq\\right)\\rightarrow SO_4^2-\\left(aq\\right)+K^+\\left(aq\\right)+H_2O\\left(l\\right)",
           "H^+\\left(aq\\right)+SO_4^2-\\left(aq\\right)+K^+\\left(aq\\right)+OH^-\\left(aq\\right)\\rightarrow SO_4^2-\\left(aq\\right)+K^+\\left(aq\\right)+H_2O\\left(l\\right)"],
          ["H^+", "H^+"],
          ["CH_3COO^-", "CH_3COO^-"],
          ["SO_4^2-", "SO_4^2-"],
          ["Cu^2+", "Cu^2+"],
          ["Na^+Cl^-", "Na^+Cl^-"],
          ["Fe_2O_3", "Fe_2O_3"],
          ["Mg+2HCl", "Mg+2HCl"],
          ["NaCl", "NaCl"],
          ["M(NaCl)", "M(NaCl)"],
        ]);
      });
      describe("isUnit", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(ChemCore.evaluate({
                method: "isUnit",
                value: v[0]
              }, v[1])).toBe(true);
            });
          });
        };
        run([
        ]);
      });
    });
    describe("Molar mass", function() {
      describe("equivLiteral", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(ChemCore.evaluate({
                method: "equivLiteral",
                value: v[0]
              }, v[1])).toBe(true);
            });
          });
        }
        run([
        ]);
      });
      describe("equivValue decimalPlaces:2", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(ChemCore.evaluate({
                method: "equivValue",
                value: v[0],
                options: {decimalPlaces: 2},
              }, v[1])).toBe(true);
            });
          });
        }
        run([
          ["M(NaCl)", "M(NaCl)"],
          ["M(Na)+M(Cl)", "M(NaCl)"],
          ["M(Na) + M(Cl)", "58.440"],
          ["M(NaCl)", "58.440"],
          ["M(Zr)", "91.224"],
          ["M(Fe)", "55.845"],
          ["M(O)", "15.9994"],
          ["M(Fe_2O_3)", "159.687"],
          ["M(H)", "1.00794"],
          ["M(H_2)", "2.016"],
        ]);
      });
      describe("equivValue decimalPlaces:2 inverseResult", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(ChemCore.evaluate({
                method: "equivValue",
                value: v[0],
                options: {
                  decimalPlaces: 2,
                  inverseResult: true,
                },
              }, v[1])).toBe(true);
            });
          });
        }
        run([
          ["M(NaCl)", "M(NaCl_2)"],
          ["M(H_2)", "2.03"],
        ]);
      });
    });
    describe("Equations", function() {
      describe("equivLiteral", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(ChemCore.evaluate({
                method: "equivLiteral",
                value: v[0]
              }, v[1])).toBe(true);
            });
          });
        }
        run([
          ["n(Mg)=\\frac{m(Mg)}{M(Mg)}", "n(Mg)=\\frac{m(Mg)}{M(Mg)}"],
          ["Mg(s)+2HCl(aq)->MgCl_2(aq)+H2(g)", "Mg(s)+2HCl(aq)->MgCl_2(aq)+H2(g)"], 
          ["Mg(s)+2HCl(aq) \\rightarrow MgCl_2(aq)+H2(g)", "Mg(s)+2HCl(aq) \\rightarrow MgCl_2(aq)+H2(g)"], 
          ["Mg+2HCl \\rightarrow MgCl_2+H_2", "Mg+2HCl \\rightarrow MgCl_2+H_2"],
        ]);
      });
      describe("isUnit", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(ChemCore.evaluate({
                method: "isUnit",
                value: v[0]
              }, v[1])).toBe(true);
            });
          });
        };
        run([
        ]);
      });
    });
  });
});
