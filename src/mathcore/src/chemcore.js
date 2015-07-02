/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2013 Learnosity Ltd. All Rights Reserved.
 *
 */
"use strict";

var ChemCore = (function () {

  Assert.reserveCodeRange(4000, 4999, "chemcore");
  var messages = Assert.messages;
  var message = Assert.message;
  var assert = Assert.assert;
  messages[4001] = "No Chem Core spec provided.";
  messages[4002] = "No Chem Core solution provided.";
  messages[4003] = "No Chem Core spec value provided.";
  messages[4004] = "Invalid Chem Core spec method '%1'.";
  messages[4005] = "Operation taking too long.";

  var u = 1;
  var k = 1000;
  var c = Math.pow(10, -2);
  var m = Math.pow(10, -3);
  var mu = Math.pow(10, -6); // micro, \\mu
  var n = Math.pow(10, -9);
  var env = {
    "g": { type: "unit", value: u, base: "g" },
    "s": { type: "unit", value: u, base: "s" },
    "m": { type: "unit", value: u, base: "m" },
    "L": { type: "unit", value: u, base: "L" },
    "kg": { type: "unit", value: k, base: "g" },
    "km": { type: "unit", value: k, base: "m" },
    "ks": { type: "unit", value: k, base: "s" },
    "kL": { type: "unit", value: k, base: "L" },
    "cg": { type: "unit", value: c, base: "g" },
    "cm": { type: "unit", value: c, base: "m" },
    "cs": { type: "unit", value: c, base: "s" },
    "cL": { type: "unit", value: c, base: "L" },
    "mg": { type: "unit", value: m, base: "g" },
    "mm": { type: "unit", value: m, base: "m" },
    "ms": { type: "unit", value: m, base: "s" },
    "mL": { type: "unit", value: m, base: "L" },
    "\\mu": mu,
    "\\mug": { type: "unit", value: mu, base: "g" },
    "\\mus": { type: "unit", value: mu, base: "s" },
    "\\mum": { type: "unit", value: mu, base: "m" },
    "\\muL": { type: "unit", value: mu, base: "L" },
    "ng": { type: "unit", value: n, base: "g" },
    "nm": { type: "unit", value: n, base: "m" },
    "ns": { type: "unit", value: n, base: "s" },
    "nL": { type: "unit", value: n, base: "L" },
    "in": { type: "unit", value: 1 / 12, base: "ft" },
    "ft": { type: "unit", value: u, base: "ft" },
    "yd": { type: "unit", value: 3, base: "ft" },
    "mi": { type: "unit", value: 5280, base: "ft" },
    "fl": { type: "unit", value: 1, base: "fl" },  // fluid ounce
    "cup": { type: "unit", value: 8, base: "fl" },
    "pt": { type: "unit", value: 16, base: "fl" },
    "qt": { type: "unit", value: 32, base: "fl" },
    "gal": { type: "unit", value: 128, base: "fl" },
    "oz": { type: "unit", value: 1 / 16, base: "lb" },
    "lb": { type: "unit", value: 1, base: "lb" },
    "st": { type: "unit", value: 1 / 1614, base: "lb" },
    "qtr": { type: "unit", value: 28, base: "lb" },
    "cwt": { type: "unit", value: 112, base: "lb" },
    "t": { type: "unit", value: 2240, base: "lb" },
    "$": { type: "unit", value: u, base: "$" },
    "i": { type: "unit", value: null, base: "i" },
    "min": { type: "unit", value: 60, base: "s" },
    "hr": { type: "unit", value: 3600, base: "s" },
    "day": { type: "unit", value: 24*3600, base: "s" },
    "mol": { type: "unit", value: u, base: "mol" },
    "\\radian": { type: "unit", value: u, base: "radian" },
    "\\degree": { type: "unit", value: Math.PI / 180, base: "radian" },
    "\\degree K": { type: "unit", value: u, base: "\\degree K" },
    "\\degree C": { type: "unit", value: u, base: "\\degree C" },
    "\\degree F": { type: "unit", value: u, base: "\\degree F" },
    "\\pi": Math.PI,
    "aq": u, // only so it will be recognized as a single identifier
    "Ac": {"name": "Actinium", "num": "89", "mass": "227"},
    "Al": {"name": "Aluminum", "num": "13", "mass": "26.9815385"},
    "Am": {"name": "Americium", "num": "95", "mass": "243"},
    "Sb": {"name": "Antimony", "num": "51", "mass": "121.760"},
    "Ar": {"name": "Argon", "num": "18", "mass": "39.948"},
    "As": {"name": "Arsenic", "num": "33", "mass": "74.921595"},
    "At": {"name": "Astatine", "num": "85", "mass": "210"},
    "Ba": {"name": "Barium", "num": "56", "mass": "137.327"},
    "Bk": {"name": "Berkelium", "num": "97", "mass": "247"},
    "Be": {"name": "Beryllium", "num": "4", "mass": "9.0121831"},
    "Bi": {"name": "Bismuth", "num": "83", "mass": "208.98040"},
    "Bh": {"name": "Bohrium", "num": "107", "mass": "270"},
    "B": {"name": "Boron", "num": "5", "mass": "10.81"},
    "Br": {"name": "Bromine", "num": "35", "mass": "79.904"},
    "Cd": {"name": "Cadmium", "num": "48", "mass": "112.414"},
    "Ca": {"name": "Calcium", "num": "20", "mass": "40.078"},
    "Cf": {"name": "Californium", "num": "98", "mass": "251"},
    "C": {"name": "Carbon", "num": "6", "mass": "12.011"},
    "Ce": {"name": "Cerium", "num": "58", "mass": "140.116"},
    "Cl": {"name": "Chlorine", "num": "17", "mass": "35.45"},
    "Cr": {"name": "Chromium", "num": "24", "mass": "51.9961"},
    "Co": {"name": "Cobalt", "num": "27", "mass": "58.933194"},
    "Cu": {"name": "Copper", "num": "29", "mass": "63.546"},
    "Cm": {"name": "Curium", "num": "96", "mass": "247"},
    "Ds": {"name": "Darmstadtium", "num": "110", "mass": "281"},
    "Db": {"name": "Dubnium", "num": "105", "mass": "270"},
    "Dy": {"name": "Dysprosium", "num": "66", "mass": "162.500"},
    "Es": {"name": "Einsteinium", "num": "99", "mass": "252"},
    "Er": {"name": "Erbium", "num": "68", "mass": "167.259"},
    "Eu": {"name": "Europium", "num": "63", "mass": "151.964"},
    "Fm": {"name": "Fermium", "num": "100", "mass": "257"},
    "F":  {"name": "Fluorine", "num": "9", "mass": "18.998403163"},
    "Fr": {"name": "Francium", "num": "87", "mass": "223"},
    "Gd": {"name": "Gadolinium", "num": "64", "mass": "157.25"},
    "Ga": {"name": "Gallium", "num": "31", "mass": "69.723"},
    "Ge": {"name": "Germanium", "num": "32", "mass": "72.630"},
    "Au": {"name": "Gold", "num": "79", "mass": "196.966569"},
    "Hf": {"name": "Hafnium", "num": "72", "mass": "178.49"},
    "Hs": {"name": "Hassium", "num": "108", "mass": "277"},
    "He": {"name": "Helium", "num": "2", "mass": "4.002602"},
    "Ho": {"name": "Holmium", "num": "67", "mass": "164.93033"},
    "H":  {"name": "Hydrogen", "num": "1", "mass": "1.008"},
    "In": {"name": "Indium", "num": "49", "mass": "114.818"},
    "I":  {"name": "Iodine", "num": "53", "mass": "126.90447"},
    "Ir": {"name": "Iridium", "num": "77", "mass": "192.217"},
    "Fe": {"name": "Iron", "num": "26", "mass": "55.845"},
    "Kr": {"name": "Krypton", "num": "36", "mass": "83.798"},
    "La": {"name": "Lanthanum", "num": "57", "mass": "138.90547"},
    "Lr": {"name": "Lawrencium", "num": "103", "mass": "262"},
    "Pb": {"name": "Lead", "num": "82", "mass": "207.2"},
    "Li": {"name": "Lithium", "num": "3", "mass": "6.94"},
    "Lv": {"name": "Livermoreium", "num": "116", "mass": "293"},
    "Lu": {"name": "Lutetium", "num": "71", "mass": "174.9668"},
    "Mg": {"name": "Magnesium", "num": "12", "mass": "24.305"},
    "Mn": {"name": "Manganese", "num": "25", "mass": "54.938044"},
    "Mt": {"name": "Meitnerium", "num": "109", "mass": "276"},
    "Md": {"name": "Mendelevium", "num": "101", "mass": "258"},
    "Hg": {"name": "Mercury", "num": "80", "mass": "200.592"},
    "Mo": {"name": "Molybdenum", "num": "42", "mass": "95.95"},
    "Nd": {"name": "Neodymium", "num": "60", "mass": "144.242"},
    "Ne": {"name": "Neon", "num": "10", "mass": "20.1797"},
    "Np": {"name": "Neptunium", "num": "93", "mass": "237"},
    "Ni": {"name": "Nickel", "num": "28", "mass": "58.6934"},
    "Nb": {"name": "Niobium", "num": "41", "mass": "92.90637"},
    "N":  {"name": "Nitrogen", "num": "7", "mass": "14.007"},
    "No": {"name": "Nobelium", "num": "102", "mass": "259"},
    "Os": {"name": "Osmium", "num": "76", "mass": "190.23"},
    "O": {"name": "Oxygen", "num": "8", "mass": "15.999"},
    "Pd": {"name": "Palladium", "num": "46", "mass": "106.42"},
    "P": {"name": "Phosphorus", "num": "15", "mass": "30.973761998"},
    "Pt": {"name": "Platinum", "num": "78", "mass": "195.084"},
    "Pu": {"name": "Plutonium", "num": "94", "mass": "244"},
    "Po": {"name": "Polonium", "num": "84", "mass": "209"},
    "K": {"name": "Potassium", "num": "19", "mass": "39.0983"},
    "Pr": {"name": "Praseodymium", "num": "59", "mass": "140.90766"},
    "Pm": {"name": "Promethium", "num": "61", "mass": "145"},
    "Pa": {"name": "Protactinium", "num": "91", "mass": "231.03588"},
    "Ra": {"name": "Radium", "num": "88", "mass": "226"},
    "Rn": {"name": "Radon", "num": "86", "mass": "222"},
    "Re": {"name": "Rhenium", "num": "75", "mass": "186.207"},
    "Rh": {"name": "Rhodium", "num": "45", "mass": "102.90550"},
    "Rb": {"name": "Rubidium", "num": "37", "mass": "85.4678"},
    "Ru": {"name": "Ruthenium", "num": "44", "mass": "101.07"},
    "Rf": {"name": "Rutherfordium", "num": "104", "mass": "267"},
    "Sm": {"name": "Samarium", "num": "62", "mass": "150.36"},
    "Sc": {"name": "Scandium", "num": "21", "mass": "44.955908"},
    "Sg": {"name": "Seaborgium", "num": "106", "mass": "271"},
    "Se": {"name": "Selenium", "num": "34", "mass": "78.971"},
    "Si": {"name": "Silicon", "num": "14", "mass": "28.085"},
    "Ag": {"name": "Silver", "num": "47", "mass": "107.8682"},
    "Na": {"name": "Sodium", "num": "11", "mass": "22.98976928"},
    "Sr": {"name": "Strontium", "num": "38", "mass": "87.62"},
    "S": {"name": "Sulfur", "num": "16", "mass": "32.06"},
    "Ta": {"name": "Tantalum", "num": "73", "mass": "180.94788"},
    "Tc": {"name": "Technetium", "num": "43", "mass": "97"},
    "Te": {"name": "Tellurium", "num": "52", "mass": "127.60"},
    "Tb": {"name": "Terbium", "num": "65", "mass": "158.92535"},
    "Tl": {"name": "Thallium", "num": "81", "mass": "204.38"},
    "Th": {"name": "Thorium", "num": "90", "mass": "232.0377"},
    "Tm": {"name": "Thulium", "num": "69", "mass": "168.93422"},
    "Sn": {"name": "Tin", "num": "50", "mass": "118.710"},
    "Ti": {"name": "Titanium", "num": "22", "mass": "47.867"},
    "W": {"name": "Tungsten", "num": "74", "mass": "183.84"},
    "U": {"name": "Uranium", "num": "92", "mass": "238.02891"},
    "V": {"name": "Vanadium", "num": "23", "mass": "50.9415"},
    "Xe": {"name": "Xenon", "num": "54", "mass": "131.293"},
    "Yb": {"name": "Ytterbium", "num": "70", "mass": "173.054"},
    "Y": {"name": "Yttrium", "num": "39", "mass": "88.90584"},
    "Zn": {"name": "Zinc", "num": "30", "mass": "65.38"},
    "Zr": {"name": "Zirconium", "num": "40", "mass": "91.224"},
  };

  function evaluate(spec, solution) {
    try {
      assert(spec, message(4001, [spec]));
      assert(solution != undefined, message(4002, [solution]));
      Assert.setCounter(1000000, message(4005));
      var evaluator = makeEvaluator(spec);
      var result = evaluator.evaluate(solution);
    } catch (e) {
      trace(e + "\n" + e.stack);
      result = undefined;
    }
    return result;
  }
  function evaluateVerbose(spec, solution) {
    try {
      assert(spec != undefined, message(4001, [spec]));
      Assert.setCounter(1000000, message(4005));
      var evaluator = makeEvaluator(spec);
      var result, errorCode = 0, msg = "Normal completion", stack, location;
      result = evaluator.evaluate(solution);
    } catch (e) {
      result = undefined;
      errorCode = parseErrorCode(e.message);
      msg = parseMessage(e.message);
      stack = e.stack;
      location = e.location;
    }
    return {
      result: result,
      errorCode: errorCode,
      message: msg,
      stack: stack,
      location: location,
      toString: function () {
        return this.errorCode + ": (" + location + ") " + msg + "\n" + this.stack;
      }
    }
    function parseErrorCode(e) {
      var code = +e.slice(0, e.indexOf(":"));
      if (!isNaN(code)) {
        return code;
      }
      return 0;
    }
    function parseMessage(e) {
      var code = parseErrorCode(e);
      if (code) {
        return e.slice(e.indexOf(":")+2);
      }
      return e;
    }
  }
  function validateOption(p, v) {
    switch (p) {
    case "field":
      switch (v) {
      case void 0: // undefined means use default
      case "integer":
      case "real":
      case "complex":
        break;
      default:
        assert(false, message(2011, [p, v]));
        break;
      }
      break;
    case "decimalPlaces":
      if (v === void 0 || +v >= 0 && +v <= 20) {
        break;
      }
      assert(false, message(2011, [p, v]));
      break;
    case "allowDecimal":
    case "dontExpandPowers":
    case "dontFactorDenominators":
    case "dontFactorTerms":
    case "dontConvertDecimalToFraction":
    case "dontSimplifyImaginary":
    case "ignoreOrder":
    case "inverseResult":
    case "ignoreText":
      if (typeof v === "undefined" || typeof v === "boolean") {
        break;
      }
      assert(false, message(2011, [p, v]));
      break;
    default:
      assert(false, message(2010, [p]));
      break;
    }
    // If we get this far, all is well.
    return;
  }
  function validateOptions(options) {
    if (options) {
      forEach(keys(options), function (option) {
        validateOption(option, options[option]);
      });
    }
  }

  function makeEvaluator(spec) {
    var method = spec.method;
    var value = spec.value;
    var options = Model.options = spec.options;
    Assert.setLocation("spec");
    validateOptions(options);
    Model.pushEnv(env);
    var valueNode = value != undefined ? Model.create(value, "spec") : undefined;
    Model.popEnv();
    var evaluate = function evaluate(solution) {
      Ast.clearPool();
      Model.pushEnv(env);
      Assert.setLocation("user");
      assert(solution != undefined, message(4002));
      var solutionNode = Model.create(solution, "user");
      Assert.setLocation("spec");
      var result;
      switch (method) {
      case "equivValue":
        assert(value != undefined, message(4003));
        result = valueNode.equivValue(solutionNode);
        break;
      case "equivLiteral":
        assert(value != undefined, message(4003));
        result = valueNode.equivLiteral(solutionNode);
        break;
      case "equivSymbolic":
        assert(value != undefined, message(4003));
        result = valueNode.equivSymbolic(solutionNode);
        break;
      case "isUnit":
        result = valueNode.isUnit(solutionNode);
        break;
      case "isTrue":
        result = solutionNode.isTrue();
        break;
      default:
        assert(false, message(4004, [method]));
        break;
      }
      Model.popEnv();
      return result;
    }
    return {
      evaluate: evaluate,
      evaluateVerbose: evaluateVerbose,
    };
  }

  // Exports
  return {
    "evaluate": evaluate,
    "evaluateVerbose": evaluateVerbose,
    "makeEvaluator": makeEvaluator,
  };

})();

