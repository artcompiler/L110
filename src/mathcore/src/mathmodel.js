/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2014 Learnosity Ltd. All Rights Reserved.
 *
 */
"use strict";
// This module has no exports. It is executed to define Model.fn plugins.
(function (ast) {

  var messages = Assert.messages;

  // Add messages here.
  Assert.reserveCodeRange(2000, 2999, "mathmodel");
  messages[2001] = "Factoring of multi-variate polynomials with all terms of degree greater than one is not supported";
  messages[2002] = "[unused]"
  messages[2003] = "Factoring non-polynomials is not supported.";
  messages[2004] = "Compound units not supported.";
  messages[2005] = "Non-numeric expressions cannot be compared with equivValue.";
  messages[2006] = "More that two equals symbols in equation.";
  messages[2007] = "Tolerances are not supported in lists.";
  messages[2008] = "deprecated";
  messages[2009] = "Units must be specified on none or both values for equivValue.";
  messages[2010] = "Invalid option name %1.";
  messages[2011] = "Invalid option value %2 for option %1.";
  messages[2012] = "Expressions with comparison or equality operators cannot be compared with equivValue.";
  messages[2013] = "Invalid matrix multiplication.";
  messages[2014] = "Incomplete expression found.";
  messages[2015] = "Invalid format name '%1'.";

  var bigZero = new BigDecimal("0");
  var bigOne = new BigDecimal("1");
  var bigTwo = new BigDecimal("2");
  var bigThree = new BigDecimal("3");
  var bigFour = new BigDecimal("4");
  var bigMinusOne = new BigDecimal("-1");
  var nodeOne = numberNode("1");
  var nodeMinusOne = numberNode("-1");
  var nodeZero = numberNode("0");
  var nodeInfinity = numberNode("Infinity");
  var nodeMinusInfinity = numberNode("-Infinity");
  var nodeOneHalf = binaryNode(Model.POW, [numberNode("2"), nodeMinusOne]);
  var nodeImaginary = binaryNode(Model.POW, [nodeMinusOne, nodeOneHalf]);
  var nodeE = variableNode("e");

  // WARNING: for debugging only
  function stripNids(node) {
    forEach(keys(node), function (k) {
      if (indexOf(k, "Nid") > 0) {
        delete node[k];
      }
    });
    if (node.args) {
      forEach(node.args, function (n) {
        stripNids(n);
      });
    }
    return node;
  }

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

  function undefinedNode() {
    var node = numberNode(new Date().getTime() + Math.random());
    node.isUndefined = true;
    return node;
  }

  function isUndefined(node) {
    return node.isUndefined;
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

  function abs(n) {
    if (n === null) {
      return null;
    } else if (n instanceof BigDecimal) {  // assume d is too
      if (n === null) {
        return null;
      }
      n = toNumber(n);
    } else if (n.op) {
      n = mathValue(n, true);
      if (n === null) {
        return null;
      }
    } else {
      if (isNaN(n)) {
        return null;
      }
    }
    return toDecimal(Math.abs(n));
  }

  function numberNode(val, doScale, roundOnly, isRepeating) {
    assert(!(val instanceof Array));
    // doScale - scale n if true
    // roundOnly - only scale if rounding
    var mv, node, minusOne;
    if (doScale) {
      var scale = option("decimalPlaces");
      if (isRepeating) {
         // FIXME expand repeating decimal past size of scale
      }
      mv = toDecimal(val);
      if (isNeg(mv) && !isMinusOne(mv)) {
        minusOne = bigMinusOne.setScale(scale, BigDecimal.ROUND_HALF_UP);
        mv = abs(mv);
      }
      if (mv !== null && (!roundOnly || mv.scale() > scale)) {
        mv = mv.setScale(scale, BigDecimal.ROUND_HALF_UP);
      }
    } else {
      mv = toDecimal(val);
      if (isNeg(mv) && !isMinusOne(mv)) {
        minusOne = bigMinusOne;
        mv = abs(mv);
      }
    }
    if (minusOne) {
      node = multiplyNode([newNode(Model.NUM, [String(minusOne)]), newNode(Model.NUM, [String(mv)])]);
    } else if (mv) {
      node = newNode(Model.NUM, [String(mv)]);
    } else {
      // Infinity and friends
      node = newNode(Model.NUM, [String(val)]);
    }
    return node;
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

  function negate(n) {
    if (typeof n === "number") {
      return -n;
    } else if (n.op === Model.MUL) {
      var args = n.args.slice(0); // copy
      return multiplyNode([negate(args.shift())].concat(args));
    } else if (n.op === Model.NUM) {
      if (n.args[0] === "1") {
        return nodeMinusOne;
      } else if (n.args[0] === "-1") {
        return nodeOne;
      } else if (n.args[0] === "Infinity") {
        return nodeMinusInfinity;
      } else if (n.args[0] === "-Infinity") {
        return nodeInfinity;
      } else if (n.args[0].charAt(0) === "-") {
        return unaryNode(Model.SUB, [n]);
      } else {
        return numberNode("-" + n.args[0]);
      }
    } else if (n.op === Model.POW && isMinusOne(n.args[1])) {
      return binaryNode(Model.POW, [negate(n.args[0]), nodeMinusOne]);
    }
    return multiplyNode([nodeMinusOne, n]);
  }

  function isNeg(n) {
    if (n === null) {
      return false;
    }
    if (n.op) {
      n = mathValue(n, true);
    }
    if (n === null) {
      return false;  // What about -Infinity?
    }
    return n.compareTo(bigZero) < 0;
  }

  function isInfinity(n) {
    if (n === Number.POSITIVE_INFINITY ||
        n === Number.NEGATIVE_INFINITY ||
        n.op === Model.NUM &&
        (n.args[0] === "Infinity" ||
         n.args[0] === "-Infinity")) {
      return true;
    }
    return false;
  }

  function isE(n) {
    if (n === null) {
      return false;
    } else if (n instanceof BigDecimal) {
      return !bigE.compareTo(n);
    } else if (typeof n === "number") {
      return n === Math.E;
    } else if (n.op === Model.NUM && +n.args[0] === Math.E) {
      return true;
    } else if (n.op === Model.VAR && n.args[0] === "e") {
      return true;
    } else {
      return false;
    }
  }

  function isZero(n) {
    if (n === null) {
      return false;
    } else if (n instanceof BigDecimal) {
      return !bigZero.compareTo(n);
    } else if (typeof n === "number") {
      return n === 0;
    } else if (n.op === Model.NUM && +n.args[0] === 0) {
      return true;
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
      var mv = mathValue(n, true);
      if (mv) {
        return !bigMinusOne.compareTo(mathValue(n, true));
      } else {
        return false;
      }
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
        isInfinity(val) ||
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

  function toRadians(node) {
    // Convert node to radians
    assert(node.op);
    var val = bigOne, uu;
    var args = [];
    if (node.op === Model.MUL) {
      forEach(node.args, function (n) {
        if (n.op === Model.VAR) {
          switch (n.args[0]) {
          case "\\degree":
            args.push(numberNode(new BigDecimal(""+Math.PI).divide(new BigDecimal("180"))));
            break;
          case "\\radians":
            // Do nothing.
            break;
          default:
            args.push(toRadians(n));
            break;
          }
        } else {
          args.push(n);
        }
      });
      node = multiplyNode(args);
    } else {
      node = node;
    }
    return node;
  }

  function logBase(b, v) {
    var n = Math.log(toNumber(v)) / Math.log(toNumber(b));
    if (!isNaN(n)) {
      return new BigDecimal(String(n));
    }
    return null;
  }

  // From http://stackoverflow.com/questions/3959211/fast-factorial-function-in-javascript
  var factCache = [bigOne, bigOne];
  var i = 2;
  function factorial(n)
  {
    if (typeof factCache[n] != 'undefined') {
      return factCache[n];
    }
    var result = factCache[i-1];
    for (; i <= n; i++) {
      factCache[i] = result = result.multiply(new BigDecimal(i.toString()));
    }
    return result;
  }

  var varMap = {};
  var varNames = [];
  function reset() {
    varMap = {};
    varNames = [];
  }

  // The outer Visitor function provides a global scope for all visitors,
  // as well as dispatching to methods within a visitor.
  function Visitor(ast) {
    var normalNumber = numberNode("298230487121230434902874");
    normalNumber.is_normal = true;
    function visit(node, visit, resume) {
      assert(node.op && node.args, "Visitor.visit() op=" + node.op + " args = " + node.args);
      switch (node.op) {
      case Model.NUM:
        node = visit.numeric(node, resume);
        break;
      case Model.ADD:
      case Model.SUB:
      case Model.PM:
      case Model.BACKSLASH: // set operator
        if (node.args.length === 1) {
          node = visit.unary(node, resume);
        } else {
          node = visit.additive(node, resume);
        }
        break;
      case Model.MUL:
      case Model.DIV:
      case Model.FRAC:
        node = visit.multiplicative(node, resume);
        break;
      case Model.POW:
      case Model.LOG:
        node = visit.exponential(node, resume);
        break;
      case Model.VAR:
      case Model.SUBSCRIPT:
        node = visit.variable(node, resume);
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
      case Model.ION:
      case Model.POW:
      case Model.SUBSCRIPT:
        node = visit.unary(node, resume);
      case Model.OVERLINE:
      case Model.OVERSET:
      case Model.UNDERSET:
      case Model.NONE:
      case Model.DEGREE:
        node = visit.unary(node);
        break;
      case Model.COMMA:
      case Model.MATRIX:
      case Model.VEC:
      case Model.ROW:
      case Model.COL:
      case Model.INTERVAL:
      case Model.LIST:
        node = visit.comma(node, resume);
        break;
      case Model.EQL:
      case Model.LT:
      case Model.LE:
      case Model.GT:
      case Model.GE:
      case Model.NE:
      case Model.APPROX:
      case Model.COLON:
      case Model.RIGHTARROW:
        node = visit.equals(node, resume);
        break;
      case Model.FORMAT:
        // Only supported by normalizeSyntax
        node = visit.format(node);
        break;
      default:
        if (visit.name !== "normalizeLiteral" &&
            visit.name !== "sort") {
          assert(false, "Should not get here. Unhandled node operator " + node.op);
        }
        break;
      }
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
            var expo = mathValue(args[1], true);
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
            if (d !==  0) {
              return nodeInfinity;
            }
            return 0;
          case Model.DEGREE:
          case Model.NONE:
          default:
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

    // Compute the constant part of an expression. The result of 'constantPart'
    // and 'variablePart' are complements. Their product are equivSymbolic with
    // the original expression.
    function constantPart(root) {
      var env = Model.env;
      if (!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return nodeZero;
      }
      return visit(root, {
        name: "constantPart",
        exponential: function (node) {
          var vars = variables(node.args[0], env);
          vars = vars.concat(variables(node.args[1], env));
          if (vars.length === 0) {
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
            var vars = variables(n);
            if (vars.length === 0) {
              // No vars so we have a constant.
              var mv = mathValue(n, env);
              if (isOne(mv)) {
                // Got one, skip it.
              } else if (isZero(mv)) {
                ff.push(nodeZero);
              } else {
                ff.push(n);
              }
            } // Otherwise it's a variable part. Skip it.
          });
          if (ff.length === 0) {
            return nodeOne;
          } else if (ff.length === 1) {
            return ff[0];
          }
          return multiplyNode(ff);
        },
        additive: function (node) {
          var vars = variables(node);
          if (vars.length !== 0) {
            // If we have vars, because this is additive the constant part is one.
            node = nodeOne;
          }
          return node;
        },
        unary: function(node) {
          var vars = variables(node.args[0], env);
          if (vars.length === 0) {
            return node;
          } else {
            return nodeOne;
          }
        },
        numeric: function(node) {
          return node;
        },
        variable: function(node) {
          return nodeOne;
        },
        comma: function(node) {
          var vars = variables(node.args[0], env);
          if (vars.length === 0) {
            return node;
          } else {
            return nodeOne;
          }
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
      var env = Model.env;
      if (!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return null;
      }
      return visit(root, {
        name: "variablePart",
        exponential: function (node) {
          if (variables(node.args[0]).length > 0 || variables(node.args[1]).length > 0) {
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
          if (variables(node).length > 0) {
            return node;
          }
          return null;
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
          return node;
        },
        comma: function(node) {
          var vars = variables(node.args[0], env);
          if (vars.length !== 0) {
            return node;
          }
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
      case Model.VAR:
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
        case "\\integer":
          if (node.numberFormat === "integer") {
            if (length === undefined || length === node.args[0].length) {
              // If there is no size or if the size matches the value...
              return true;
            }
          }
          break;
        case "\\decimal":
          if (node.numberFormat === "decimal" &&
              node.isRepeating === true) {
            if (length === undefined) {
              return true;
            } else {
              // Repeating is infinite.
              return false;
            }
          }
          if (node.numberFormat === "decimal") {
            if (length === undefined ||
                length === 0 && node.args[0].indexOf(".") === -1 ||
                length === node.args[0].substring(node.args[0].indexOf(".") + 1).length) {
              // If there is no size or if the size matches the value...
              return true;
            }
          }
          break;
        case "\\number":
          if (node.numberFormat === "decimal" &&
              node.isRepeating === true) {
            if (length === undefined) {
              return true;
            } else {
              // Repeating is infinite.
              return false;
            }
          }
          if (node.numberFormat === "integer" ||
              node.numberFormat === "decimal") {
            var brk = node.args[0].indexOf(".");
            if (length === undefined ||
                length === 0 && brk === -1 ||
                brk >= 0 && length === node.args[0].substring(brk + 1).length) {
              // If there is no size or if the size matches the value...
              return true;
            }
          }
          break;
        case "\\scientific":
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
        case "\\fraction":
          if (node.isFraction ||
              node.isMixedFraction) {
            return true;
          }
          break;
        case "\\simpleFraction":
        case "\\nonMixedFraction": // deprecated
          if (node.isFraction) {
            return true;
          }
          break;
        case "\\mixedFraction":
          if (node.isMixedFraction) {
            return true;
          }
          break;
        case "\\fractionOrDecimal":
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
      case "\\variable":
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
      case "\\integer":
      case "\\decimal":
      case "\\number":
      case "\\scientific":
      case "\\fraction":
      case "\\mixedFraction":
      case "\\nonMixedFraction":
      case "\\fractionOrDecimal":
        name = id;  // Do nothing.
        break;
      default:
        assert(false, message(2015, [code]));
        break;
      }
      return name;
    }

    function isEmptyNode(node) {
      return node.op === Model.VAR && node.args[0] === "0";
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
      var nid = ast.intern(root);
      var node = Model.create(visit(root, {
        name: "normalizeSyntax",
        format: function(node) {
          var fmtList = normalizeFormatObject(node.args[0]);
          if (fmtList[0].code === "\\variable") {
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
          if (ref && ref.op === Model.SUB &&
              ref.args.length === 1 &&
              ref.args[0].op === Model.FORMAT) {
            // We have unary minus. Strip minus.
            ref = ref.args[0];
          }
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
            // Found a mixed fraction.
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
          forEach(node.args, function (n, i) {
            n = normalizeSyntax(n, ref.args[i]);
            if (!isMinusOne(n)) {
              args.push(n);
            }
          });
          return binaryNode(Model.MUL, args);
        },
        unary: function(node) {
          var arg0 = normalizeSyntax(node.args[0], ref.args[0]);
          switch (node.op) {
          case Model.PERCENT:
            node = unaryNode(node.op, [arg0]);  // Percent compares only to other percent forms
            break;
          case Model.SUB:
            if (ref && ref.op === Model.FORMAT &&
                // Check the original node.
                checkNumberFormat(ref.args[0], node.args[0])) {
              return normalNumber;
            }
            // Strip minus
            node = arg0;
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

    function cancelFactors(node) {
      if (node.op !== Model.MUL) {
        return node;
      }
      var numers = {};
      var denoms = {};
      forEach(node.args, function(n, i) {
        var isDenom = false;
        var f;
        if (isMinusOne(n)) {
          // Move negatives to denom.
          n = newNode(Model.POW, [nodeMinusOne, nodeMinusOne]);
        }
        if (n.op === Model.POW && isMinusOne(n.args[1])) {
          f = n.args[0];
          isDenom = true;
        } else {
          f = n;
        }
        var mv = mathValue(f, true);
        var key = mv !== null ? String(mv) : "nid$" + ast.intern(f);
        if (isDenom) {
          if (!denoms[key]) {
            denoms[key] = [];
          }
          denoms[key].push(n);
        } else {
          if (!numers[key]) {
            numers[key] = [];
          }
          numers[key].push(n);
        }
      });
      var nKeys = keys(numers);
      var dKeys = keys(denoms);
      if (nKeys.length === 0 || dKeys.length === 0 ||
         dKeys.length === 1 && dKeys[0] === "-1") {
        // One case is a sole synthetic -1 with not other denoms.
        return node;
      }
      // Now do he canceling.
      var args = [];
      forEach(nKeys, function (k) {
        var nn = numers[k];
        var dd = denoms[k];
        if (dd) {
          var count = dd.length > nn.length ? nn.length : dd.length;
          numers[k] = nn.slice(count);  // Slice off count items.
          denoms[k] = dd.slice(count);
        }
      });
      forEach(nKeys, function (k) {
        args = args.concat(numers[k]);  // Save survivors.
      });
      forEach(dKeys, function (k) {
        args = args.concat(denoms[k]);
      });
      if (args.length) {
        return multiplyNode(args);
      } else {
        return nodeOne;
      }
    }

    // normalize() replaces subtraction with addition and division with
    // multiplication. It does not perform expansion or simplification so that
    // the basic structure of the expression is preserved. Also, flattens binary
    // trees into N-ary nodes.
    var normalizedNodes = [];
    function normalize(root) {
      if (!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return 0;
      }
      var nid = ast.intern(root);
      if (root.normalizeNid === nid) {
        return root;
      }
      var cachedNode;
      if ((cachedNode = normalizedNodes[nid]) !== undefined) {
        return cachedNode;
      }
      var rootNid = nid;
      var node = Model.create(visit(root, {
        name: "normalize",
        numeric: function (node) {
          if (!option("dontConvertDecimalToFraction") && isDecimal(node)) {
            node = decimalToFraction(node);
          } else if (isNeg(node)) {
            // FIXME what's this doing?
            node = numberNode(node.args[0]);  // Normalize negatives
          }
          return node;
        },
        additive: function (node) {
          if (node.op === Model.SUB) {
            assert(node.args.length === 2);
            node = binaryNode(Model.ADD, [node.args[0], negate(node.args[1])]);
          } else if (node.op === Model.PM) {
            assert(node.args.length === 2, "Operator \pm can only be used on binary nodes");
            node = binaryNode(Model.ADD, [
              node.args[0],
              unaryNode(Model.PM, [node.args[1]])
            ]);
          }
          var args = [];
          if (node.op === Model.MATRIX) {
            // Don't flatten matrix nodes.
            return node;
          }
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
          var hasPM;
          forEach(node.args, function (n) {
            n = normalize(n);
            if (ast.intern(n) === ast.intern(nodeOne)) {
              // If number node one, then erase it. Can't use mathValue here,
              // because it simplifies constant expressions.
              return;
            }
            if (args.length > 0 &&
                isMinusOne(n) &&
                isMinusOne(args[args.length-1])) {
              // Double negative, so erase both.
              args.pop();
              return;
            }
            if (n.op === Model.MUL) {
              // Flatten
              args = args.concat(n.args);
            } else if (n.op === Model.PM) {
              hasPM = true;
              args.push(n.args[0]);
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
          if (hasPM) {
            node = unaryNode(Model.PM, [node]);
          }
          return node;
        },
        unary: function(node) {
          var arg0 = normalize(node.args[0]);
          switch (node.op) {
          case Model.SUB:
            node = negate(arg0);
            break;
          case Model.PERCENT:
            node = multiplyNode([
              binaryNode(Model.POW, [
                numberNode("100"),
                nodeMinusOne
              ]), arg0]);
            break;
          case Model.PM:
            if (isNeg(mathValue(arg0, true))) {
              var args = node.args.slice(0);
              node = newNode(node.op, [negate(args.shift())].concat(args));
            }
            break;
          case Model.FACT:
            var mv = mathValue(arg0);
            if (mv) {
              node = numberNode(factorial(mv));
            } else {
              node = unaryNode(node.op, [arg0]);
            }
            break;
          default:
            node = unaryNode(node.op, [arg0]);
            break;
          }
          return node;
        },
        variable: function(node) {
          if (node.args[0] === "i" && !option("dontSimplifyImaginary")) {
            node = nodeImaginary;
          }
          return node;
        },
        exponential: function(node) {
          var args = [];
          switch(node.op) {
          case Model.LOG:
            // log_e has special meaning so don't normalize 'e' in that case.
            if (ast.intern(node.args[0]) === ast.intern(nodeE)) {
              args.push(nodeE);
            } else {
              args.push(normalize(node.args[0]));
            }
            break;
          default:
            args.push(normalize(node.args[0]));
            break;
          }
          args.push(normalize(node.args[1]));
          return binaryNode(node.op, args);
        },
        comma: function(node) {
          var vals = [];
          forEach(node.args, function (n) {
            vals = vals.concat(normalize(n));
          });
          var node = newNode(node.op, vals);
          return sort(node);
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
          if (node.op !== Model.COLON && !isZero(mathValue(node.args[1], true))) {
            // a=b -> a-b=0
            node = binaryNode(node.op, [
              binaryNode(Model.ADD, [
                node.args[0],
                multiplyNode([nodeMinusOne, node.args[1]], true) // flatten
              ], true),
              nodeZero,
            ]);
          } else if (!isZero(mathValue(node.args[1], true)) && !isOne(mathValue(node.args[1], true))) {
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
      while (nid !== ast.intern(node)) {
        nid = ast.intern(node);
        node = normalize(node);
      }
      node.normalizeNid = nid;
      normalizedNodes[rootNid] = node;
      return node;
    }

    var sortedNodes = [];
    function sort(root) {
      if (!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return 0;
      }
      var nid = ast.intern(root);
      if (root.sortNid === nid) {
        return root;
      }
      var cachedNode;
      if ((cachedNode = sortedNodes[nid]) !== undefined) {
        return cachedNode;
      }
      var rootNid = nid;
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
          if (node.op === Model.PM ||
              node.op === Model.BACKSLASH) {
            // Don't sort these kinds of nodes.
            return node;
          }
          var d0, d1;
          var n0, n1;
          var v0, v1;
          var cp0, cp1;
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
                } else if (isLessThan(constantPart(n0), constantPart(n1))) {
                  node.args[i] = n1;
                  node.args[i + 1] = n0;
                }
              } else if (d0 === 0) {
                if (exponent(n0) !== exponent(n1)) {
                  if (exponent(n0) < exponent(n1)) {
                    node.args[i] = n1;
                    node.args[i + 1] = n0;
                  }
                } else if (isLessThan((cp0 = abs(constantPart(n0))), (cp1 = abs(constantPart(n1))))) {
                  node.args[i] = n1;
                  node.args[i + 1] = n0;
                } else if (!cp0 && cp1) {
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
          if (node.op === Model.FRAC) {
            // Don't sort numerators and denominator
            return node;
          }
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
              } else if(v0.length === v1.length && v0.length > 0 && v0[0] < v1[0]) {
                // Swap adjacent elements
                node.args[i] = n1;
                node.args[i + 1] = n0;
              } else if (isLessThan(leadingCoeff(n0), leadingCoeff(n1))) {
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
          if (node.op === Model.COLON ||
              node.op === Model.RIGHTARROW ||
              node.op === Model.GT ||
              node.op === Model.GE ||
              node.op === Model.LT ||
              node.op === Model.LE ) {
            // If already normalized or ratio or chem, then don't sort toplevel terms.
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
            } else if (d0 === d1) {
              v0 = variables(n0);
              v1 = variables(n1);
              if (v0.length !== v1.length) {
                if(v0.length < v1.length) {
                  // Swap adjacent elements
                  var t = node.args[i];
                  node.args[i] = n1;
                  node.args[i + 1] = n0;
                }
              } else if (v0.length > 0) {
                if (v0[0] < v1[0]) {
                  // Swap adjacent elements
                  var t = node.args[i];
                  node.args[i] = n1;
                  node.args[i + 1] = n0;
                }
              } else if (!isZero(n1) && isLessThan(mathValue(n0), mathValue(n1))) {
                // Unless the RHS is zero, swap adjacent elements
                var t = node.args[i];
                node.args[i] = n1;
                node.args[i + 1] = n0;
              }
            }
          }
          return node;
        },
      });
      // If the node has changed, sort again
      while (nid !== ast.intern(node)) {
        nid = ast.intern(node);
        node = sort(node);
      }
      node.sortNid = nid;
      sortedNodes[rootNid] = node;
      return node;
    }

    function normalizeLiteral(root) {
      if (!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return 0;
      }
      var nid = ast.intern(root);
      if (root.normalizeLiteralNid === nid) {
        return root;
      }
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
          if (Model.option("ignoreOrder") && node.op === Model.SUB) {
            assert(args.length === 2);
            return binaryNode(Model.ADD, [args[0], negate(args[1])]);
          }
          return binaryNode(node.op, args);
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
          return binaryNode(node.op, args, true);
        },
        unary: function(node) {
          var args = [];
          forEach(node.args, function (n) {
            args.push(normalizeLiteral(n));
          });
          if (Model.option("ignoreOrder") && node.op === Model.SUB) {
            assert(args.length === 1);
            return negate(args[0]);
          }
          return newNode(node.op, args);
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
          if (option("ignoreOrder") &&
              (node.op === Model.GT ||
               node.op === Model.GE)) {
            // Swap adjacent elements and reverse the operator.
            assert(args.length === 2, "Internal error: comparisons have only two operands");
            var t = args[0];
            args[0] = args[1];
            args[1] = t;
            node.op = node.op === Model.GT ? Model.LT : Model.LE;
            node.args = args;
          } else {
            node.args = args;
          }
          return node;
        },
      });
      // If the node has changed, normalizeLiteral again
      while (nid !== ast.intern(node)) {
        nid = ast.intern(node);
        node = normalizeLiteral(node);
      }
      node.normalizeLiteralNid = nid;
      return node;
    }

    function normalizeExpanded(root) {
      if (!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return 0;
      }
      var nid = ast.intern(root);
      if (root.normalizeExpandedNid === nid) {
        return root;
      }
      var node = visit(root, {
        name: "normalizeExpanded",
        numeric: function (node) {
          return node;
        },
        additive: function (node) {
          var args = [];
          forEach(node.args, function (n) {
            args.push(normalizeExpanded(n));
          });
          node.args = args;
          return groupLikes(node);
        },
        multiplicative: function (node) {
          var equivLiteralDivAndFrac = false;
          var args = [];
          forEach(node.args, function (n) {
            args.push(normalizeExpanded(n));
          });
          node.args = args;
          return flattenNestedNodes(groupLikes(node));
        },
        unary: function(node) {
          var args = [];
          forEach(node.args, function (n) {
            args.push(normalizeExpanded(n));
          });
          node.args = args;
          return node;
        },
        exponential: function (node) {
          var args = [];
          forEach(node.args, function (n) {
            args.push(normalizeExpanded(n));
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
            args.push(normalizeExpanded(n));
          });
          node.args = args;
          return node;
        },
        equals: function(node) {
          var args = [];
          forEach(node.args, function (n) {
            args.push(normalizeExpanded(n));
          });
          node.args = args;
          return node;
        },
      });
      // If the node has changed, normalizeExpanded again
      while (nid !== ast.intern(node)) {
        nid = ast.intern(node);
        node = normalizeExpanded(node);
      }
      node.normalizeExpandedNid = nid;
      return node;
    }

    function isAggregate(node) {
      return node.op === Model.COMMA ||
        node.op === Model.LIST ||
        node.op === Model.MATRIX ||
        node.op === Model.INTERVAL;
    }

    function isAdditive(node) {
      return node.op === Model.ADD ||
        node.op === Model.SUB ||
        node.op === Model.PM ||
        node.op === Model.BACKSLASH;
    }

    function isMultiplicative(node) {
      return node.op === Model.MUL || node.op === Model.DIV;
    }

    function isInteger(node) {
      var mv;
      if (!node) {
        return false;
      }
      if (node.op === Model.NUM &&
          (mv = mathValue(node, true)) !== null &&
          isInteger(mv)) {
        return true;
      } else if (node instanceof BigDecimal) {
        return node.remainder(bigOne).compareTo(bigZero) === 0;
      }
      return false;
    }

    function isDecimal(node) {
      var mv;
      if (!node) {
        return false;
      }
      if (node.op === Model.NUM &&
          (mv = mathValue(node, true)) !== null &&
          !isInteger(mv)) {
        return true;
      } else if (node instanceof BigDecimal &&
                 !isInteger(node)) {
        return true;
      }
      return false;
    }

    function isRepeating(node) {
      assert(node.op === Model.NUM);
      return node.isRepeating;
    }

    function findRepeatingPattern(s, p, x) {
      if (!p) {
        assert((typeof s === "string") && s.length > 0);
        p = s.charAt(0);
        s = s.substring(1);
        x = "";
      }
      if (s.length === 0) {
        return p;
      }
      if (s.indexOf(p) === 0) {
        // p is a prefix of s, so continue checking
        x += p;
        s = s.substring(p.length);
        return findRepeatingPattern(s, p, x);
      } else {
        // p is not a prefix of s, so extend p by skipped digits
        p += x + s.charAt(0);
        x = "";
        s = s.substring(1);
        return findRepeatingPattern(s, p, x);
      }
    }

    function repeatingDecimalToFraction(node) {
      assert(isRepeating(node));
      var str = node.args[0];
      if (str.charAt(0) === "0") {
        str = str.slice(1);  // Trim off leading zero.
      }
      var pos = str.indexOf(".");
      var integerPart = str.slice(0, pos);
      var decimalPart = findRepeatingPattern(str.slice(pos+1));
      var decimalPlaces = decimalPart.length;
      // 0.3 --> 3/9
      // 0.12 --> 12/99 --> 4/33
      // 0.1212 --> 1212/9999 --> 4/33
      var numer = numberNode(integerPart + decimalPart);
      var denom = binaryNode(Model.ADD, [
        binaryNode(Model.POW, [numberNode("10"), numberNode(decimalPlaces)]),
        nodeMinusOne
      ]);
      return fractionNode(numer, denom);
    }

    function decimalToFraction(node) {
      assert(node.op === Model.NUM);
      if (isRepeating(node)) {
        return repeatingDecimalToFraction(node);
      }
      var str = node.args[0];
      if (str.charAt(0) === "0") {
        str = str.slice(1);  // Trim off leading zero.
      }
      var pos = str.indexOf(".");
      var decimalPlaces = str.length - pos - 1;
      var numer = numberNode(str.slice(0, pos) + str.slice(pos+1));
      var denom = binaryNode(Model.POW, [numberNode("10"), negate(numberNode(decimalPlaces))]);
      return multiplyNode([numer, denom]);
    }

    function isLessThan(n1, n2) {
      if (n1 && n1.op !== undefined) {
        n1 = mathValue(n1, true);
      }
      if (n2 && n2.op !== undefined) {
        n2 = mathValue(n2, true);
      }
      if (n1 === null || !(n1 instanceof BigDecimal) ||
          n2 === null || !(n1 instanceof BigDecimal)) {
        return false;
      }
      return n1.compareTo(n2) < 0;
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
        node, nodeOneHalf
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
      }
      if (isNaN(n)) {
        return null;
      }
      return toDecimal(Math.sqrt(n)).setScale(option("decimalPlaces"), BigDecimal.ROUND_HALF_UP);
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
      if (node.op === Model.NUM || node.op === Model.VAR) {
        return node;
      }
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

    // Map like factors to the same key.
    function factorGroupingKey(root) {
      if (!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return 0;
      }
      return visit(root, {
        name: "factorGroupingKey",
        exponential: function (node) {
          return factorGroupingKey(node.args[1]) + Model.POW +  factorGroupingKey(node.args[0]);
        },
        multiplicative: function (node) {
          var key = "";
          key += variables(node).join("");
          if (!key) {
            key = factorGroupingKey(node.args[0]);
          }
          return key;
        },
        additive: function (node) {
          var key = "";
          forEach(node.args, function (n) {
            key += "+" + factorGroupingKey(n);
          });
          return key;
        },
        unary: function(node) {
          return factorGroupingKey(node.args[0]);
        },
        numeric: function(node) {
          return Model.NUM;
        },
        variable: function(node) {
          return node.args[0];
        },
        comma: function(node) {
          return Model.COMMA;
        },
        equals: function(node) {
          return Model.EQL;
        },
      });
    }

    // Group like factors and terms into nodes that will simplify nicely.
    // We don't use the visitor mechanism because this is not recursive.
    var groupedNodes = [];
    function groupLikes(node) {
      var hash = {};
      var vp, keyid;
      if (node.op !== Model.MUL && node.op !== Model.ADD) {
        // We only care about factors and terms.
        return node;
      }
      assert(node.args.length > 1);
      var nid = ast.intern(node);
      var cachedNode;
      if ((cachedNode = groupedNodes[nid]) !== undefined) {
        return cachedNode;
      }
      var rootNid = nid;
      node = flattenNestedNodes(node);
      forEach(node.args, function (n, i) {
        var key;
        if (node.op === Model.MUL) {
          // If factors, then likes have same variables.
          key = factorGroupingKey(n);
        } else if (node.op === Model.ADD) {
          // If terms, likes have the same variable parts.
          key = variablePart(n);
        }
        if (!key) {
          var mv;
          // No variable key, so get a constant based key
          if ((mv = mathValue(n, true)) !== null) {
            // Group nodes that have computable math values.
            if (n.op === Model.POW) {
              mv = abs(mathValue(n.args[0], true));
              if (mv !== null) {
                key = "number";
              } else {
                key = "none";
              }
            } else {
              mv = abs(mv);
              if (mv !== null) {
                key = "number";
              } else {
                key = "none";
              }
            }
          } else {
            key = n;
          }
        }
        assert(key);
        if (typeof key === "string") {
          key = variableNode(key);
        }
        keyid = ast.intern(key);
        var list = hash[keyid] ? hash[keyid] : (hash[keyid] = []);
        list.push(n);
      });
      var args = [];
      var numberArgs = [];
      forEach(keys(hash), function (k) {
        // Group elements that hashed together. Keep a set of singleton numbers
        // to group together later.
        var exprs = hash[k];
        assert(exprs);
        var cp = [];
        var vp = [];
        // Separate the constant part from the variable part.
        forEach(exprs, function (n) {
          var c = constantPart(n);
          if (c) {
            cp.push(c);
          }
        });
        forEach(exprs, function (n) {
          var c = variablePart(n);
          if (c) {
            vp.push(c);
          }
        });
        if (cp.indexOf(null) >= 0) {
          // We've got some strange equation, so just return it as is.
          return node;
        }
        if (node.op === Model.ADD) {
          var nd;
          if (cp.length > 0) {
            // Combine all the constants.
            nd = binaryNode(node.op, cp);
            var mv = mathValue(nd);
            var tempArgs = [];
            if (mv !== null) {
              nd = numberNode(mv);
            } else {
              nd = simplify(nd, {dontGroup: true});
            }
          } else {
            nd = nodeOne;
          }
          if (vp.length > 0) {
            var v = vp[0];  // each element is the same
            if (isZero(nd)) {
              args.push(nodeZero);
            } else if (isOne(nd)) {
              args.push(v);
            } else {
              args.push(simplify(binaryNode(Model.MUL, [nd, v]), {dontGroup: true}));
            }
          } else if (nd) {
            if (nd.op === Model.NUM) {
              // At this point any node that has a math value will be a number node.
              numberArgs.push(nd);
            } else {
              args.push(nd);
            }
          }
        } else if (node.op === Model.MUL) {
          var nd;
          if (cp.length > 0) {
            // Combine all the constants.
            nd = binaryNode(node.op, cp);
            var mv = mathValue(nd);
            var tempArgs = [];
            if (mv !== null) {
              if (isOne(mv)) {
              } else {
                numberArgs.push(numberNode(mv.toString()));
              }
              nd = null;  // Factor out coefficient
            } else {
              nd = simplify(nd, {dontGroup: true});
            }
          } else {
            nd = null;
          }
          if (vp.length > 0) {
            if (nd === null || isOne(nd)) {
              args.push(simplify(binaryNode(Model.MUL, vp), {dontGroup: true}));
            } else if (isZero(nd)) {
              args.push(nodeZero);
            } else {
              args.push(simplify(binaryNode(Model.MUL, [nd].concat(vp)), {dontGroup: true}));
            }
          } else if (nd) {
            if (mathValue(nd, true)) {
              numberArgs.push(nd);
            } else {
              args.push(nd);
            }
          }
        } else {
          args.push(binaryNode(node.op, exprs));
        }
      });
      if (numberArgs.length > 0) {
        var nd = binaryNode(node.op, numberArgs);
        var mv = mathValue(nd);
        if (mv === null) {
          args.push(nd);
        } else {
          args.push(numberNode(mv));
        }
      }
      if (args.length === 0) {
        node = nodeOne;
      } else if (args.length === 1) {
        node = args[0];
      } else {
        node = binaryNode(node.op, args);
      }
      node = sort(node);
      groupedNodes[rootNid] = node;
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
      var result = !every(node.args, function (n) {
        // (x+3)(x+3) (xy^2)
        vpnid = ast.intern(n);
        list = hash[vpnid] ? hash[vpnid] : (hash[vpnid] = []);
        list.push(n);
        // If there are duplicates and those duplicates do not have multiple terms.
        return list.length < 2 || isAdditive(n);
      });
      return result;
    }

    function squareRoot(node) {
      var e = 2;  // The root size
      var args;
      if (node.op === Model.NUM) {
        args = factors(node, {}, false, true);
      } else if (node.op === Model.MUL) {
        args = node.args;
      } else {
        // FIXME handle other cases (e.g. Polynomials)
        return sqrtNode(node);
      }
      var hash = {};
      var vp, vpnid, list;
      forEach(args, function (n) {
        // (x+3)(x+3) (xy^2)
        vpnid = ast.intern(n);
        list = hash[vpnid] ? hash[vpnid] : (hash[vpnid] = []);
        list.push(n);
      });
      var inList = [], outList = [];
      forEach(keys(hash), function (k) {
        list = hash[k];
        if (list.length >= e) {
          while (list.length >= e) {
            outList.push(list[0]);
            list = list.slice(e);
          }
          inList = inList.concat(list);
        } else {
          inList = inList.concat(list);
        }
      });
      if (inList.length > 0) {
        outList = outList.concat(sqrtNode(multiplyNode(inList)));
      }
      return multiplyNode(outList);
    }

    function listNodeIDs(node) {
      var aa = [];
      if (node.op === Model.COMMA) {
        forEach(node.args, function(n) {
          aa.push(ast.intern(n));
        });
      } else {
        aa.push(ast.intern(node));
      }
      return aa;
    }

    function diffSets(n1, n2) {
      if (n1.op === Model.MUL) {
        assert(n1.args.length === 2);
        assert(n1.args[1].op === Model.COMMA);
        // Swap operands to undo sorting.
        var t = n2;
        n2 = n1.args[1];
        n1 = t;
      }
      var a1 = listNodeIDs(n1);
      var a2 = listNodeIDs(n2);
      var nids = filter(a1, function(i) {
        return indexOf(a2, i) < 0;
      });
      var args = [];
      forEach(nids, function (nid) {
        args.push(ast.node(nid));
      });
      return newNode(Model.COMMA, args);
    }

    function isPolynomialDenominatorWithNegativeTerm(node) {
      return node.op === Model.POW &&
        isMinusOne(node.args[1]) &&
        node.args[0].op === Model.ADD &&
        variables(node.args[0]).length > 0 &&
        some(node.args[0].args, function (n) {
          // Limit the complexity allowed.
          return isNeg(constantPart(n));
        });
    }

    var simplifiedNodes = [];
    function simplify(root, env, resume) {
      if (!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return 0;
      }
      assert(root.op !== Model.MUL || root.args.length > 1);
      var nid = ast.intern(root);
      if (root.simplifyNid === nid) {
        return root;
      }
      Assert.checkCounter();
      var node = Model.create(visit(root, {
        name: "simplify",
        numeric: function (node) {
          return node;
        },
        additive: function (node) {
          assert(node.op !== Model.SUB,
                 "simplify() additive node not normalized: " + JSON.stringify(node));
          if (node.op === Model.PM) {
            return node;
          }
          if (!env || !env.dontGroup) {
            node = groupLikes(node);
          }
          if (!isAdditive(node)) {
            // Have a new kind of node so start over.
            return node;
          }
          // Simplify kids
          var args = [];
          forEach(node.args, function (n, i) {
            args = args.concat(simplify(n, env));
          });
          node = newNode(node.op, args);
          if (node.op === Model.PM) {
            return node;
          } else if (node.op === Model.BACKSLASH ||
                     node.op === Model.ADD &&
                     node.args.length === 2 &&
                     node.args[0].op === Model.MUL &&
                     node.args[0].args.length === 2 &&
                     node.args[0].args[0].op === Model.NUM &&
                     node.args[0].args[0].args[0] === "-1" &&
                     node.args[0].args[1].op === Model.COMMA &&
                     node.args[1].op === Model.COMMA) {
            return diffSets(node.args[0], node.args[1]);
          }
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
          var n0 = [simplify(args.shift(), env)];
          // For each next value, pop last value and fold it with next value.
          forEach(args, function (n1, i) {
            n1 = simplify(n1, env);
            n0 = n0.concat(fold(n0.pop(), n1));
          });
          if (n0.length < 2) {
            node = n0[0];
          } else {
            node = binaryNode(node.op, n0);
          }
          assert(node.args.length > 0);
          return node;
          function commonDenom(node) {
            // 1/2+2/3
            // ((1/2)(2*3)+(2/3)(2*3))/6
            // (3+4)/6
            // 7/6
            var n0 = node.args;
            if (!isChemCore()) {
              // Make common denominator
              // Get denominators
              var denoms = [];
              forEach(n0, function (n1) {
                // Add current node's denominator to the list.
                denoms = denom(n1, denoms);
              });
              if (denoms.length > 1 || (denoms.length === 1 && !isOne(denoms[0]))) {
                // We have a non-trivial common denominator.
                var denominator = binaryNode(Model.POW, [multiplyNode(denoms, true), nodeMinusOne]);
                var n2 = [];
                // For each term get the numerator based on the common denominator.
                forEach(n0, function (n1) {
                  var d, n;
                  // 2/x+3/y -> (2y+3x)/(xy)
                  // .5x+.2y -> (2x+5y)/10
                  d = denom(n1, []);
                  n = numer(n1, d[0], denoms);
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
            // Denominators are in positive power form.
            // n = node to get numerator of.
            // d = denominator of current node.
            // denoms = all common denominators.
            // n/d/denoms
            var dd = denoms.slice(0); // Copy
            var ff = factors(n, {}, true, true);
            var hasNumer = false;
            var n0, nn = [];
            forEach(ff, function (n) {
              if (n.op !== Model.POW || !isNeg(mathValue(n.args[1], true))) {
                // Is a numerator
                nn.push(n);
              }
            });
            if (nn.length === 0) {
              // If no denominator, then add 1 if not already there.
              n0 = nodeOne;
            } else {
              n0 = multiplyNode(nn);
            }
            // Multiply top common denominator. Simplify to cancel factors.
            var nid0 = ast.intern(d);
            var index = -1;
            some(dd, function (n, i) {
              var nid1 = ast.intern(n);
              if (nid0 === nid1) {
                index = i;
                return true;
              }
              return false
            });
            if (index > -1) {
              dd.splice(index, 1);
            }
            return multiplyNode([].concat(n0).concat(dd), true);
          }
          function denom(n, denoms) {
            // If the current node has a different denominator as those in denoms,
            // then add it. Denominators are in positive power form.
            var ff = factors(n, {}, true, true);
            var hasDenom = false;
            var d0, dd = [];
            forEach(ff, function (n) {
              d0 = n.args[0];
              if (n.op === Model.POW && isNeg(mathValue(n.args[1], true))) {
                dd.push(binaryNode(Model.POW, [d0, simplify(negate(n.args[1]), env)]));
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
              return ast.intern(d) !== ast.intern(d0);
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
              var mvldenom = mathValue(ldenom, true);
              var mvrdenom = mathValue(rdenom, true);
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
            var lcoeff = constantPart(lnode);
            var rcoeff = constantPart(rnode);
            if (isZero(lcoeff)) {
              return rnode;
            }
            if (isZero(rcoeff)) {
              return lnode;
            }
            if (ldegr === rdegr) {
              // Have two terms of the same degree
              var lvpart = variablePart(lnode);
              var rvpart = variablePart(rnode);
              // combine terms with like factors
              if (lvpart !== null && rvpart !== null &&
                  ast.intern(lvpart) === ast.intern(rvpart)) {
                var c = binaryNode(Model.ADD, [lcoeff, rcoeff]);
                var cmv = mathValue(c);
                if (isZero(cmv)) {
                  return nodeZero;
                } else if (isOne(cmv)) {
                  return lvpart;
                }
                return multiplyNode([c, lvpart]);
              } else if (lnode.op === Model.LOG && rnode.op === Model.LOG &&
                         (ast.intern(lnode.args[0]) === ast.intern(rnode.args[0]))) {
                return simplify(newNode(Model.LOG, [lnode.args[0], multiplyNode([lnode.args[1], rnode.args[1]])]), env);
              } else if (ldegr === 0 && rdegr === 0) {
                // Have two constants
                var mv1 = mathValue(lnode, true);
                var mv2 = mathValue(rnode, true);
                if (isInteger(mv1) && isInteger(mv2)) {
                  return numberNode(mv1.add(mv2));
                } else if (ast.intern(lnode) === ast.intern(rnode)) {
                  return multiplyNode([numberNode("2"), lnode]);
                } else if ((!env || !env.dontGroup) && !option("dontFactorTerms") && commonFactors(lnode, rnode).length > 0) {
                  return [factorTerms(lnode, rnode)];
                } else {
                  return [lnode, rnode];
                }
              }
            }

            if (ast.intern(lnode) === ast.intern(rnode)) {
              return multiplyNode([numberNode("2"), lnode]);
            } else if (isZero(mathValue(lcoeff))) {
              return rnode;
            } else if (isZero(mathValue(rcoeff))) {
              return lnode;
            } else if (!option("dontFactorTerms") && !isOne(mathValue(lcoeff)) && !isOne(mathValue(rcoeff))) {
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
          if (!env || !env.dontGroup) {
            node = groupLikes(node);
          }
          if (!isMultiplicative(node)) {
            // Have a new kind of node start over.
            return node;
          }
          var nid = ast.intern(node);
          var args = node.args.slice(0);
          var n0 = [simplify(args.shift(), env)];
          if (n0[0].op === Model.MUL) {
            // flatten
            n0 = n0[0].args.slice(0);
          }
          // For each next value, pop last value and fold it with next value.
          forEach(args, function (n1, i) {
            n1 = simplify(n1, env);
            n0 = n0.concat(fold(n0.pop(), n1));
          });
          if (n0.length < 2) {
            node = n0[0];
          } else {
            assert(n0.length);
            node = sort(flattenNestedNodes(multiplyNode(n0)));
          }
          node = cancelFactors(node);
          return node;
          function fold(lnode, rnode) {
            if (isUndefined(lnode) || isUndefined(rnode)) {
              return undefinedNode();
            }
            var ldegr = degree(lnode);
            var rdegr = degree(rnode);
            var lvars = variables(lnode);
            var rvars = variables(rnode);
            var lvpart = variablePart(lnode);
            var rvpart = variablePart(rnode);
            var lcoeff = constantPart(lnode);
            var rcoeff = constantPart(rnode);
            var lcoeffmv = mathValue(lcoeff, true);
            var rcoeffmv = mathValue(rcoeff, true);
            if (ldegr === 0 && isZero(lcoeffmv) ||
                rdegr === 0 && isZero(rcoeffmv)) {
              if (units(lnode).length || units(rnode).length) {
                // Don't erase units.
                return [lnode, rnode];
              } else {
                return nodeZero;
              }
            } else if (ldegr === 0 && isOne(lcoeffmv)) {
              return rnode;
            } else if (rdegr === 0 && isOne(rcoeffmv)) {
              return lnode;
            } else  if (isInfinity(lnode)) {
              if (isNeg(rnode)) {
                return negate(lnode);
              } else {
                return lnode;
              }
            } else if (isInfinity(rnode)) {
              if (isNeg(lnode)) {
                return negate(rnode);
              } else {
                return rnode;
              }
            } else if (ldegr === 0 && rdegr === 0) {
              if (isOne(rcoeffmv) && isOne(lcoeffmv)) {
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
                  if (isMinusOne(lbase) || isMinusOne(rbase)) {
                    node = [lnode, rnode];
                  } else {
                    node = multiplyNode([numberNode(lbase), numberNode(rbase)]);
                    if ((mv = mathValue(node))) {
                      node = numberNode(mv);
                    }
                    if (lexpo === -1) {
                      node = binaryNode(Model.POW, [node, nodeMinusOne]);
                    }
                  }
                } else {
                  // We've got a fraction to simplify
                  var mv;
                  if (isZero(lnode)) {
                    node = nodeZero;
                  } else if ((mv = mathValue(multiplyNode([lnode, rnode])))) {
                    node = numberNode(mv);
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
                         ast.intern(lnode.args[1]) === ast.intern(rnode.args[1])) {
                // x^z*y^z -> (x*y)^z
                var lbase = lnode.args[0];
                var rbase = rnode.args[0];
                var lexpo = exponent(lnode);
                var rexpo = exponent(rnode);
                if (lexpo === 0.5 &&
                    ast.intern(lbase) === ast.intern(rbase)) {
                  // Found square of square roots, so simplify
                  node = lbase;
                } else {
                  node = [lnode, rnode];
                }
              } else {
                node = [lnode, rnode];
              }
            } else if (lvpart && rvpart && ast.intern(lvpart) === ast.intern(rvpart)) {
              // one or both nodes contain var
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
            } else if (ast.intern(lnode.op === Model.POW ? lnode.args[0] : lnode) ===
                       ast.intern(rnode.op === Model.POW ? rnode.args[0] : rnode)) {
              // Same base, different exponents
              var b, el, er;
              if (lnode.op === Model.POW) {
                b = lnode.args[0];
              } else {
                b = lnode;
              }
              if (lnode.op === Model.POW) {
                el = lnode.args[1];
              } else {
                el = nodeOne;
              }
              if (rnode.op === Model.POW) {
                er = rnode.args[1];
              } else {
                er = nodeOne;
              }
              var e = simplify(binaryNode(Model.ADD, [el, er]), env);
              if (isZero(e)) {
                // x^0 = 1
                node = nodeOne;
              } else if (isOne(e)) {
                // x^1 = x
                node = b;
              } else {
                node = binaryNode(Model.POW, [b, e]);
              }
            } else if (ldegr === 0 && isOne(lcoeffmv)) {
              return rnode;
            } else if (rdegr === 0 && isOne(rcoeffmv)) {
              return lnode;
            } else if (ldegr === 0) {
              if (sign(lnode) < 0 && isPolynomialDenominatorWithNegativeTerm(rnode)) {
                // If lnode is negative and rnode is a polynomial denominator, then invert
                return [negate(lnode), expand(negate(rnode))];
              }
              var v = mathValue(lnode);
              if (v !== null) {
                node = [numberNode(v), rnode];
              } else {
                node = [lnode, rnode];
              }
            } else if (rdegr === 0) {
              var v = mathValue(rnode);
              if (v !== null) {
                node = [numberNode(v), lnode];  // coeffs first
              } else {
                node = [lnode, rnode];
              }
            } else if (option("dontExpandPowers") &&
                       lnode.op === Model.POW && rnode.op === Model.POW &&
                       ast.intern(lnode.args[1]) === ast.intern(rnode.args[1])) {
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
            if (lnode.op === Model.PM || rnode.op === Model.PM) {
              if (node instanceof Array) {
                node = binaryNode(Model.PM, node);
              } else {
                node = unaryNode(Model.PM, [node]);
              }
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
          case Model.PM:
            node = unaryNode(node.op, [simplify(node.args[0], env)]);
            break;
          default:
            node = unaryNode(node.op, [simplify(node.args[0], env)]);
          }
          return node;
        },
        exponential: function (node) {
          var base = node.args[0];
          // Make a copy of and reverse args to work from right to left
          var nid = ast.intern(node);
          var args = node.args.slice(0).reverse();
          var n0 = [simplify(args.shift(), env)];
          // For each next value, pop last value and fold it with next value.
          forEach(args, function (n1, i) {
            n1 = simplify(n1, env);
            n0 = n0.concat(fold(node.op, n0.pop(), n1));
          });
          if (n0.length === 1) {
            var n = n0[0];
            if (n.op !== Model.NUM || isInteger(n) ||
               isInfinity(n) ||
               isUndefined(n)) {
              // If the result is not a number or is a whole number, then return it
              node = n;
            } // Otherwise return the orginal expression.
          } else {
            if (isInfinity(n0[1]) && isNeg(n0[0])) {
              return nodeZero;
            }
            node = binaryNode(node.op, n0.reverse());
          }
          return node;
          function fold(op, expo, base) {
            var mv, node;
            var bmv = mathValue(base);
            var emv = mathValue(expo, {}, true);
            if (op === Model.POW) {
              if (isZero(bmv)) {
                // 0^x
                if (isNeg(emv)) {
                  return [undefinedNode()];
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
              } else if (ast.intern(base) === ast.intern(nodeImaginary) && emv !== null) {
                if (emv.remainder(bigFour).compareTo(bigZero) === 0) {
                  return [nodeOne];
                } else if (emv.remainder(bigThree).compareTo(bigZero) === 0) {
                  return [multiplyNode([nodeMinusOne, nodeImaginary])];
                } else if (emv.remainder(bigTwo).compareTo(bigZero) === 0) {
                  return [nodeMinusOne];
                } else if (emv.remainder(bigOne).compareTo(bigZero) === 0) {
                  return [nodeImaginary];
                }
                return [expo, base];
              } else if (ast.intern(expo) === ast.intern(nodeOneHalf)) {
                // \sqrt{x}
                return squareRoot(base);
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
              } else if (bmv !== null && emv !== null && !isNeg(bmv)) {
                // 2^3, 16^(-1*1^-2)
                var b = pow(bmv, emv)
                base = numberNode(b);
                return base;
                if (ff.length === 0) {
                  return base;
                } else if (ff.length === 1) {
                  return [ff[0], base];
                } else {
                  if (ff.length === 0) assert(false);
                  return [multiplyNode(ff), base];
                }
              } else {
                var b = pow(bmv, emv);
                if (b !== null) {
                  return numberNode(b);
                }
              }
            } else if (op === Model.LOG) {
              if (emv !== null && isE(base)) {
                var mv = toDecimal(Math.log(toNumber(emv)));
                if (isInteger(mv)) {
                  return numberNode(mv);
                }
              }
            }
            // x^2, x^y
            return [expo, base];
          }
        },
        variable: function(node) {
          var val, n;
          var env = Model.env;
          if (node.args[0] === "e") {
            node = numberNode(Math.E);
          }
          return node;
        },
        comma: function(node) {
          var args = [];
          forEach(node.args, function (n) {
            args = args.concat(simplify(n, env));
          });
          return newNode(node.op, args);
        },
        equals: function(node) {
          var args = [];
          forEach(node.args, function (n) {
            args = args.concat(simplify(n, env));
          });
          assert(args.length === 2);
          if (isZero(args[1])) {
            var mv = mathValue(args[0], true);
            if (mv !== null) {
              // If its a number, then we're done.
              return newNode(node.op, args);
            }
            var ff = factors(args[0], {}, true, true, true);
            if (isMinusOne(ff[0])) {
              // Drop the leading negative one.
              ff.shift();
            }
            var args0 = [];
            var foundZero = false;
            forEach(ff, function (n) {
              var mv = mathValue(n, true);
              if (foundZero ||
                  mv !== null && !isZero(mv) && ff.length > 1 ||
                  n.op === Model.VAR && units(n).length > 0 && ff.length > 1 ||  // $, cm, s^2
                  n.op === Model.POW && units(n.args[0]).length > 0 && mathValue(n.args[0]) !== null && ff.length > 1 ||  // $, cm, s^2
                  n.op === Model.POW && isNeg(mathValue(n.args[1]))) {
                // Ignore constant factors including units, unless they are alone.
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
            if (node.op === Model.EQL && sign(args[0]) < 0) {
              args[0] = expand(multiplyNode([nodeMinusOne, args[0]]));
            }
          }
          return newNode(node.op, args);
        },
      }), root.location);
      // If the node has changed, simplify again
      while (nid !== ast.intern(node)) {
        nid = ast.intern(node);
        node = simplify(node, env);
      }
      node.simplifyNid = nid;
//      simplifiedNodes[rootNid] = node;
      return node;
    }

    function leadingCoeff(node) {
      var tt, c;
      switch (node.op) {
      case Model.ADD:
        c = constantPart(node.args[0]);
        break;
      default:
        c = constantPart(node);
        break;
      }
      return c;
    }

    function sign(node) {
      var s = 0;
      var tt = terms(node);
      forEach(tt, function (n) {
        var mv = mathValue(n);
        if (isNeg(leadingCoeff(n))) {
          s -= 1;
        } else {
          s += 1;
        }
      });
      if (s === 0) {
        if (isNeg((leadingCoeff(tt[0])))) {
          s = -1;
        } else {
          s = 1;
        }
      }
      return s;
    }

    function base(node) {
      // Return the base if it is a number.
      var op = node.op;
      var base = op === Model.POW
        ? mathValue(node.args[0])
        : mathValue(node);
      return base;
    }

    function exponent(node) {
      return node.op === Model.POW ? toNumber(mathValue(node.args[1], {}, true)) : 1;
    }

    function log(b, x) {
      return Math.log(x) / Math.log(b);
    }

    // Return the math value of an expression, or null if the expression does
    // not have a math value.

    function mathValue(root, env, allowDecimal) {
      if (allowDecimal === undefined && typeof env === "boolean") {
        allowDecimal = env;
        env = {};
      }
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
          if (isUndefined(node)) {
            return null;
          }
          return toDecimal(node.args[0]);
        },
        additive: function (node) {
          if (node.op === Model.PM) {
            return null;
          }
          // Simplify each side.
          var val = bigZero;
          forEach(node.args, function (n) {
            var mv = mathValue(n, env, true);
            if (mv && val) {
              val = val.add(mv);
            } else {
              val = null;   // bd === null is NaN
            }
          });
          if (allowDecimal || isInteger(val)) {
            return val;
          } else {
            return null;
          }
        },
        multiplicative: function (node) {
          // Allow decimal if the option 'allowDecimal' is set to true or
          // if at least one of the operands is a decimal.
          var val = bigOne;
          forEach(node.args, function (n) {
            var mv = mathValue(n, env, true);
            if (val !== null && mv != null) {
              val = val.multiply(mv);
            } else {
              val = null;
            }
          });
          if (allowDecimal || isInteger(val)) {
            return val;
          }
          return null;
        },
        unary: function(node) {
          switch (node.op) {
          case Model.SUB:
            var val = mathValue(node.args[0], env, allowDecimal);
            if (val === null) {
              return null;
            }
            return val.multiply(bigMinusOne);
          case Model.FACT:
            var n = mathValue(node.args[0], env, allowDecimal);
            if (n) {
              return toDecimal(factorial(n));
            } else {
              return null;
            }
          case Model.M:
            var args = [];
            // M.args[0] -> ADD.args
            if (node.args[0].op === Model.MUL) {
              forEach(node.args[0].args, function (n) {
                assert(n.op === Model.VAR, "Internal error: invalid arguments to the \M tag");
                var sym = Model.env[n.args[0]];
                assert(sym && sym.mass, "Internal error: missing chemical symbol");
                var count = n.args[1] ? toNumber(mathValue(n.args[1], env, allowDecimal)) : 1;
                args.push(numberNode(sym.mass * count));
              });
            } else {
              // Just have one VAR node.
              var n = node.args[0];
              assert(n.op === Model.VAR, "Internal error: invalid arguments to the \M tag");
              var sym = Model.env[n.args[0]];
              assert(sym && sym.mass, "Internal error: missing chemical symbol");
              var count = n.args[1] ? toNumber(mathValue(n.args[1], env, allowDecimal)) : 1;
              args.push(numberNode(sym.mass * count));
            }
            return mathValue(makeTerm(args), env, allowDecimal);
          case Model.ABS:
            return abs(mathValue(node.args[0], env, allowDecimal));
          case Model.SIN:
          case Model.COS:
          case Model.TAN:
          case Model.ARCSIN:
          case Model.ARCCOS:
          case Model.ARCTAN:
            if (allowDecimal) {
              var val = mathValue(toRadians(node.args[0]), env, allowDecimal);
              return trig(val, node.op);
            }
            return null;
          case Model.ADD:
            return mathValue(node.args[0], env, allowDecimal);
          case Model.DEGREE:
            return mathValue(toRadians(node.args[0]), env, allowDecimal);
          default:
            return null;
          }
        },
        exponential: function (node) {
          // Allow decimal if the option 'allowDecimal' is set to true or
          // if at least one of the operands is a decimal.
          var args = node.args.slice(0).reverse();
          var val = mathValue(args.shift(), env, allowDecimal);
          var op = node.op;
          if (op === Model.POW) {
            forEach(args, function (n) {
              var mv = mathValue(n, env, true);
              if (val !== null && mv != null) {
                val = pow(mv, val);
              } else {
                val = null;
              }
            });
          } else if (op === Model.LOG) {
            assert(args.length === 1);
            var mv;
            var emv = val;
            var base = args[0];
            var bmv = mathValue(base, true);
            if (emv !== null) {
              if (bmv !== null) {
                val = logBase(bmv, emv);
              } else if (base.op === Model.VAR && base.args[0] === "e") {
                val = toDecimal(Math.log(toNumber(emv)));
              }
            }
          }
          if (allowDecimal || isInteger(val)) {
            return val;
          }
          return null;
        },
        variable: function(node) {
          var val, n;
          if (env && (val = env[node.args[0]])) {
            switch (val.type) {
            case "unit":
              n = val.value;
              break;
            default:
              n = val;
              break;
            }
            return toDecimal(n);
          }
          return null;
        },
        comma: function(node) {
          return null;
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
          return [];
        },
        numeric: function(node) {
          return [];
        },
        variable: function(node) {
          var val, env = Model.env;
          if (env && (val = env[node.args[0]])) {
            if (val.type === "unit") {
              return [node.args[0]];
            }
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

    function dummy(root, env, resume) {
      console.log("dummy() root=" + JSON.stringify(root, null, 2));
      if (!root || !root.args) {
        // FIXME pass resume to assert
        assert(false, "Should not get here. Illformed node.");
      }
      var nid = Ast.intern(root);
      visit(root, {
        name: "dummy",
        exponential: function (node) {
          //Helper.dummy(node, {}, resume);
        },
        multiplicative: function (node) {
          resume(null, node);
        },
        additive: function (node) {
          resume(null, node);
        },
      }, function (err, val) {
        if (Ast.intern(val) === nid) {
          // Found a fixed point. Resume.
          resume(err, val);
        }
        // Do it again.
        dummy(val, env, resume);
      });
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

    var expandedNodes = [];
    function expand(root, env) {
      if (!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return 0;
      }
      var nid = ast.intern(root);
      if (root.expandNid === nid) {
        return root;
      }
      var cachedNode;
      if ((cachedNode = expandedNodes[nid]) !== undefined) {
        return cachedNode;
      }
      var rootNid = nid;
      var node = Model.create(visit(root, {
        name: "expand",
        numeric: function (node) {
          assert(typeof node.args[0] === "string");
          return node;
        },
        additive: function (node) {
          var nid = ast.intern(node);
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
          if (node.op === Model.MATRIX) {
            // Don't flatten matrix nodes.
            return node;
          }
          if (node.op === Model.MATRIX) {
            // Don't flatten matrix nodes.
            return node;
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
          var nid = ast.intern(node);
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
          if (node.op === Model.MATRIX) {
            // Don't flatten matrix nodes.
            return node;
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
          var nid = ast.intern(node);
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
            if (!isE(base)) {
              node2 = binaryNode(Model.MUL, [
                binaryNode(Model.LOG, [nodeE, expo]),
                binaryNode(Model.POW, [
                  binaryNode(Model.LOG, [nodeE, base]),
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
                  } else if (ea < 10 && (isAdditive(n) || !dontExpandPowers)) {
                    // Expand if the base is additive, or exponent is an integer and
                    // dontExpandPowers is false. We limit the power of the expansion
                    // to avoid long running computations.
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
                  var c = constantPart(expo);
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
      while (nid !== ast.intern(node)) {
        nid = ast.intern(node);
        node = expand(node);
      }
      node.expandNid = nid;
      expandedNodes[rootNid] = node;
      return node;
    }

    function factors(root, env, ignorePrimeFactors, preserveNeg, factorAdditive) {
      if (!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return 0;
      }
      return visit(root, {
        name: "factors",
        numeric: function (node) {
          if (ignorePrimeFactors || isInfinity(node)) {
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
          if (!factorAdditive) {
            // Actually, we have a repeating decimal. So no factors here.
            return [node];
          }
          var args = node.args.slice(0);  // make a copy
          var n0 = [multiplyNode(factors(args.shift(), {}, true, true))];
          // For each next value, pop last value and look for common factors with the next value.
          forEach(args, function (n1, i) {
            n1 = multiplyNode(factors(n1, {}, true, true));
            var n;
            if (commonFactors((n = n0.pop()), n1).length > 0) {
              n0 = n0.concat(factorTerms(n, n1));
            } else {
              n0 = n0.concat([n, n1]);
            }
          });
          if (n0.length === 1 && n0[0].op === Model.MUL) {
            return n0[0].args;
          }
          return [node];
        },
        multiplicative: function (node) {
          switch (node.op) {
          case Model.MUL:
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
          ff.push(ast.intern(n));
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
        if ((i = indexOf(cf, ast.intern(f))) === -1) {
          lfacts2.push(f);
        } else {
          delete cf[i];  // erase the matched factor
        }
      });
      var cf = cfacts.slice(0);
      forEach(rfacts, function (f) {
        if ((i = indexOf(cf, ast.intern(f))) === -1) {
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
        args.push(ast.node(i));
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
      var node = Model.create(visit(root, {
        name: "scale",
        exponential: function (node) {
          var mv, nd;
          if ((mv = mathValue(node, true)) &&
              (nd = numberNode(mv, true))) {
            return nd;
          }
          var args = [];
          forEach(node.args, function (n) {
            args.push(scale(n));
          });
          return newNode(node.op, args);
        },
        multiplicative: function (node) {
          var mv, nd;
          if ((mv = mathValue(node, true)) &&
              (nd = numberNode(mv, true))) {
            return nd;
          }
          var args = [];
          var mv2 = bigOne;
          forEach(node.args, function (n) {
            if ((mv = mathValue(multiplyNode([numberNode(mv2), n]), true))) {
              mv2 = mv;
            } else {
              args.push(scale(n));
            }
          });
          if (!isOne(mv2)) {
            args.unshift(numberNode(mv2, true));
          }
          return multiplyNode(args);
        },
        additive: function (node) {
          var mv;
          if ((mv = mathValue(node, true))) {
            return numberNode(mv, true);
          }
          var args = [];
          var mv2 = bigZero;
          forEach(node.args, function (n) {
            if ((mv = mathValue(binaryNode(Model.ADD, [numberNode(mv2), n]), true))) {
              mv2 = mv;
            } else {
              args.push(scale(n));
            }
          });
          if (!isZero(mv2)) {
            args.unshift(numberNode(mv2, true));
          }
          return binaryNode(Model.ADD, args);
        },
        unary: function(node) {
          var mv;
          if ((mv = mathValue(node, true))) {
            return numberNode(mv, true);
          }
          return unaryNode(node.op, [scale(node.args[0])]);
        },
        numeric: function(node) {
          return numberNode(node.args[0], true);
        },
        variable: function(node) {
          if (node.args[0] === "\\pi") {
            node = numberNode(Math.PI, true);
          }
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
      }), root.location);
      return node;
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
              ff.push(ast.intern(n));
            });
            t2.push(ff);
          });
          // Check to see if there are any common factors (ids). Start with the
          // factors of the first term.
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
            if (d === Number.POSITIVE_INFINITY) {
              // x^y
              assert(false, message(2003));
              return undefined;
            }
          })) {
            return true;
          } else if (some(t1, function (n) {
            var d = degree(n, true);
            if (d >= 0 && d < 2) {
              // x+y^2+xy
              return true;
            }
          })) {
            return true;
          }
          assert(vars.length < 2, message(2001));
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
        var n1 = negate(numberNode(n));
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
        r = toNumber(mathValue(r, true));
        var nn = variables(node);
        assert(nn.length === 1);
        var env = {};
        env[nn[0]] = r;
        var x = toNumber(mathValue(node, env, true));
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
        cc[d] = cc[d] + toNumber(mathValue(constantPart(v)));
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
      if (absN <= 1 || isNaN(n) || isInfinity(n)) {
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
    this.normalizeExpanded = normalizeExpanded;
    this.normalizeLiteral = normalizeLiteral;
    this.normalizeSyntax = normalizeSyntax;
    this.degree = degree;
    this.constantPart = constantPart;
    this.variables = variables;
    this.variablePart = variablePart;
    this.sort = sort;
    this.simplify = simplify;
    this.dummy = dummy;
    this.expand = expand;
    this.terms = terms;
    this.factors = factors;
    this.isFactorised = isFactorised;
    this.mathValue = mathValue;
    this.units = units;
    this.scale = scale;
    this.hasLikeFactors = hasLikeFactors;
    this.factorGroupingKey = factorGroupingKey;
  }

  var visitor = new Visitor(new Ast);
  function degree(node, notAbsolute) {
    var visitor = new Visitor(new Ast);
    return visitor.degree(node, notAbsolute);
  }

  function constantPart(node) {
    var visitor = new Visitor(new Ast);
    return visitor.constantPart(node);
  }

  function variables(node) {
    var visitor = new Visitor(new Ast);
    return visitor.variables(node);
  }

  function variablePart(node) {
    var visitor = new Visitor(new Ast);
    return visitor.variablePart(node);
  }

  function sort(node) {
    var visitor = new Visitor(new Ast);
    var prevLocation = Assert.location;
    if (node.location) {
      Assert.setLocation(node.location);
    }
    var result = visitor.sort(node);
    Assert.setLocation(prevLocation);
    return result;
  }

  function normalize(node) {
    var visitor = new Visitor(new Ast);
    var prevLocation = Assert.location;
    if (node.location) {
      Assert.setLocation(node.location);
    }
    var result = visitor.normalize(node);
    Assert.setLocation(prevLocation);
    return result;
  }

  function normalizeLiteral(node) {
    var visitor = new Visitor(new Ast);
    var prevLocation = Assert.location;
    if (node.location) {
      Assert.setLocation(node.location);
    }
    var result = visitor.normalizeLiteral(node);
    Assert.setLocation(prevLocation);
    return result;
  }

  function normalizeSyntax(node, ref) {
    var visitor = new Visitor(new Ast);
    var prevLocation = Assert.location;
    if (node.location) {
      Assert.setLocation(node.location);
    }
    var result = visitor.normalizeSyntax(node, ref);
    Assert.setLocation(prevLocation);
    return result;
  }

  function normalizeExpanded(node) {
    var visitor = new Visitor(new Ast);
    var prevLocation = Assert.location;
    if (node.location) {
      Assert.setLocation(node.location);
    }
    var result = visitor.normalizeExpanded(node);
    Assert.setLocation(prevLocation);
    return result;
  }

  function mathValue(node, env, allowDecimal) {
    var visitor = new Visitor(new Ast);
    var prevLocation = Assert.location;
    if (node.location) {
      Assert.setLocation(node.location);
    }
    var result = visitor.mathValue(node, env, allowDecimal);
    Assert.setLocation(prevLocation);
    return result;
  }

  function units(node, env) {
    var visitor = new Visitor(new Ast);
    var prevLocation = Assert.location;
    if (node.location) {
      Assert.setLocation(node.location);
    }
    var result = visitor.units(node, env);
    Assert.setLocation(prevLocation);
    return result;
  }

  function simplify(node, env) {
    var visitor = new Visitor(new Ast);
    var prevLocation = Assert.location;
    if (node.location) {
      Assert.setLocation(node.location);
    }
    var result = visitor.simplify(node, env);
    Assert.setLocation(prevLocation);
    return result;
  }

  function dummy(node, env, resume) {
    var prevLocation = Assert.location;
    if (node.location) {
      Assert.setLocation(node.location);
    }
    visitor.dummy(node, env, function (err, val) {
      Assert.setLocation(prevLocation);
      resume(err, val);
    });
  }

  function hasLikeFactors(node, env) {
    var visitor = new Visitor(new Ast);
    var prevLocation = Assert.location;
    if (node.location) {
      Assert.setLocation(node.location);
    }
    var result = visitor.hasLikeFactors(node, env);
    Assert.setLocation(prevLocation);
    return result;
  }

  function expand(node, env) {
    var visitor = new Visitor(new Ast);
    var prevLocation = Assert.location;
    if (node.location) {
      Assert.setLocation(node.location);
    }
    var result = visitor.expand(node, env);
    Assert.setLocation(prevLocation);
    return result;
  }

  function terms(node, env) {
    var visitor = new Visitor(new Ast);
    var prevLocation = Assert.location;
    if (node.location) {
      Assert.setLocation(node.location);
    }
    var result = visitor.terms(node, env);
    Assert.setLocation(prevLocation);
    return result;
  }

  function factorGroupingKey(node, env) {
    var visitor = new Visitor(new Ast);
    var prevLocation = Assert.location;
    if (node.location) {
      Assert.setLocation(node.location);
    }
    var result = visitor.factorGroupingKey(node, env);
    Assert.setLocation(prevLocation);
    return result;
  }

  function factors(node, env) {
    var visitor = new Visitor(new Ast);
    var prevLocation = Assert.location;
    if (node.location) {
      Assert.setLocation(node.location);
    }
    var result = visitor.factors(node, env);
    Assert.setLocation(prevLocation);
    return result;
  }

  function isFactorised(node, env) {
    var visitor = new Visitor(new Ast);
    var prevLocation = Assert.location;
    if (node.location) {
      Assert.setLocation(node.location);
    }
    var result = visitor.isFactorised(node, env);
    Assert.setLocation(prevLocation);
    return result;
  }

  function scale(node) {
    var visitor = new Visitor(new Ast);
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

  Model.fn.equivValue = function equivValue(n1, n2, op) {
    var options = Model.options = Model.options ? Model.options : {};
    var scale = options.decimalPlaces != undefined ? +(options.decimalPlaces) : 10;
    var env = Model.env;
    var inverseResult = option("inverseResult");
    var result;
    var v1t = bigZero;
    var v2t = bigZero;
    var args = [];
    if (isComparison(n1.op) && isComparison(n2.op)) {
      var n1l = n1.args[0];
      var n1r = n1.args[1];
      var n2l = n2.args[0];
      var n2r = n2.args[1];
      if (option("compareSides")) {
        // 10=10 20/2=5*2
        if (n1.op !== n2.op) {
          return false;
        }
        var v1 = equivValue(n1l, n2l);
        var v2 = equivValue(n1r, n2r);
        var result = v1 && v2;
      } else {
        var v1 = Model.create(n1l).equivValue(n1r, n1.op);
        var v2 = Model.create(n2l).equivValue(n2r, n2.op);
        var result = v1 === v2;
      }
      return inverseResult ? !result : result;
    }
    if (n1.op === Model.PM && n1.args.length > 1) {
      var args = distributeUnits(n1.args[0], n1.args[1]);
      n1 = binaryNode(Model.PM, args);
    }
    if (n2.op === Model.PM && n2.args.length > 1) {
      var args = distributeUnits(n2.args[0], n2.args[1]);
      n2 = binaryNode(Model.PM, args);
    }
    var n1b, n2b, n1t, n2t;
    if (n1.op === Model.PM && n1.args.length > 1) {
      n1b = simplify(expand(normalize(n1.args[0])));
      n1t = simplify(expand(normalize(n1.args[1])));
      var v1 = mathValue(n1b, env, true);
      var v1t = mathValue(n1t, env, true);
    } else {
      n1b = simplify(expand(normalize(n1)));
      var v1 = mathValue(n1b, env, true);
    }
    if (n2.op === Model.PM && n2.args.length > 1) {
      n2b = simplify(expand(normalize(n2.args[0])));
      n2t = simplify(expand(normalize(n2.args[1])));
      var v2 = mathValue(n2b, env, true);
      var v2t = mathValue(n2t, env, true);
    } else {
      n2b = simplify(expand(normalize(n2)));
      var v2 = mathValue(n2b, env, true);
    }
    // If either value is undefined, then we have no match.
    if (isUndefined(n1b) || isUndefined(n2b)) {
      result = false;
      return inverseResult ? !result : result;
    }
    // If we have two lists, then compare their elements
    if (n1b.op === Model.COMMA && n2b.op === Model.COMMA ||
        n1b.op === Model.LIST && n2b.op === Model.LIST) {
      assert(n1t === undefined && n2t === undefined, message(2007));
      // Check that the corresponding elements of each list are equal.
      var result = every(n1b.args, function (a, i) {
        return equivValue(n1b.args[i], n2b.args[i]);
      });
      // Check that the brackets of the list match
      if (result && n1b.lbrk === n2b.lbrk || n1b.rbrk === n2b.rbrk) {
        result = true;
      } else {
        result = false;
      }
      return inverseResult ? !result : result;
    }
    var vp1 = variablePart(n1b);
    var vp2 = variablePart(n2b);
    if (!n1t && !n2t && vp1 && vp2 && ast.intern(vp1) === ast.intern(vp2)) {
      // The variable part is the same, so factor out of the comparison.
      n1b = constantPart(n1b);
      n2b = constantPart(n2b);
      if (n1b === undefined && n2b === undefined) {
        // No constant part, but variable parts match so we have a match.
        result = true;
        return inverseResult ? !result : result;
      }
    }
    var nid1 = ast.intern(n1b);
    var nid2 = ast.intern(n2b);
    if (nid1 === nid2 && n1t === undefined && n2t === undefined &&
        (op === undefined || isEqualsComparison(op))) {
      result = true;
      return inverseResult ? !result : result;
    }
    // If we have two arrays, then compare their elements
    if (n1b.op === Model.LIST && n2b.op === Model.LIST) {
      assert(n1t === undefined && n2t === undefined, message(2007));
      // Check that the brackets of the list match
      if (n1b.lbrk !== n2b.lbrk || n1b.rbrk !== n2b.rbrk) {
        return false;
      }
      // Check that the corresponding elements of each list are equal.
      var l1 = n1b.args;
      var l2 = n2b.args;
      return every(l1, function (a, i) {
        var result = equivValue(a, l2[i]);
        return inverseResult ? !result : result;
      });
    }
    var v1 = mathValue(n1b, env, true);
    var v2 = mathValue(n2b, env, true);
    assert(v1 !== null || isComparison(n1b.op), message(2005), "spec");
    assert(n1b.op !== Model.PM || v1t !== null, message(2005), "spec");
    assert(v2 !== null || isComparison(n2b.op), message(2005), "user");
    assert(n2b.op !== Model.PM || v2t !== null, message(2005), "user");
    Assert.clearLocation();
    // Not lists so check values and units. At this point the values reflect
    // the relative magnitudes of the units.
    if (v1 !== null && v2 !== null) {
      assert(baseUnit(n1b) === undefined && baseUnit(n2b) === undefined ||
             baseUnit(n1b) !== undefined && baseUnit(n2b) !== undefined,
             message(2009));
      // lb : g, ft : m
      v2 = baseUnitConversion(n1b, n2b)(v2);
      if (!isZero(v2t)) {
        v2t = baseUnitConversion(n1b, n2b)(v2t);
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
        v1t = v1t.setScale(scale, BigDecimal.ROUND_HALF_UP);
        v2t = v2t.setScale(scale, BigDecimal.ROUND_HALF_UP);
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
      var env = Model.env;
      var prevLocation = Assert.location;
      if (node.location) {
        Assert.setLocation(node.location);
      }
      var uu = units(node, env);
      Assert.setLocation(prevLocation);
      assert(uu.length < 2, "FIXME need user error message");
      var u;
      if ((u = env[uu[0]])) {
        assert(u.type === "unit");
        return u.base;
      }
      // Node has no valid units, so just return undefined.
      return undefined;
    }
    // Convert between different unit systems
    function baseUnitConversion(u1, u2) {
      var NaN = Math.NaN;
      var baseUnitConversions = {
        "g/lb": function (v) { return v.multiply(toDecimal("453.592")) },
        "lb/g": function (v) { return v.multiply(toDecimal("0.00220462")) },
        "m/ft": function (v) { return v.multiply(toDecimal("0.3048")) },
        "ft/m": function (v) { return v.multiply(toDecimal("3.28084")) },
        "L/fl": function (v) { return v.multiply(toDecimal("0.02957353")) },
        "fl/L": function (v) { return v.multiply(toDecimal("33.814022702")) },
        "\\degree K/\\degree C" : function (v) { return v.add(toDecimal("273.15")) },
        "\\degree C/\\degree K" : function (v) { return v.subtract(toDecimal("273.15")) },
        "\\degree C/\\degree F" : function (v) { return v.subtract(toDecimal("32")).multiply(toDecimal("5")).divide(toDecimal("9")) },
        "\\degree F/\\degree C" : function (v) { return v.multiply(toDecimal("9")).divide(toDecimal("5")).add(toDecimal("32")) },
        "\\degree K/\\degree F" : function (v) { return v.add(toDecimal("459.67")).multiply(toDecimal("5")).divide(toDecimal("9")) },
        "\\degree F/\\degree K" : function (v) { return v.multiply(toDecimal("9")).divide(toDecimal("5")).subtract(toDecimal("459.67")) },
      };
      var bu1 = baseUnit(u1);
      var bu2 = baseUnit(u2);
      var fn = bu1 === bu2
               ? function (v) { return v }
               : baseUnitConversions[bu1 + "/" + bu2];
      return fn;
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
      try {
        options.is_normal = true;
        var n1n = normalizeSyntax(n, n);
        delete options.is_normal;
      } catch (e) {
        throw e;
      }
      var n2n = normalizeSyntax(n2, n);
      return ast.intern(n1n) === ast.intern(n2n);
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
    if (terms(n1).length !== terms(n2).length) {
      // Fail fast. No way these are equivLiteral if they have different
      // number of terms.
      return false;
    }
    var ignoreOrder = option("ignoreOrder");
    var inverseResult = option("inverseResult");
    n1 = normalizeLiteral(n1);
    n2 = normalizeLiteral(n2);
    if (ignoreOrder) {
      n1 = sort(n1);
      n2 = sort(n2);
    }
    var nid1 = ast.intern(n1);
    var nid2 = ast.intern(n2);
    var result = nid1 === nid2;
    return inverseResult ? !result : result;
  }

  // Check if two equations are mathematically equivalent. Two equations are
  // mathematically equivalent if they are literally equal after simplification
  // and normalization.
  Model.fn.equivSymbolic = function (n1, n2, resume) {
    var result;
    var inverseResult = option("inverseResult");
    if (!inverseResult && !option("strict")) {   // If strict mode, take the slow path for better testing code coverage.
      var ignoreOrder = option("ignoreOrder", true);
      try {
        var result = Model.fn.equivLiteral(n1, n2);
        option("ignoreOrder", ignoreOrder);
      } catch (e) {
        option("ignoreOrder", ignoreOrder);
        throw e;
      }
      if (result) {
        // Got a match. We're done.
        return true;
      }
    }
    if (option("compareSides") && isComparison(n1.op) && n1.op === n2.op) {
      var n1l = n1.args[0];
      var n1r = n1.args[1];
      var n2l = n2.args[0];
      var n2r = n2.args[1];
      n1l = scale(normalize(simplify(expand(normalize(n1l)))));
      n2l = scale(normalize(simplify(expand(normalize(n2l)))));
      var nid1l = ast.intern(n1l);
      var nid2l = ast.intern(n2l);
      n1r = scale(normalize(simplify(expand(normalize(n1r)))));
      n2r = scale(normalize(simplify(expand(normalize(n2r)))));
      var nid1r = ast.intern(n1r);
      var nid2r = ast.intern(n2r);
      var result = nid1l === nid2l && nid1r === nid2r;
    } else {
      n1 = scale(normalize(simplify(expand(normalize(n1)))));
      n2 = scale(normalize(simplify(expand(normalize(n2)))));
      var nid1 = ast.intern(n1);
      var nid2 = ast.intern(n2);
      var result = nid1 === nid2;
      if (!result) {
        n1 = scale(normalize(simplify(expand(normalize(n1)))));
        n2 = scale(normalize(simplify(expand(normalize(n2)))));
        nid1 = ast.intern(n1);
        nid2 = ast.intern(n2);
        result = nid1 === nid2;
      }
    }
    if (result) {
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
      op === Model.NE ||
      op === Model.APPROX ||
      op === Model.EQL;
  }

  Model.fn.isTrue = function (n1) {
    var prevLocation = Assert.location;
    if (n1.location) {
      Assert.setLocation(n1.location);
    }
    var result;
    if (isComparison(n1.op)) {
      try {
        result = Model.create(n1.args[0]).equivValue(n1.args[1], n1.op);
      } catch (e) {
        // Handle any semantic exceptions raised by equivValue.
        result = false;
      }
      Assert.setLocation(prevLocation);
      return result; // equivValue implements inverseResult
    } else {
      var mv = mathValue(n1);
      if (mv && !isZero(mv)) {
        result = true;
      } else {
        result = false;
      }
      Assert.setLocation(prevLocation);
    }
    var inverseResult = option("inverseResult");
    return inverseResult ? !result : result;
  }

  Model.fn.isExpanded = function isExpanded(node) {
    var n1, n2, nid1, nid2, result;
    if (node.op === Model.COMMA) {
      result = every(node.args, function (n) {
        return isExpanded(n);
      });
    } else if (isComparison(node.op)) {
      var inverseResult = option("inverseResult", false);
      result = isExpanded(node.args[0]) && isExpanded(node.args[1]);
      option("inverseResult", inverseResult);
    } else {
      var dontExpandPowers = option("dontExpandPowers", true);
      var dontFactorDenominators = option("dontFactorDenominators", true);
      var dontFactorTerms = option("dontFactorTerms", true);
      var dontConvertDecimalToFraction = option("dontConvertDecimalToFraction", true);
      var dontSimplifyImaginary = option("dontSimplifyImaginary", true);
      n1 = normalize(node);
      n2 = normalizeExpanded(normalize(expand(normalize(node))));
      nid1 = ast.intern(n1);
      nid2 = ast.intern(n2);
      option("dontExpandPowers", dontExpandPowers);
      option("dontFactorDenominators", dontFactorDenominators);
      option("dontFactorTerms", dontFactorTerms);
      option("dontConvertDecimalToFraction", dontConvertDecimalToFraction);
      option("dontSimplifyImaginary", dontSimplifyImaginary);
      if (nid1 === nid2 && !hasLikeFactors(n1)) {
        // hasLikeFactors: x*x != x^2
        result = true;
      } else {
        result = false;
      }
    }
    var inverseResult = option("inverseResult");
    return inverseResult ? !result : result;
  }

  function hasDenominator(node) {
    // Node has a denominator.
    var tt = terms(node);
    var result = some(tt, function (t) {
      // Some term of node has a denominator.
      if (variablePart(t)) {
        var ff = factors(t);
        return some(ff, function (f) {
          // Has factor of some term of node has a denominator.
          return f.op === Model.POW && isNeg(f.args[1]);
        });
      } else {
        // No variable part then its a coefficient, so don't check.
        return false;
      }
    });
    return result;
  }

  Model.fn.isSimplified = function isSimplified(node, resume) {
    var n1, n2, nid1, nid2, result;
    var dontExpandPowers = option("dontExpandPowers", true);
    var dontFactorDenominators = option("dontFactorDenominators", true);
    var dontFactorTerms = option("dontFactorTerms", true);
    var dontConvertDecimalToFraction = option("dontConvertDecimalToFraction", true);
    var dontSimplifyImaginary = option("dontSimplifyImaginary", true);
    var inverseResult = option("inverseResult");
    if (node.op === Model.COMMA) {
      result = every(node.args, function (n) {
        return isSimplified(n);
      });
    } else if (isComparison(node.op)) {
      var n = normalize(binaryNode(Model.ADD, [node.args[0], node.args[1]]));
      result = true;
      if (!isSimplified(n)) {
        // Check for like terms on both sides
        result = false;
      }
      if (result && hasDenominator(n)) {
        // Check for division or fraction.
        result = false;
      }
      if (result && !isFactorised(n)) {
        result = false;
      }
    } else {
      n1 = normalize(node);
      n2 = normalize(simplify(expand(normalize(node))));
      nid1 = ast.intern(n1);
      nid2 = ast.intern(n2);
      result = nid1 === nid2;
    }
    option("dontExpandPowers", dontExpandPowers);
    option("dontFactorDenominators", dontFactorDenominators);
    option("dontFactorTerms", dontFactorTerms);
    option("dontConvertDecimalToFraction", dontConvertDecimalToFraction);
    option("dontSimplifyImaginary", dontSimplifyImaginary);
    if (result) {
      return inverseResult ? false : true;
    }
    return inverseResult ? true : false
/*
    dummy(node, {}, function (err, val) {
      var nid1 = Ast.intern(n1);
      var nid2 = Ast.intern(normalize(val));
      console.log("isSimplified() n1=" + JSON.stringify(n1, null, 2));
      console.log("isSimplified() n2=" + JSON.stringify(val, null, 2));
      option("dontExpandPowers", dontExpandPowers);
      option("dontFactorDenominators", dontFactorDenominators);
      option("dontFactorTerms", dontFactorTerms);
      var result;
      if (nid1 === nid2) {
        result = inverseResult ? false : true;
      } else {
        result = inverseResult ? true : false;
      }
      resume(err, result);
    });
*/
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
    var result = false;
    if (u1.length ===  0 && u2.length === 0 && n2.op !== Model.NONE) {
      result = true;  // Make degenerate case true (e.g. isUnit "10" "20").
    } else if (u2.length) {
      result = every(u2, function (v) {
        return indexOf(u1, v) >= 0;
      });
    }
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
      case "setThousandsSeparator":
      case "setDecimalSeparator":
      case "dontExpandPowers":
      case "dontFactorDenominators":
      case "dontFactorTerms":
      case "dontConvertDecimalToFraction":
      case "strict":
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
    })();
  }
})(new Ast);
