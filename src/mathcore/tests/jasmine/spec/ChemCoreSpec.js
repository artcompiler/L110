/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2014 Learnosity Ltd. All Rights Reserved.
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
                  decimalPlaces: 3,
                },
              }, v[1])).toBe(true);
            });
          });
        }
        run([
          ["", ""],
          ["Fe_2{}^-", "Fe_2{}^-"],
          ["Fe_2{}^-", "Fe_2^-"],
          ["_1^2H", "_1^2H"],
          ["_1^-H", "_1^-H"],
          ["_1^+H", "_1^+H"],
          ["_1^{2-}H", "_1^{2-}H"],
          ["_1^{2+}H", "_1^{2+}H"],
          ["A_{x_1}", "A_{x_1}"],
          ["3Zn^{2+}(aq)+2(PO_4)^{3-}(aq)\\to  Zn_3(PO_4)_2(s)",
           "3Zn^{2+}(aq)+2(PO_4)^{3-}(aq)\\to  Zn_3(PO_4)_2(s)"],
          ["Cu^{2+}(aq)+2OH^-(aq)\\to Cu(OH)_2(s)", "Cu^{2+}(aq)+2OH^-(aq)\\to Cu(OH)_2(s)"],
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
      describe("equivValue", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(ChemCore.evaluate({
                method: "equivValue",
                value: v[0]
              }, v[1])).toBe(true);
            });
          });
        }
        run([
          ["-173.15\\degree C", "100 \\degree K"],
          ["1\\pm0.1\\ mol", "1.08\\ mol"],
          ["1000000{\\mu}m", "1m"],
          ["1000000{\\mu}g", "1g"],
          ["1000000{\\mu}s", "1s"],
          ["1000000{\\mu}L", "1L"],
          ["1{\\mu}L", "1*10^{-6}L"],
          ["1{\\mu}L", "1\\times10^{-6}L"],
          ["1000000\\mum", "1m"],
          ["1000000\\mug", "1g"],
          ["1000000\\mus", "1s"],
          ["1000000\\muL", "1L"],
          ["1\\muL", "1*10^{-6}L"],
          ["1\\muL", "1\\times10^{-6}L"],
          ["1\\times10^6\\muL", "1L"],
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
      describe("equivLiteral ignoreOrder=true", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(ChemCore.evaluate({
                method: "equivLiteral",
                options: {
                  ignoreOrder: true,
                },
                value: v[0]
              }, v[1])).toBe(true);
            });
          });
        }
        run([
          ["\\frac{[\\text{Cu}(\\text{NH}_3)_4{}^{2+}]^-}{[\\text{Cu}^{2+}]^-\\times[\\text{NH}_3]^4}",
           "\\frac{[\\text{Cu}(\\text{NH}_3)_4{}^{2+}]^-}{[\\text{Cu}^{2+}]^-\\times[\\text{NH}_3]^4}"],
          ["CH_2+2O_2 \\rightarrow CO_2+2H_2",
           "CH_2+2O_2 \\rightarrow 2H_2+CO_2"],
          ["CH_2+2O_2 \\longrightarrow CO_2+2H_2O",
           "CH_2+2O_2 \\longrightarrow 2H_2O+CO_2"],
          ["CH_2(g)+2O_2(g) \\longrightarrow CO_2(g)+2H_2O(g)",
           "CH_2(g)+2O_2(g) \\longrightarrow (2H_2O(g)+CO_2(g))"],
          ["^{872}_{45} \\overset{2+}{H}_4{}^{2-}", "^{872}_{45} \\overset{2+}{H}_4{}^{2-}"],
          ["^{872}_{45} \\underset{2+}{H}_4{}^{2-}", "^{872}_{45} \\underset{2+}{H}_4{}^{2-}"],
          ["Fe_2{}^-", "Fe_2{}^-"],
          ["Fe_2{}^-", "Fe_2^-"],
          ["C^{2}+H\\ \\rightarrow\\ HC^2", "C^2+H\\ \\rightarrow\\ HC^2"],
          ["HC^2\\ \\rightarrow\\ HC^2", "HC^2\\ \\rightarrow\\ HC^2"], 
          ["HC^{2}\\ \\rightarrow\\ HC^{2}", "C^{2}H\\ \\rightarrow\\ HC^{2}"], 
          ["H+C^2\\ \\rightarrow\\ HC^2", "C^{2}+H\\ \\rightarrow\\ HC^2"], 
          ["H+C^2\\ \\rightarrow\\ HC^2", "C^2+H\\ \\rightarrow\\ HC^2"], 
        ]);
      });
      describe("NOT equivLiteral", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(ChemCore.evaluate({
                method: "equivLiteral",
                value: v[0]
              }, v[1])).toBe(false);
            });
          });
        }
        run([
          ['\\overset{2+}{H}', '\\overset{2-}{H}'],
          ['\\overset{2-}{H}', '\\overset{2+}{H}'],
          ['\\overset{2}{H}', '\\overset{2-}{H}'],
          ['\\overset{2}{H}', '\\overset{2+}{H}'],
          ['\\overset{2-}{H}', '\\overset{2}{H}'],
          ['\\overset{2+}{H}', '\\overset{2}{H}'],
          ["\\overset{2}{H}", "\\overset{2+}{H}"],
          ["\\overset{2+}{H}", "\\overset{2}{H}"],
          ["\\underset{2}{H}", "\\underset{2+}{H}"],
          ["\\underset{2+}{H}", "\\underset{2}{H}"],
          ["\\overset{3}{H}", "\\overset{2}{H}"],
          ["\\overset{3}{H}", "\\underset{3}{H}"],
        ]);
      });
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
          ['\\overset{2+}{H}', '\\overset{2+}{H}'],
          ['\\overset{2-}{H}', '\\overset{2-}{H}'],
          ['\\overset{2}{H}', '\\overset{2}{H}'],
          ['\\xrightarrow[3]{2}', '\\xrightarrow[3]{2}'],
          ['\\xrightarrow{2}', '\\xrightarrow{2}'],
          ['\\xrightarrow[3]', '\\xrightarrow[3]'],
          ['\\text{C}_2\\text{H}_5\\text{OH}\\xrightarrow{Cr_2O_7{}^{2-},\\text{H}^+,\\text{H}^+}CH_3COOH',
           '\\text{C}_2\\text{H}_5\\text{OH}\\xrightarrow{Cr_2O_7{}^{2-},\\text{H}^+,\\text{H}^+}CH_3COOH'
          ],
          ["", ""],
          ["Fe_2{}^-", "Fe_2{}^-"],
          ["Fe_2{}^-", "Fe_2^-"],
          ["_1^2H", "_1^2H"],
          ["_1^-H", "_1^-H"],
          ["_1^+H", "_1^+H"],
          ["_1^{2-}H", "_1^{2-}H"],
          ["_1^{2+}H", "_1^{2+}H"],
          ["x_1^{4+}", "x_1^{4+}"],
          ["x^{4+}", "x^{4+}"],
          ["Cu^{2+}(aq)+2OH^-(aq)\\to Cu(OH)_2(s)", "Cu^{2+}(aq)+2OH^-(aq)\\to Cu(OH)_2(s)"],
          ["M_r^-", "M_r^-"],
          ["K_a=\\frac{\\left[M_r^-\\right]\\left[H_3O^+\\right]}{\\left[HM_r\\right]}",
           "K_a=\\frac{\\left[M_r^-\\right]\\left[H_3O^+\\right]}{\\left[HM_r\\right]}"],
          ["Mg^2+(aq)+S^{2-}(aq)\\longrightarrow MgS(s)", "Mg^2+(aq)+S^{2-}(aq)\\longrightarrow MgS(s)"],
          ["Cr_2O_7^{2-}(aq)+14H^+(aq)+6^{e-}\\longrightarrow 2Cr^{3+}(aq)+7H_2O(l)", "Cr_2O_7^{2-}(aq)+14H^+(aq)+6^{e-}\\longrightarrow 2Cr^{3+}(aq)+7H_2O(l)"],
          ["Cr_2O_7^{2-}(aq)+14H^+(aq)+6^{e-}\\ \\longrightarrow\\ 2Cr^{3+}(aq)+7H_2O(l)", "Cr_2O_7^{2-}(aq)+14H^+(aq)+6^{e-}\\ \\longrightarrow\\ 2Cr^{3+}(aq)+7H_2O(l)"],
          ["H^+\\left(aq\\right)+SO_4^{2-}\\left(aq\\right)+K^+\\left(aq\\right)+OH^-\\left(aq\\right)\\rightarrow SO_{4^{2-}}\\left(aq\\right)+K^+\\left(aq\\right)+H_2O\\left(l\\right)",
           "H^+\\left(aq\\right)+SO_4^{2-}\\left(aq\\right)+K^+\\left(aq\\right)+OH^-\\left(aq\\right)\\rightarrow SO_{4^{2-}}\\left(aq\\right)+K^+\\left(aq\\right)+H_2O\\left(l\\right)"],
          ["H^+\\left(aq\\right)+SO_4^{2-}",
           "H^+\\left(aq\\right)+SO_4^{2-}"],
          ["H^+\\left(aq\\right)+SO_4^{2-}\\left(aq\\right)+K^+\\left(aq\\right)+OH^-\\left(aq\\right)\\rightarrow SO_4^{2-}\\left(aq\\right)+K^+\\left(aq\\right)+H_2O\\left(l\\right)",
           "H^+\\left(aq\\right)+SO_4^{2-}\\left(aq\\right)+K^+\\left(aq\\right)+OH^-\\left(aq\\right)\\rightarrow SO_4^{2-}\\left(aq\\right)+K^+\\left(aq\\right)+H_2O\\left(l\\right)"],
          ["H^+", "H^+"],
          ["CH_3COO^-", "CH_3COO^-"],
          ["SO_4^{2-}", "SO_4^{2-}"],
          ["Cu^{2+}", "Cu^{2+}"],
          ["\Na^+\Cl^-", "\Na^+\Cl^-"],
          ["Na^+Cl^-", "Na^+Cl^-"],
          ["Fe_2O_3", "Fe_2O_3"],
          ["Mg+2HCl", "Mg+2HCl"],
          ["\Na\Cl", "NaCl"],
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
          ["mol", "1.08\\ mol"],
        ]);
      });
      describe("NOT isUnit", function() {
        function run(tests) {
          forEach(tests, function (v, i) {
            it(v[0] + " | " + v[1], function() {
              expect(ChemCore.evaluate({
                method: "isUnit",
                value: v[0]
              }, v[1])).toBe(false);
            });
          });
        };
        run([
          ["mol", "1.08"],
          ["mol", "1.08cm"],
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
