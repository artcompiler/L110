/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2014 Learnosity Ltd. All Rights Reserved.
 *
 */
"use strict";
// This module has no exports. It is executed to define Model.fn plugins.
(function () {
  var messages = Assert.messages;

  // Add messages here.
  Assert.reserveCodeRange(2000, 2999, "mathmodel");
  messages[2001] = "Factoring of multi-variate polynomials with all terms of degree greater than one is not supported";
  messages[2002] = "[unused]"
  messages[2003] = "Factoring non-polynomials is not supported.";
  messages[2004] = "Compound units not supported.";
  messages[2005] = "Expressions with variables cannot be compared with equivValue.";
  messages[2006] = "More that two equals symbols in equation.";
  messages[2007] = "Tolerances are not supported in lists.";
  messages[2008] = "deprecated";
  messages[2009] = "Units must be specified on none or both values for equivValue.";
  messages[2010] = "Invalid option name %1.";
  messages[2011] = "Invalid option value %2 for option %1.";
  messages[2012] = "Expressions with comparison or equality operators cannot be compared with equivValue.";
  messages[2013] = "Invalid matrix multiplication.";
  messages[2014] = "Invalid syntax.";
  messages[2015] = "Invalid format name '%1'.";

  var bigOne = new BigDecimal("1");
  var bigZero = new BigDecimal("0");
  var bigMinusOne = new BigDecimal("-1");
  var nodeOne = numberNode("1");
  var nodeMinusOne = numberNode("-1");
  var nodeZero = numberNode("0");

  function hashCode(str) {
    var hash = 0, i, chr, len;
    if (str.length == 0) return hash;
    for (i = 0, len = str.length; i < len; i++) {
      chr   = str.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  };

  function isChemCore() {
    // Has chem symbols so in chem mode
    return !!Model.env["Au"];
  }

  function newNode(op, args) {
    return {
      op: op,
      args: args
    };
  }

  function binaryNode(op, args, flatten) {
    if (args.length < 2) {
      return args[0];
    }
    var aa = [];
    forEach(args, function(n) {
      if (flatten && n.op === op) {
        aa = aa.concat(n.args);
      } else {
        aa.push(n);
      }
    });
    return newNode(op, aa);
  }

  function numberNode(val, doScale, roundOnly) {
    // doScale - scale n if true
    // roundOnly - only scale if rounding
    if (doScale) {
      var n = toDecimal(val.toString());
      var scale = option("decimalPlaces")
      if (n !== null && (!roundOnly || n.scale() > scale)) {
        n = n.setScale(scale, BigDecimal.ROUND_HALF_UP);
      } else {
        n = val;
      }
    } else {
      n = val;
    }
    return newNode(Model.NUM, [n.toString()]);
  }

  function multiplyNode(args, flatten) {
    return binaryNode(Model.MUL, args, flatten);
  }

  function fractionNode(n, d) {
    return binaryNode(Model.MUL, [n, binaryNode(Model.POW, [d, nodeMinusOne])]);
  }

  function unaryNode(op, args) {
    assert(args.length === 1, "Wrong number of arguments for unary node");
    if (op === Model.ADD) {
      return args[0];
    } else {
      return newNode(op, args);
    }
  }

  function variableNode(name) {
    assert(typeof name === "string");
    return newNode(Model.VAR, [name]);
  }

  function isInfinity(n) {
    if (n.op === Model.NUM && n.args[0] === "Infinity") {
      return true;
    }
    return false;
  }

  function isZero(n) {
    if (n === null) {
      return false;
    } else if (n instanceof BigDecimal) {
      return !bigZero.compareTo(n);
    } else if (typeof n === "number") {
      return n === 0;
    } else if (n.op === Model.NUM) {
      return !bigZero.compareTo(mathValue(n));
    } else {
      return false;
    }
  }

  function isOne(n) {
    if (n === null) {
      return false;
    } else if (n instanceof BigDecimal) {
      return !bigOne.compareTo(n);
    } else if (typeof n === "number") {
      return n === 1;
    } else if (n.op === Model.NUM) {
      return !bigOne.compareTo(mathValue(n));
    } else {
      return false;
    }
  }

  function isMinusOne(n) {
    if (n === null) {
      return false;
    } else if (n instanceof BigDecimal) {
      return !bigMinusOne.compareTo(n);
    } else if (typeof n === "number") {
      return n === -1;
    } else if (n.op !== undefined) {
      return !bigMinusOne.compareTo(mathValue(n));
    }
    assert(false, "Internal error: unable to compare with zero.");
  }

  function toNumber(n) {
    var str;
    if (n === null) {
      return Number.NaN;
    } else if (typeof n === "number") {
      return n;
    } else if (n instanceof BigDecimal) {
      str = n.toString();
    } else if (n.op === Model.NUM) {
      str = n.args[0];
    } else {
      return Number.NaN;
    }
    return parseFloat(str);
  }

  function toDecimal(val) {
    var str;
    if (val === null ||
        isNaN(val) ||
        typeof val === "string" && val.indexOf("Infinity") >= 0) {
      return null;
    } else if (val instanceof BigDecimal) {
      return val;
    } else if (val.op === Model.NUM) {
      str = val.args[0];
    } else {
      str = val.toString();
    }
    return new BigDecimal(str);
  }

  function logBase(b, v) {
    return new BigDecimal(String(Math.log(toNumber(v)) / Math.log(toNumber(b))));
  }

  function factorial(n) {
    // n : Number
    var rval=1;
    for (var i = 2; i <= n; i++)
      rval = rval * i;
    return rval;
  }

  var varMap = {};
  var varNames = [];
  function reset() {
    varMap = {};
    varNames = [];
  }

  // The outer Visitor function provides a global scope for all visitors,
  // as well as dispatching to methods within a visitor.
  function Visitor() {
    var normalNumber = numberNode("298230487121230434902874");
    normalNumber.is_normal = true;
    function visit(node, visit) {
      assert(node.op && node.args, "Visitor.visit() op=" + node.op + " args = " + node.args);
      switch (node.op) {
      case Model.NUM:
        node = visit.numeric(node);
        break;
      case Model.ADD:
      case Model.SUB:
      case Model.PM:
        if (node.args.length === 1) {
          node = visit.unary(node);
        } else {
          node = visit.additive(node);
        }
        break;
      case Model.MUL:
      case Model.DIV:
      case Model.FRAC:
        node = visit.multiplicative(node);
        break;
      case Model.POW:
      case Model.LOG:
        node = visit.exponential(node);
        break;
      case Model.VAR:
      case Model.SUBSCRIPT:
        node = visit.variable(node);
        break;
      case Model.SQRT:
      case Model.SIN:
      case Model.COS:
      case Model.TAN:
      case Model.ARCSIN:
      case Model.ARCCOS:
      case Model.ARCTAN:
      case Model.SEC:
      case Model.CSC:
      case Model.COT:
      case Model.PERCENT:
      case Model.M:
      case Model.ABS:
      case Model.FACT:
      case Model.FORALL:
      case Model.EXISTS:
      case Model.IN:
      case Model.SUM:
      case Model.LIM:
      case Model.EXP:
      case Model.TO:
      case Model.INT:
      case Model.PROD:
        node = visit.unary(node);
        break;
      case Model.COMMA:
      case Model.MATRIX:
      case Model.VEC:
      case Model.ROW:
      case Model.COL:
      case Model.INTERVAL:
      case Model.LIST:
        node = visit.comma(node);
        break;
      case Model.EQL:
      case Model.LT:
      case Model.LE:
      case Model.GT:
      case Model.GE:
      case Model.COLON:
      case Model.RIGHTARROW:
        node = visit.equals(node);
        break;
      case Model.FORMAT:
        // Only supported by normalizeSyntax
        node = visit.format(node);
        break;
      default:
        assert(false, "Should not get here. Unhandled node operator " + node.op);
        break;
      }
      Assert.checkCounter();
      return node;
    }

    // Compute the degree (Number value) of the right most term of an equation.
    // If name is provided then return the degree of the part with that variable
    // name.
    function degree(root, notAbsolute) {
      if (!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return 0;
      }
      return visit(root, {
        name: "degree",
        exponential: function (node) {
          var args = node.args;
          var d;
          if (node.op === Model.POW) {
            var expo = mathValue(args[1]);
            if (expo) {
              if (notAbsolute) {
                // Return the raw degree, not the absolute value of the degree
                d = degree(args[0], notAbsolute) * toNumber(expo);
              } else {
                d = degree(args[0], notAbsolute) * Math.abs(toNumber(expo));
              }
            } else {
              d = Number.POSITIVE_INFINITY;   // degree of variable power
            }
          } else if (node.op === Model.LOG) {
            // In, ln x, the degree is known so we call it infinity
            d = Number.POSITIVE_INFINITY;
          }
          return d;
        },
        multiplicative: function (node) {
          var args = node.args;
          var d = 0;
          forEach(args, function (n) {
            d += degree(n, notAbsolute);
          });
          return d;
        },
        additive: function (node) {
          // Return the degree of the highest degree term.
          var args = node.args;
          var d = 0;
          var t;
          forEach(args, function (n) {
            t = degree(n, notAbsolute);
            if (t > d) {
              d = t;
            }
          });
          return d;
        },
        numeric: function(node) {
          return 0;
        },
        unary: function(node) {
          var args = node.args;
          var d = degree(args[0], notAbsolute);
          switch (node.op) {
          case Model.ADD:
          case Model.SUB:
          case Model.COS:
          case Model.SIN:
          case Model.TAN:
          case Model.ARCSIN:
          case Model.ARCCOS:
          case Model.ARCTAN:
          case Model.SEC:
          case Model.CSC:
          case Model.COT:
          case Model.PM:
          case Model.PERCENT:
          case Model.M:
          case Model.ABS:
            return d;
          case Model.SQRT:
            assert(args.length === 1, message(2003));
            return d / 2;
          case Model.FACT:
            return d;
          default:
            assert(false, "Should not get here. Unhandled case.");
            return 0;
          }
        },
        variable: function(node) {
          if (!name || node.args[0] === name) {
            return 1;
          }
          return 0;
        },
        comma: function(node) {
          var args = node.args;
          var dd = [];
          forEach(args, function (n) {
            dd = dd.concat(degree(n, notAbsolute));
          });
          return dd;
        },
        equals: function(node) {
          // Return the degree of the highest degree term.
          var args = node.args;
          var d = 0;
          var t;
          forEach(args, function (n) {
            t = degree(n, notAbsolute);
            if (t > d) {
              d = t;
            }
          });
          return d;
        },
      });
    }

    // Compute the coefficient of an expression. The result of 'coeff' and
    // 'variablePart' are complements. Their product are equivSymbolic with
    // the original expression.
    function coeff(root) {
      if (!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return nodeZero;
      }
      return visit(root, {
        name: "coeff",
        exponential: function (node) {
          var base = mathValue(node.args[0]);
          var expo = mathValue(node.args[1]);
          if (base !== null && expo !== 0 && expo !== null) {
            return node;
          } else {
            return nodeOne;
          }
        },
        multiplicative: function (node) {
          var args = node.args;
          var val = bigOne;
          var ff = [];
          forEach(args, function (n) {
            var d = degree(n);
            var mv = mathValue(n);
            if (mv !== null) {
              if (isOne(mv)) {
                // got variable or one, skip it
              } else if (isZero(mv)) {
                ff.push(nodeZero);
              } else {
                ff.push(n);
              }
            } // otherwise skip it
          });
          if (ff.length === 0) {
            return nodeOne;
          } else if (ff.length === 1) {
            return ff[0];
          }
          return multiplyNode(ff);
        },
        additive: function (node) {
          var mv = mathValue(node);
          if (mv !== null) {
            node = numberNode(mv);
          } else {
            node = nodeOne;
          }
          return node;
        },
        unary: function(node) {
          // If it's a constant, it's a coefficient. Otherwise, it's not.
          var mv = mathValue(node.args[0]);
          if (mv !== null) {
            mv = mathValue(node);
            if (mv !== null) {
              node = numberNode(mv);
            } else {
              node = null;
            }
          } else {
            node = nodeOne;
          }
          return node;
        },
        numeric: function(node) {
          return node;
        },
        variable: function(node) {
          return nodeOne;
        },
        comma: function(node) {
          return null;
        },
        equals: function(node) {
          return null;
        },
      });
    }

    // Compute the unique variables of an expression.
    function variables(root) {
      if (!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return 0;
      }
      return visit(root, {
        name: "variables",
        exponential: function (node) {
          var args = node.args;
          var val = [];
          forEach(args, function (n) {
            var vars = variables(n);
            forEach(vars, function (v) {
              if (indexOf(val, v) < 0) {
                val.push(v);
              }
            });
          });
          return val;
        },
        multiplicative: function (node) {
          var args = node.args;
          var val = [];
          forEach(args, function (n) {
            var vars = variables(n);
            forEach(vars, function (v) {
              if (indexOf(val, v) < 0) {
                val.push(v);
              }
            });
          });
          return val;
        },
        additive: function (node) {
          var args = node.args;
          var val = [];
          forEach(args, function (n) {
            var vars = variables(n);
            forEach(vars, function (v) {
              if (indexOf(val, v) < 0) {
                val.push(v);
              }
            });
          });
          return val;
        },
        unary: function(node) {
          return variables(node.args[0]);
        },
        numeric: function(node) {
          return [];
        },
        variable: function(node) {
          return [node.args[0]];
        },
        comma: function(node) {
          var args = node.args;
          var val = [];
          // FIXME should this be a list of strings or a list of arrays of
          // strings?
          forEach(args, function (n) {
            val = val.concat(variables(n));
          });
          return val;
        },
        equals: function(node) {
          var args = node.args;
          var val = [];
          forEach(args, function (n) {
            val = val.concat(variables(n));
          });
          return val;
        },
      });
    }

    // Compute the variable part of the expression. The result of 'coeff' and
    // 'variablePart' are complements. Their product are equivSymbolic with the
    // original expression.
    function variablePart(root) {
      if (!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return null;
      }
      return visit(root, {
        name: "variablePart",
        exponential: function (node) {
          if (degree(node) !== 0) {
            return node;
          }
          return null;
        },
        multiplicative: function (node) {
          // 3x^2y^3
          var args = node.args;
          var vals = [];
          forEach(args, function (n) {
            var v = variablePart(n);
            if (v !== null) {
              vals.push(v);
            }
          });
          if (vals.length === 0) {
            return null;
          } else if (vals.length === 1) {
            return vals[0];
          }
          return multiplyNode(vals);
        },
        additive: function (node) {
          // (x + 2)(x - 1)
          if (mathValue(node) !== null) {
            return null;
          }
          return node;
        },
        unary: function(node) {
          var vp = variablePart(node.args[0]);
          if (vp !== null) {
            return node;
          }
          return null;
        },
        numeric: function(node) {
          return null;
        },
        variable: function(node) {
          if (Model.env[node.args[0]]) {
            // A unit or other keyword, so not a variable.
            return null;
          }
          return node;
        },
        comma: function(node) {
          return null;
        },
        equals: function(node) {
          return null;
        },
      });
    }

    // Get the terms of an expression
    function terms(root) {
      if (!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return 0;
      }
      return visit(root, {
        name: "terms",
        exponential: function (node) {
          return [node];
        },
        multiplicative: function (node) {
          return [node];
        },
        additive: function (node) {
          var vals = [];
          forEach(node.args, function (n) {
            vals = vals.concat(terms(n));
          });
          return vals;
        },
        unary: function(node) {
          return [node];
        },
        numeric: function(node) {
          return [node];
        },
        variable: function(node) {
          return [node];
        },
        comma: function(node) {
          var vals = [];
          forEach(node.args, function (n) {
            vals = vals.concat(terms(n));
          });
          return vals;
        },
        equals: function(node) {
          var vals = [];
          forEach(node.args, function (n) {
            vals = vals.concat(terms(n));
          });
          return vals;
        },
      });
    }

    function normalizeFormatObject(fmt) {
      // Normalize the fmt object to an array of objects
      var list = [];
      switch (fmt.op) {
      case Model.STR:
        list.push({
          code: fmt.args[0],
        });
        break;
      case Model.MUL:
        var code = "";
        var length = undefined;  // undefined and zero have different meanings.
        forEach(fmt.args, function (f) {
          if (f.op === Model.VAR) {
            code += f.args[0];
          } else if (f.op === Model.NUM) {
            length = +f.args[0];
          }
        });
        list.push({
          code: code,
          length: length,
        });
        break;
      case Model.COMMA:
        forEach(fmt.args, function (f) {
          list = list.concat(normalizeFormatObject(f));
        });
        break;
      }
      return list;
    }

    function checkNumberFormat(fmt, node) {
      var fmtList = normalizeFormatObject(fmt);
      return some(fmtList, function (f) {
        var code = f.code;
        var length = f.length;
        switch (code) {
        case "integer":
          if (node.numberFormat === "integer") {
            if (length === undefined || length === node.args[0].length) {
              // If there is no size or if the size matches the value...
              return true;
            }
          }
          break;
        case "decimal":
          if (node.numberFormat === "decimal") {
            if (length === undefined ||
                length === 0 && node.args[0].indexOf(".") === -1 ||
                length === node.args[0].substring(node.args[0].indexOf(".") + 1).length) {
              // If there is no size or if the size matches the value...
              return true;
            }
          }
          break;
        case "number":
          if (node.numberFormat === "integer" ||
              node.numberFormat === "decimal") {
            if (length === undefined ||
                length === 0 && node.args[0].indexOf(".") === -1 ||
                length === node.args[0].substring(node.args[0].indexOf(".") + 1).length) {
              // If there is no size or if the size matches the value...
              return true;
            }
          }
          break;
        case "scientific":
          if (node.isScientific) {
            var coeff = node.args[0].args[0];
            if (length === undefined ||
                length === 0 && coeff.indexOf(".") === -1 ||
                length === coeff.substring(coeff.indexOf(".") + 1).length) {
              // If there is no size or if the size matches the value...
              return true;
            }
          }
          break;
        case "fraction":
          if (node.isFraction) {
            return true;
          }
          break;
        case "mixedFraction":
          if (node.isMixedFraction) {
            return true;
          }
          break;
        case "fractionOrDecimal":
          if (node.isFraction ||
              node.isMixedFraction ||
              node.numberFormat === "decimal") {
            return true;
          }
          break;
        default:
          assert(false, message(2015, [code]));
          break;
        }
      });
    }

    function checkVariableFormat(fmt, id) {
      var fmtList = normalizeFormatObject(fmt);
      assert(fmtList.length === 1);
      var code = fmtList[0].code;
      var length = fmtList[0].length; // Possibly undefined.
      var name;
      switch (code) {
      case "variable":
        if (length === undefined) {
          // If length is undefined, then accept any variable.
          name = "_";
        } else if (!(name = varMap[id])) {
          // If not in the map then add it.
          // But only if the synthetic name is not already taken.
          if (indexOf(varNames, "_" + length) < 0) {
            varMap[id] = name = "_" + length;
            varNames.push(name);
          } else {
            name = id; // No match, so use the original name.
          }
        }
        break;
      case "integer":
      case "decimal":
      case "number":
      case "scientific":
      case "fraction":
      case "mixedFraction":
      case "fractionOrDecimal":
        name = id;  // Do nothing.
        break;
      default:
        assert(false, message(2015, [code]));
        break;
      }
      return name;
    }

    function normalizeSyntax(root, ref) {
      var options = Model.options ? Model.options : {};
      if (!ref || !ref.args) {
        // If not ref, then the structure of nodes is different, so just return original root.
        ref = {args:[]};
      }
      if (!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return 0;
      }
      var nid = Ast.intern(root);
      var node = Model.create(visit(root, {
        name: "normalizeSyntax",
        format: function(node) {
          var fmtList = normalizeFormatObject(node.args[0]);
          if (fmtList[0].code === "variable") {
            var id;
            if (fmtList[0].length === undefined) {
              id = "_";
            } else {
              id = "_" + fmtList[0].length;
            }
            return variableNode(id);
          }
          return normalNumber;
        },
        numeric: function (node) {
          if (ref && ref.op === Model.FORMAT &&
              checkNumberFormat(ref.args[0], node)) {
            return normalNumber;
          }
          return node;
        },
        additive: function (node) {
          var args = [];
          if (ref && ref.op === Model.FORMAT &&
              checkNumberFormat(ref.args[0], node)) {
            return normalNumber;
          }
          forEach(node.args, function (n, i) {
            n = normalizeSyntax(n, ref.args[i]);
            args.push(n);
          });
          return binaryNode(Model.ADD, args);
        },
        multiplicative: function(node) {
          var args = [];
          if (ref && ref.op === Model.FORMAT &&
              checkNumberFormat(ref.args[0], node)) {
            return normalNumber;
          }
          if (option("requireScientific") && !node.isScientific) {
            return node;
          }
          var allow_integer = options.allow_integer;
          forEach(node.args, function (n, i) {
            n = normalizeSyntax(n, ref.args[i]);
            args.push(n);
          });
          return binaryNode(Model.MUL, args);
        },
        unary: function(node) {
          var arg0 = normalizeSyntax(node.args[0], ref.args[0]);
          switch (node.op) {
          case Model.PERCENT:
            if (option("allowPercent")) {
              node = normalNumber;  // Percent compares to any number forms
            } else {
              node = unaryNode(node.op, [arg0]);  // Percent compares only to other percent forms
            }
            break;
          case Model.SUB:
            // Convert SUBs to ADDs
            // Avoid nested MULs
            if (arg0.op === Model.MUL) {
              arg0.args.push(nodeMinusOne);
              node = arg0;
            } else {
              node = multiplyNode([arg0, nodeMinusOne]);
            }
            break;
          default:
            node = unaryNode(node.op, [arg0]);
            break;
          }
          return node;
        },
        variable: function(node) {
          var id = node.args[0];
          var name;
          if (ref && ref.op === Model.FORMAT) {
            name = checkVariableFormat(ref.args[0], id);
          } else {
            name = id;
          }
          return variableNode(name);
        },
        exponential: function(node) {
          var args = [];
          forEach(node.args, function (n, i) {
            n = normalizeSyntax(n, ref.args[i]);
            args.push(n);
          });
          return binaryNode(node.op, args);
        },
        comma: function(node) {
          var vals = [];
          forEach(node.args, function (n, i) {
            vals = vals.concat(normalizeSyntax(n, ref.args[i]));
          });
          var node = newNode(node.op, vals);
          return node;
        },
        equals: function(node) {
          var args = [];
          forEach(node.args, function (n, i) {
            n = normalizeSyntax(n, ref.args[i]);
            args.push(n);
          });
          return binaryNode(node.op, args);
        },
      }), root.location);
      return node;
    }

    // normalize() replaces subtraction with addition and division with
    // multiplication. It does not perform expansion or simplification so that
    // the basic structure of the expression is preserved. Also, flattens binary
    // trees into N-ary nodes.
    function normalize(root) {
      if (!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return 0;
      }
      var nid = Ast.intern(root);
      var node = Model.create(visit(root, {
        name: "normalize",
        numeric: function (node) {
          var arg0 = +node.args[0];
          if (arg0 < 0 && arg0 !== -1) {
            node = multiplyNode([nodeMinusOne, numberNode(Math.abs(arg0.toString()))]);
          }
          return node;
        },
        additive: function (node) {
          assert(node.op !== Model.SUB, "Subtraction should be eliminated during parsing");
          if (node.op === Model.PM) {
            assert(node.args.length === 2, "Operator \pm can only be used on binary nodes");
            node = binaryNode(Model.ADD, [
              node.args[0],
              unaryNode(Model.PM, [node.args[1]])
            ]);
          }
          var args = [];
          node = flattenNestedNodes(node);
          return sort(node);
        },
        multiplicative: function(node) {
          assert(node.op !== Model.DIV, "Divsion should be eliminated during parsing");
          if (node.op === Model.FRAC) {
            node = newNode(Model.MUL, [node.args[0], newNode(Model.POW, [node.args[1], nodeMinusOne])]);
          }
          var args = [];
          // Flatten nested multiplication.
          // FIXME can't use flattenNestedNode because of slight differences
          forEach(node.args, function (n) {
            n = normalize(n);
            if (Ast.intern(n) === Ast.intern(nodeOne)) {
              // If number node one, then erase it. Can't use mathValue here,
              // because it simplifies constant expressions.
              return;
            }
            if (args.length > 0 &&
                Ast.intern(n) === Ast.intern(nodeMinusOne) &&
                Ast.intern(args[args.length-1]) === Ast.intern(nodeMinusOne)) {
              // Double negative, so erase both.
              args.pop();
              return;
            }
            if (n.op === Model.MUL) {
              // Flatten
              args = args.concat(n.args);
            } else {
              args.push(n);
            }
          });
          if (args.length === 0) {
            node = nodeOne;
          } else if (args.length === 1) {
            node = args[0];
          } else {
            node = sort(binaryNode(node.op, args));
          }
          return node;
        },
        unary: function(node) {
          var arg0 = normalize(node.args[0]);
          switch (node.op) {
          case Model.SUB:
            // Convert SUBs to ADDs
            // Avoid nested MULs
            switch (arg0.op) {
            case Model.MUL:
              arg0.args.push(nodeMinusOne);
              node = arg0;
              break;
            default:
              node = multiplyNode([arg0, nodeMinusOne]);
              break;
            }
            break;
          case Model.PERCENT:
            node = multiplyNode([
              binaryNode(Model.POW, [
                numberNode("100"),
                nodeMinusOne
              ]), arg0]);
            break;
          default:
            node = unaryNode(node.op, [arg0]);
            break;
          }
          return node;
        },
        variable: function(node) {
          if (option("allowDecimal") && node.args[0] === "\\pi") {
            node = numberNode(Math.PI);
          }
          return node;
        },
        exponential: function(node) {
          var args = [];
          forEach(node.args, function (n) {
            n = normalize(n);
            args.push(n);
          });
          return binaryNode(node.op, args);
        },
        comma: function(node) {
          var vals = [];
          forEach(node.args, function (n) {
            vals = vals.concat(normalize(n));
          });
          var node = newNode(node.op, vals);
          return node;
        },
        equals: function(node) {
          assert(node.args.length === 2, message(2006));
          var args = [];
          forEach(node.args, function (n) {
            n = normalize(n);
            args.push(n);
          });
          node = binaryNode(node.op, args);
          if (node.op === Model.GT || node.op === Model.GE) {
            // Normalize inequalities to LT and LE
            node.op = node.op === Model.GT ? Model.LT : Model.LE;
            var t = node.args[0];
            node.args[0] = node.args[1];
            node.args[1] = t;
          }
          node = sort(node);   // sort so that the lnodes after reconstruction compare
          // If the rhs is not already normalized to 0, then normalize it now.
          if (node.op !== Model.COLON && !isZero(mathValue(node.args[1]))) {
            // a=b -> a-b=0
            node = binaryNode(node.op, [
              binaryNode(Model.ADD, [
                node.args[0],
                multiplyNode([nodeMinusOne, node.args[1]], true) // flatten
              ], true),
              nodeZero,
            ]);
          } else if (!isZero(mathValue(node.args[1])) && !isOne(mathValue(node.args[1]))) {
            node = binaryNode(node.op, [
              multiplyNode([
                node.args[0],
                binaryNode(Model.POW, [node.args[1], nodeMinusOne], true)
              ]),
              nodeOne,
            ]);
          }
          if (node.op === Model.COLON) {
            // RHS is now 1 the ratio is expressed by the LHS.
            node = node.args[0];
          }
          return node;
        },
      }), root.location);
      // If the node has changed, simplify again
      while (nid !== Ast.intern(node)) {
        nid = Ast.intern(node);
        node = normalize(node);
      }
      return node;
    }

    function sort(root) {
      if (!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return 0;
      }
      var nid = Ast.intern(root);
      var node = visit(root, {
        name: "sort",
        numeric: function (node) {
          return node;
        },
        additive: function (node) {
          // Sort by descending degree
          var args = [];
          forEach(node.args, function (n, i) {
            args.push(sort(n));
          });
          node = binaryNode(node.op, args);
          if (node.op === Model.PM) {
            return node;
          }
          var d0, d1;
          var n0, n1;
          var v0, v1;
          for (var i = 0; i < node.args.length - 1; i++) {
            n0 = node.args[i];
            n1 = node.args[i + 1];
            d0 = degree(node.args[i]);
            d1 = degree(node.args[i + 1]);
            if (d0 < d1) {
              // Swap adjacent elements
              node.args[i] = n1;
              node.args[i + 1] = n0;
            } else if (d0 === d1) {
              v0 = variables(n0);
              v1 = variables(n1);
              if (v0.length !== v1.length) {
                if (v0.length < v1.length) {
                  // Swap
                  node.args[i] = n1;
                  node.args[i + 1] = n0;
                }
              } else if (v0.length > 0) {
                if (v0.join("") !== v1.join("")) {
                  if (v0.join("") < v1.join("")) {     // merge variable names
                    node.args[i] = n1;
                    node.args[i + 1] = n0;
                  }
                } else if (isLessThan(coeff(n0), coeff(n1))) {
                  node.args[i] = n1;
                  node.args[i + 1] = n0;
                }
              } else if (d0 === 0) {
                if (exponent(n0) !== exponent(n1)) {
                  if (exponent(n0) < exponent(n1)) {
                    node.args[i] = n1;
                    node.args[i + 1] = n0;
                  }
                } else if (isLessThan(coeff(n0), coeff(n1))) {
                  node.args[i] = n1;
                  node.args[i + 1] = n0;
                }
              }
            }
          }
          return node;
        },
        multiplicative: function (node) {
          // Sort by ascending degree
          var args = [];
          forEach(node.args, function (n, i) {
            args.push(sort(n));
          });
          node = binaryNode(node.op, args);
          var d0, d1;
          var n0, n1;
          var v0, v1;
          for (var i = 0; i < node.args.length - 1; i++) {
            n0 = node.args[i];
            n1 = node.args[i + 1];
            d0 = Math.abs(degree(n0));
            d1 = Math.abs(degree(n1));
            if (d0 > d1) {
              // Swap adjacent elements
              node.args[i] = n1;
              node.args[i + 1] = n0;
            } else if (d0 === d1) {
              v0 = variables(n0);
              v1 = variables(n1);
              var e0 = exponent(n0);
              var e1 = exponent(n1);
              if (e0 !== e1 && !isNaN(e0) && !isNaN(e1)) {
                if (e0 < e1) {
                  // Swap adjacent elements
                  node.args[i] = n1;
                  node.args[i + 1] = n0;
                }
              } else if(v0.length !== v1.length) {
                if (v0.length < v1.length) {
                  node.args[i] = n1;
                  node.args[i + 1] = n0;
                }
              } else if (n0.op !== n1.op) {
                if (hashCode(n0.op) < hashCode(n1.op)) {
                  node.args[i] = n1;
                  node.args[i + 1] = n0;
                }
              } else if(v0.length === v1.length && v0.length > 0) {
                if (v0[0] < v1[0]) {
                  // Swap adjacent elements
                  node.args[i] = n1;
                  node.args[i + 1] = n0;
                }
              } else if (isLessThan(coeff(n0), coeff(n1))) {
                // Keep last
                node.args[i] = n1;
                node.args[i + 1] = n0;
              }
            }
          }
          return node;
        },
        unary: function(node) {
          return unaryNode(node.op, [sort(node.args[0])]);
        },
        exponential: function (node) {
          var args = [];
          forEach(node.args, function (n, i) {
            args.push(sort(n));
          });
          node = binaryNode(node.op, args);
          return node;
        },
        variable: function(node) {
          return node;
        },
        comma: function(node) {
          var args = [];
          forEach(node.args, function (n) {
            args.push(sort(n));
          });
          switch (node.op) {
          case Model.COMMA:
            // If its a bare comma expression then sort.
            args.sort(function (a, b) {
              a = JSON.stringify(a);
              b = JSON.stringify(b);
              if (a < b) {
                return -1;
              }
              if (a > b) {
                return 1;
              }
              return 0;
            });
            break;
          default:
            break;
          }
          return newNode(node.op, args);
        },
        equals: function(node) {
          forEach(node.args, function (n, i) {
            node.args[i] = sort(n);
          });
          if (node.op === Model.COLON) {
            // If ratio, then don't sort toplevel terms.
            return node;
          }
          // Sort by descending degree
          var d0, d1;
          var n0, n1;
          var v0, v1;
          for (var i = 0; i < node.args.length - 1; i++) {
            n0 = node.args[i];
            n1 = node.args[i + 1];
            if ((d0 = degree(node.args[i], true)) < (d1 = degree(node.args[i + 1], true))) {
              // Swap adjacent elements
              node.args[i] = n1;
              node.args[i + 1] = n0;
              node.op =
                node.op === Model.GT ? Model.LT :
                node.op === Model.GE ? Model.LE :
                node.op === Model.LT ? Model.GT :
                node.op === Model.LE ? Model.GE : node.op;
            } else if (d0 === d1) {
              v0 = variables(n0);
              v1 = variables(n1);
              if (v0.length !== v1.length  && v0.length < v1.length ||
                  v0.length > 0 && v0[0] < v1[0]) {
                // Swap adjacent elements
                var t = node.args[i];
                node.args[i] = n1;
                node.args[i + 1] = n0;
                node.op =
                  node.op === Model.GT ? Model.LT :
                  node.op === Model.GE ? Model.LE :
                  node.op === Model.LT ? Model.GT :
                  node.op === Model.LE ? Model.GE : node.op;
              } else if (!isZero(n1) && isLessThan(mathValue(n0), mathValue(n1))) {
                // Unless the RHS is zero, swap adjacent elements
                var t = node.args[i];
                node.args[i] = n1;
                node.args[i + 1] = n0;
                node.op =
                  node.op === Model.GT ? Model.LT :
                  node.op === Model.GE ? Model.LE :
                  node.op === Model.LT ? Model.GT :
                  node.op === Model.LE ? Model.GE : node.op;
              }
            }
          }
          return node;
        },
      });
      // If the node has changed, sort again
      while (nid !== Ast.intern(node)) {
        nid = Ast.intern(node);
        node = sort(node);
      }
      return node;
    }

    function normalizeLiteral(root) {
      if (!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return 0;
      }
      var nid = Ast.intern(root);
      var node = visit(root, {
        name: "normalizeLiteral",
        numeric: function (node) {
          return node;
        },
        additive: function (node) {
          var args = [];
          forEach(node.args, function (n) {
            args.push(normalizeLiteral(n));
          });
          node.args = args;
          return node;
        },
        multiplicative: function (node) {
          var equivLiteralDivAndFrac = false;
          var args = [];
          forEach(node.args, function (n) {
            args.push(normalizeLiteral(n));
          });
          if (equivLiteralDivAndFrac && node.op === Model.FRAC) {
            return newNode(Model.MUL, [args[0], newNode(Model.POW, [args[1], nodeMinusOne])]);
          }
          node.args = args;
          return node;
        },
        unary: function(node) {
          var args = [];
          forEach(node.args, function (n) {
            args.push(normalizeLiteral(n));
          });
          node.args = args;
          return node;
        },
        exponential: function (node) {
          var args = [];
          forEach(node.args, function (n) {
            args.push(normalizeLiteral(n));
          });
          node.args = args;
          return node;
        },
        variable: function(node) {
          return node;
        },
        comma: function(node) {
          var args = [];
          forEach(node.args, function (n) {
            args.push(normalizeLiteral(n));
          });
          node.args = args;
          return node;
        },
        equals: function(node) {
          var args = [];
          forEach(node.args, function (n) {
            args.push(normalizeLiteral(n));
          });
          node.args = args;
          return node;
        },
      });
      // If the node has changed, normalizeLiteral again
      while (nid !== Ast.intern(node)) {
        nid = Ast.intern(node);
        node = normalizeLiteral(node);
      }
      return node;
    }

    function leadingCoeff(node) {
      var tt, c;
      switch (node.op) {
      case Model.ADD:
        tt = terms(node);
        c = coeff(tt[0]);
        break;
      default:
        c = coeff(node);
        break;
      }
      return c;
    }

    function isAggregate(node) {
      return node.op === Model.COMMA ||
        node.op === Model.LIST ||
        node.op === Model.MATRIX ||
        node.op === Model.INTERVAL;
    }

    function isAdditive(node) {
      return node.op === Model.ADD || node.op === Model.SUB || node.op === Model.PM;
    }

    function isMultiplicative(node) {
      return node.op === Model.MUL || node.op === Model.DIV;
    }

    function isInteger(bd) {
      if (bd === null) {
        return false;
      }
      return bd.remainder(bigOne).compareTo(bigZero) === 0;
    }

    function isDecimal(node) {
      var mv;
      if (node.op === Model.NUM &&
          (mv = mathValue(node)) !== null &&
          !isInteger(mv)) {
        return true;
      } else if (node instanceof BigDecimal &&
                 !isInteger(node)) {
        return true;
      }
      return false;
    }

    function isLessThan(n1, n2) {
      if (n1 && n1.op !== undefined) {
        n1 = mathValue(n1);
      }
      if (n2 && n2.op !== undefined) {
        n2 = mathValue(n2);
      }
      if (n1 === null || !(n1 instanceof BigDecimal) ||
          n2 === null || !(n1 instanceof BigDecimal)) {
        return false;
      }
      return n1.compareTo(n2) < 0;
    }

    function isNeg(n) {
      if (n === null) {
        return false;
      }
      var bd;
      if (n.op === Model.NUM) {
        bd = mathValue(n);
      } else {
        bd = n;
      }
      return bd.compareTo(bigZero) < 0;
    }

    function isPos(bd) {
      return bd.compareTo(bigZero) > 0;
    }

    function pow(b, e) {
      var val;
      if (b === null || e === null) {
        return null;
      }
      if (b instanceof BigDecimal) {
        if (isInteger(e)) {
          val = b.pow(e.abs());
          if (isNeg(e)) {
            val = divide(bigOne, val);
          }
          return val;
        } else {
          b = toNumber(b);
          e = toNumber(e);
          val = Math.pow(b, e);
          if (isNaN(val)) {
            return null;
          }
          return toDecimal(val);
        }
      } else {
        return toDecimal(Math.pow(b, e));
      }
    }

    function sqrtNode(node) {
      return binaryNode(Model.POW, [
        n, numberNode("2"), nodeMinusOne
      ]);
    }

    function divide(n, d) {
      if (n === null || d === null) {
        return null;
      }
      if (n instanceof BigDecimal) {
        n = toNumber(n);
      }
      if (d instanceof BigDecimal) {
        d = toNumber(d);
      }
      if (d === 0) {
        return null;
      }
      return toDecimal(n / d);
    }

    function sqrt(n) {
      if (n instanceof BigDecimal) {  // assume d is too
        if (n === null) {
          return null;
        }
        n = toNumber(n);
      } else {
        if (isNaN(n)) {
          return null;
        }
      }
      return toDecimal(Math.sqrt(n)).setScale(option("decimalPlaces"), BigDecimal.ROUND_HALF_UP);
    }

    function abs(n) {
      if (n instanceof BigDecimal) {  // assume d is too
        if (n === null) {
          return null;
        }
        n = toNumber(n);
      } else {
        if (isNaN(n)) {
          return null;
        }
      }
      return toDecimal(Math.abs(n));
    }

    function trig(n, op) {
      if (n === null) {
        return null;
      } else if (n instanceof BigDecimal) {  // assume d is too
        n = toNumber(n);
      } else {
        if (isNaN(n)) {
          return null;
        }
      }
      var f;
      switch (op) {
      case Model.SIN:
        f = Math.sin;
        break;
      case Model.COS:
        f = Math.cos;
        break;
      case Model.TAN:
        f = Math.tan;
        break;
      case Model.ARCSIN:
        f = Math.asin;
        break;
      case Model.ARCCOS:
        f = Math.acos;
        break;
      case Model.ARCTAN:
        f = Math.atan;
        break;
      default:
        assert(false);
        break;
      }
      return toDecimal(f(n));
    }

    function flattenNestedNodes(node, doSimplify) {
      var args = [];
      forEach(node.args, function (n) {
        if (doSimplify) {
          n = simplify(n);
        }
        // FIXME why is it necessary to normalize here?
        n = normalize(n);
        if (n.op === node.op) {
          args = args.concat(n.args);
        } else {
          args.push(n);
        }
      });
      return binaryNode(node.op, args);
    }

    function groupLikes(node) {
      var hash = {};
      var vp, vpnid, list;
      forEach(node.args, function (n, i) {
        if (node.op === Model.MUL) {
          // If factors, then likes have same variables.
          vp = variables(n).join("");
        } else {
          // If terms, then likes have the same variable parts.
          vp = variablePart(n);
        }
        if (vp) {
          if (typeof vp === "string") {
            vp = variableNode(vp);
          }
          vpnid = Ast.intern(vp);
        } else {
          vpnid = "none";
        }
        list = hash[vpnid] ? hash[vpnid] : (hash[vpnid] = []);
        list.push(n);
      });
      var args = [];
      forEach(keys(hash), function (k) {
        var aa = hash[k];
        assert(aa);
        if (aa.length > 1) {
          args.push(binaryNode(node.op, aa));
        } else {
          args.push(aa[0]);
        }
      });
      if (args.length > 1) {
        node = binaryNode(node.op, args);
      } else {
        assert(args.length !== 0);
        node = args[0];
      }
      return node;
    }

    // Special case. Check for like factors to avoid isExpanded|Factorised "x*x"
    // to evaluate to true.
    function hasLikeFactors(node) {
      if (node.op !== Model.MUL) {
        return false;
      }
      var hash = {};
      var vp, vpnid, list;
      var result = !every(node.args, function (n, i) {
        // (x+3)(x+3) (xy^2)
        vpnid = Ast.intern(n);
        list = hash[vpnid] ? hash[vpnid] : (hash[vpnid] = []);
        list.push(n);
        // If there are duplicates and those duplicates do not have multiple terms.
        return list.length < 2 || isAdditive(n);
      });
      return result;
    }

    function simplify(root, env) {
      if (!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return 0;
      }
      var nid = Ast.intern(root);
      var node = Model.create(visit(root, {
        name: "simplify",
        numeric: function (node) {
          assert(typeof node.args[0] === "string");
          return node;
        },
        additive: function (node) {
          assert(node.op !== Model.SUB,
                 "simplify() additive node not normalized: " + JSON.stringify(node));
          if (node.op === Model.PM) {
            return node;
          }
          node = flattenNestedNodes(node);
          node = groupLikes(node);
          if (!isAdditive(node)) {
            // Have a new kind of node so start over.
            return node;
          }
          // Simplify kids
          var args = [];
          forEach(node.args, function (n, i) {
            args = args.concat(simplify(n));
          });
          node = newNode(node.op, args);
          // Make denominators common
          if (!option("dontFactorDenominators")) {
            node = commonDenom(node);
          }
          if (!isAdditive(node)) {
            // Have a new kind of node so start over.
            return node;
          }
          // Now fold other terms
          var args = node.args.slice(0);  // make a copy
          var n0 = [simplify(args.shift())];
          // For each next value, pop last value and fold it with next value.
          forEach(args, function (n1, i) {
            n1 = simplify(n1);
            if (!isZero(mathValue(n1))) {
              var t = fold(n0.pop(), n1);
              n0 = n0.concat(t);
            }
          });
          if (n0.length < 2) {
            node = n0[0];
          } else {
            node = binaryNode(node.op, n0);
          }
          assert(node.args.length > 0);
          return node;
          function commonDenom(node) {
            var n0 = node.args;
            if (!isChemCore()) {
              // Make common denominator
              // Get denominators
              var denoms = [];
              forEach(n0, function (n1) {
                denoms = denom(n1, denoms);
              });
              if (denoms.length > 1 || !isOne(denoms[0])) {
                // We have a non-trivial denominator.
                var denominator = binaryNode(Model.POW, [multiplyNode(denoms, true), nodeMinusOne]);
                var n2 = [];
                forEach(n0, function (n1) {
                  var d, n;
                  d = denom(n1, []);
                  n = numer(n1, d, denoms);
                  n2 = n2.concat(n);
                });
                // Now add the numerator and multiply it by the denominator.
                n0 = binaryNode(node.op, n2);
                node = multiplyNode([n0, denominator]);
              } else {
                // Just return the original node.
                node = node;
              }
            }
            return node;
          }
          function numer(n, d, denoms) {
            // Multiply top common denominator. Simplify to cancel factors.
            return simplify(multiplyNode([].concat(n).concat(denoms), true));
          }
          function denom(n, denoms) {
            // If the current node has a different denominator as those in denoms,
            // then add it.
            var ff = factors(n, {}, true, false);
            var hasDenom = false;
            var d0, dd = [];
            forEach(ff, function (n) {
              d0 = n.args[0];
              if (n.op === Model.POW && isNeg(mathValue(n.args[1]))) {
                dd.push(d0);
              }
            });
            if (dd.length === 0) {
              // If no denominator, then add 1 if not already there.
              d0 = nodeOne;
            } else {
              d0 = multiplyNode(dd);
            }
            // Add to denoms if not already there.
            if (every(denoms, function (d) {
              return Ast.intern(d) !== Ast.intern(d0);
            })) {
              denoms.push(d0);
            }
            return denoms;
          }
          function unfold(lnode, rnode) {
            var ldeg = degree(lnode);
            var rdeg = degree(rnode);
            if (isZero(ldeg) && isZero(rdeg)) {
              var lfact = factors(lnode, null, false, true);
              var rfact = factors(rnode, null, false, true);
              var ldenom = nodeOne, lnumer = nodeOne;
              forEach(lfact, function (n) {
                if (n.op === Model.POW && isMinusOne(mathValue(n.args[1]))) {
                  // Accumulate the left denominator
                  if (!isOne(ldenom)) {
                    ldenom = multiplyNode([ldenom, n.args[0]], true);
                  } else {
                    // Have 1 so ignore it
                    ldenom = n.args[0];
                  }
                } else {
                  // Accumulate the left numerator
                  if (!isOne(lnumer)) {
                    lnumer = multiplyNode([lnumer, n], true);
                  } else {
                    // Have 1 so ignore it
                    lnumer = n;
                  }
                }
              });
              var rdenom = nodeOne, rnumer = nodeOne;
              forEach(rfact, function (n) {
                if (n.op === Model.POW && isMinusOne(mathValue(n.args[1]))) {
                  // Accumulate the right denominator
                  if (!isOne(rdenom)) {
                    rdenom = multiplyNode([rdenom, n.args[0]], true);
                  } else {
                    rdenom = n.args[0];
                  }
                } else {
                  // Accumulate the right numerator
                  if (!isOne(rnumer)) {
                    rnumer = multiplyNode([rnumer, n], true);
                  } else {
                    rnumer = n;
                  }
                }
              });
              var mvldenom = mathValue(ldenom);
              var mvrdenom = mathValue(rdenom);
              if (mvldenom !== null && mvrdenom !== null &&
                  isZero(mvldenom.compareTo(mvrdenom))) {
                // Denominators are the same.
                if (isZero(mvldenom.compareTo(bigOne))) {
                  // Denominators are one.
                  return [binaryNode(Model.ADD, [lnumer, rnumer])];
                } else {
                  // Denominators are same, but not one.
                  return [multiplyNode([
                    binaryNode(Model.ADD, [lnumer, rnumer]),
                    binaryNode(Model.POW, [ldenom, nodeMinusOne])
                  ])];
                }
              } else {
                // Denominators are not the same, so make it so
                // x/a + y/b -> (bx+ay)/ab
                lnumer = multiplyNode([rdenom, lnumer], true);
                rnumer = multiplyNode([ldenom, rnumer], true);
                return [multiplyNode([
                  binaryNode(Model.ADD, [lnumer, rnumer]),
                  binaryNode(Model.POW, [multiplyNode([ldenom, rdenom]), nodeMinusOne])
                ])];
              }
            }
            return [lnode, rnode];
          }
          function fold(lnode, rnode) {
            var ldegr = degree(lnode);
            var rdegr = degree(rnode);
            var lcoeff = coeff(lnode);
            var rcoeff = coeff(rnode);
            if (ldegr === rdegr) {
              // Have two terms of the same degree
              //var lcoeff = coeff(lnode);  // BigD
              //var rcoeff = coeff(rnode);
              var lvpart = variablePart(lnode);
              var rvpart = variablePart(rnode);
              // combine terms with like factors
              if (lvpart !== null && rvpart !== null &&
                  Ast.intern(lvpart) === Ast.intern(rvpart)) {
                var c = binaryNode(Model.ADD, [lcoeff, rcoeff]);
                var cmv = mathValue(c);
                if (isZero(cmv)) {
                  return nodeZero;
                } else if (isOne(cmv)) {
                  return lvpart;
                }
                return multiplyNode([c, lvpart]);
              } else if (lnode.op === Model.LOG && rnode.op === Model.LOG &&
                        (Ast.intern(lnode.args[0]) === Ast.intern(rnode.args[0]))) {
                return simplify(newNode(Model.LOG, [lnode.args[0], multiplyNode([lnode.args[1], rnode.args[1]])]));
              } else if (ldegr === 0 && rdegr === 0) {
                // Have two constants
                var mv1 = mathValue(lnode);
                var mv2 = mathValue(rnode);
                if (isInteger(mv1) && isInteger(mv2) ||
                    mv1 !== null && mv2 !== null) {
                   return numberNode(mv1.add(mv2));
                } else if (Ast.intern(lnode) === Ast.intern(rnode)) {
                  return multiplyNode([numberNode("2"), lnode]);
                } else if (commonFactors(lnode, rnode).length > 0) {
                  return [factorTerms(lnode, rnode)];
                } else {
                  return [lnode, rnode];
                }
              }
            }

            if (Ast.intern(lnode) === Ast.intern(rnode)) {
              return multiplyNode([numberNode("2"), lnode]);
            } else if (isZero(mathValue(lcoeff))) {
              return rnode;
            } else if (isZero(mathValue(rcoeff))) {
              return lnode;
            } else if (!isOne(mathValue(lcoeff)) && !isOne(mathValue(rcoeff))) {
              if (commonFactors(lnode, rnode).length > 0) {
                var node = [factorTerms(lnode, rnode)];
                return node;
              }
            }
            return [lnode, rnode];
          }
        },
        multiplicative: function (node) {
          assert(node.op === Model.MUL, "simplify() multiplicative node not normalized: " + JSON.stringify(node));
          node = flattenNestedNodes(node);
          node = groupLikes(node);
          if (!isMultiplicative(node)) {
            // Have a new kind of node start over.
            return node;
          }
          var nid = Ast.intern(node);
          var args = node.args.slice(0);
          var n0 = [simplify(args.shift())];
          if (n0[0].op === Model.MUL) {
            n0 = n0[0].args;
          }
          // For each next value, pop last value and fold it with next value.
          forEach(args, function (n1, i) {
            n1 = simplify(n1);
            n0 = n0.concat(fold(n0.pop(), n1));
          });
          if (n0.length < 2) {
            // If we have a solitary node and its exponent is negative then give
            // it a numerator
            if (exponent(n0[0]) < 0) {
              node = n0[0];
            } else {
              node = n0[0];
            }
          } else {
            if (n0.length === 0) assert(false);
            node = sort(multiplyNode(n0));
          }
          return node;
          function fold(lnode, rnode) {
            var ldegr = degree(lnode);
            var rdegr = degree(rnode);
            var lvars = variables(lnode);
            var rvars = variables(rnode);
            var lvpart = variablePart(lnode);
            var rvpart = variablePart(rnode);
            var lcoeff = coeff(lnode);   // BigD
            var rcoeff = coeff(rnode);
            var lcoeffmv = mathValue(lcoeff);
            var rcoeffmv = mathValue(rcoeff);
            if (ldegr === 0 && isZero(lcoeffmv) ||
                rdegr === 0 && isZero(rcoeffmv)) {
              return nodeZero;
            } else if (ldegr === 0 && isOne(lcoeffmv)) {
              return rnode;
            } else if (rdegr === 0 && isOne(rcoeffmv)) {
              return lnode;
            } else if (ldegr === 0 && rdegr === 0) {
              assert(lnode.op !== Model.MUL && rnode.op !== Model.MUL,
                     "Internal error: multiplicative expressions not flattened");
              if (lcoeffmv === null || rcoeffmv === null) {
                if (isInfinity(lnode)) {
                  if (isNeg(rnode)) {
                    return multiplyNode([nodeMinusOne, lnode]);
                  } else {
                    return lnode;
                  }
                } else if (isInfinity(rnode)) {
                  if (isNeg(lnode)) {
                    return multiplyNode([nodeMinusOne, rnode]);
                  } else {
                    return rnode;
                  }
                }
              } else if (isOne(rcoeffmv) && isOne(lcoeffmv)) {
                // Have two constants that have the math value of one.
                return nodeOne;
              }
              var lexpo = exponent(lnode);
              var rexpo = exponent(rnode);
              var lbase = base(lnode);  // : BigD
              var rbase = base(rnode);
              if (lbase !== null && rbase !== null &&
                  Math.abs(lexpo) === 1 && Math.abs(rexpo) === 1) {
                if (lexpo === rexpo) {
                  // 2^3*3^3, combine bases
                  var b = lbase.multiply(rbase);
                  node = numberNode(b);
                  if (lexpo === -1) {
                    node = binaryNode(Model.POW, [node, nodeMinusOne]);
                  }
                } else {
                  // We've got a fraction to simplify
                  if (option("allowDecimal") ||
                     isDecimal(lbase) ||
                     isDecimal(rbase)) {
                    // Allow converstion to decimal if 'allowDecimal=true' or
                    // if either operand is decimal.
                    var n = lexpo === 1 ? lbase : rbase;
                    var d = lexpo === 1 ? rbase : lbase;
                    node = numberNode(divide(n, d));
                  } else {
                    var lbaseN = toNumber(lbase);
                    var rbaseN = toNumber(rbase);
                    var d = gcd(lbaseN, rbaseN);
                    if (d === (d | 0)) {
                      // Have integer GCD
                      lbase = divide(lbase, toDecimal(d));
                      rbase = divide(rbase, toDecimal(d));
                    }
                    if (lexpo < 0 && isOne(lbase)) {
                      node = numberNode(rbase);
                    } else if (rexpo < 0 && isOne(rbase)) {
                      node = numberNode(lbase);
                    } else {
                      var n = lexpo === 1 ? lbase : rbase;
                      var d = lexpo === 1 ? rbase : lbase;
                      if (isOne(n)) {
                        // If the numerator is 1, erase it.
                        node = binaryNode(Model.POW, [numberNode(d), nodeMinusOne]);
                      } else {
                        var q = divide(n, d);
                        if (isInteger(q)) {
                          // Got an integer, use it.
                          node = numberNode(q);
                        } else {
                          // Otherwise, make a new simplified fraction.
                          if (isNeg(n) && isNeg(d)) {
                            n = n.multiply(toDecimal("-1"));
                            d = d.multiply(toDecimal("-1"));
                          }
                          node = [
                            numberNode(n),
                            binaryNode(Model.POW, [numberNode(d), nodeMinusOne])
                          ];
                        }
                      }
                    }
                  }
                }
              } else if (lnode.op === Model.POW && rnode.op === Model.POW &&
                         Ast.intern(lnode.args[1]) === Ast.intern(rnode.args[1])) {
                // x^z*y^z -> (x*y)^z
                var lbase = lnode.args[0];
                var rbase = rnode.args[0];
                var lexpo = exponent(lnode);
                var rexpo = exponent(rnode);
                var sqrtExpo = binaryNode(Model.POW, [numberNode("2"), nodeMinusOne]);
                if (Ast.intern(lnode.args[1]) === Ast.intern(sqrtExpo) &&
                    Ast.intern(lbase) === Ast.intern(rbase)) {
                  // Found square root of squares, so simplify
                  node = lbase;
                } else {
                  var args = [];
                  if (lbase.op === Model.MUL) {
                    // Flatten nested multiplication.
                    args = args.concat(lbase.args);
                  } else {
                    args.push(lbase);
                  }
                  if (rbase.op === Model.MUL) {
                    // Flatten nested multiplication.
                    args = args.concat(rbase.args);
                  } else {
                    args.push(rbase);
                  }
                  node = binaryNode(Model.POW, [multiplyNode(args), lnode.args[1]]);
                }
              } else {
                // Resort to numerical computation
                var lval = pow(lbase, toDecimal(lexpo));
                var rval = pow(rbase, toDecimal(rexpo));
                if (rval !== null && lval !== null) {
                  var val = lval.multiply(rval);
                  if (isInteger(val) || option("allowDecimal") ||
                      !isInteger(lval) || !isInteger(rval)) {
                    node = numberNode(lval.multiply(rval));
                  } else {
                    node = [lnode, rnode];
                  }
                } else {
                  node = [lnode, rnode];
                }
              }
            // one or both nodes contain var
            } else if (lvpart && rvpart && Ast.intern(lvpart) === Ast.intern(rvpart)) {
              var lnode = multiplyNode([lcoeff, rcoeff]);
              if (lvpart.op === Model.POW) {
                // FIXME if lvpart (and therefore rvpart) base is additive and
                // expos are the same, then multiply out bases
                assert(lvpart.args.length === 2 && rvpart.args.length === 2, "Exponents of exponents not handled here.");
                var lexpo = lvpart.args[1];
                var rexpo = rvpart.args[1];
                var rnode = binaryNode(Model.POW, [
                  lvpart.args[0],
                  binaryNode(Model.ADD, [lexpo, rexpo])
                ]);
              } else {
                var rnode = binaryNode(Model.POW, [lvpart, numberNode("2")]);
              }
              if (isZero(mathValue(lnode))) {
                node = [];
              } else if (isOne(mathValue(lnode))) {
                node = rnode;
              } else {
                node = [lnode, rnode];
              }
            } else if (Ast.intern(lnode.op === Model.POW ? lnode.args[0] : lnode) ===
                       Ast.intern(rnode.op === Model.POW ? rnode.args[0] : rnode)) {
              // x(x-1)^-1
              var lexpo = exponent(lnode);
              var rexpo = exponent(rnode);
              var expo = lexpo + rexpo;
              if (expo === 0) {
                // x^0 = 1
                node = nodeOne;
              } else if (expo === 1) {
                // x^1 = x
                node = variableNode(lvars[0]);
              } else if (!isNaN(expo)) {
                node = binaryNode(Model.POW, [variableNode(lvars[0]), numberNode(lexpo + rexpo)]);
              } else {
                node = [lnode, rnode];
              }
            } else if (ldegr === 0 && isOne(lcoeffmv)) {
              return rnode;
            } else if (rdegr === 0 && isOne(rcoeffmv)) {
              return lnode;
            } else if (ldegr === 0 && (isDecimal(lnode) || option("allowDecimal"))) {
              var v = mathValue(lnode);
              if (v !== null) {
                node = [numberNode(v), rnode];
              } else {
                node = [lnode, rnode];
              }
            } else if (rdegr === 0 && (isDecimal(rnode) || option("allowDecimal"))) {
              var v = mathValue(rnode);
              if (v !== null) {
                node = [numberNode(v), lnode];  // coeffs first
              } else {
                node = [lnode, rnode];
              }
            } else if (option("dontExpandPowers") &&
                       lnode.op === Model.POW && rnode.op === Model.POW &&
                       Ast.intern(lnode.args[1]) === Ast.intern(rnode.args[1])) {
              // x^z*y^z -> (xy)^z
              var lbase = lnode.args[0];
              var rbase = rnode.args[0];
              var lexpo = exponent(lnode);
              var rexpo = exponent(rnode);
              var args = [];
              if (lbase.op === Model.MUL) {
                // Flatten nested multiplication.
                args = args.concat(lbase.args);
              } else {
                args.push(lbase);
              }
              if (rbase.op === Model.MUL) {
                // Flatten nested multiplication.
                args = args.concat(rbase.args);
              } else {
                args.push(rbase);
              }
              node = binaryNode(Model.POW, [multiplyNode(args), lnode.args[1]]);
            } else {
              node = [lnode, rnode];
            }
            return node;
          }
        },
        unary: function(node) {
          switch (node.op) {
          case Model.SUB:
            // Remove unary SUBs
            node = multiplyNode([node.args[0], nodeMinusOne]);
            break;
          case Model.ABS:
            var mv = mathValue(node.args[0]);
            if (mv !== null) {
              node = numberNode(abs(mv));
            }
            // Otherwise, don't simplify
            break;
          case Model.M:
            var mv = mathValue(node);
            if (mv !== null) {
              node = numberNode(mv);
            }
            // Otherwise, don't simplify
            break;
          default:
            node = unaryNode(node.op, [simplify(node.args[0])]);
          }
          return node;
        },
        exponential: function (node) {
          var base = node.args[0];
          // Flatten nested exponential expressions.
          if (base.op === Model.POW) {
            node = binaryNode(Model.POW, [base.args[0], multiplyNode([base.args[1], node.args[1]])]);
          }
          // Make a copy of and reverse args to work from right to left
          var nid = Ast.intern(node);
          var args = node.args.slice(0).reverse();
          var n0 = [simplify(args.shift())];
          // For each next value, pop last value and fold it with next value.
          forEach(args, function (n1, i) {
            n1 = simplify(n1);
            n0 = n0.concat(fold(node.op, n0.pop(), n1));
          });
          if (n0.length === 1) {
            var n = n0[0];
            if (n.op !== Model.NUM ||
                (+n.args[0] === (+n.args[0] | 0) || n.args[0] === "Infinity")
                || option("allowDecimal")) {
              // If the result is not a number or is a whole number, then return it
              node = n;
            } // Otherwise return the orginal expression.
          } else {
            node = binaryNode(node.op, n0.reverse());
          }
          return node;
          function fold(op, expo, base) {
            var mv;
            var bmv = mathValue(base);
            var emv = mathValue(expo);
            if (op === Model.POW) {
              if (isZero(bmv)) {
                // 0^x
                if (isNeg(emv)) {
                  return [numberNode("Infinity")];
                } else {
                  return [nodeZero];
                }
              } else if (isZero(emv)) {
                // x^0
                return [nodeOne]
              } else if (isOne(bmv)) {
                // 1^x
                return [nodeOne];
              } else if (isOne(emv)) {
                // x^1
                return [base];
              } else if (!option("dontExpandPowers") && base.op === Model.MUL) {
                // Expand factors
                var args = [];
                base.args.forEach(function (n) {
                  if (n.op === Model.POW) {
                    // flatten
                    args.push(binaryNode(Model.POW, [n.args[0], multiplyNode([n.args[1], expo])]));
                  } else {
                    args.push(binaryNode(Model.POW, [n, expo]));
                  }
                });
                return multiplyNode(args);
              } else if (base.op === Model.POW) {
                // Flatten nested exponents
                return binaryNode(Model.POW, [base.args[0], multiplyNode([base.args[1], expo])]);
              } else if (bmv !== null && emv !== null) {
                // 2^3, 16^(-1*1^-2)
                // FIXME this is still a bit finicky as the order and number of exponents matter.
                var ff = factors(expo, null, false, true);
                // Apply each factor until in integer is not the result, or non-integers are allowed
                var b = mv = bmv;
                for (var i = ff.length-1; i >= 0; i--) {
                  var e = mathValue(ff[i]);
                  var mv = pow(mv, e);
                  if (mv !== null) {
                    b = mv;
                    ff.pop();
                    continue;
                  }
                  break;
                }
                base = numberNode(b);
                if (ff.length === 0) {
                  return base;
                } else if (ff.length === 1) {
                  return [ff[0], base];
                } else {
                  if (ff.length === 0) assert(false);
                  return [multiplyNode(ff), base];
                }
              }
            } else if (op === Model.LOG) {
              if (emv !== null) {
                if (bmv !== null) {
                  return numberNode(logBase(bmv, emv));
                } else if (base.op === Model.VAR && base.args[0] === "e") {
                  return numberNode(Math.log(toNumber(emv)).toString());
                }
              }
            }
            // x^2, x^y
            return [expo, base];
          }
        },
        variable: function(node) {
          return node;
        },
        comma: function(node) {
          var args = [];
          forEach(node.args, function (n) {
            args = args.concat(simplify(n));
          });
          return newNode(node.op, args);
        },
        equals: function(node) {
          // FIXME look for common factors on each side
          var args = [];
          forEach(node.args, function (n) {
            args = args.concat(simplify(n));
          });
          assert(args.length === 2);
          if (isZero(args[1])) {
            var mv = mathValue(args[0]);
            if (mv !== null) {
              // If its a number, then we're done.
              return newNode(node.op, args);
            }
            var ff = factors(args[0], {}, true, true);
            var args0 = [];
            var foundZero = false;
            forEach(ff, function (n) {
              var mv = mathValue(n);
              if (foundZero ||
                  mv !== null && !isZero(mv) && ff.length > 1 ||
                  n.op === Model.POW && isNeg(mathValue(n.args[1]))) {
                // Ignore constant factors, unless they are alone.
              } else if (isZero(mv)) {
                // Result is zero.
                args0 = [nodeZero];
                foundZero = true;
              } else {
                args0 = args0.concat(n);
              }
            });
            if (args0.length > 0) {
              // Multiply the remaining numerator terms
              args[0] = multiplyNode(args0);
            } else {
              // LHS has no more terms, so is zero
              args[0] = nodeZero;
            }
            // If equality and LHS leading coefficient is negative, then multiply by -1
            var c;
            if (node.op === Model.EQL && !isOne((c = leadingCoeff(args[0])))) {
              if (isMinusOne(c)) {
                args[0] = expand(multiplyNode([nodeMinusOne, args[0]]));
              }
            }
          }
          return newNode(node.op, args);
        },
      }), root.location);
      // If the node has changed, simplify again
      while (nid !== Ast.intern(node)) {
        nid = Ast.intern(node);
        node = simplify(node);
      }
      return node;
    }

    function base(node) {
      var op = node.op;
      return op === Model.POW
        ? mathValue(node.args[0])
        : mathValue(node);
    }

    function exponent(node) {
      return node.op === Model.POW ? toNumber(mathValue(node.args[1])) : 1;
    }

    function log(b, x) {
      return Math.log(x) / Math.log(b);
    }

    function mathValue(root, env) {
      if (!root) {
        return null;
      }
      if (!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return 0;
      }
      return visit(root, {
        name: "simplify",
        numeric: function (node) {
          return toDecimal(node.args[0]);
        },
        additive: function (node) {
          if (node.op === Model.PM) {
            return null;
          }
          // Simplify each side.
          var val = bigZero;
          forEach(node.args, function (n) {
            var mv = mathValue(n, env);
            if (mv && val) {
              val = val.add(mv);
            } else {
              val = null;   // bd === null is NaN
            }
          });
          return val;
        },
        multiplicative: function (node) {
          var val = bigOne;
          forEach(node.args, function (n) {
            var mv = mathValue(n, env);
            if (mv && val) {
              val = val.multiply(mv);
            } else {
              val = null;   // bd === null is NaN
            }
          });
          return val;
        },
        unary: function(node) {
          switch (node.op) {
          case Model.SUB:
            var val = mathValue(node.args[0], env);
            return val.multiply(bigMinusOne);
          case Model.FACT:
            var n = mathValue(node.args[0], env);
            if (n) {
              return toDecimal(factorial(n));
            } else {
              return null;
            }
          case Model.M:
            var args = [];
            // M.args[0] -> ADD.args
            if (node.args[0].op === Model.ADD) {
              forEach(node.args[0].args, function (n) {
                assert(n.op === Model.VAR, "Internal error: invalid arguments to the \M tag");
                var sym = Model.env[n.args[0]];
                assert(sym && sym.mass, "Internal error: missing chemical symbol");
                var count = n.args[1] ? toNumber(mathValue(n.args[1])) : 1;
                args.push(numberNode(sym.mass * count));
              });
            } else {
              // Just have one VAR node.
              var n = node.args[0];
              assert(n.op === Model.VAR, "Internal error: invalid arguments to the \M tag");
              var sym = Model.env[n.args[0]];
              assert(sym && sym.mass, "Internal error: missing chemical symbol");
              var count = n.args[1] ? toNumber(mathValue(n.args[1])) : 1;
              args.push(numberNode(sym.mass * count));
            }
            return mathValue(makeTerm(args));
          case Model.ABS:
            return abs(mathValue(node.args[0], env));
          case Model.SIN:
          case Model.COS:
          case Model.TAN:
          case Model.ARCSIN:
          case Model.ARCCOS:
          case Model.ARCTAN:
            return trig(mathValue(node.args[0], env), node.op);
          default:
            return mathValue(node.args[0], env);
          }
        },
        exponential: function (node) {
          var args = node.args.slice(0).reverse();
          var val = mathValue(args.shift());
          forEach(args, function (n) {
            val = pow(mathValue(n, env), val);
          });
          return val;
        },
        variable: function(node) {
          var val;
          if (env && (val = env[node.args[0]])) {
            return toDecimal(val);
          }
          return null;
        },
        comma: function(node) {
          var args = [];
          forEach(node.args, function (n) {
            args = args.concat(mathValue(n, env));
          });
          return args;
        },
        equals: function(node) {
          return null;
        },
      });
      function exponent(node) {
        // FIXME this is brittle. need way to handle general exponents
        return node.op === Model.POW ? +node.args[1].args[0] : 1;
      }
    }
    function getUnique(list) {
      var u = {}, a = [];
      for(var i = 0, l = list.length; i < l; ++i){
        if(u.hasOwnProperty(list[i])) {
          continue;
        }
        a.push(list[i]);
        u[list[i]] = 1;
      }
      return a;
    }
    // Get the list of units used in an expression.
    function units(root, env) {
      if (!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return 0;
      }
      return getUnique(visit(root, {
        name: "terms",
        exponential: function (node) {
          return units(node.args[0], env);
        },
        multiplicative: function (node) {
          var uu = [];
          forEach(node.args, function (n) {
            uu = uu.concat(units(n, env));
          });
          return uu;
        },
        additive: function (node) {
          var uu = [];
          forEach(node.args, function (n) {
            uu = uu.concat(units(n, env));
          });
          return uu;
        },
        unary: function(node) {
          return units(node.args[0], env);
        },
        numeric: function(node) {
          return [];
        },
        variable: function(node) {
          // NOTE This assumes that all names in the environment with number
          // values are units, which is currently the case.
          var env = Model.env;
          if (env && typeof env[node.args[0]] === "number") {
            return [node.args[0]];
          }
          return [];
        },
        comma: function(node) {
          var uu = [];
          forEach(node.args, function (n) {
            uu = uu.concat(units(n, env));
          });
          return uu;
        },
        equals: function(node) {
          var uu = [];
          forEach(node.args, function (n) {
            uu = uu.concat(units(n, env));
          });
          return uu;
        },
      }));
    }

    function multiplyMatrix(lnode, rnode) {
      var snode, mnode;
      // Scalar * Matrix
      if (lnode.op !== Model.MATRIX) {
        return multiplyScalarAndMatrix(lnode, rnode);
      } else if (rnode.op !== Model.MATRIX) {
        return multiplyScalarAndMatrix(rnode, lnode);
      }
      // Matrix * Matrix
      var rowArgs = [];
      var rows = lnode.args[0].args;
      forEach(rows, function (row) {
        var colArgs = [];
        var cols = rnode.args[0].args[0].args;  // use cols in first row as reference
        assert(rows.length === cols.length, message(2013));
        forEach(cols, function (col, n) {
          col = getMatrixCol(rnode, n);  // get actual column
          colArgs.push(multiplyVectors(row.args, col));
        });
        rowArgs.push(newNode(Model.COL, colArgs));
      });
      return newNode(Model.MATRIX, [newNode(Model.ROW, rowArgs)]);
    }

    function addMatrix(lnode, rnode) {
      var snode, mnode;
      // Scalar + Matrix
      if (lnode.op !== Model.MATRIX) {
        return addScalarAndMatrix(lnode, rnode);
      } else if (rnode.op !== Model.MATRIX) {
        return addScalarAndMatrix(rnode, lnode);
      }
      // Matrix + Matrix
      var rowArgs = [];
      var lrows = lnode.args[0].args;
      forEach(lrows, function (lrow, i) {
        var colArgs = [];
        var rrows = rnode.args[0].args;  // use cols in first row as reference
        assert(lrows.length === rrows.length, message(2013));
        var rrow = rrows[i];
        colArgs = addVectors(lrow.args, rrow.args);
        rowArgs.push(newNode(Model.COL, colArgs));
      });
      return newNode(Model.MATRIX, [newNode(Model.ROW, rowArgs)]);
    }

    function getMatrixCol(mnode, n) {
      var vec = [];
      var rows = mnode.args[0].args;
      forEach(rows, function (row) {
        var cols = row.args;
        vec.push(cols[n]);
      });
      return vec;
    }

    function addVectors(v1, v2) {
      // v1, v2 : Array of nodes
      var args = [];
      forEach(v1, function (n1, i) {
        var n2 = v2[i];
        args.push(binaryNode(Model.ADD, [n1, n2]));
      });
      return args;
    }

    function multiplyVectors(v1, v2) {
      // v1, v2 : Array of nodes
      var args = [];
      forEach(v1, function (n1, i) {
        var n2 = v2[i];
        args.push(multiplyNode([n1, n2]));
      });
      return binaryNode(Model.ADD, args);
    }

    function multiplyScalarAndMatrix(snode, mnode) {
      // For each row, for each column
      var rowArgs = [];
      var rows = mnode.args[0].args;
      forEach(rows, function (row) {
        var colArgs = [];
        var cols = row.args;
        forEach(cols, function (col) {
          colArgs.push(multiplyNode([snode, col]));
        });
        rowArgs.push(newNode(Model.COL, colArgs));
      });
      return newNode(Model.MATRIX, [newNode(Model.ROW, rowArgs)]);
    }

    function addScalarAndMatrix(snode, mnode) {
      // For each row, for each column
      var rowArgs = [];
      var rows = mnode.args[0].args;
      forEach(rows, function (row) {
        var colArgs = [];
        var cols = row.args;
        forEach(cols, function (col) {
          colArgs.push(binaryNode(Model.ADD, [snode, col]));
        });
        rowArgs.push(newNode(Model.COL, colArgs));
      });
      return newNode(Model.MATRIX, [newNode(Model.ROW, rowArgs)]);
    }

    function multiplyTerms(lterms, rterms, expo) {
      var args = [];
      forEach(lterms, function (n0) {
        forEach(rterms, function (n1) {
          // Multiply the terms
          var args1 = [];
          if (n0.op === Model.MUL) {
            args1 = args1.concat(n0.args);
          } else {
            args1.push(n0);
          }
          if (n1.op === Model.MUL) {
            args1 = args1.concat(n1.args);
          } else {
            args1.push(n1);
          }
          args.push(multiplyNode(args1));
        });
      });
      var node = binaryNode(Model.ADD, args);
      if (expo !== undefined) {
        // Reapply the power.
        node = binaryNode(Model.POW, [node, numberNode(expo.toString())]);
      }
      return [sort(node)];
    }

    function expand(root, env) {
      if (!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return 0;
      }
      var nid = Ast.intern(root);
      var node = Model.create(visit(root, {
        name: "expand",
        numeric: function (node) {
          return node;
        },
        additive: function (node) {
          var nid = Ast.intern(node);
          var args = node.args.slice(0);  // make copy
          var n0 = [expand(args.shift())];
          forEach(args, function (n1) {
            n1 = expand(n1);
            n0 = n0.concat(unfold(n0.pop(), n1));
          });
          if (n0.length < 2) {
            node = n0[0];
          } else {
            node = binaryNode(node.op, n0);
          }
          return node;
          function unfold(lnode, rnode) {
            if (lnode.op === Model.MATRIX || rnode.op === Model.MATRIX) {
              return addMatrix(lnode, rnode);
            }
            return [lnode, rnode];
          }
        },
        multiplicative: function (node) {
          var nid = Ast.intern(node);
          var args = node.args.slice(0);  // make copy
          var n0 = [expand(args.shift())];
          // For each next value, pop last value and fold it with next value.
          forEach(args, function (n1, i) {
            n1 = expand(n1);
            n0 = n0.concat(unfold(n0.pop(), n1));
          });
          if (n0.length < 2) {
            node = n0[0];
          } else {
            node = multiplyNode(n0);
          }
          return node;
          function unfold(lnode, rnode) {
            // FIXME if the bases are additive and the expo are the same power,
            // then expand the base and reapply the power.
            var expo, lterms, rterms;
            if (lnode.op === Model.MATRIX || rnode.op === Model.MATRIX) {
              return multiplyMatrix(lnode, rnode);
            }
            if (lnode.op === Model.POW && rnode.op === Model.POW &&
                exponent(lnode) === exponent(rnode)) {
              lterms = terms(lnode.args[0]);
              rterms = terms(rnode.args[0]);
              expo = exponent(lnode);
            } else {
              lterms = terms(lnode);
              rterms = terms(rnode);
            }
            if (!isAggregate(lnode) && lterms.length > 1 ||
                !isAggregate(rnode) && rterms.length > 1) {
              // (x + 2)(x - 3)
              return multiplyTerms(lterms, rterms, expo);
            }
            var result = [];
            if (lnode.op === Model.MUL) {
              result = result.concat(lnode.args);
            } else {
              result.push(lnode);
            }
            if (rnode.op === Model.MUL) {
              result = result.concat(rnode.args);
            } else {
              result.push(rnode);
            }
            return result;
          }
        },
        unary: function(node) {
          assert(node.op !== Model.SQRT, "Internal error: SQRT removed during parsing");
          switch (node.op) {
          case Model.SUB:
            node = multiplyNode([expand(node.args[0]), nodeMinusOne]);
            node.args[0] = expand(node.args[0]);
            break;
          case Model.TAN:
            var arg0 = expand(node.args[0]);
            // tan x = sin x / cos x
            node = multiplyNode([
              newNode(Model.SIN, [arg0]),
              binaryNode(Model.POW, [
                newNode(Model.COS, [arg0]),
                nodeMinusOne
              ])
            ]);
            break;
          case Model.COT:
            var arg0 = expand(node.args[0]);
            node = multiplyNode([
              newNode(Model.COS, [arg0]),
              binaryNode(Model.POW, [
                newNode(Model.SIN, [arg0]),
                nodeMinusOne
              ])
            ]);
            break;
          case Model.SEC:
            var arg0 = expand(node.args[0]);
            node = multiplyNode([
              nodeOne,
              binaryNode(Model.POW, [
                newNode(Model.COS, [arg0]),
                nodeMinusOne
              ])
            ]);
            break;
          case Model.CSC:
            var arg0 = expand(node.args[0]);
            node = multiplyNode([
              nodeOne,
              binaryNode(Model.POW, [
                newNode(Model.SIN, [arg0]),
                nodeMinusOne
              ])
            ]);
            break;
          default:
            node = unaryNode(node.op, [expand(node.args[0])]);
            break;
          }
          return node;
        },
        exponential: function (node) {
          // (xy)^z -> x^zy^z
          // Make a copy of and reverse args to work from right to left
          var nid = Ast.intern(node);
          var args = node.args.slice(0).reverse();
          var n0 = [expand(args.shift())];
          // For each next value, pop last value and fold it with next value.
          forEach(args, function (n1, i) {
            n1 = expand(n1);
            n0 = n0.concat(unfold(node.op, n0.pop(), n1));
          });
          var node2
          if (n0.length < 2) {
            var n = n0[0];
            // If the result is not a number or is a whole number, then return it
            node2 = n;
          } else {
            node2 = binaryNode(node.op, n0.reverse());
          }
          // If LOG and not base e, then normalize to base e.
          if (node2.op === Model.LOG) {
            var base = node2.args[0];
            var expo = node2.args[1];
            if (base.op !== Model.VAR || base.args[0] !== "e") {
              node2 = binaryNode(Model.MUL, [
                binaryNode(Model.LOG, [variableNode("e"), expo]),
                binaryNode(Model.POW, [
                  binaryNode(Model.LOG, [variableNode("e"), base]),
                  nodeMinusOne
                ])
              ]);
            }
          }
          return node2;
          function unfold(op, expo, base) {
            var node;
            var emv = mathValue(expo);
            if (op === Model.POW) {
              var ff = factors(base, null, false, true);
              if (ff.length === 0) {
                // No factors means we have a node with math value '1', so just
                // return it.
                return nodeOne;
              }
              var args = [];
              var dontExpandPowers = option("dontExpandPowers");
              // Raise each factor to the expo power and then multiply them together
              forEach(ff, function (n) {
                if (expo.op === Model.ADD) {
                  // If additive, then multiply base raised to each term.
                  // x^(y+z) -> x^y*x^z
                  forEach(expo.args, function (e) {
                    args.push(newNode(op, [n, e]));
                  });
                } else if (isInteger(emv)) {
                  // x^2 -> x*x
                  var ea = Math.abs(toNumber(emv));
                  if (isZero(emv)) {
                    args.push(nodeOne);
                  } else if (ea < 5 && (isAdditive(n) || !dontExpandPowers)) {
                    // Expand if the base is additive, or exponent is an integer and
                    // dontExpandPowers is false.
                    var invert = isNeg(emv);
                    for (var i = 0; i < ea; i++) {
                      if (invert) {
                        args.push(binaryNode(Model.POW, [n, nodeMinusOne]));
                      } else {
                        args.push(n);
                      }
                    }
                  } else {
                    args.push(newNode(op, [n, expo]));
                  }
                } else if (!dontExpandPowers && expo.op === Model.MUL) {
                  // x^(2y) -> x^y*x^y
                  var c = coeff(expo);
                  var cmv = mathValue(c);
                  var vp = variablePart(expo);
                  if (vp !== null) {
                    if (!isOne(cmv)) {
                      args.push(binaryNode(Model.POW, [n, c]));
                    }
                    args.push(binaryNode(Model.POW, [n, vp]));
                  } else if (cmv !== null) {
                    args.push(newNode(op, [n, numberNode(cmv.toString())]));
                  } else {
                    args.push(newNode(op, [n, expo]));
                  }
                } else {
                  args.push(newNode(op, [n, expo]));
                }
              });
            } else if (op === Model.LOG) {
              var args = [];
              var dontExpandPowers = option("dontExpandPowers");
              if (isMultiplicative(expo)) {
                // If log and multiplicative, then add log of each term.
                var aa = [];
                forEach(expo.args, function (e) {
                  if (e.op === Model.POW) {
                    // log x^y -> y log x
                    aa.push(multiplyNode([
                      e.args[1],
                      newNode(Model.LOG, [base, e.args[0]])
                    ]));
                  } else {
                    aa.push(newNode(op, [base, e]));
                  }
                });
                args.push(binaryNode(Model.ADD, aa));
              } else if (expo.op === Model.POW) {
                // log x^y -> y log x
                args.push(multiplyNode([
                  expo.args[1],
                  newNode(Model.LOG, [base, expo.args[0]])
                ]));
              } // Otherwise, do nothing
            }
            // x^2, x^y
            if (args.length > 1) {
              return [multiplyNode(args)];
            } else if (args.length === 1) {
              return [args[0]];
            }
            return [expo, base];
          }
        },
        variable: function(node) {
          return node;
        },
        comma: function(node) {
          var args = [];
          forEach(node.args, function (n) {
            args = args.concat(expand(n));
          });
          return newNode(node.op, args);
        },
        equals: function(node) {
          // x/10+5=0 -> x+50=0
          // x/(y+1)+10=0 -> x+10(y+1) -> x+10y+10
          // x/y+2/z=0 -> xz+2y=0
          var args = [];
          forEach(node.args, function (n) {
            args = args.concat(expand(n));
          });
          // For each term, for each factor, if denom
          return newNode(node.op, args);
        },
      }), root.location);
      // If the node has changed, simplify again
      while (nid !== Ast.intern(node)) {
        nid = Ast.intern(node);
        node = expand(node);
      }
      return node;
    }

    function factors(root, env, ignorePrimeFactors, preserveNeg) {
      if (!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return 0;
      }
      return visit(root, {
        name: "factors",
        numeric: function (node) {
          if (ignorePrimeFactors) {
            return [node];
          }
          var ff = [];
          if (preserveNeg && isNeg(node)) {
            ff.push(nodeMinusOne);
          }
          var absv = Math.abs(+node.args[0]);
          var pff = primeFactors(absv);
          if (pff.length === 0 && !isOne(absv)) {
            ff.push(numberNode(absv)); // e.g. 0.4
          } else {
            forEach(primeFactors(+node.args[0]), function (n) {
              ff.push(numberNode(n));
            });
          }
          return ff;
        },
        additive: function (node) {
          return [node];
        },
        multiplicative: function (node) {
          switch (node.op) {
          case Model.MUL:
            var vars = variables(node);
            var ff = [];
            forEach(node.args, function (n) {
              ff = ff.concat(factors(n, env, ignorePrimeFactors, preserveNeg));
            });
            return ff;
          default:
            assert(false, "Node not normalized");
            break;
          }
          return [node];
        },
        unary: function(node) {
          return [node];
        },
        exponential: function (node) {
          if (node.op === Model.POW) {
            if (mathValue(node.args[1]) < 0) {
              return [node];
            } else {
              var ff = [];
              var e = mathValue(node.args[1]);
              if (e !== null && isInteger(e)) {
                for (var i = toNumber(e); i > 0; i--) {
                  ff.push(node.args[0]);
                }
                return ff;
              } else {
                return [node];
              }
            }
          } else if (node.op === Model.LOG) {
            return [node];
          }
        },
        variable: function(node) {
          return [node];
        },
        comma: function(node) {
          var args = [];
          forEach(node.args, function (n) {
            args = args.concat(factors(n));
          });
          return newNode(node.op, args);
        },
        equals: function(node) {
          return [node];
        },
      });
    }

    function commonFactors(lnode, rnode) {
      var t1 = [lnode, rnode];
      var t;
      var t2 = [];
      // Factorise each term and intern its factors (giving each unqiue
      // sub-expression an id.
      forEach(t1, function (n) {
        t = factors(n, null, false, true);
        var ff = [];
        forEach(t, function (n) {
          ff.push(Ast.intern(n));
        });
        t2.push(ff);
      });
      // Check to see if there are any common factors (ids).
      var intersect = t2.shift();
      forEach(t2, function (a) {
        intersect = filter(intersect, function (n) {
          var i = indexOf(a, n);
          if (i !== -1) {
            delete a[i];   // erase matches
            return true;
          }
          return false;
        });
      });
      return intersect;
    }

    function factorTerms(lnode, rnode) {
      // Eliminate the common factors from each term and sum the unique parts.
      var cfacts = commonFactors(lnode, rnode);
      var lfacts = factors(lnode, null, false, true);
      var rfacts = factors(rnode, null, false, true);
      var lfacts2 = [], rfacts2 = [];
      var cf = cfacts.slice(0);
      var i;
      forEach(lfacts, function (f) {
        if ((i = indexOf(cf, Ast.intern(f))) === -1) {
          lfacts2.push(f);
        } else {
          delete cf[i];  // erase the matched factor
        }
      });
      var cf = cfacts.slice(0);
      forEach(rfacts, function (f) {
        if ((i = indexOf(cf, Ast.intern(f))) === -1) {
          rfacts2.push(f);
        } else {
          delete cf[i];  // erase the matched factor
        }
      });
      var aa = [];
      aa = aa.concat(makeFactor(lfacts2));
      aa = aa.concat(makeFactor(rfacts2));
      var args = [];
      if (aa.length > 0) {
        args.push(makeTerm(aa));
      }
      forEach(cfacts, function (i) {
        args.push(new Ast().node(i));
      });
      return makeFactor(args)[0];
    }

    function makeFactor(args) {
      if (args.length === 0) {
        return [nodeOne];  // no factors, means times one
      } else if (args.length === 1) {
        return args;
      }
      return [multiplyNode(args)];
    }

    function makeTerm(args) {
      assert(args.length > 0, "Too few arguments in makeTerm()");
      if (args.length === 1) {
        return args[0];
      }
      return binaryNode(Model.ADD, args);
    }

    // Scale the numbers in an expression.
    function scale(root) {
      if (!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return 0;
      }
      return visit(root, {
        name: "scale",
        exponential: function (node) {
          var args = [];
          forEach(node.args, function (n) {
            args.push(scale(n));
          });
          return newNode(node.op, args);
        },
        multiplicative: function (node) {
          var args = [];
          forEach(node.args, function (n) {
            args.push(scale(n));
          });
          return newNode(node.op, args);
        },
        additive: function (node) {
          var args = [];
          forEach(node.args, function (n) {
            args.push(scale(n));
          });
          return newNode(node.op, args);
        },
        unary: function(node) {
          return unaryNode(node.op, [scale(node.args[0])]);
        },
        numeric: function(node) {
          return numberNode(node.args[0], true);
        },
        variable: function(node) {
          return node;  // nothing to do here
        },
        comma: function(node) {
          var args = [];
          forEach(node.args, function (n) {
            args.push(scale(n));
          });
          return newNode(node.op, args);
        },
        equals: function(node) {
          var args = [];
          forEach(node.args, function (n) {
            args.push(scale(n));
          });
          return newNode(node.op, args);
        },
      });
    }

    // Returns true if 'root' has no factors with coefficients in the integers.
    function isFactorised(root, env) {
      if (!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return 0;
      }
      return visit(root, {
        name: "isFactorised",
        numeric: function (node) {
          // We don't care about prime factors
          return true;
        },
        additive: function (node) {
          if (node.op === Model.PM) {
            return true;
          }
          var vars = variables(node);
          var coeffs, vals;
          var t1 = terms(normalize(node));
          var t;
          var t2 = [];
          // Factorise each term and intern its factors (giving each unqiue
          // sub-expression an id.
          forEach(t1, function (n) {
            t = factors(n);
            var ff = [];
            forEach(t, function (n) {
              ff.push(Ast.intern(n));
            });
            t2.push(ff);
          });
          // Check to see if there are any common factors (ids).
          var intersect = t2.shift();
          forEach(t2, function (a) {
            intersect = filter(intersect, function (n) {
              return indexOf(a, n) != -1;
            });
          });
          // If so, then root is not factorised.
          if (intersect.length > 0) {
            return false;
          }
          // If not, check to see if there are any integer solutions to the
          // quadratic equation.
          if ((coeffs = isPolynomial(node)) && coeffs.length < 3) {
            return true;  // 0 or 1 degree equations that get here are factored.
          } else if (coeffs !== null && variables(node).length === 1) {
            if (coeffs.length === 3) {
              return !solveQuadratic(coeffs[2], coeffs[1], coeffs[0]);
            }
            return !hasRoot(node, coeffs);
          } else if (some(t1, function (n) {
            var d = degree(n, true);
            if (d > 0 && d < 2) {
              // x+y^2+xy
              return true;
            }
          })) {
            return true;
          }
          assert(vars.length < 2, message(2001));
          assert(false, message(2003));
          // FIXME What other checks can we add here?
          return undefined;
        },
        multiplicative: function (node) {
          switch (node.op) {
          case Model.MUL:
            var result = every(node.args, function (n) {
              return isFactorised(n);
            });
            return result ? !hasLikeFactors(node) : false;
          default:
            assert(false, "isFactorised(): node not normalized");
            break;
          }
          return false;
        },
        unary: function(node) {
          return true;
        },
        exponential: function (node) {
          return true;
        },
        variable: function(node) {
          return true;
        },
        comma: function(node) {
          var result = every(node.args, function (n) {
            return args.concat(isFactorised(n));
          });
          return result;
        },
        equals: function(node) {
          var result = every(node.args, function (n) {
            return args.concat(isFactorised(n));
          });
          return result;
        },
      });
    }

    var primes = [
      2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67,
      71, 73, 79, 83, 89, 97
    ];

    // Table of values and their primality.
    var primesCache = {};
    forEach(primes, function (v) {
      primesCache[v] = true;
    });

    function findPossibleRoots(coeffs) {
      var c0 = coeffs[0];               // zero degree
      var c1 = coeffs[coeffs.length-1]; // highest degree
      // FIXME eliminate dups
      // FIXME sort by most likely roots
      var f0 = primeFactors(c0);
      var f1 = primeFactors(c1);
      f0.push(1);
      f0.push(c0);
      f1.push(1);
      f1.push(c1);
      var possibleRoots = [];
      forEach(f0, function (n) {
        var n0 = numberNode(n);
        var n1 = numberNode("-" + n);
        forEach(f1, function (d) {
          var d = numberNode(d);
          possibleRoots.push(fractionNode(n0, d));
          possibleRoots.push(fractionNode(n1, d));
        });
      });
      return possibleRoots;
    }

    function hasRoot(node, coeffs) {
      var rr = findPossibleRoots(coeffs);
      var field = option("field");
      return some(rr, function (r) {
        r = toNumber(mathValue(r));
        var nn = variables(node);
        assert(nn.length === 1);
        var env = {};
        env[nn[0]] = r;
        var x = toNumber(mathValue(node, env));
        return x === 0 &&
          (field === "integer" && r === (r | 0) ||
           field === "real");   // FIXME document that this actually only works for rational, not all reals
      });
    }

    function isPolynomial(node) {
      var n0 = JSON.parse(JSON.stringify(node));  // Make copy
      var tt = terms(expand(n0));
      var a = bigZero, b = bigZero, c = bigZero, notPolynomial = false;
      var cc = [];
      forEach(tt, function (v) {
        var d = degree(v, true);
        if (d === Number.POSITIVE_INFINITY || d < 0 || d !== Math.floor(d)) {   // non-positive integer power
          notPolynomial = true;
          return;
        }
        if (cc[d] === undefined) {
          var i = d;
          // Zero out undefined coefficients from here to the last coefficient.
          while (i >= 0 && cc[i] === undefined) {
            cc[i] = 0;
            i--;
          }
        }
        cc[d] = cc[d] + toNumber(mathValue(coeff(v)));
      });
      if (notPolynomial || variables(node).length > 1) {
        return null;
      }
      return cc;
    }
    function solveQuadratic(a, b, c) {
      a = toNumber(a);  // HACK, do math in BD
      b = toNumber(b);
      c = toNumber(c);
      var x0 = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
      var x1 = (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a);
      var opt = option("field");
      var hasSolution =
        opt === "integer" && ((x0 === (x0 | 0)) && (x1 === (x1 | 0))) ||
        opt === "real" && (b * b - 4 * a * c) >= 0 ||
        opt === "complex"; // Redundant, but okay.
      if (hasSolution) {
        return true; //[new BigDecimal(x0.toString()), new BigDecimal(x1.toString())];
      }
      return false;
    }
    function primeFactors(n) {  // n : Number
      var absN = Math.abs(n);
      if (absN <= 1) {
        return [];
      } else if (isPrime(absN)) {
        return [absN];
      }
      var maxf = Math.sqrt(absN);
      for (var f = 2; f <= maxf; f++) {
        if (n % f === 0) {
          return primeFactors(f).concat(primeFactors(absN / f));
        }
      }
    }

    function isPrime(n) {
      if (primesCache[n] !== void 0) {
        return primesCache[n];
      }
      if (n <= 1) {
        primesCache[n] = false;
        return false;
      } else {
        if (n <= 1 || n > 2 && n % 2 === 0) {
          return primesCache[n] = false;
        } else {
          for (var i = 3, sqrt = Math.sqrt(n); i <= sqrt; i += 2) {
            if (n % i === 0) {
              return primesCache[n] = false;
            }
          }
        }
        return primesCache[n] = true;
      }
    }

    function gcd(a, b) {
      if (arguments.length > 2) {
        var rest = [].slice.call(arguments, 1);
        return gcd(a, gcd.apply(rest));
      } else {
        var mod;
        a = Math.abs(a);
        b = Math.abs(b);
        while (b) {
          mod = a % b;
          a = b;
          b = mod;
        }
        return a;
      }
    }

    function lcm(a, b) {
      if (arguments.length > 2) {
        var rest = [].slice.call(arguments, 1);
        return lcm(a, lcm.apply(rest));
      } else {
        return Math.abs(a * b) / gcd(a, b);
      }
    }

    // Visitor exports
    this.normalize = normalize;
    this.normalizeLiteral = normalizeLiteral;
    this.normalizeSyntax = normalizeSyntax;
    this.degree = degree;
    this.coeff = coeff;
    this.variables = variables;
    this.variablePart = variablePart;
    this.sort = sort;
    this.simplify = simplify;
    this.expand = expand;
    this.factors = factors;
    this.isFactorised = isFactorised;
    this.mathValue = mathValue;
    this.units = units;
    this.scale = scale;
    this.hasLikeFactors = hasLikeFactors;
  }

  var visitor = new Visitor();
  function degree(node, notAbsolute) {
    return visitor.degree(node, notAbsolute);
  }

  function coeff(node, name) {
    return visitor.coeff(node, name);
  }

  function variables(node) {
    return visitor.variables(node);
  }

  function variablePart(node) {
    return visitor.variablePart(node);
  }

  function sort(node) {
    var prevLocation = Assert.location;
    if (node.location) {
      Assert.setLocation(node.location);
    }
    var result = visitor.sort(node);
    Assert.setLocation(prevLocation);
    return result;
  }

  function normalize(node) {
    var prevLocation = Assert.location;
    if (node.location) {
      Assert.setLocation(node.location);
    }
    var result = visitor.normalize(node);
    Assert.setLocation(prevLocation);
    return result;
  }

  function normalizeLiteral(node) {
    var prevLocation = Assert.location;
    if (node.location) {
      Assert.setLocation(node.location);
    }
    var result = visitor.normalizeLiteral(node);
    Assert.setLocation(prevLocation);
    return result;
  }

  function normalizeSyntax(node, ref) {
    var prevLocation = Assert.location;
    if (node.location) {
      Assert.setLocation(node.location);
    }
    var result = visitor.normalizeSyntax(node, ref);
    Assert.setLocation(prevLocation);
    return result;
  }

  function mathValue(node, env) {
    var prevLocation = Assert.location;
    if (node.location) {
      Assert.setLocation(node.location);
    }
    var result = visitor.mathValue(node, env);
    Assert.setLocation(prevLocation);
    return result;
  }

  function units(node, env) {
    var prevLocation = Assert.location;
    if (node.location) {
      Assert.setLocation(node.location);
    }
    var result = visitor.units(node, env);
    Assert.setLocation(prevLocation);
    return result;
  }

  function simplify(node, env) {
    var prevLocation = Assert.location;
    if (node.location) {
      Assert.setLocation(node.location);
    }
    var result = visitor.simplify(node, env);
    Assert.setLocation(prevLocation);
    return result;
  }

  function hasLikeFactors(node, env) {
    var prevLocation = Assert.location;
    if (node.location) {
      Assert.setLocation(node.location);
    }
    var result = visitor.hasLikeFactors(node, env);
    Assert.setLocation(prevLocation);
    return result;
  }

  function expand(node, env) {
    var prevLocation = Assert.location;
    if (node.location) {
      Assert.setLocation(node.location);
    }
    var result = visitor.expand(node, env);
    Assert.setLocation(prevLocation);
    return result;
  }

  function factors(node, env) {
    var prevLocation = Assert.location;
    if (node.location) {
      Assert.setLocation(node.location);
    }
    var result = visitor.factors(node, env);
    Assert.setLocation(prevLocation);
    return result;
  }

  function isFactorised(node, env) {
    var prevLocation = Assert.location;
    if (node.location) {
      Assert.setLocation(node.location);
    }
    var result = visitor.isFactorised(node, env);
    Assert.setLocation(prevLocation);
    return result;
  }

  function scale(node) {
    var prevLocation = Assert.location;
    if (node.location) {
      Assert.setLocation(node.location);
    }
    var result = visitor.scale(node);
    Assert.setLocation(prevLocation);
    return result;
  }

  var env = Model.env;
  function precision(bd) {
    // 100x10^-2 = 1
    var scale = bd.scale();
    // Don't count trailing zeros on the rhs of the decimal
    var prec = bd.mant.length;
    for (var i = 0; i < scale; i++) {
      if (bd.mant[prec-1-i] !== 0) {
        break;
      }
    }
    return prec;
  }

  function stripTrailingZeros(bd) {
    var mc = new MathContext(precision(bd));
    return v1.round(mc);
  }

  // Check if two equations have the same math value. Two equations have the
  // same math value if and only if have the same numeric value factoring in
  // units, if any.
  // Need to convert units.

  function distributeUnits(n1, n2) {
    var n1units = units(n1);
    var n2units = units(n2);
    assert(n1units.length < 2, message(2004));
    assert(n2units.length < 2, message(2004));
    var n1unit = n1units[0];
    var n2unit = n2units[0];
    // Distribute unit. Maybe undefined.
    var n1new, n2new;
    if (n1unit === undefined && n2unit !== undefined) {
      n1new = multiplyNode([n1, variableNode(n2unit)]);
      n2new = n2;
    } else if (n2unit === undefined && n1unit !== undefined) {
      n1new = n1;
      n2new = multiplyNode([n2, variableNode(n1unit)]);
    } else {
      n1new = n1;
      n2new = n2;
    }
    return [n1new, n2new];
  }

  Model.fn.equivValue = function (n1, n2, op) {
    var options = Model.options = Model.options ? Model.options : {};
    var scale = options.decimalPlaces != undefined ? +(options.decimalPlaces) : 10;
    var env = Model.env;
    var inverseResult = option("inverseResult");
    var result;
    Model.options.allowDecimal = true;
    var v1t = bigZero;
    var v2t = bigZero;
    var args = [];
    if (isComparison(n1.op) && isComparison(n2.op)) {
      var v1 = Model.create(n1.args[0]).equivValue(n1.args[1], n1.op);
      var v2 = Model.create(n2.args[0]).equivValue(n2.args[1], n2.op);
      var result = v1 === v2;
      return inverseResult ? !result : result;
    }
    if (n1.op === Model.PM) {
      var args = distributeUnits(n1.args[0], n1.args[1]);
      n1 = binaryNode(Model.PM, args);
    }
    if (n2.op === Model.PM) {
      var args = distributeUnits(n2.args[0], n2.args[1]);
      n2 = binaryNode(Model.PM, args);
    }
    var n1b, n2b, n1t, n2t;
    if (n1.op === Model.PM) {
      n1b = simplify(expand(normalize(n1.args[0])));
      n1t = simplify(expand(normalize(n1.args[1])));
      var v1 = mathValue(n1b, env);
      var v1t = mathValue(n1t, env);
    } else {
      n1b = simplify(expand(normalize(n1)));
      var v1 = mathValue(n1b, env);
    }
    if (n2.op === Model.PM) {
      n2b = simplify(expand(normalize(n2.args[0])));
      n2t = simplify(expand(normalize(n2.args[1])));
      var v2 = mathValue(n2b, env);
      var v2t = mathValue(n2t, env);
    } else {
      n2b = simplify(expand(normalize(n2)));
      var v2 = mathValue(n2b, env);
    }
    var vp1 = variablePart(n1b);
    var vp2 = variablePart(n2b);
    if (vp1 && vp2 && this.intern(vp1) === this.intern(vp2)) {
      // The variable part is the same, so factor out of the comparison.
      n1b = coeff(n1b);
      n2b = coeff(n2b);
    }
    var nid1 = this.intern(n1b);
    var nid2 = this.intern(n2b);
    if (nid1 === nid2 && n1t === undefined && n2t === undefined &&
        (op === undefined || isEqualsComparison(op))) {
        result = true;
        return inverseResult ? !result : result;
    }
    var v1 = mathValue(n1b, env);
    var v2 = mathValue(n2b, env);
    assert(v1 !== null || isComparison(n1b.op), message(2005));
    assert(n1b.op !== Model.PM || v1t !== null, message(2005));
    assert(v2 !== null || isComparison(n2b.op), message(2005));
    assert(n2b.op !== Model.PM || v2t !== null, message(2005));
    Assert.clearLocation();
    // If we have two arrays, then compare their elements
    if (v1 instanceof Array && v2 instanceof Array) {
      assert(n1t === undefined && n2t === undefined, message(2007));
      // Check that the brackets of the list match
      if (n1b.lbrk !== n2b.lbrk || n1b.rbrk !== n2b.rbrk) {
        return false;
      }
      // Check that the corresponding elements of each list are equal.
      return every(v1, function (a, i) {
        var b = v2[i].multiply(baseUnitConversion(n1b.args[i], n2b.args[i]));
        a = a.setScale(scale, BigDecimal.ROUND_HALF_UP);
        b = b.setScale(scale, BigDecimal.ROUND_HALF_UP);
        var result = a.compareTo(b) === 0;
        return inverseResult ? !result : result;
      });
    }
    // Not lists so check values and units. At this point the values reflect
    // the relative magnitudes of the units.
    if (v1 !== null && v2 !== null) {
      assert(baseUnit(n1b) === undefined && baseUnit(n2b) === undefined ||
           baseUnit(n1b) !== undefined && baseUnit(n2b) !== undefined,
             message(2009));

      // lb : g, ft : m
      v2 = v2.multiply(baseUnitConversion(n1b, n2b));
      if (!isZero(v2t)) {
        v2t = v2t.multiply(baseUnitConversion(n1b, n2b));
      }
      v1 = v1.setScale(scale, BigDecimal.ROUND_HALF_UP);
      v2 = v2.setScale(scale, BigDecimal.ROUND_HALF_UP);
      Model.options = options;
      if (isZero(v1t) && isZero(v2t)) {
        var cmp = v1.compareTo(v2);
        switch (op) {
        case Model.LT:
          result = cmp < 0 ? true : false;
          break;
        case Model.LE:
          result = cmp <= 0 ? true : false;
          break;
        case Model.GT:
          result = cmp > 0 ? true : false;
          break;
        case Model.GE:
          result = cmp >= 0 ? true : false;
          break;
        default:
          result = cmp === 0;
          break;
        }
        return inverseResult ? !result : result;
      } else {
        var v1min = v1.subtract(v1t);
        var v2min = v2.subtract(v2t);
        var v1max = v1.add(v1t);
        var v2max = v2.add(v2t);
        // is v1min or v1max between v2min and v2max
        // or is v2min or v2max between v1min and v1max
        if (v1min.compareTo(v2min) >= 0 && v1max.compareTo(v2min) <= 0 ||
            v1min.compareTo(v2max) >= 0 && v1max.compareTo(v2max) <= 0 ||
            v2min.compareTo(v1min) >= 0 && v2max.compareTo(v1max) <= 0 ||
            v2min.compareTo(v1max) >= 0 && v2max.compareTo(v1max) <= 0) {
          result = true;
          return inverseResult ? !result : result;
        }
      }
    }
    var result = false;
    return inverseResult ? !result : result;

    // Return the base unit (e.g. 'g', 'm', 's') in the given expression.
    function baseUnit(node) {
      var baseUnits = {
        "g": "g",
        "cg": "g",
        "kg": "g",
        "mg": "g",
        "ng": "g",
        "\\mug": "g",
        "m": "m",
        "cm": "m",
        "km": "m",
        "mm": "m",
        "\\mum": "m",
        "nm": "m",
        "s": "s",
        "cs": "s",
        "ks": "s",
        "ms": "s",
        "\\mus": "s",
        "ns": "s",
        "in": "ft",
        "ft": "ft",
        "mi": "ft",
        "fl": "fl",
        "cup": "fl",
        "pt": "fl",
        "qt": "fl",
        "gal": "fl",
        "oz": "lb",
        "lb": "lb",
        "st": "lb",
        "qtr": "lb",
        "cwt": "lb",
        "t": "lb",
        "L": "L",
        "mL": "L",
        "\\muL": "L",
        "nL": "L",
        "$": "$",
        "\\radian": "\\radian",
        "\\degree": "\\radian",
        "mol": "mol",
      };
      var prevLocation = Assert.location;
      if (node.location) {
        Assert.setLocation(node.location);
      }
      var uu = units(node, Model.env);
      Assert.setLocation(prevLocation);
      assert(uu.length < 2, "FIXME need user error message");
      if (baseUnits[uu[0]]) {
        return baseUnits[uu[0]];
      }
      // Node has no valid units, so just return undefined.
      return undefined;
    }
    // Convert between different unit systems
    function baseUnitConversion(u1, u2) {
      var NaN = Math.NaN;
      var baseUnitConversions = {
        "g/g": 1,
        "lb/lb": 1,
        "fl/fl": 1,
        "m/m": 1,
        "ft/ft": 1,
        "s/s": 1,
        "g/lb": "453.592",
        "lb/g": "0.00220462",
        "m/ft": "0.3048",
        "ft/m": "3.28084",
        "L/fl": "0.02957353",
        "fl/L": "33.814022702",
      };
      var bu1 = baseUnit(u1);
      var bu2 = baseUnit(u2);
      var val = (bu1 === bu2 ? 1 : 0) || baseUnitConversions[bu1 + "/" + bu2];
      return toDecimal(val);
    }
  }

  // We are interested in knowing where ASTs diverge and what those differences
  // mean.
  function compareTrees(actual, expected) {

  }

  Model.fn.equivSyntax = function (n1, n2) {
    reset();
    var ignoreOrder = option("ignoreOrder");
    var inverseResult = option("inverseResult");
    var options = Model.options ? Model.options : {};
    var result = false;
    if (!(n1 instanceof Array)) {
      n1 = [n1];
    }
    result = some(n1, function (n) {
      options.is_normal = true;
      var n1n = normalizeSyntax(n, n);
      options.is_normal = false;
      var n2n = normalizeSyntax(n2, n);
      return Ast.intern(n1n) === Ast.intern(n2n);
    });
    var input = "";
    delete options.is_normal;
    var not = options.not;
    if (not) {
      input += "NOT ";
      delete options.not;
    }
    return inverseResult ? !result : result;
  };

  // Check if two equations are literally equivalent. Two equations are
  // literally equivalent if and only if they have the same AST. ASTs with the
  // same structure intern to the same pool index.
  Model.fn.equivLiteral = function equivLiteral(n1, n2) {
    var ignoreOrder = option("ignoreOrder");
    var inverseResult = option("inverseResult");
    n1 = normalizeLiteral(n1);
    n2 = normalizeLiteral(n2);
    if (ignoreOrder) {
      n1 = sort(n1);
      n2 = sort(n2);
    }
    var nid1 = Ast.intern(n1);
    var nid2 = Ast.intern(n2);
    if (nid1 === nid2) {
      if (n1.op !== Model.INTERVAL && n1.op !== Model.LIST) {
        // Check special case of \text{..} [..]
        if (n1.op === Model.MUL) {
          for (var i = 0; i < n1.args.length; i++) {
            if (n1.args[i].op === Model.INTERVAL &&
                !equivLiteral(n1.args[i], n2.args[i])) {
              // Check immediately nested intervals.
              return inverseResult ? true : false;
            }
          }
        }
        return inverseResult ? false : true;
      } else if (n1.lbrk === n2.lbrk && n1.rbrk === n2.rbrk) {
          return inverseResult ? false : true;
      }
    }
    return inverseResult ? true : false;
  }

  // Check if two equations are mathematically equivalent. Two equations are
  // mathematically equivalent if they are literally equal after simplification
  // and normalization.
  Model.fn.equivSymbolic = function (n1, n2) {
    n1 = scale(normalize(simplify(expand(normalize(n1)))));
    n2 = scale(normalize(simplify(expand(normalize(n2)))));
    var nid1 = Ast.intern(n1);
    var nid2 = Ast.intern(n2);
    var inverseResult = option("inverseResult");
    if (nid1 === nid2) {
      return inverseResult ? false : true;
    }
    return inverseResult ? true : false;
  }

  function isEqualsComparison(op) {
    return op === Model.LE ||
      op === Model.GE ||
      op === Model.EQL;
  }

  function isComparison(op) {
    return op === Model.LT ||
      op === Model.LE ||
      op === Model.GT ||
      op === Model.GE ||
      op === Model.EQL;
  }

  Model.fn.isTrue = function (n1) {
    var prevLocation = Assert.location;
    if (n1.location) {
      Assert.setLocation(n1.location);
    }
    var result;
    if (isComparison(n1.op)) {
      result = Model.create(n1.args[0]).equivValue(n1.args[1], n1.op);
    } else {
      result = !isZero(mathValue(n1));
    }
    Assert.setLocation(prevLocation);
    var inverseResult = option("inverseResult");
    return inverseResult ? !result : result;
  }

  Model.fn.isExpanded = function (n1) {
    var dontExpandPowers = option("dontExpandPowers", true);
    n1 = normalize(n1);
    var nid1 = Ast.intern(n1);
    var nid2 = Ast.intern(normalize(expand(n1)));
    option("dontExpandPowers", dontExpandPowers);
    var inverseResult = option("inverseResult");
    if (nid1 === nid2 && !hasLikeFactors(n1)) {
      // hasLikeFactors: x*x != x^2
      return inverseResult ? false : true;
    }
    return inverseResult ? true : false;
  }

  Model.fn.isSimplified = function (node) {
    var dontExpandPowers = option("dontExpandPowers", true);
    var dontFactorDenominators = option("dontFactorDenominators", true);
    var inverseResult = option("inverseResult");
    var n1 = normalize(node);
    var n2 = normalize(simplify(expand(normalize(node))));
    var nid1 = Ast.intern(n1);
    var nid2 = Ast.intern(n2);
    option("dontExpandPowers", dontExpandPowers);
    option("dontFactorDenominators", dontFactorDenominators);
    if (nid1 === nid2) {
      return inverseResult ? false : true;
    }
    return inverseResult ? true : false;
  }

  Model.fn.isFactorised = function (n1) {
    var inverseResult = option("inverseResult");
    var result = isFactorised(normalize(n1));
    return inverseResult ? !result : result;
  }

  Model.fn.isUnit = function (n1, n2) {
    var inverseResult = option("inverseResult");
    var u1 = units(normalize(n1), env);
    var u2 = units(normalize(n2), env);
    if (!(u2 instanceof Array)) {
      u2 = [u2];
    }
    var result = every(u2, function (v) {
      return indexOf(u1, v) >= 0;
    });
    return inverseResult ? !result : result;
  }

  var option = Model.option = function option(p, v) {
    var options = Model.options;
    var opt = options && options[p];
    if (v !== undefined) {
      // Set the option value.
      Model.options = options = options ? options : {};
      options[p] = v;
    }
    if (opt === undefined) {
      switch (p) {
      case "field":
        opt = "integer";
        break;
      case "decimalPlaces":
        opt = 10;
        break;
      case "numberFormat":
        opt = undefined;
        break;
      default:
        opt = false;
        break;
      }
    }
    // Return the original or default option.
    return opt;
  }

  var RUN_SELF_TESTS = false;
  if (RUN_SELF_TESTS) {
    var env = {
    };

    trace("\nMath Model self testing");
    (function () {
      Model.pushEnv(env);
//      Model.options = {allowDecimal: true, decimalPlaces: 3};
//          ["x^{yy}", "x^{yy}"],
//          ["\\lg(\\sqrt{x})", "\\frac{\\frac{\\ln(x)}{\\ln(10)}}{2}"],
//          ["x^(1-1)", "1"],
//          [, "\\frac{33}{8}in^3"],
//          ["\\frac{7}{-2}-11(-2)+2", "20+1/2"],
//          ["12.5=\\frac{100}{v}", "12.5v=100"],
//          ["3\\sqrt{8}-6\\sqrt{32}", "-18\\sqrt{2}"],
//          ["1\\frac{1}{2}= \\frac{3}{2}", "1+\\frac{2-1}{2}= \\frac{3}{2}"],
//          ["5=y+x", "-5=y+(-x-2y)"],
//          ["1/4(2x+8)", "2+x/2"],
//          ["5=y+x", "\\frac{5}{5}=y+\\frac{x}{5}-\\frac{4y}{5}"],
//          ["y=7/6(x+4)-2", "y=7/6(x-8)+12"],
//          ["5+2y=y+x", "5+y=x"],
      var nd1 = Model.create("[x+1]");
      var nd2 = Model.create("x+2");
      var val = nd1.equivSyntax(nd2);
//      var val = nd1.equivSymbolic(nd2);
      var result = val ? "PASS": "FAIL";
      trace(result);
      trace(Ast.dumpAll());
//      var val = nd1.isTrue();
      trace("start");
      trace("nd1=" + JSON.stringify(nd1, null, 2));
      trace("nd2=" + JSON.stringify(nd2, null, 2));
      trace("normalize");
      var nd1 = normalize(nd1);
      var nd2 = normalize(nd2);
      trace("nd1=" + JSON.stringify(nd1, null, 2));
      trace("nd2=" + JSON.stringify(nd2, null, 2));
      trace("expand");
      var nd1 = expand(nd1);
      var nd2 = expand(nd2);
      trace("nd1=" + JSON.stringify(nd1, null, 2));
      trace("nd2=" + JSON.stringify(nd2, null, 2));
      trace("simplify");
      var nd1 = simplify(nd1);
      var nd2 = simplify(nd2);
      trace("nd1=" + JSON.stringify(nd1, null, 2));
      trace("nd2=" + JSON.stringify(nd2, null, 2));
      trace("normalize");
      var nd1 = normalize(nd1);
      var nd2 = normalize(nd2);
      trace("nd1=" + JSON.stringify(nd1, null, 2));
      trace("nd2=" + JSON.stringify(nd2, null, 2));
      trace("scale");
      var nd1 = scale(nd1);
      var nd2 = scale(nd2);
      trace("nd1=" + JSON.stringify(nd1, null, 2));
      trace("nd2=" + JSON.stringify(nd2, null, 2));
    })();
  }
})();
