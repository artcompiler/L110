/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/* Copyright (c) 2014, Art Compiler LLC */

var _ = require("underscore");
var requirejs = require("requirejs");

var transformer = function() {

  function print(str) {
    console.log(str);
  }

  var canvasWidth = 0
  var canvasHeight = 0
  var canvasColor = ""

  var ticket = 1000

  var table = {
    "PROG" : program,
    "EXPRS" : exprs,
    "STR": str,
    "BOOL": bool,
    "LIST" : list,
    "EQUIV-SYNTAX": equiv_syntax,
    "ALLOW-TRAILING-ZEROS": allow_trailing_zeros,
    "ALLOW-DECIMAL": allow_decimal,
    "ALLOW-FRACTION": allow_fraction,
    "ALLOW-SCIENTIFIC": allow_scientific,
    "ALLOW-INTEGER": allow_integer,
    "ALLOW-OTHER-VARIABLE-NAMES": allow_other_variable_names,
  }

  var RADIUS = 100;
  var STEP_LENGTH = .1745;
  var leftX = 0, leftY = 0, rightX = 0, rightY = 0;
  var angle = 0;
  var penX, penY;
  var penState;
  var trackState;

  var nodePool

  function reset() {
    angle = 0;
    leftX = RADIUS/2;
    leftY = 0;
    rightX = -RADIUS/2;
    rightY = 0;
    penX = 0;
    penY = 0;
    penState = false;
    trackState = false;
  }

  function transform(pool) {
    reset();
    nodePool = pool;
    return visit(pool.root);
  }

  function visit(nid, visitor) {
    // Get the node from the pool of nodes.
    var node = nodePool[nid];
    if (node == null) {
      return null;
    } else if (node.tag === void 0) {
      return [ ];  // clean up stubs
    } else if (visitor) {
      var visit = visitor[node.tag];
      if (visit) {
        return visit(node);
      } else {
        print("visit() visitor=" + visitor["visitor-name"] + " tag=" + node.tag + " not found!");
      }
    }

    if (isFunction(table[node.tag])) {
      // There is a visitor method for this node, so call it.
      return table[node.tag](node);
    } else {
      console.log("Missing method for " + node.tag);
      //throw "missing visitor method for " + node.tag;
    }
  }

  function isArray(v) {
    return _.isArray(v);
  }

  function isObject(v) {
    return _isObjet(v);
  }

  function isString(v) {
    return _.isString(v);
  }

  function isPrimitive(v) {
    return _.isNull(v) || _.isString(v) || _.isNumber(v) || _.isBoolean(v);
  }

  function isFunction(v) {
    return _.isFunction(v);
  }

  // BEGIN VISITOR METHODS

  var edgesNode;

  function str(node) {
    return node.elts[0]
  }

  function bool(node) {
    return node.elts[0]
  }

  function list(node) {
    var elts = visit(node.elts[0]);
    if (!(elts instanceof Array)) {
      elts = [elts];
    }
    return elts;
  }

  function program(node) {
    var elts = [];
    elts.push(visit(node.elts[0]));
    return {
      "tag": "g",
      "elts": elts,
    };
  }

  function exprs(node) {
    var elts = []
    if (node.elts) {
      for (var i = 0; i < node.elts.length; i++) {
        elts.push(visit(node.elts[i]))
      }
    }
    return elts;
  }

  // Get or set an option on a node.
  function option(node, id, val) {
    if (!node.options) {
      node.options = {};
    }
    var old = node.options[id];
    if (val !== undefined) {
      node.options[id] = val;
    }
    return old;
  }

  var normalNumber = numberNode("298230487121230434902874");
  normalNumber.is_normal = true;

  function equiv_syntax(node) {
    var reference = visit(node.elts[1]);
    var response = visit(node.elts[0]);
    var style = "fill: rgb(255,0,0)";
    if (response) {
      var result = some(reference, function (ref) {
        var n1 = Model.create(ref);
        var n2 = Model.create(response);
        var options = reference.options ? reference.options : {};
        options.is_normal = true;
        var n1n = normalize(n1, options, n1);
        options.is_normal = false;
        var n2n = normalize(n2, options, n1);
        return Ast.intern(n1n) === Ast.intern(n2n);
      });
      if (result) {
        style = "fill: rgb(0,255,0)";
      }
    }
    return {
      "tag": "ellipse",
      "cx": "100",
      "cy": "100",
      "rx": "50",
      "ry": "50",
      "style": style,
    };
  }


  function allow_fraction(node) {
    var n1 = visit(node.elts[1]);
    var n2 = visit(node.elts[0]);
    option(n2, "allow_fraction", n1);
    return n2;
  }

  function allow_trailing_zeros(node) {
    var n1 = visit(node.elts[1]);
    var n2 = visit(node.elts[0]);
    option(n2, "allow_trailing_zeros", n1);
    return n2;
  }

  function allow_decimal(node) {
    var n1 = visit(node.elts[1]);
    var n2 = visit(node.elts[0]);
    option(n2, "allow_decimal", n1);
    return n2;
  }

  function allow_scientific(node) {
    var n1 = visit(node.elts[1]);
    var n2 = visit(node.elts[0]);
    option(n2, "allow_scientific", n1);
    return n2;
  }

  function allow_integer(node) {
    var n1 = visit(node.elts[1]);
    var n2 = visit(node.elts[0]);
    option(n2, "allow_integer", n1);
    return n2;
  }

  function allow_other_variable_names(node) {
    var n1 = visit(node.elts[1]);
    var n2 = visit(node.elts[0]);
    option(n2, "allow_alternate_vars", n1);
    return n2;
  }

  // Add messages here.
/*
  Assert.reserveCodeRange(2000, 2999, "mathmodel");
  messages[2001] = "Factoring multi-variate polynomials is not supported";
  messages[2002] = "Expressions of the form 'x^y^z' are not supported."
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

  var bigOne = new BigDecimal("1");
  var bigZero = new BigDecimal("0");
  var bigMinusOne = new BigDecimal("-1");
*/
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


  // The outer Visitor function provides a global scope for all visitors,
  // as well as dispatching to methods within a visitor.
  function Visitor() {
    var varNames = "abcdefghijklmnopqrstuvwxyz";
    var varMap = {};
    function reset() {
      varMap = {};
    }
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
        node = visit.unary(node);
        break;
      case Model.COMMA:
      case Model.MATRIX:
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
        node = visit.equals(node);
        break;
      default:
        assert(false, "Should not get here. Unhandled node operator " + node.op);
        break;
      }
      return node;
    }

    // normalize() replaces subtraction with addition and division with
    // multiplication. It does not perform expansion or simplification so that
    // the basic structure of the expression is preserved. Also, flattens binary
    // trees into N-ary nodes.
    function normalize(root, options, ref) {
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
        name: "normalize",
        numeric: function (node) {
          // In normal mode, replace each number with its corresponding normalized
          // value. Otherwise, replace each number with its corresponding normalized
          // value only if the option
          if (options.is_normal) {
            return normalNumber;
          } else if (ref && node.numberFormat === ref.numberFormat ||
                     node.numberFormat === "decimal" && options.allow_decimal ||
                     node.numberFormat === "integer" && options.allow_integer) {
            return normalNumber;
          }
          return node;
        },
        additive: function (node) {
          var args = [];
          forEach(node.args, function (n, i) {
            n = normalize(n, options, ref.args[i]);
            args.push(n);
          });
          return binaryNode(Model.ADD, args);
        },
        multiplicative: function(node) {
          var args = [];
          var allow_integer = options.allow_integer;
          if (options.allow_fraction) {
            options.allow_integer = true;
          }
          forEach(node.args, function (n, i) {
            n = normalize(n, options, ref.args[i]);
            args.push(n);
          });
          options.allow_integer = allow_integer;
          if (options.is_normal) {
            if (node.isFraction) {
              options.allow_fraction = true;
            }
            return normalNumber;
          } else if (node.isFraction && options.allow_fraction &&
                     args[0].is_normal && args[1].is_normal) {
            return normalNumber;
          }
          return binaryNode(Model.MUL, args);
        },
        unary: function(node) {
          var arg0 = normalize(node.args[0], options, ref.args[i]);
          switch (node.op) {
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
          var id = node.args[0];
          var name;
          if (!(name = varMap[id])) {
            varMap[id] = name = varNames.charAt(keys(varMap).length);
          }
          return variableNode(name);
        },
        exponential: function(node) {
          var args = [];
          forEach(node.args, function (n, i) {
            n = normalize(n, options, ref.args[i]);
            args.push(n);
          });
          if (options.is_normal) {
            return normalNumber;
          } else if (args[0].is_normal && 
                     (args[1].is_normal || args[1].numberFormat === "integer")) {
            return normalNumber;
          }
          return binaryNode(node.op, args);
        },
        comma: function(node) {
          var vals = [];
          forEach(node.args, function (n, i) {
            vals = vals.concat(normalize(n, options, ref.args[i]));
          });
          var node = newNode(node.op, vals);
          return node;
        },
        equals: function(node) {
          assert(node.args.length === 2, message(2006));
          if (node.op === Model.GT || node.op === Model.GE) {
            // Normalize inequalities to LT and LE
            node.op = node.op === Model.GT ? Model.LE : Model.LT;
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
          return 1;
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

    function exponent(node) {
      return node.op === Model.POW ? toNumber(mathValue(node.args[1])) : 1;
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
          if (node.op !== Model.EQL) {
            // If inequality, then don't sort
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
              if (v0.length !== v1.length  && v0.length < v1.length ||
                  v0.length > 0 && v0[0] < v1[0]) {
                // Swap adjacent elements
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
      while (nid !== Ast.intern(node)) {
        nid = Ast.intern(node);
        node = sort(node);
      }
      return node;
    }

    // Visitor exports
    this.normalize = normalize;
    this.reset = reset;
  }

  var visitor = new Visitor();
  function normalize(node, options, ref) {
    visitor.reset();
    var result = visitor.normalize(node, options, ref);
    return result;
  }

  return {
    transform: transform,
    canvasWidth: function() {
      return canvasWidth;
    },
    canvasHeight: function() {
      return canvasHeight;
    },
    canvasColor: function() {
      return canvasColor;
    },
  };
  
}()


var renderer = function() {

  var scripts;

  return {
    render: render,
  }

  // CONTROL FLOW ENDS HERE
  function print(str) {
    console.log(str)
  }
  
  var nodePool

  function prefix() {
    scripts = "";

    return [ //'<?xml version="1.0" standalone="no"?>'
             //, '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" '
             //, '"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">'
             , '<html xmlns="http://www.w3.org/1999/xhtml">'
             , '<head>'
             , '<script src="http://code.jquery.com/jquery-1.11.0.min.js"></script>'
             , '<script src="http://d3js.org/d3.v3.js" charset="utf-8"></script>'
             , '<style>'
             , 'body : {'
             , ' margin: 0;'
             , '}'
             , '</style>'
             , '</head>'
             , '<body>'
             , '<div class="graffiti">'
             , '<svg'
             , '  viewBox="0 0 200 200"'
             , '  width="200" height="200"'
             , '  xmlns:xlink="http://www.w3.org/1999/xlink"'
             , '  xmlns="http://www.w3.org/2000/svg"'
             , '  font-family="Verdana"'
             , '  font-size="12"'
             , '  fill="#fff"'
             , '  stroke="#000"'
             , '  version="1.1"'
             , '  preserveAspectRatio="xMidYMid meet"'
             , '  overflow="hidden"'
             , '  clip="rect(50,50,50,50)"'
             , '  style="background:'+transformer.canvasColor()+'"' + '>'
             , '<g>'
           ].join("\n")
  }

  function suffix() {
    return [ ''
             , '</g>'
             , '</svg>'
             , '</div>'
             , '<script>'
             , '$(document).ready(function () {' + scripts + '})'
             , '</script>'
             , '</body>'
             , '</html>'
           ].join("\n")
  }

  function render(node) {
    //        nodePool = pool
    var str = ""
    str += prefix()
    str += visit(node, "  ")
    str += suffix()
    return str
  }

  function visit(node, padding) {

    if (typeof node === "string") {
      return node
    }

    var tagName = node.tag
    var attrs = ""
    for (var name in node) {   // iterate through attributes
      if (name === "tag" || name === "elts") {
        continue;
      } else if (tagName === "path" && name === "d") {
        attrs += " d='" + node[name] + "'"
        continue;
      }
      attrs += " " + name + "='" + node[name] + "'"
    }

    if (attrs.length === 0) {
      var indent = ""
    } else {
      var indent = "   "
    }

    var elts = ""
    if (node.elts) {
      for (var i = 0; i < node.elts.length; i++) {
        if (node.elts[i]) {  // skip empty elts
          elts += visit(node.elts[i], padding+indent)
        }
      }
    }

    if (tagName === "g" && attrs.length === 0) {   // skip g elements without attrs
      var tag = elts
    } else if (tagName === "script" && node.elts.length === 1) {
      scripts += "\n" + node.elts[0] + ";";
    } else {
      var tag = "\n"+padding+"<" + tagName + attrs + ">" + elts + "\n"+padding+"</" + tagName + ">"
    }
    return tag
  }

}()

exports.compiler = function () {
  exports.compile = compile;
  Model.option = function option(p, v) {
    return undefined;
  }
  function compile(src) {
    try {
      return renderer.render(transformer.transform(src));
    } catch (x) {
      console.log(x.stack);
    }
  }
}();
