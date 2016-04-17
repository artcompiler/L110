/*
 * Mathcore unversioned - a8fcc93
 * Copyright 2014 Learnosity Ltd. All Rights Reserved.
 *
 */

"use strict";
var name = '';
var MathCore = (function () {
/*
 Copyright (c) 2012 Daniel Trebbien and other contributors
Portions Copyright (c) 2003 STZ-IDA and PTV AG, Karlsruhe, Germany
Portions Copyright (c) 1995-2001 International Business Machines Corporation and others

All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, provided that the above copyright notice(s) and this permission notice appear in all copies of the Software and that both the above copyright notice(s) and this permission notice appear in supporting documentation.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT OF THIRD PARTY RIGHTS. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR HOLDERS INCLUDED IN THIS NOTICE BE LIABLE FOR ANY CLAIM, OR ANY SPECIAL INDIRECT OR CONSEQUENTIAL DAMAGES, OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

Except as contained in this notice, the name of a copyright holder shall not be used in advertising or otherwise to promote the sale, use or other dealings in this Software without prior written authorization of the copyright holder.
*/
'use strict';var boxedString = Object("a"), splitString = boxedString[0] != "a" || !(0 in boxedString);
var forEach = function forEach(array, fun) {
  var thisp = arguments[2];
  if(Array.prototype.indexOf) {
    return array.forEach(fun)
  }
  var object = toObject(array), self = splitString && _toString(object) == "[object String]" ? object.split("") : object, i = -1, length = self.length >>> 0;
  if(_toString(fun) != "[object Function]") {
    throw new TypeError;
  }
  while(++i < length) {
    if(i in self) {
      fun.call(thisp, self[i], i, object)
    }
  }
};
var filter = function filter(array, fun) {
  var thisp = arguments[2];
  if(Array.prototype.filter) {
    return array.filter(fun)
  }
  var object = toObject(array), self = splitString && _toString(array) == "[object String]" ? array.split("") : object, length = self.length >>> 0, result = [], value;
  if(_toString(fun) != "[object Function]") {
    throw new TypeError(fun + " is not a function");
  }
  for(var i = 0;i < length;i++) {
    if(i in self) {
      value = self[i];
      if(fun.call(thisp, value, i, object)) {
        result.push(value)
      }
    }
  }
  return result
};
var every = function every(array, fun) {
  var thisp = arguments[2];
  if(Array.prototype.every) {
    return array.every(fun, thisp)
  }
  var object = toObject(array), self = splitString && _toString(array) == "[object String]" ? array.split("") : object, length = self.length >>> 0;
  if(_toString(fun) != "[object Function]") {
    throw new TypeError(fun + " is not a function");
  }
  for(var i = 0;i < length;i++) {
    if(i in self && !fun.call(thisp, self[i], i, object)) {
      return false
    }
  }
  return true
};
var some = function some(array, fun) {
  var thisp = arguments[2];
  if(Array.prototype.some) {
    return array.some(fun, thisp)
  }
  var object = toObject(array), self = splitString && _toString(array) == "[object String]" ? array.split("") : object, length = self.length >>> 0;
  if(_toString(fun) != "[object Function]") {
    throw new TypeError(fun + " is not a function");
  }
  for(var i = 0;i < length;i++) {
    if(i in self && fun.call(thisp, self[i], i, object)) {
      return true
    }
  }
  return false
};
var indexOf = function indexOf(array, sought) {
  var fromIndex = arguments[2];
  if(Array.prototype.indexOf || typeof array === "string") {
    return array.indexOf(sought, fromIndex)
  }
  var self = splitString && _toString(array) == "[object String]" ? array.split("") : toObject(array), length = self.length >>> 0;
  if(!length) {
    return-1
  }
  var i = 0;
  if(arguments.length > 2) {
    i = toInteger(fromIndex)
  }
  i = i >= 0 ? i : Math.max(0, length + i);
  for(;i < length;i++) {
    if(i in self && self[i] === sought) {
      return i
    }
  }
  return-1
};
var keys = function keys(object) {
  if(Object.keys) {
    return Object.keys(object)
  }
  var hasDontEnumBug = true, dontEnums = ["toString", "toLocaleString", "valueOf", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "constructor"], dontEnumsLength = dontEnums.length;
  for(var key in{"toString":null}) {
    hasDontEnumBug = false
  }
  if(typeof object != "object" && typeof object != "function" || object === null) {
    throw new TypeError("Object.keys called on a non-object");
  }
  var keys = [];
  for(var name in object) {
    if(owns(object, name)) {
      keys.push(name)
    }
  }
  if(hasDontEnumBug) {
    for(var i = 0, ii = dontEnumsLength;i < ii;i++) {
      var dontEnum = dontEnums[i];
      if(owns(object, dontEnum)) {
        keys.push(dontEnum)
      }
    }
  }
  return keys
};
var toObject = function(o) {
  if(o == null) {
    throw new TypeError("can't convert " + o + " to object");
  }
  return Object(o)
};
var prototypeOfObject = Object.prototype;
var _toString = function(val) {
  return prototypeOfObject.toString.apply(val)
};
var owns = function(object, name) {
  return prototypeOfObject.hasOwnProperty.call(object, name)
};
var create = function create(o) {
  if(Object.create) {
    return Object.create(o)
  }
  var F = function() {
  };
  if(arguments.length != 1) {
    throw new Error("Object.create implementation only accepts one parameter.");
  }
  F.prototype = o;
  return new F
};
if(typeof window !== "undefined" && !window.JSON) {
  window.JSON = {parse:function(sJSON) {
    return eval("(" + sJSON + ")")
  }, stringify:function() {
    var toString = Object.prototype.toString;
    var isArray = Array.isArray || function(a) {
      return toString.call(a) === "[object Array]"
    };
    var escMap = {'"':'\\"', "\\":"\\\\", "\b":"\\b", "\f":"\\f", "\n":"\\n", "\r":"\\r", "\t":"\\t"};
    var escFunc = function(m) {
      return escMap[m] || "\\u" + (m.charCodeAt(0) + 65536).toString(16).substr(1)
    };
    var escRE = /[\\"\u0000-\u001F\u2028\u2029]/g;
    return function stringify(value) {
      if(value == null) {
        return"null"
      }else {
        if(typeof value === "number") {
          return isFinite(value) ? value.toString() : "null"
        }else {
          if(typeof value === "boolean") {
            return value.toString()
          }else {
            if(typeof value === "object") {
              if(typeof value.toJSON === "function") {
                return stringify(value.toJSON())
              }else {
                if(isArray(value)) {
                  var res = "[";
                  for(var i = 0;i < value.length;i++) {
                    res += (i ? ", " : "") + stringify(value[i])
                  }
                  return res + "]"
                }else {
                  if(toString.call(value) === "[object Object]") {
                    var tmp = [];
                    for(var k in value) {
                      if(value.hasOwnProperty(k)) {
                        tmp.push(stringify(k) + ": " + stringify(value[k]))
                      }
                    }
                    return"{" + tmp.join(", ") + "}"
                  }
                }
              }
            }
          }
        }
      }
      return'"' + value.toString().replace(escRE, escFunc) + '"'
    }
  }()}
}
var ASSERT = true;
var assert = function() {
  return!ASSERT ? function() {
  } : function(val, str, location) {
    if(str === void 0) {
      str = "failed!"
    }
    if(!val) {
      var err = new Error(str);
      err.location = location ? location : Assert.location;
      throw err;
    }
  }
}();
var message = function(errorCode, args) {
  var str = Assert.messages[errorCode];
  var location = Assert.location;
  if(args) {
    forEach(args, function(arg, i) {
      str = str.replace("%" + (i + 1), arg)
    })
  }
  return errorCode + ": " + str
};
var reserveCodeRange = function(first, last, moduleName) {
  assert(first <= last, "Invalid code range");
  var noConflict = every(Assert.reservedCodes, function(range) {
    return last < range.first || first > range.last
  });
  assert(noConflict, "Conflicting request for error code range");
  Assert.reservedCodes.push({first:first, last:last, name:moduleName})
};
var setLocation = function(location) {
  Assert.location = location
};
var clearLocation = function() {
  Assert.location = null
};
var setTimeout_ = function(timeout, message) {
  if(timeout === undefined) {
    return undefined
  }
  Assert.timeout = timeout ? Date.now() + timeout : 0;
  Assert.timeoutMessage = message ? message : "ERROR timeout exceeded"
};
var checkTimeout = function() {
  assert(!Assert.timeout || Assert.timeout > Date.now(), Assert.timeoutMessage)
};
var Assert = {assert:assert, message:message, messages:{}, reserveCodeRange:reserveCodeRange, reservedCodes:[], setLocation:setLocation, clearLocation:clearLocation, checkTimeout:checkTimeout, setTimeout:setTimeout_};
var TRACE = false;
var global = this;
var trace = function() {
  return!TRACE ? function() {
  } : function trace(str) {
    if(global.console && global.console.log) {
      console.log(str)
    }else {
      if(global.print) {
        print(str)
      }else {
        throw"No trace function defined!";
      }
    }
  }
}();
var Ast = function() {
  function Ast() {
    this.nodePool = ["unused"];
    this.nodeMap = {}
  }
  Ast.prototype.create = function create(op, args) {
    var node = create(this);
    if(typeof op === "string") {
      node.op = op;
      if(args instanceof Array) {
        node.args = args
      }else {
        node.args = []
      }
    }else {
      if(op !== null && typeof op === "object") {
        var obj = op;
        forEach(keys(obj), function(v, i) {
          node[v] = obj[v]
        })
      }
    }
    return node
  };
  Ast.prototype.arg = function arg(node) {
    if(!isNode(this)) {
      throw"Malformed node";
    }
    this.args.push(node);
    return this
  };
  Ast.prototype.argN = function argN(i, node) {
    if(!isNode(this)) {
      throw"Malformed node";
    }
    if(node === undefined) {
      return this.args[i]
    }
    this.args[i] = node;
    return this
  };
  Ast.prototype.args = function args(a) {
    if(!isNode(this)) {
      throw"Malformed node";
    }
    if(a === undefined) {
      return this.args
    }
    this.args = a;
    return this
  };
  Ast.prototype.isNode = isNode;
  function isNode(obj) {
    if(obj === undefined) {
      obj = this
    }
    return obj.op && obj.args
  }
  Ast.prototype.intern = function intern(node) {
    if(this instanceof Ast && (node === undefined && isNode(this))) {
      node = this
    }
    assert(typeof node === "object", "node not an object");
    var op = node.op;
    var count = node.args.length;
    var args = "";
    var args_nids = [];
    for(var i = 0;i < count;i++) {
      args += " ";
      if(typeof node.args[i] === "string") {
        args += args_nids[i] = node.args[i]
      }else {
        args += args_nids[i] = this.intern(node.args[i])
      }
    }
    var key = op + count + args;
    var nid = this.nodeMap[key];
    if(nid === void 0) {
      this.nodePool.push({op:op, args:args_nids});
      nid = this.nodePool.length - 1;
      this.nodeMap[key] = nid
    }
    return nid
  };
  Ast.prototype.node = function node(nid) {
    var n = JSON.parse(JSON.stringify(this.nodePool[nid]));
    for(var i = 0;i < n.args.length;i++) {
      if(typeof n.args[i] !== "string") {
        n.args[i] = this.node(n.args[i])
      }
    }
    return n
  };
  Ast.prototype.dumpAll = function dumpAll() {
    var s = "";
    var ast = this;
    forEach(this.nodePool, function(n, i) {
      s += "\n" + i + ": " + Ast.dump(n)
    });
    return s
  };
  Ast.dump = Ast.prototype.dump = function dump(n) {
    if(typeof n === "string") {
      var s = '"' + n + '"'
    }else {
      if(typeof n === "number") {
        var s = n
      }else {
        var s = '{ op: "' + n.op + '", args: [ ';
        for(var i = 0;i < n.args.length;i++) {
          if(i > 0) {
            s += " , "
          }
          s += dump(n.args[i])
        }
        s += " ] }"
      }
    }
    return s
  };
  var RUN_SELF_TESTS = false;
  function test() {
    (function() {
      trace("Ast self testing");
      var ast = new Ast;
      var node1 = {op:"+", args:[10, 20]};
      var node2 = {op:"+", args:[10, 30]};
      var node3 = {op:"num", args:[10]};
      var node4 = ast.create("+").arg(10).arg(30);
      var node5 = ast.create("+", [10, 20]);
      var node6 = ast.create({op:"+", args:[10, 20]});
      var nid1 = ast.intern(node1);
      var nid2 = ast.intern(node2);
      var nid3 = ast.intern(node3);
      var nid4 = node4.intern();
      var nid5 = node5.intern();
      var nid6 = node6.intern();
      var result = nid2 === nid4 ? "PASS" : "FAIL";
      trace(result + ": " + "nid2 === nid4");
      var result = nid1 === nid5 ? "PASS" : "FAIL";
      trace(result + ": " + "nid1 === nid5");
      var result = nid5 === nid6 ? "PASS" : "FAIL";
      trace(result + ": " + "nid5 === nid6")
    })()
  }
  if(RUN_SELF_TESTS) {
    test()
  }
  return Ast
}();
var Model = function() {
  function error(str) {
    trace("error: " + str)
  }
  function Model() {
  }
  Model.fn = {};
  Model.env = env = {};
  var envStack = [];
  var env = {};
  Model.pushEnv = function pushEnv(e) {
    envStack.push(env);
    Model.env = env = e
  };
  Model.popEnv = function popEnv() {
    assert(envStack.length > 0, "Empty envStack");
    Model.env = env = envStack.pop()
  };
  function isChemCore() {
    return!!Model.env["Au"]
  }
  var Mp = Model.prototype = new Ast;
  Assert.reserveCodeRange(1E3, 1999, "model");
  Assert.messages[1001] = "Invalid syntax. '%1' expected, '%2' found.";
  Assert.messages[1002] = "Only one decimal separator can be specified.";
  Assert.messages[1003] = "Extra characters in input at position: %1, lexeme: %2.";
  Assert.messages[1004] = "Invalid character '%1' (%2) in input.";
  Assert.messages[1005] = "Misplaced thousands separator.";
  Assert.messages[1006] = "Invalid syntax. Expression expected, %1 found.";
  Assert.messages[1007] = "Unexpected character: '%1' in '%2'.";
  Assert.messages[1008] = "The same character '%1' is being used as a thousands and decimal separators.";
  Assert.messages[1009] = "Missing argument for '%1' command.";
  Assert.messages[1010] = "Expecting an operator between numbers.";
  var message = Assert.message;
  Model.create = Mp.create = function create(node, location) {
    assert(node != undefined, "Model.create() called with invalid argument " + node);
    if(node instanceof Model) {
      if(location) {
        node.location = location
      }
      return node
    }
    var model;
    if(node instanceof Array) {
      model = [];
      forEach(node, function(n) {
        model.push(create(n, location))
      });
      return model
    }
    if(!(this instanceof Model)) {
      return(new Model).create(node, location)
    }
    model = create(this);
    model.location = location;
    if(typeof node === "string") {
      var parser = parse(node, Model.env);
      node = parser.expr()
    }else {
      node = JSON.parse(JSON.stringify(node))
    }
    forEach(keys(Model.fn), function(v, i) {
      if(!Mp.hasOwnProperty(v)) {
        Mp[v] = function() {
          var fn = Model.fn[v];
          if(arguments.length > 1 && arguments[1] instanceof Model) {
            return fn.apply(this, arguments)
          }else {
            var args = [this];
            for(var i = 0;i < arguments.length;i++) {
              args.push(arguments[i])
            }
            return fn.apply(this, args)
          }
        }
      }
    });
    forEach(keys(node), function(v, i) {
      model[v] = node[v]
    });
    return model
  };
  Model.fromLaTex = Mp.fromLaTex = function fromLaTex(src) {
    assert(typeof src === "string", "Model.prototype.fromLaTex");
    if(!this) {
      return Model.create(src)
    }
    return this.create(src)
  };
  Mp.toLaTex = function toLaTex(node) {
    return render(node)
  };
  var OpStr = {ADD:"+", SUB:"-", MUL:"times", DIV:"div", FRAC:"frac", EQL:"=", ATAN2:"atan2", SQRT:"sqrt", VEC:"vec", PM:"pm", SIN:"sin", COS:"cos", TAN:"tan", SEC:"sec", COT:"cot", CSC:"csc", ARCSIN:"arcsin", ARCCOS:"arccos", ARCTAN:"arctan", LOG:"log", LN:"ln", LG:"lg", VAR:"var", NUM:"num", CST:"cst", COMMA:",", POW:"^", SUBSCRIPT:"_", ABS:"abs", PAREN:"()", HIGHLIGHT:"hi", LT:"lt", LE:"le", GT:"gt", GE:"ge", NE:"ne", APPROX:"approx", INTERVAL:"interval", LIST:"list", EXISTS:"exists", IN:"in", 
  FORALL:"forall", LIM:"lim", EXP:"exp", TO:"to", SUM:"sum", INT:"int", PROD:"prod", PERCENT:"%", M:"M", RIGHTARROW:"->", FACT:"fact", BINOM:"binom", ROW:"row", COL:"col", COLON:"colon", MATRIX:"matrix", FORMAT:"format", OVERSET:"overset", UNDERSET:"underset", OVERLINE:"overline", DEGREE:"degree", BACKSLASH:"backslash", MATHBF:"mathbf", DOT:"dot", NONE:"none"};
  forEach(keys(OpStr), function(v, i) {
    Model[v] = OpStr[v]
  });
  var OpToLaTeX = {};
  OpToLaTeX[OpStr.ADD] = "+";
  OpToLaTeX[OpStr.SUB] = "-";
  OpToLaTeX[OpStr.MUL] = "\\times";
  OpToLaTeX[OpStr.DIV] = "\\div";
  OpToLaTeX[OpStr.FRAC] = "\\frac";
  OpToLaTeX[OpStr.EQL] = "=";
  OpToLaTeX[OpStr.ATAN2] = "\\atan2";
  OpToLaTeX[OpStr.POW] = "^";
  OpToLaTeX[OpStr.SUBSCRIPT] = "_";
  OpToLaTeX[OpStr.PM] = "\\pm";
  OpToLaTeX[OpStr.SIN] = "\\sin";
  OpToLaTeX[OpStr.COS] = "\\cos";
  OpToLaTeX[OpStr.TAN] = "\\tan";
  OpToLaTeX[OpStr.ARCSIN] = "\\arcsin";
  OpToLaTeX[OpStr.ARCCOS] = "\\arccos";
  OpToLaTeX[OpStr.ARCTAN] = "\\arctan";
  OpToLaTeX[OpStr.SEC] = "\\sec";
  OpToLaTeX[OpStr.COT] = "\\cot";
  OpToLaTeX[OpStr.CSC] = "\\csc";
  OpToLaTeX[OpStr.LN] = "\\ln";
  OpToLaTeX[OpStr.COMMA] = ",";
  OpToLaTeX[OpStr.M] = "\\M";
  OpToLaTeX[OpStr.BINOM] = "\\binom";
  OpToLaTeX[OpStr.COLON] = "\\colon";
  Model.fold = function fold(node, env) {
    var args = [], val;
    forEach(node.args, function(n) {
      args.push(fold(n, env))
    });
    node.args = args;
    switch(node.op) {
      case OpStr.VAR:
        if(val = env[node.args[0]]) {
          node = val
        }
        break;
      default:
        break
    }
    return node
  };
  var render = function render(n) {
    var text = "";
    if(typeof n === "string") {
      text = n
    }else {
      if(typeof n === "number") {
        text = n
      }else {
        if(typeof n === "object") {
          var args = [];
          for(var i = 0;i < n.args.length;i++) {
            args[i] = render(n.args[i])
          }
          switch(n.op) {
            case OpStr.VAR:
            ;
            case OpStr.CST:
            ;
            case OpStr.NUM:
              text = n.args[0];
              break;
            case OpStr.SUB:
              if(n.args.length === 1) {
                text = OpToLaTeX[n.op] + " " + args[0]
              }else {
                text = args[0] + " " + OpToLaTeX[n.op] + " " + args[1]
              }
              break;
            case OpStr.DIV:
            ;
            case OpStr.PM:
            ;
            case OpStr.EQL:
              text = args[0] + " " + OpToLaTeX[n.op] + " " + args[1];
              break;
            case OpStr.POW:
              var lhs = n.args[0];
              var rhs = n.args[1];
              if(lhs.args && lhs.args.length === 2 || rhs.args && rhs.args.length === 2) {
                if(lhs.op === OpStr.ADD || (lhs.op === OpStr.SUB || (lhs.op === OpStr.MUL || (lhs.op === OpStr.DIV || lhs.op === OpStr.SQRT)))) {
                  args[0] = " (" + args[0] + ") "
                }
              }
              text = "{" + args[0] + "^{" + args[1] + "}}";
              break;
            case OpStr.SIN:
            ;
            case OpStr.COS:
            ;
            case OpStr.TAN:
            ;
            case OpStr.ARCSIN:
            ;
            case OpStr.ARCCOS:
            ;
            case OpStr.ARCTAN:
            ;
            case OpStr.SEC:
            ;
            case OpStr.COT:
            ;
            case OpStr.CSC:
            ;
            case OpStr.LN:
            ;
            case OpStr.M:
              text = "{" + OpToLaTeX[n.op] + "{" + args[0] + "}}";
              break;
            case OpStr.FRAC:
              text = "\\dfrac{" + args[0] + "}{" + args[1] + "}";
              break;
            case OpStr.BINOM:
              text = "\\binom{" + args[0] + "}{" + args[1] + "}";
              break;
            case OpStr.SQRT:
              switch(args.length) {
                case 1:
                  text = "\\sqrt{" + args[0] + "}";
                  break;
                case 2:
                  text = "\\sqrt[" + args[0] + "]{" + args[1] + "}";
                  break
              }
              break;
            case OpStr.VEC:
              text = "\\vec{" + args[0] + "}";
              break;
            case OpStr.MUL:
              var prevTerm;
              text = "";
              forEach(n.args, function(term, index) {
                if(term.args && term.args.length >= 2) {
                  if(term.op === OpStr.ADD || term.op === OpStr.SUB) {
                    args[index] = "(" + args[index] + ")"
                  }
                  if(index !== 0 && typeof term === "number") {
                    text += OpToLaTeX[n.op] + " "
                  }
                  text += args[index]
                }else {
                  if(term.op === OpStr.PAREN || (term.op === OpStr.VAR || (term.op === OpStr.CST || typeof prevTerm === "number" && typeof term !== "number"))) {
                    text += args[index]
                  }else {
                    if(index !== 0) {
                      text += " " + OpToLaTeX[n.op] + " "
                    }
                    text += args[index]
                  }
                }
                prevTerm = term
              });
              break;
            case OpStr.ADD:
            ;
            case OpStr.COMMA:
              forEach(args, function(value, index) {
                if(index === 0) {
                  text = value
                }else {
                  text = text + " " + OpToLaTeX[n.op] + " " + value
                }
              });
              break;
            default:
              assert(false, "unimplemented eval operator");
              break
          }
        }else {
          assert(false, "invalid expression type")
        }
      }
    }
    return text
  };
  var parse = function parse(src, env) {
    src = stripInvisible(src);
    var TK_NONE = 0;
    var TK_ADD = "+".charCodeAt(0);
    var TK_CARET = "^".charCodeAt(0);
    var TK_UNDERSCORE = "_".charCodeAt(0);
    var TK_COS = 261;
    var TK_COT = 264;
    var TK_CSC = 265;
    var TK_FRAC = 256;
    var TK_SLASH = "/".charCodeAt(0);
    var TK_EQL = "=".charCodeAt(0);
    var TK_LN = 263;
    var TK_LEFTBRACE = "{".charCodeAt(0);
    var TK_VERTICALBAR = "|".charCodeAt(0);
    var TK_LEFTBRACKET = "[".charCodeAt(0);
    var TK_LEFTPAREN = "(".charCodeAt(0);
    var TK_MUL = "*".charCodeAt(0);
    var TK_NUM = "0".charCodeAt(0);
    var TK_PM = 258;
    var TK_RIGHTBRACE = "}".charCodeAt(0);
    var TK_RIGHTBRACKET = "]".charCodeAt(0);
    var TK_RIGHTPAREN = ")".charCodeAt(0);
    var TK_SEC = 262;
    var TK_SIN = 259;
    var TK_SQRT = 257;
    var TK_SUB = "-".charCodeAt(0);
    var TK_TAN = 260;
    var TK_VAR = "a".charCodeAt(0);
    var TK_CONST = "A".charCodeAt(0);
    var TK_NEXT = 266;
    var TK_COMMA = ",".charCodeAt(0);
    var TK_LG = 267;
    var TK_LOG = 268;
    var TK_TEXT = 269;
    var TK_LT = 270;
    var TK_LE = 271;
    var TK_GT = 272;
    var TK_GE = 273;
    var TK_EXISTS = 274;
    var TK_IN = 275;
    var TK_FORALL = 276;
    var TK_LIM = 277;
    var TK_EXP = 278;
    var TK_TO = 279;
    var TK_SUM = 280;
    var TK_INT = 281;
    var TK_PROD = 282;
    var TK_PERCENT = "%".charCodeAt(0);
    var TK_M = 283;
    var TK_RIGHTARROW = 284;
    var TK_BANG = "!".charCodeAt(0);
    var TK_BINOM = 285;
    var TK_NEWROW = 286;
    var TK_NEWCOL = 287;
    var TK_BEGIN = 288;
    var TK_END = 289;
    var TK_COLON = ":".charCodeAt(0);
    var TK_VEC = 290;
    var TK_ARCSIN = 291;
    var TK_ARCCOS = 292;
    var TK_ARCTAN = 293;
    var TK_DIV = 294;
    var TK_FORMAT = 295;
    var TK_OVERLINE = 296;
    var TK_OVERSET = 297;
    var TK_UNDERSET = 298;
    var TK_BACKSLASH = 299;
    var TK_MATHBF = 300;
    var TK_NE = 301;
    var TK_APPROX = 302;
    var TK_ABS = 303;
    var TK_DOT = 304;
    var T0 = TK_NONE, T1 = TK_NONE;
    var tokenToOperator = {};
    tokenToOperator[TK_SLASH] = OpStr.FRAC;
    tokenToOperator[TK_FRAC] = OpStr.FRAC;
    tokenToOperator[TK_SQRT] = OpStr.SQRT;
    tokenToOperator[TK_VEC] = OpStr.VEC;
    tokenToOperator[TK_ADD] = OpStr.ADD;
    tokenToOperator[TK_SUB] = OpStr.SUB;
    tokenToOperator[TK_PM] = OpStr.PM;
    tokenToOperator[TK_CARET] = OpStr.POW;
    tokenToOperator[TK_UNDERSCORE] = OpStr.SUBSCRIPT;
    tokenToOperator[TK_MUL] = OpStr.MUL;
    tokenToOperator[TK_DIV] = OpStr.DIV;
    tokenToOperator[TK_SIN] = OpStr.SIN;
    tokenToOperator[TK_COS] = OpStr.COS;
    tokenToOperator[TK_TAN] = OpStr.TAN;
    tokenToOperator[TK_ARCSIN] = OpStr.ARCSIN;
    tokenToOperator[TK_ARCCOS] = OpStr.ARCCOS;
    tokenToOperator[TK_ARCTAN] = OpStr.ARCTAN;
    tokenToOperator[TK_SEC] = OpStr.SEC;
    tokenToOperator[TK_COT] = OpStr.COT;
    tokenToOperator[TK_CSC] = OpStr.CSC;
    tokenToOperator[TK_LN] = OpStr.LN;
    tokenToOperator[TK_LG] = OpStr.LG;
    tokenToOperator[TK_LOG] = OpStr.LOG;
    tokenToOperator[TK_EQL] = OpStr.EQL;
    tokenToOperator[TK_COMMA] = OpStr.COMMA;
    tokenToOperator[TK_TEXT] = OpStr.TEXT;
    tokenToOperator[TK_LT] = OpStr.LT;
    tokenToOperator[TK_LE] = OpStr.LE;
    tokenToOperator[TK_GT] = OpStr.GT;
    tokenToOperator[TK_GE] = OpStr.GE;
    tokenToOperator[TK_NE] = OpStr.NE;
    tokenToOperator[TK_APPROX] = OpStr.APPROX;
    tokenToOperator[TK_EXISTS] = OpStr.EXISTS;
    tokenToOperator[TK_IN] = OpStr.IN;
    tokenToOperator[TK_FORALL] = OpStr.FORALL;
    tokenToOperator[TK_LIM] = OpStr.LIM;
    tokenToOperator[TK_EXP] = OpStr.EXP;
    tokenToOperator[TK_TO] = OpStr.TO;
    tokenToOperator[TK_SUM] = OpStr.SUM;
    tokenToOperator[TK_INT] = OpStr.INT;
    tokenToOperator[TK_PROD] = OpStr.PROD;
    tokenToOperator[TK_M] = OpStr.M;
    tokenToOperator[TK_RIGHTARROW] = OpStr.RIGHTARROW;
    tokenToOperator[TK_BANG] = OpStr.FACT;
    tokenToOperator[TK_BINOM] = OpStr.BINOM;
    tokenToOperator[TK_NEWROW] = OpStr.ROW;
    tokenToOperator[TK_NEWCOL] = OpStr.COL;
    tokenToOperator[TK_COLON] = OpStr.COLON;
    tokenToOperator[TK_FORMAT] = OpStr.FORMAT;
    tokenToOperator[TK_OVERLINE] = OpStr.OVERLINE;
    tokenToOperator[TK_OVERSET] = OpStr.OVERSET;
    tokenToOperator[TK_UNDERSET] = OpStr.UNDERSET;
    tokenToOperator[TK_BACKSLASH] = OpStr.BACKSLASH;
    tokenToOperator[TK_MATHBF] = OpStr.MATHBF;
    tokenToOperator[TK_DOT] = OpStr.DOT;
    function newNode(op, args) {
      return{op:op, args:args}
    }
    function matchThousandsSeparator(ch, last) {
      if(Model.option("allowThousandsSeparator") || Model.option("setThousandsSeparator")) {
        var separators = Model.option("setThousandsSeparator");
        if(!separators) {
          return ch === "," ? ch : ""
        }else {
          if(ch === last || !last && indexOf(separators, ch) >= 0) {
            return ch
          }else {
            return""
          }
        }
      }
      return""
    }
    function matchDecimalSeparator(ch) {
      var decimalSeparator = Model.option("setDecimalSeparator");
      var thousandsSeparators = Model.option("setThousandsSeparator");
      if(typeof decimalSeparator === "string") {
        assert(decimalSeparator.length === 1, message(1002));
        var separator = decimalSeparator;
        if(thousandsSeparators instanceof Array && indexOf(thousandsSeparators, separator) >= 0) {
          assert(false, message(1008, [separator]))
        }
        return ch === separator
      }
      if(decimalSeparator instanceof Array) {
        forEach(decimalSeparator, function(separator) {
          if(thousandsSeparators instanceof Array && indexOf(thousandsSeparators, separator) >= 0) {
            assert(false, message(1008, [separator]))
          }
        });
        return indexOf(decimalSeparator, ch) >= 0
      }
      return ch === "."
    }
    function numberNode(n0, doScale, roundOnly) {
      var ignoreTrailingZeros = Model.option("ignoreTrailingZeros");
      var n1 = n0.toString();
      var n2 = "";
      var i, ch;
      var lastSeparatorIndex, lastSignificantIndex;
      var separatorCount = 0;
      var numberFormat = "integer";
      var hasLeadingZero, hasTrailingZero;
      if(n0 === ".") {
        assert(false, message(1004, [n0, n0.charCodeAt(0)]))
      }
      for(i = 0;i < n1.length;i++) {
        if(matchThousandsSeparator(ch = n1.charAt(i))) {
          if(separatorCount && lastSeparatorIndex !== i - 4 || !separatorCount && i > 4) {
            assert(false, message(1005))
          }
          lastSeparatorIndex = i;
          separatorCount++
        }else {
          if(matchDecimalSeparator(ch)) {
            if(numberFormat === "decimal") {
              assert(false, message(1007, [ch, n2 + ch]))
            }
            ch = ".";
            numberFormat = "decimal";
            if(separatorCount && lastSeparatorIndex !== i - 4) {
              assert(false, message(1005))
            }
            if(n2 === "0") {
              hasLeadingZero = true
            }
            lastSignificantIndex = n2.length;
            lastSeparatorIndex = i;
            separatorCount++
          }else {
            if(numberFormat === "decimal") {
              if(ch !== "0") {
                lastSignificantIndex = n2.length
              }
            }
          }
          n2 += ch
        }
      }
      if(numberFormat !== "decimal" && (lastSeparatorIndex && lastSeparatorIndex !== i - 4)) {
        assert(false, message(1005))
      }
      if(lastSignificantIndex !== undefined) {
        if(lastSignificantIndex + 1 < n2.length) {
          hasTrailingZero = true
        }
        if(ignoreTrailingZeros) {
          n2 = n2.substring(0, lastSignificantIndex + 1);
          if(n2 === ".") {
            n2 = "0"
          }
        }
      }
      n2 = new BigDecimal(n2);
      if(doScale) {
        var scale = option("decimalPlaces");
        if(!roundOnly || n2.scale() > scale) {
          n2 = n2.setScale(scale, BigDecimal.ROUND_HALF_UP)
        }
      }
      return{op:Model.NUM, args:[String(n2)], hasThousandsSeparator:separatorCount !== 0, numberFormat:numberFormat, hasLeadingZero:hasLeadingZero, hasTrailingZero:hasTrailingZero}
    }
    function multiplyNode(args, flatten) {
      return binaryNode(Model.MUL, args, flatten)
    }
    function unaryNode(op, args) {
      assert(args.length === 1, "Wrong number of arguments for unary node");
      return newNode(op, args)
    }
    function binaryNode(op, args, flatten) {
      assert(args.length > 1, "Too few argument for binary node");
      var aa = [];
      forEach(args, function(n) {
        if(flatten && n.op === op) {
          aa = aa.concat(n.args)
        }else {
          aa.push(n)
        }
      });
      return newNode(op, aa)
    }
    var nodeOne = numberNode("1");
    var nodeMinusOne = unaryNode(Model.SUB, [numberNode("1")]);
    var nodeNone = newNode(Model.NONE, [numberNode("0")]);
    var nodeEmpty = newNode(Model.VAR, ["0"]);
    var scan = scanner(src);
    function start(options) {
      T0 = scan.start(options)
    }
    function hd() {
      return T0
    }
    function lexeme() {
      return scan.lexeme()
    }
    function next(options) {
      T0 = T1;
      T1 = TK_NONE;
      if(T0 === TK_NONE) {
        T0 = scan.start(options)
      }
    }
    function lookahead(options) {
      if(T1 === TK_NONE) {
        T1 = scan.start(options)
      }
      return T1
    }
    function eat(tc, options) {
      var tk = hd();
      if(tk !== tc) {
        var expected = String.fromCharCode(tc);
        var found = tk ? String.fromCharCode(tk) : "EOS";
        assert(false, message(1001, [expected, found]))
      }
      next(options)
    }
    function isSimpleFraction(node) {
      if(node.op === Model.FRAC) {
        var n0 = node.args[0];
        var n1 = node.args[1];
        return n0.op === Model.NUM && (n0.numberFormat === "integer" && (n1.op === Model.NUM && n1.numberFormat === "integer"))
      }
      return false
    }
    function isMinusOne(node) {
      return node.op === Model.SUB && (node.args.length === 1 && (node.args[0].op === Model.NUM && (node.args[0].args.length === 1 && node.args[0].args[0] === "1")))
    }
    function primaryExpr() {
      var e;
      var tk;
      var op;
      switch(tk = hd()) {
        case "A".charCodeAt(0):
        ;
        case "a".charCodeAt(0):
        ;
        case TK_VAR:
          var args = [lexeme()];
          next();
          if((t = hd()) === TK_UNDERSCORE) {
            next({oneCharToken:true});
            args.push(primaryExpr())
          }
          e = newNode(Model.VAR, args);
          if(isChemCore()) {
            if(hd() === TK_LEFTBRACE && lookahead() === TK_RIGHTBRACE) {
              eat(TK_LEFTBRACE);
              eat(TK_RIGHTBRACE)
            }
          }
          break;
        case TK_NUM:
          e = numberNode(lexeme());
          next();
          break;
        case TK_LEFTBRACKET:
        ;
        case TK_LEFTPAREN:
          e = parenExpr(tk);
          break;
        case TK_LEFTBRACE:
          e = braceExpr();
          break;
        case TK_BEGIN:
          next();
          var figure = braceExpr();
          var tbl = matrixExpr();
          eat(TK_END);
          braceExpr();
          if(indexOf(figure.args[0], "matrix") >= 0) {
            e = newNode(Model.MATRIX, [tbl])
          }else {
            assert(false, "Unrecognized LaTeX name")
          }
          break;
        case TK_VERTICALBAR:
          e = absExpr();
          break;
        case TK_ABS:
          next();
          var e = unaryNode(Model.ABS, [braceExpr()]);
          break;
        case TK_FRAC:
          next();
          var expr1 = braceExpr();
          var expr2 = braceExpr();
          e = newNode(Model.FRAC, [expr1, expr2]);
          e.isFraction = isSimpleFraction(e);
          break;
        case TK_BINOM:
          next();
          var n = braceExpr();
          var k = braceExpr();
          var num = unaryNode(Model.FACT, [n]);
          var den = binaryNode(Model.POW, [binaryNode(Model.MUL, [unaryNode(Model.FACT, [k]), unaryNode(Model.FACT, [binaryNode(Model.ADD, [n, negate(k)])])]), nodeMinusOne]);
          e = binaryNode(Model.MUL, [num, den]);
          e.isBinomial = true;
          break;
        case TK_SQRT:
          next();
          switch(hd()) {
            case TK_LEFTBRACKET:
              var root = bracketExpr();
              var base = braceExpr();
              e = newNode(Model.POW, [base, newNode(Model.POW, [root, nodeMinusOne])]);
              break;
            case TK_LEFTBRACE:
              var base = braceExpr();
              e = newNode(Model.POW, [base, newNode(Model.POW, [newNode(Model.NUM, ["2"]), nodeMinusOne])]);
              break;
            default:
              assert(false, message(1001, ["{ or (", String.fromCharCode(hd())]));
              break
          }
          break;
        case TK_VEC:
          next();
          var name = braceExpr();
          e = newNode(Model.VEC, [name]);
          break;
        case TK_SIN:
        ;
        case TK_COS:
        ;
        case TK_TAN:
          next();
          var t, args = [];
          while((t = hd()) === TK_CARET) {
            next({oneCharToken:true});
            args.push(unaryExpr())
          }
          if(args.length === 1 && isMinusOne(args[0])) {
            op = "arc" + tokenToOperator[tk];
            args = []
          }else {
            op = tokenToOperator[tk]
          }
          args.unshift(newNode(op, [postfixExpr()]));
          if(args.length > 1) {
            return newNode(Model.POW, args)
          }else {
            return args[0]
          }
          break;
        case TK_ARCSIN:
        ;
        case TK_ARCCOS:
        ;
        case TK_ARCTAN:
        ;
        case TK_SEC:
        ;
        case TK_COT:
        ;
        case TK_CSC:
          next();
          var t, args = [];
          while((t = hd()) === TK_CARET) {
            next({oneCharToken:true});
            args.push(unaryExpr())
          }
          args.unshift(newNode(tokenToOperator[tk], [primaryExpr()]));
          if(args.length > 1) {
            return newNode(Model.POW, args)
          }else {
            return args[0]
          }
          break;
        case TK_LN:
          next();
          return newNode(Model.LOG, [newNode(Model.VAR, ["e"]), primaryExpr()]);
        case TK_LG:
          next();
          return newNode(Model.LOG, [newNode(Model.NUM, ["10"]), primaryExpr()]);
        case TK_LOG:
          next();
          var t, args = [];
          if((t = hd()) === TK_UNDERSCORE) {
            next({oneCharToken:true});
            args.push(primaryExpr())
          }else {
            args.push(newNode(Model.VAR, ["e"]))
          }
          args.push(primaryExpr());
          return newNode(Model.LOG, args);
          break;
        case TK_LIM:
          next();
          var t, args = [];
          eat(TK_UNDERSCORE);
          args.push(primaryExpr());
          args.push(primaryExpr());
          return newNode(tokenToOperator[tk], args);
          break;
        case TK_SUM:
        ;
        case TK_INT:
        ;
        case TK_PROD:
          next();
          var t, args = [];
          if(hd() === TK_UNDERSCORE) {
            next({oneCharToken:true});
            args.push(primaryExpr());
            eat(TK_CARET, {oneCharToken:true});
            args.push(primaryExpr())
          }
          args.push(commaExpr());
          return newNode(tokenToOperator[tk], args);
          break;
        case TK_EXISTS:
          next();
          return newNode(Model.EXISTS, [equalExpr()]);
        case TK_FORALL:
          next();
          return newNode(Model.FORALL, [commaExpr()]);
        case TK_EXP:
          next();
          return newNode(Model.EXP, [additiveExpr()]);
        case TK_M:
          next();
          return newNode(Model.M, [multiplicativeExpr()]);
        case TK_FORMAT:
          next();
          return newNode(Model.FORMAT, [braceExpr()]);
        case TK_OVERLINE:
          next();
          return newNode(Model.OVERLINE, [braceExpr()]);
        case TK_DOT:
          next();
          return newNode(Model.DOT, [braceExpr()]);
        case TK_OVERSET:
        ;
        case TK_UNDERSET:
          next();
          var expr1 = braceExpr();
          var expr2 = braceExpr();
          expr2.args.push(newNode(tokenToOperator[tk], [expr1]));
          return expr2;
          break;
        case TK_MATHBF:
          next();
          var expr1 = braceExpr();
          return expr1;
        default:
          assert(!Model.option("strict"), message(1006, [tokenToOperator[tk]]));
          e = nodeEmpty;
          break
      }
      return e
    }
    function matrixExpr() {
      var args = [];
      var node, t;
      args.push(rowExpr());
      while((t = hd()) === TK_NEWROW) {
        next();
        args.push(rowExpr())
      }
      return newNode(tokenToOperator[TK_NEWROW], args)
    }
    function rowExpr() {
      var args = [];
      var t;
      args.push(equalExpr());
      while((t = hd()) === TK_NEWCOL) {
        next();
        args.push(equalExpr())
      }
      return newNode(tokenToOperator[TK_NEWCOL], args)
    }
    function absExpr() {
      eat(TK_VERTICALBAR);
      var e = additiveExpr();
      eat(TK_VERTICALBAR);
      return unaryNode(Model.ABS, [e])
    }
    function braceExpr() {
      var e;
      eat(TK_LEFTBRACE);
      if(hd() === TK_RIGHTBRACE) {
        eat(TK_RIGHTBRACE);
        e = newNode(Model.COMMA, [])
      }else {
        e = commaExpr();
        eat(TK_RIGHTBRACE)
      }
      e.lbrk = TK_LEFTBRACE;
      e.rbrk = TK_RIGHTBRACE;
      return e
    }
    function bracketExpr() {
      eat(TK_LEFTBRACKET);
      var e = commaExpr();
      eat(TK_RIGHTBRACKET);
      return e
    }
    function parenExpr(tk) {
      var e;
      var tk2;
      eat(tk);
      if(hd() === TK_RIGHTPAREN || hd() === TK_RIGHTBRACKET) {
        eat(tk === TK_LEFTPAREN ? TK_RIGHTPAREN : TK_RIGHTBRACKET);
        e = newNode(Model.COMMA, [])
      }else {
        e = commaExpr();
        if(Model.option("allowInterval")) {
          eat(tk2 = hd() === TK_RIGHTPAREN ? TK_RIGHTPAREN : TK_RIGHTBRACKET)
        }else {
          eat(tk2 = tk === TK_LEFTPAREN ? TK_RIGHTPAREN : TK_RIGHTBRACKET)
        }
      }
      e.lbrk = tk;
      e.rbrk = tk2;
      if(Model.option("allowInterval") && (e.args.length === 2 && ((tk === TK_LEFTPAREN || tk === TK_LEFTBRACKET) && (tk2 === TK_RIGHTPAREN || tk2 === TK_RIGHTBRACKET)))) {
        e.op = Model.INTERVAL;
        e.args.push(numberNode(tk));
        e.args.push(numberNode(tk2))
      }else {
        if(e.op === Model.COMMA) {
          e.op = Model.LIST
        }
      }
      return e
    }
    function exponentialExpr() {
      var t, args = [primaryExpr()];
      while((t = hd()) === TK_CARET) {
        next({oneCharToken:true});
        var t;
        if((isMathSymbol(args[0]) || isChemCore()) && ((t = hd()) === TK_ADD || t === TK_SUB)) {
          next();
          args.push(unaryNode(tokenToOperator[t], [nodeOne]))
        }else {
          var n = unaryExpr();
          if(n.op === Model.VAR && n.args[0] === "\\circ") {
            if(hd() === TK_VAR && lexeme() === "K" || (lexeme() === "C" || lexeme() === "F")) {
              n = multiplyNode([args.pop(), unaryNode(Model.VAR, ["\\degree " + lexeme()])]);
              next()
            }else {
              n = multiplyNode([args.pop(), unaryNode(Model.VAR, ["\\degree"])])
            }
            args.push(n)
          }else {
            args.push(n)
          }
        }
      }
      if(args.length > 1) {
        var expo = args.pop();
        forEach(args.reverse(), function(base) {
          expo = newNode(Model.POW, [base, expo])
        });
        return expo
      }else {
        return args[0]
      }
    }
    function postfixExpr() {
      var t;
      var expr = exponentialExpr();
      switch(t = hd()) {
        case TK_PERCENT:
          next();
          expr = newNode(Model.PERCENT, [expr]);
          break;
        case TK_BANG:
          next();
          expr = newNode(Model.FACT, [expr]);
          break;
        default:
          if(t === TK_VAR && lexeme() === "\\degree") {
            next();
            if(hd() === TK_VAR && (lexeme() === "K" || (lexeme() === "C" || lexeme() === "F"))) {
              expr = multiplyNode([expr, unaryNode(Model.VAR, ["\\degree " + lexeme()])]);
              next()
            }else {
              expr = multiplyNode([expr, unaryNode(Model.VAR, ["\\degree"])])
            }
          }else {
            if(isChemCore() && ((t === TK_ADD || t === TK_SUB) && lookahead() === TK_RIGHTBRACE)) {
              next();
              expr = unaryNode(tokenToOperator[t], [expr])
            }
          }
          break
      }
      return expr
    }
    function unaryExpr() {
      var t;
      var expr;
      switch(t = hd()) {
        case TK_ADD:
          next();
          expr = newNode(Model.ADD, [unaryExpr()]);
          break;
        case TK_SUB:
          next();
          expr = newNode(Model.SUB, [unaryExpr()]);
          break;
        case TK_PM:
          next();
          expr = unaryExpr();
          expr = newNode(tokenToOperator[t], [expr]);
          break;
        case TK_UNDERSCORE:
          var op = tokenToOperator[t];
          next({oneCharToken:true});
          if((t = hd()) === TK_ADD || t === TK_SUB) {
            next();
            expr = nodeOne
          }else {
            expr = unaryExpr()
          }
          expr = newNode(op, [expr]);
          if((t = hd()) === TK_CARET) {
            var args = [expr];
            var op = tokenToOperator[t];
            next({oneCharToken:true});
            if((t = hd()) === TK_ADD || t === TK_SUB) {
              next();
              expr = nodeOne
            }else {
              expr = unaryExpr()
            }
            args.push(expr);
            expr = newNode(op, args)
          }
          break;
        case TK_CARET:
          var op = tokenToOperator[t];
          next({oneCharToken:true});
          if((t = hd()) === TK_ADD || t === TK_SUB) {
            next();
            expr = nodeOne
          }else {
            expr = unaryExpr()
          }
          expr = newNode(op, [expr]);
          break;
        default:
          if(t === TK_VAR && lexeme() === "$") {
            next();
            if(hd()) {
              expr = multiplyNode([newNode(Model.VAR, ["$"]), postfixExpr()])
            }else {
              expr = newNode(Model.VAR, ["$"])
            }
          }else {
            expr = postfixExpr()
          }
          break
      }
      return expr
    }
    function subscriptExpr() {
      var t, args = [unaryExpr()];
      if((t = hd()) === TK_UNDERSCORE) {
        next({oneCharToken:true});
        args.push(exponentialExpr());
        if(isChemCore()) {
          if(hd() === TK_LEFTBRACE) {
            eat(TK_LEFTBRACE);
            eat(TK_RIGHTBRACE)
          }
        }
      }
      if(args.length > 1) {
        return newNode(Model.SUBSCRIPT, args)
      }else {
        return args[0]
      }
    }
    function fractionExpr() {
      var t, node = subscriptExpr();
      while((t = hd()) === TK_SLASH) {
        next();
        node = newNode(Model.FRAC, [node, subscriptExpr()]);
        node.isFraction = isSimpleFraction(node)
      }
      return node
    }
    function isChemSymbol(n) {
      var id;
      if(n.op === Model.VAR) {
        id = n.args[0]
      }else {
        if(n.op === Model.POW) {
          id = n.args[0].args[0]
        }else {
          return false
        }
      }
      var sym = Model.env[id];
      return sym && sym.mass ? true : false
    }
    function isMathSymbol(n) {
      if(n.op !== Model.VAR) {
        return false
      }
      var sym = Model.env[n.args[0]];
      return sym && sym.name ? true : false
    }
    function isVar(n, id) {
      assert(typeof id === "undefined" || typeof id === "string", "Internal error in 'isVar()'");
      if(n.op !== Model.VAR) {
        return false
      }
      return n === undefined ? true : n.args[0] === id
    }
    function isOneOrMinusOne(node) {
      return isOne(node) || isMinusOne(node)
    }
    function isOne(node) {
      return node.op === Model.NUM && node.args[0] === "1"
    }
    function isMinusOne(node) {
      return node.op === Model.SUB && (node.args.length === 1 && isOne(node.args[0]))
    }
    function multiplicativeExpr() {
      var t, expr, explicitOperator = false, prevExplicitOperator, isFraction, args = [];
      var n0;
      expr = fractionExpr();
      if(expr.op === Model.MUL && !expr.isBinomial) {
        args = expr.args
      }else {
        args = [expr]
      }
      while((t = hd()) && (!isAdditive(t) && (!isRelational(t) && (t !== TK_COMMA && (!isEquality(t) && (t !== TK_RIGHTBRACE && (t !== TK_RIGHTPAREN && (t !== TK_RIGHTBRACKET && (t !== TK_RIGHTARROW && (t !== TK_LT && (t !== TK_VERTICALBAR && (t !== TK_NEWROW && (t !== TK_NEWCOL && t !== TK_END))))))))))))) {
        prevExplicitOperator = explicitOperator;
        explicitOperator = false;
        if(isMultiplicative(t)) {
          next();
          explicitOperator = true
        }
        expr = fractionExpr();
        if(t === TK_DIV) {
          expr = newNode(Model.POW, [expr, nodeMinusOne])
        }
        assert(explicitOperator || (args.length === 0 || (expr.lbrk || (args[args.length - 1].op !== Model.NUM || (args[args.length - 1].lbrk || (isRepeatingDecimal([args[args.length - 1], expr]) || expr.op !== Model.NUM))))), message(1010));
        if(isChemCore() && (t === TK_LEFTPAREN && isVar(args[args.length - 1], "M"))) {
          args.pop();
          expr = unaryNode(Model.M, [expr])
        }else {
          if(!explicitOperator && (Model.option("ignoreCoefficientOne") && (args.length === 1 && isOneOrMinusOne(args[0])))) {
            if(isOne(args[0])) {
              args.pop()
            }else {
              expr = negate(expr)
            }
          }else {
            if(!explicitOperator && (args.length > 0 && isMixedFraction(args[args.length - 1], expr))) {
              t = args.pop();
              if(isNeg(t)) {
                expr = binaryNode(Model.MUL, [nodeMinusOne, expr])
              }
              expr = binaryNode(Model.ADD, [t, expr]);
              expr.isMixedFraction = true
            }else {
              if(!explicitOperator && (args.length > 0 && (n0 = isRepeatingDecimal([args[args.length - 1], expr])))) {
                args.pop();
                expr = n0
              }else {
                if(t === TK_MUL && (args.length > 0 && (explicitOperator && isScientific([args[args.length - 1], expr])))) {
                  t = args.pop();
                  if(isNeg(t)) {
                    expr = binaryNode(Model.MUL, [nodeMinusOne, expr])
                  }
                  expr = binaryNode(Model.MUL, [t, expr]);
                  expr.isScientific = true
                }
              }
            }
          }
        }
        if(expr.op === Model.MUL && (!expr.isScientific && !expr.isBinomial)) {
          args = args.concat(expr.args)
        }else {
          args.push(expr)
        }
      }
      if(args.length > 1) {
        return multiplyNode(args)
      }else {
        return args[0]
      }
      function isMultiplicative(t) {
        return t === TK_MUL || (t === TK_DIV || t === TK_SLASH)
      }
    }
    function isNumber(n) {
      return n.op === Model.NUM
    }
    function isMixedFraction(n0, n1) {
      if(n0.op === Model.SUB && n0.args.length === 1) {
        n0 = n0.args[0]
      }
      if(!n0.lbrk && (!n1.lbrk && (n0.op === Model.NUM && isSimpleFraction(n1)))) {
        return true
      }
      return false
    }
    function isInteger(node) {
      var mv;
      if(!node) {
        return false
      }
      if(node.op === Model.NUM && ((mv = new BigDecimal(node.args[0])) && isInteger(mv))) {
        return true
      }else {
        if(node instanceof BigDecimal) {
          return node.remainder(bigOne).compareTo(bigZero) === 0
        }
      }
      return false
    }
    var bigZero = new BigDecimal("0");
    var bigOne = new BigDecimal("1");
    function isRepeatingDecimal(args) {
      var expr, n0, n1;
      if(args[0].isRepeating === Model.DOT) {
        var n = args[0].op === Model.ADD && args[0].args[1].op === Model.NUM ? args[0].args[1] : args[0];
        assert(n.op === Model.NUM);
        var arg1;
        if(args[1].op === Model.DOT) {
          assert(args[1].args[0].op === Model.NUM);
          arg1 = numberNode(n.args[0] + args[1].args[0].args[0])
        }else {
          assert(args[1].op === Model.NUM);
          arg1 = numberNode(n.args[0] + args[1].args[0])
        }
        arg1.isRepeating = Model.DOT;
        if(args[0].op === Model.ADD) {
          args[0].args[1] = arg1;
          expr = args[0]
        }else {
          expr = arg1
        }
      }else {
        if(!args[0].lbrk && (args[0].op === Model.NUM && args[0].numberFormat === "decimal")) {
          if(args[1].lbrk === 40 && isInteger(args[1])) {
            n0 = args[0];
            n1 = args[1]
          }else {
            if(!args[1].lbrk && args[1].op === Model.OVERLINE) {
              n0 = args[0];
              n1 = args[1].args[0]
            }else {
              if(!args[1].lbrk && args[1].op === Model.DOT) {
                n0 = args[0];
                n1 = args[1].args[0]
              }else {
                return null
              }
            }
          }
          n1 = numberNode("." + n1.args[0]);
          n1.isRepeating = args[1].op;
          if(indexOf(n0.args[0], ".") >= 0) {
            var decimalPlaces = n0.args[0].length - indexOf(n0.args[0], ".") - 1;
            n1 = multiplyNode([n1, binaryNode(Model.POW, [numberNode("10"), numberNode("-" + decimalPlaces)])])
          }
          if(n0.op === Model.NUM && +n0.args[0] === 0) {
            expr = n1
          }else {
            expr = binaryNode(Model.ADD, [n0, n1])
          }
          expr.numberFormat = "decimal";
          expr.isRepeating = args[1].op
        }else {
          expr = null
        }
      }
      return expr
    }
    function isScientific(args) {
      if(args.length === 1) {
        if(args[0].op === Model.NUM && (args[0].args[0].length === 1 || indexOf(args[0].args[0], ".") === 1)) {
          return true
        }else {
          if(args[0].op === Model.POW && (args[0].args[0].op === Model.NUM && (args[0].args[0].args[0] === "10" && args[0].args[1].numberFormat === "integer"))) {
            return true
          }
        }
        return false
      }else {
        if(args.length === 2) {
          var a = args[0];
          var e = args[1];
          if(a.op === Model.NUM && ((a.args[0].length === 1 || indexOf(a.args[0], ".") === 1) && (e.op === Model.POW && (e.args[0].op === Model.NUM && (e.args[0].args[0] === "10" && e.args[1].numberFormat === "integer"))))) {
            return true
          }
          return false
        }
      }
    }
    function isNeg(n) {
      if(typeof n === "number") {
        return n < 0
      }else {
        if(n.args.length === 1) {
          return n.op === OpStr.SUB && n.args[0].args[0] > 0 || n.op === Model.NUM && +n.args[0] < 0
        }else {
          if(n.args.length === 2) {
            return n.op === OpStr.MUL && isNeg(n.args[0])
          }
        }
      }
    }
    function negate(n) {
      if(typeof n === "number") {
        return-n
      }else {
        if(n.op === Model.MUL) {
          var args = n.args.slice(0);
          return multiplyNode([negate(args.shift())].concat(args))
        }else {
          if(n.op === Model.POW && isMinusOne(n.args[1])) {
            return binaryNode(Model.POW, [negate(n.args[0]), nodeMinusOne])
          }
        }
      }
      return unaryNode(Model.SUB, [n])
    }
    function isAdditive(t) {
      return t === TK_ADD || (t === TK_SUB || (t === TK_PM || t === TK_BACKSLASH))
    }
    function additiveExpr() {
      var expr = multiplicativeExpr();
      var t;
      while(isAdditive(t = hd())) {
        next();
        var expr2 = multiplicativeExpr();
        switch(t) {
          case TK_BACKSLASH:
            expr = binaryNode(Model.BACKSLASH, [expr, expr2]);
            break;
          case TK_PM:
            expr = binaryNode(Model.PM, [expr, expr2]);
            break;
          case TK_SUB:
            expr = binaryNode(Model.SUB, [expr, expr2]);
            break;
          default:
            expr = binaryNode(Model.ADD, [expr, expr2], true);
            break
        }
      }
      return expr
    }
    function isRelational(t) {
      return t === TK_LT || (t === TK_LE || (t === TK_GT || (t === TK_GE || (t === TK_IN || (t === TK_TO || t === TK_COLON)))))
    }
    function relationalExpr() {
      var t = hd();
      var expr = additiveExpr();
      var args = [];
      while(isRelational(t = hd())) {
        next();
        var expr2 = additiveExpr();
        expr = newNode(tokenToOperator[t], [expr, expr2]);
        args.push(expr);
        expr = Model.create(expr2)
      }
      if(args.length === 0) {
        return expr
      }else {
        if(args.length === 1) {
          return args[0]
        }else {
          return newNode(Model.COMMA, args)
        }
      }
    }
    function isEquality(t) {
      return t === TK_EQL || (t === TK_NE || t === TK_APPROX)
    }
    function equalExpr() {
      var expr = relationalExpr();
      var t;
      var args = [];
      while(isEquality(t = hd()) || t === TK_RIGHTARROW) {
        next();
        var expr2 = additiveExpr();
        expr = newNode(tokenToOperator[t], [expr, expr2]);
        args.push(expr);
        expr = Model.create(expr2)
      }
      if(args.length === 0) {
        return expr
      }else {
        if(args.length === 1) {
          return args[0]
        }else {
          return newNode(Model.COMMA, args)
        }
      }
    }
    function commaExpr() {
      var expr = equalExpr();
      var args = [expr];
      var t;
      while((t = hd()) === TK_COMMA) {
        next();
        args.push(equalExpr())
      }
      if(args.length > 1) {
        return newNode(tokenToOperator[TK_COMMA], args)
      }else {
        return expr
      }
    }
    function tokenize() {
      var args = [];
      start();
      while(hd()) {
        var lex = lexeme();
        args.push(newNode(hd(), lex ? [lex] : []));
        next()
      }
      var node = newNode(Model.COMMA, args);
      return node
    }
    function expr() {
      start();
      if(hd()) {
        var n = commaExpr();
        if(n.op !== Model.COMMA && (n.lbrk === TK_LEFTBRACE && n.rbrk === TK_RIGHTBRACE)) {
          n = newNode(Model.COMMA, [n])
        }
        assert(!hd(), message(1003, [scan.pos(), scan.lexeme()]));
        return n
      }
      return nodeNone
    }
    return{expr:expr, tokenize:tokenize};
    function isInvisibleCharCode(c) {
      return isControlCharCode(c)
    }
    function isWhitespaceCharCode(c) {
      return c === 32 || (c === 9 || (c === 10 || c === 13))
    }
    function isNumberCharCode(c) {
      return c >= 48 && c <= 57
    }
    function isControlCharCode(c) {
      return c >= 1 && c <= 31 || c >= 127 && c <= 159
    }
    function stripInvisible(src) {
      var out = "";
      var c, lastCharCode;
      var curIndex = 0;
      while(curIndex < src.length) {
        while(curIndex < src.length && isInvisibleCharCode(c = src.charCodeAt(curIndex++))) {
          if(lastCharCode === 32) {
            continue
          }
          c = 9;
          lastCharCode = c
        }
        if(c === 92) {
          out += String.fromCharCode(c);
          if(curIndex < src.length) {
            c = src.charCodeAt(curIndex++)
          }
        }else {
          if(c === 9) {
            if(isNumberCharCode(out.charCodeAt(out.length - 1)) && isNumberCharCode(src.charCodeAt(curIndex))) {
              c = src.charCodeAt(curIndex++)
            }
          }
        }
        out += String.fromCharCode(c)
      }
      return out
    }
    function scanner(src) {
      var curIndex = 0;
      var lexeme = "";
      var lexemeToToken = {"\\cdot":TK_MUL, "\\times":TK_MUL, "\\div":TK_DIV, "\\dfrac":TK_FRAC, "\\frac":TK_FRAC, "\\sqrt":TK_SQRT, "\\vec":TK_VEC, "\\pm":TK_PM, "\\sin":TK_SIN, "\\cos":TK_COS, "\\tan":TK_TAN, "\\sec":TK_SEC, "\\cot":TK_COT, "\\csc":TK_CSC, "\\arcsin":TK_ARCSIN, "\\arccos":TK_ARCCOS, "\\arctan":TK_ARCTAN, "\\ln":TK_LN, "\\lg":TK_LG, "\\log":TK_LOG, "\\left":null, "\\right":null, "\\big":null, "\\Big":null, "\\bigg":null, "\\Bigg":null, "\\ ":null, "\\quad":null, "\\qquad":null, 
      "\\text":TK_TEXT, "\\textrm":TK_TEXT, "\\textit":TK_TEXT, "\\textbf":TK_TEXT, "\\lt":TK_LT, "\\le":TK_LE, "\\gt":TK_GT, "\\ge":TK_GE, "\\ne":TK_NE, "\\approx":TK_APPROX, "\\exists":TK_EXISTS, "\\in":TK_IN, "\\forall":TK_FORALL, "\\lim":TK_LIM, "\\exp":TK_EXP, "\\to":TK_TO, "\\sum":TK_SUM, "\\int":TK_INT, "\\prod":TK_PROD, "\\%":TK_PERCENT, "\\rightarrow":TK_RIGHTARROW, "\\longrightarrow":TK_RIGHTARROW, "\\binom":TK_BINOM, "\\begin":TK_BEGIN, "\\end":TK_END, "\\colon":TK_COLON, "\\vert":TK_VERTICALBAR, 
      "\\lvert":TK_VERTICALBAR, "\\rvert":TK_VERTICALBAR, "\\mid":TK_VERTICALBAR, "\\format":TK_FORMAT, "\\overline":TK_OVERLINE, "\\overset":TK_OVERSET, "\\underset":TK_UNDERSET, "\\backslash":TK_BACKSLASH, "\\mathbf":TK_MATHBF, "\\abs":TK_ABS, "\\dot":TK_DOT};
      var identifiers = keys(env);
      function isAlphaCharCode(c) {
        return c >= 65 && c <= 90 || c >= 97 && c <= 122
      }
      function start(options) {
        if(!options) {
          options = {}
        }
        var c;
        lexeme = "";
        while(curIndex < src.length) {
          switch(c = src.charCodeAt(curIndex++)) {
            case 32:
            ;
            case 9:
            ;
            case 10:
            ;
            case 13:
              continue;
            case 38:
              if(indexOf(src.substring(curIndex), "nbsp;") === 0) {
                curIndex += 5;
                continue
              }
              return TK_NEWCOL;
            case 92:
              lexeme += String.fromCharCode(c);
              switch(src.charCodeAt(curIndex)) {
                case 92:
                  curIndex++;
                  return TK_NEWROW;
                case 123:
                ;
                case 124:
                ;
                case 125:
                  return src.charCodeAt(curIndex++)
              }
              var tk = latex();
              if(tk !== null) {
                return tk
              }
              lexeme = "";
              continue;
            case 45:
              if(src.charCodeAt(curIndex) === 62) {
                curIndex++;
                return TK_RIGHTARROW
              }
            ;
            case 33:
              if(src.charCodeAt(curIndex) === 61) {
                curIndex++;
                return TK_NE
              }
              return c;
            case 37:
            ;
            case 40:
            ;
            case 41:
            ;
            case 42:
            ;
            case 43:
            ;
            case 44:
            ;
            case 47:
            ;
            case 58:
            ;
            case 61:
            ;
            case 91:
            ;
            case 93:
            ;
            case 94:
            ;
            case 95:
            ;
            case 123:
            ;
            case 124:
            ;
            case 125:
              lexeme += String.fromCharCode(c);
              return c;
            case 36:
              lexeme += String.fromCharCode(c);
              return TK_VAR;
            case 60:
              if(src.charCodeAt(curIndex) === 61) {
                curIndex++;
                return TK_LE
              }
              return TK_LT;
            case 62:
              if(src.charCodeAt(curIndex) === 61) {
                curIndex++;
                return TK_GE
              }
              return TK_GT;
            default:
              if(isAlphaCharCode(c) || c === "'".charCodeAt(0)) {
                return variable(c)
              }else {
                if(matchDecimalSeparator(String.fromCharCode(c)) || isNumberCharCode(c)) {
                  if(options.oneCharToken) {
                    lexeme += String.fromCharCode(c);
                    return TK_NUM
                  }
                  return number(c)
                }else {
                  assert(false, message(1004, [String.fromCharCode(c), c]));
                  return 0
                }
              }
          }
        }
        return 0
      }
      var lastSeparator;
      function number(c) {
        while(isNumberCharCode(c) || (matchDecimalSeparator(String.fromCharCode(c)) || (lastSeparator = matchThousandsSeparator(String.fromCharCode(c), lastSeparator)) && isNumberCharCode(src.charCodeAt(curIndex)))) {
          lexeme += String.fromCharCode(c);
          c = src.charCodeAt(curIndex++);
          if(c === 92 && src.charCodeAt(curIndex) === 32) {
            c = 32;
            curIndex++
          }
        }
        if(lexeme === "." && (indexOf(src.substring(curIndex), "overline") === 0 || indexOf(src.substring(curIndex), "dot") === 0)) {
          lexeme = "0."
        }
        curIndex--;
        return TK_NUM
      }
      function variable(c) {
        var ch = String.fromCharCode(c);
        lexeme += ch;
        while(isAlphaCharCode(c) || c === "'".charCodeAt(0)) {
          c = src.charCodeAt(curIndex++);
          var ch = String.fromCharCode(c);
          var prefix = lexeme + ch;
          var match = some(identifiers, function(u) {
            return indexOf(u, prefix) === 0
          });
          if(!match) {
            break
          }
          lexeme += ch
        }
        while(c === "'".charCodeAt(0)) {
          c = src.charCodeAt(curIndex++);
          var ch = String.fromCharCode(c);
          lexeme += ch
        }
        curIndex--;
        return TK_VAR
      }
      function latex() {
        var c = src.charCodeAt(curIndex++);
        if(c === "$".charCodeAt(0)) {
          lexeme = String.fromCharCode(c)
        }else {
          if(c === "%".charCodeAt(0)) {
            lexeme += String.fromCharCode(c)
          }else {
            if(indexOf([" ".charCodeAt(0), ":".charCodeAt(0), ";".charCodeAt(0), ",".charCodeAt(0), "!".charCodeAt(0)], c) >= 0) {
              lexeme = "\\ "
            }else {
              while(isAlphaCharCode(c)) {
                lexeme += String.fromCharCode(c);
                c = src.charCodeAt(curIndex++)
              }
              curIndex--
            }
          }
        }
        var tk = lexemeToToken[lexeme];
        if(tk === void 0) {
          tk = TK_VAR
        }else {
          if(tk === TK_TEXT) {
            var c = src.charCodeAt(curIndex++);
            while(c && c !== "{".charCodeAt(0)) {
              c = src.charCodeAt(curIndex++)
            }
            lexeme = "";
            var c = src.charCodeAt(curIndex++);
            while(c && c !== "}".charCodeAt(0)) {
              var ch = String.fromCharCode(c);
              if(ch === "&" && indexOf(src.substring(curIndex), "nbsp;") === 0) {
                curIndex += 5
              }else {
                if(ch === " " || ch === "\t") {
                }else {
                  lexeme += ch
                }
              }
              c = src.charCodeAt(curIndex++)
            }
            if(!lexeme || Model.option("ignoreText")) {
              tk = null
            }else {
              tk = TK_VAR
            }
          }
        }
        return tk
      }
      return{start:start, lexeme:function() {
        if(lexeme) {
          return lexeme
        }
      }, pos:function() {
        return curIndex
      }}
    }
  };
  return Model
}();
var MathContext = function() {
  MathContext.prototype.getDigits = getDigits;
  MathContext.prototype.getForm = getForm;
  MathContext.prototype.getLostDigits = getLostDigits;
  MathContext.prototype.getRoundingMode = getRoundingMode;
  MathContext.prototype.toString = toString;
  MathContext.prototype.isValidRound = isValidRound;
  MathContext.PLAIN = MathContext.prototype.PLAIN = 0;
  MathContext.SCIENTIFIC = MathContext.prototype.SCIENTIFIC = 1;
  MathContext.ENGINEERING = MathContext.prototype.ENGINEERING = 2;
  MathContext.ROUND_CEILING = MathContext.prototype.ROUND_CEILING = 2;
  MathContext.ROUND_DOWN = MathContext.prototype.ROUND_DOWN = 1;
  MathContext.ROUND_FLOOR = MathContext.prototype.ROUND_FLOOR = 3;
  MathContext.ROUND_HALF_DOWN = MathContext.prototype.ROUND_HALF_DOWN = 5;
  MathContext.ROUND_HALF_EVEN = MathContext.prototype.ROUND_HALF_EVEN = 6;
  MathContext.ROUND_HALF_UP = MathContext.prototype.ROUND_HALF_UP = 4;
  MathContext.ROUND_UNNECESSARY = MathContext.prototype.ROUND_UNNECESSARY = 7;
  MathContext.ROUND_UP = MathContext.prototype.ROUND_UP = 0;
  MathContext.prototype.DEFAULT_FORM = MathContext.prototype.SCIENTIFIC;
  MathContext.prototype.DEFAULT_DIGITS = 9;
  MathContext.prototype.DEFAULT_LOSTDIGITS = false;
  MathContext.prototype.DEFAULT_ROUNDINGMODE = MathContext.prototype.ROUND_HALF_UP;
  MathContext.prototype.MIN_DIGITS = 0;
  MathContext.prototype.MAX_DIGITS = 999999999;
  MathContext.prototype.ROUNDS = new Array(MathContext.prototype.ROUND_HALF_UP, MathContext.prototype.ROUND_UNNECESSARY, MathContext.prototype.ROUND_CEILING, MathContext.prototype.ROUND_DOWN, MathContext.prototype.ROUND_FLOOR, MathContext.prototype.ROUND_HALF_DOWN, MathContext.prototype.ROUND_HALF_EVEN, MathContext.prototype.ROUND_UP);
  MathContext.prototype.ROUNDWORDS = new Array("ROUND_HALF_UP", "ROUND_UNNECESSARY", "ROUND_CEILING", "ROUND_DOWN", "ROUND_FLOOR", "ROUND_HALF_DOWN", "ROUND_HALF_EVEN", "ROUND_UP");
  MathContext.prototype.DEFAULT = new MathContext(MathContext.prototype.DEFAULT_DIGITS, MathContext.prototype.DEFAULT_FORM, MathContext.prototype.DEFAULT_LOSTDIGITS, MathContext.prototype.DEFAULT_ROUNDINGMODE);
  function MathContext() {
    this.digits = 0;
    this.form = 0;
    this.lostDigits = false;
    this.roundingMode = 0;
    var setform = this.DEFAULT_FORM;
    var setlostdigits = this.DEFAULT_LOSTDIGITS;
    var setroundingmode = this.DEFAULT_ROUNDINGMODE;
    if(arguments.length == 4) {
      setform = arguments[1];
      setlostdigits = arguments[2];
      setroundingmode = arguments[3]
    }else {
      if(arguments.length == 3) {
        setform = arguments[1];
        setlostdigits = arguments[2]
      }else {
        if(arguments.length == 2) {
          setform = arguments[1]
        }else {
          if(arguments.length != 1) {
            throw"MathContext(): " + arguments.length + " arguments given; expected 1 to 4";
          }
        }
      }
    }
    var setdigits = arguments[0];
    if(setdigits != this.DEFAULT_DIGITS) {
      if(setdigits < this.MIN_DIGITS) {
        throw"MathContext(): Digits too small: " + setdigits;
      }
      if(setdigits > this.MAX_DIGITS) {
        throw"MathContext(): Digits too large: " + setdigits;
      }
    }
    if(setform == this.SCIENTIFIC) {
    }else {
      if(setform == this.ENGINEERING) {
      }else {
        if(setform == this.PLAIN) {
        }else {
          throw"MathContext() Bad form value: " + setform;
        }
      }
    }
    if(!this.isValidRound(setroundingmode)) {
      throw"MathContext(): Bad roundingMode value: " + setroundingmode;
    }
    this.digits = setdigits;
    this.form = setform;
    this.lostDigits = setlostdigits;
    this.roundingMode = setroundingmode;
    return
  }
  function getDigits() {
    return this.digits
  }
  function getForm() {
    return this.form
  }
  function getLostDigits() {
    return this.lostDigits
  }
  function getRoundingMode() {
    return this.roundingMode
  }
  function toString() {
    var formstr = null;
    var r = 0;
    var roundword = null;
    if(this.form == this.SCIENTIFIC) {
      formstr = "SCIENTIFIC"
    }else {
      if(this.form == this.ENGINEERING) {
        formstr = "ENGINEERING"
      }else {
        formstr = "PLAIN"
      }
    }
    var $1 = this.ROUNDS.length;
    r = 0;
    r:for(;$1 > 0;$1--, r++) {
      if(this.roundingMode == this.ROUNDS[r]) {
        roundword = this.ROUNDWORDS[r];
        break r
      }
    }
    return"digits=" + this.digits + " " + "form=" + formstr + " " + "lostDigits=" + (this.lostDigits ? "1" : "0") + " " + "roundingMode=" + roundword
  }
  function isValidRound(testround) {
    var r = 0;
    var $2 = this.ROUNDS.length;
    r = 0;
    r:for(;$2 > 0;$2--, r++) {
      if(testround == this.ROUNDS[r]) {
        return true
      }
    }
    return false
  }
  return MathContext
}();
var BigDecimal = function(MathContext) {
  function div(a, b) {
    return(a - a % b) / b
  }
  BigDecimal.prototype.div = div;
  function arraycopy(src, srcindex, dest, destindex, length) {
    var i;
    if(destindex > srcindex) {
      for(i = length - 1;i >= 0;--i) {
        dest[i + destindex] = src[i + srcindex]
      }
    }else {
      for(i = 0;i < length;++i) {
        dest[i + destindex] = src[i + srcindex]
      }
    }
  }
  BigDecimal.prototype.arraycopy = arraycopy;
  function createArrayWithZeros(length) {
    var retVal = new Array(length);
    var i;
    for(i = 0;i < length;++i) {
      retVal[i] = 0
    }
    return retVal
  }
  BigDecimal.prototype.createArrayWithZeros = createArrayWithZeros;
  BigDecimal.prototype.abs = abs;
  BigDecimal.prototype.add = add;
  BigDecimal.prototype.compareTo = compareTo;
  BigDecimal.prototype.divide = divide;
  BigDecimal.prototype.divideInteger = divideInteger;
  BigDecimal.prototype.max = max;
  BigDecimal.prototype.min = min;
  BigDecimal.prototype.multiply = multiply;
  BigDecimal.prototype.negate = negate;
  BigDecimal.prototype.plus = plus;
  BigDecimal.prototype.pow = pow;
  BigDecimal.prototype.remainder = remainder;
  BigDecimal.prototype.subtract = subtract;
  BigDecimal.prototype.equals = equals;
  BigDecimal.prototype.format = format;
  BigDecimal.prototype.intValueExact = intValueExact;
  BigDecimal.prototype.movePointLeft = movePointLeft;
  BigDecimal.prototype.movePointRight = movePointRight;
  BigDecimal.prototype.scale = scale;
  BigDecimal.prototype.setScale = setScale;
  BigDecimal.prototype.signum = signum;
  BigDecimal.prototype.toString = toString;
  BigDecimal.prototype.layout = layout;
  BigDecimal.prototype.intcheck = intcheck;
  BigDecimal.prototype.dodivide = dodivide;
  BigDecimal.prototype.bad = bad;
  BigDecimal.prototype.badarg = badarg;
  BigDecimal.prototype.extend = extend;
  BigDecimal.prototype.byteaddsub = byteaddsub;
  BigDecimal.prototype.diginit = diginit;
  BigDecimal.prototype.clone = clone;
  BigDecimal.prototype.checkdigits = checkdigits;
  BigDecimal.prototype.round = round;
  BigDecimal.prototype.allzero = allzero;
  BigDecimal.prototype.finish = finish;
  BigDecimal.prototype.isGreaterThan = isGreaterThan;
  BigDecimal.prototype.isLessThan = isLessThan;
  BigDecimal.prototype.isGreaterThanOrEqualTo = isGreaterThanOrEqualTo;
  BigDecimal.prototype.isLessThanOrEqualTo = isLessThanOrEqualTo;
  BigDecimal.prototype.isPositive = isPositive;
  BigDecimal.prototype.isNegative = isNegative;
  BigDecimal.prototype.isZero = isZero;
  BigDecimal.ROUND_CEILING = BigDecimal.prototype.ROUND_CEILING = MathContext.prototype.ROUND_CEILING;
  BigDecimal.ROUND_DOWN = BigDecimal.prototype.ROUND_DOWN = MathContext.prototype.ROUND_DOWN;
  BigDecimal.ROUND_FLOOR = BigDecimal.prototype.ROUND_FLOOR = MathContext.prototype.ROUND_FLOOR;
  BigDecimal.ROUND_HALF_DOWN = BigDecimal.prototype.ROUND_HALF_DOWN = MathContext.prototype.ROUND_HALF_DOWN;
  BigDecimal.ROUND_HALF_EVEN = BigDecimal.prototype.ROUND_HALF_EVEN = MathContext.prototype.ROUND_HALF_EVEN;
  BigDecimal.ROUND_HALF_UP = BigDecimal.prototype.ROUND_HALF_UP = MathContext.prototype.ROUND_HALF_UP;
  BigDecimal.ROUND_UNNECESSARY = BigDecimal.prototype.ROUND_UNNECESSARY = MathContext.prototype.ROUND_UNNECESSARY;
  BigDecimal.ROUND_UP = BigDecimal.prototype.ROUND_UP = MathContext.prototype.ROUND_UP;
  BigDecimal.prototype.ispos = 1;
  BigDecimal.prototype.iszero = 0;
  BigDecimal.prototype.isneg = -1;
  BigDecimal.prototype.MinExp = -999999999;
  BigDecimal.prototype.MaxExp = 999999999;
  BigDecimal.prototype.MinArg = -999999999;
  BigDecimal.prototype.MaxArg = 999999999;
  BigDecimal.prototype.plainMC = new MathContext(0, MathContext.prototype.PLAIN);
  BigDecimal.prototype.bytecar = new Array(90 + 99 + 1);
  BigDecimal.prototype.bytedig = diginit();
  BigDecimal.ZERO = BigDecimal.prototype.ZERO = new BigDecimal("0");
  BigDecimal.ONE = BigDecimal.prototype.ONE = new BigDecimal("1");
  BigDecimal.TEN = BigDecimal.prototype.TEN = new BigDecimal("10");
  function BigDecimal() {
    this.ind = 0;
    this.form = MathContext.prototype.PLAIN;
    this.mant = null;
    this.exp = 0;
    if(arguments.length == 0) {
      return
    }
    var inchars;
    var offset;
    var length;
    if(arguments.length == 1) {
      inchars = arguments[0];
      offset = 0;
      length = inchars.length
    }else {
      inchars = arguments[0];
      offset = arguments[1];
      length = arguments[2]
    }
    if(typeof inchars == "string") {
      inchars = inchars.split("")
    }
    var exotic;
    var hadexp;
    var d;
    var dotoff;
    var last;
    var i = 0;
    var si = 0;
    var eneg = false;
    var k = 0;
    var elen = 0;
    var j = 0;
    var sj = 0;
    var dvalue = 0;
    var mag = 0;
    if(length <= 0) {
      this.bad("BigDecimal(): ", inchars)
    }
    this.ind = this.ispos;
    if(inchars[0] == "-") {
      length--;
      if(length == 0) {
        this.bad("BigDecimal(): ", inchars)
      }
      this.ind = this.isneg;
      offset++
    }else {
      if(inchars[0] == "+") {
        length--;
        if(length == 0) {
          this.bad("BigDecimal(): ", inchars)
        }
        offset++
      }
    }
    exotic = false;
    hadexp = false;
    d = 0;
    dotoff = -1;
    last = -1;
    var $1 = length;
    i = offset;
    i:for(;$1 > 0;$1--, i++) {
      si = inchars[i];
      if(si >= "0") {
        if(si <= "9") {
          last = i;
          d++;
          continue i
        }
      }
      if(si == ".") {
        if(dotoff >= 0) {
          this.bad("BigDecimal(): ", inchars)
        }
        dotoff = i - offset;
        continue i
      }
      if(si != "e") {
        if(si != "E") {
          if(si < "0" || si > "9") {
            this.bad("BigDecimal(): ", inchars)
          }
          exotic = true;
          last = i;
          d++;
          continue i
        }
      }
      if(i - offset > length - 2) {
        this.bad("BigDecimal(): ", inchars)
      }
      eneg = false;
      if(inchars[i + 1] == "-") {
        eneg = true;
        k = i + 2
      }else {
        if(inchars[i + 1] == "+") {
          k = i + 2
        }else {
          k = i + 1
        }
      }
      elen = length - (k - offset);
      if(elen == 0 || elen > 9) {
        this.bad("BigDecimal(): ", inchars)
      }
      var $2 = elen;
      j = k;
      j:for(;$2 > 0;$2--, j++) {
        sj = inchars[j];
        if(sj < "0") {
          this.bad("BigDecimal(): ", inchars)
        }
        if(sj > "9") {
          this.bad("BigDecimal(): ", inchars)
        }else {
          dvalue = sj - "0"
        }
        this.exp = this.exp * 10 + dvalue
      }
      if(eneg) {
        this.exp = -this.exp
      }
      hadexp = true;
      break i
    }
    if(d == 0) {
      this.bad("BigDecimal(): ", inchars)
    }
    if(dotoff >= 0) {
      this.exp = this.exp + dotoff - d
    }
    var $3 = last - 1;
    i = offset;
    i:for(;i <= $3;i++) {
      si = inchars[i];
      if(si == "0") {
        offset++;
        dotoff--;
        d--
      }else {
        if(si == ".") {
          offset++;
          dotoff--
        }else {
          if(si <= "9") {
            break i
          }else {
            break i
          }
        }
      }
    }
    this.mant = new Array(d);
    j = offset;
    if(exotic) {
      exotica:do {
        var $4 = d;
        i = 0;
        i:for(;$4 > 0;$4--, i++) {
          if(i == dotoff) {
            j++
          }
          sj = inchars[j];
          if(sj <= "9") {
            this.mant[i] = sj - "0"
          }else {
            this.bad("BigDecimal(): ", inchars)
          }
          j++
        }
      }while(false)
    }else {
      simple:do {
        var $5 = d;
        i = 0;
        i:for(;$5 > 0;$5--, i++) {
          if(i == dotoff) {
            j++
          }
          this.mant[i] = inchars[j] - "0";
          j++
        }
      }while(false)
    }
    if(this.mant[0] == 0) {
      this.ind = this.iszero;
      if(this.exp > 0) {
        this.exp = 0
      }
      if(hadexp) {
        this.mant = this.ZERO.mant;
        this.exp = 0
      }
    }else {
      if(hadexp) {
        this.form = MathContext.prototype.SCIENTIFIC;
        mag = this.exp + this.mant.length - 1;
        if(mag < this.MinExp || mag > this.MaxExp) {
          this.bad("BigDecimal(): ", inchars)
        }
      }
    }
    return
  }
  function abs() {
    var set;
    if(arguments.length == 1) {
      set = arguments[0]
    }else {
      if(arguments.length == 0) {
        set = this.plainMC
      }else {
        throw"abs(): " + arguments.length + " arguments given; expected 0 or 1";
      }
    }
    if(this.ind == this.isneg) {
      return this.negate(set)
    }
    return this.plus(set)
  }
  function add() {
    var set;
    if(arguments.length == 2) {
      set = arguments[1]
    }else {
      if(arguments.length == 1) {
        set = this.plainMC
      }else {
        throw"add(): " + arguments.length + " arguments given; expected 1 or 2";
      }
    }
    var rhs = arguments[0];
    var lhs;
    var reqdig;
    var res;
    var usel;
    var usellen;
    var user;
    var userlen;
    var newlen = 0;
    var tlen = 0;
    var mult = 0;
    var t = null;
    var ia = 0;
    var ib = 0;
    var ea = 0;
    var eb = 0;
    var ca = 0;
    var cb = 0;
    if(set.lostDigits) {
      this.checkdigits(rhs, set.digits)
    }
    lhs = this;
    if(lhs.ind == 0) {
      if(set.form != MathContext.prototype.PLAIN) {
        return rhs.plus(set)
      }
    }
    if(rhs.ind == 0) {
      if(set.form != MathContext.prototype.PLAIN) {
        return lhs.plus(set)
      }
    }
    reqdig = set.digits;
    if(reqdig > 0) {
      if(lhs.mant.length > reqdig) {
        lhs = this.clone(lhs).round(set)
      }
      if(rhs.mant.length > reqdig) {
        rhs = this.clone(rhs).round(set)
      }
    }
    res = new BigDecimal;
    usel = lhs.mant;
    usellen = lhs.mant.length;
    user = rhs.mant;
    userlen = rhs.mant.length;
    padder:do {
      if(lhs.exp == rhs.exp) {
        res.exp = lhs.exp
      }else {
        if(lhs.exp > rhs.exp) {
          newlen = usellen + lhs.exp - rhs.exp;
          if(newlen >= userlen + reqdig + 1) {
            if(reqdig > 0) {
              res.mant = usel;
              res.exp = lhs.exp;
              res.ind = lhs.ind;
              if(usellen < reqdig) {
                res.mant = this.extend(lhs.mant, reqdig);
                res.exp = res.exp - (reqdig - usellen)
              }
              return res.finish(set, false)
            }
          }
          res.exp = rhs.exp;
          if(newlen > reqdig + 1) {
            if(reqdig > 0) {
              tlen = newlen - reqdig - 1;
              userlen = userlen - tlen;
              res.exp = res.exp + tlen;
              newlen = reqdig + 1
            }
          }
          if(newlen > usellen) {
            usellen = newlen
          }
        }else {
          newlen = userlen + rhs.exp - lhs.exp;
          if(newlen >= usellen + reqdig + 1) {
            if(reqdig > 0) {
              res.mant = user;
              res.exp = rhs.exp;
              res.ind = rhs.ind;
              if(userlen < reqdig) {
                res.mant = this.extend(rhs.mant, reqdig);
                res.exp = res.exp - (reqdig - userlen)
              }
              return res.finish(set, false)
            }
          }
          res.exp = lhs.exp;
          if(newlen > reqdig + 1) {
            if(reqdig > 0) {
              tlen = newlen - reqdig - 1;
              usellen = usellen - tlen;
              res.exp = res.exp + tlen;
              newlen = reqdig + 1
            }
          }
          if(newlen > userlen) {
            userlen = newlen
          }
        }
      }
    }while(false);
    if(lhs.ind == this.iszero) {
      res.ind = this.ispos
    }else {
      res.ind = lhs.ind
    }
    if((lhs.ind == this.isneg ? 1 : 0) == (rhs.ind == this.isneg ? 1 : 0)) {
      mult = 1
    }else {
      signdiff:do {
        mult = -1;
        swaptest:do {
          if(rhs.ind == this.iszero) {
          }else {
            if(usellen < userlen || lhs.ind == this.iszero) {
              t = usel;
              usel = user;
              user = t;
              tlen = usellen;
              usellen = userlen;
              userlen = tlen;
              res.ind = -res.ind
            }else {
              if(usellen > userlen) {
              }else {
                ia = 0;
                ib = 0;
                ea = usel.length - 1;
                eb = user.length - 1;
                compare:for(;;) {
                  if(ia <= ea) {
                    ca = usel[ia]
                  }else {
                    if(ib > eb) {
                      if(set.form != MathContext.prototype.PLAIN) {
                        return this.ZERO
                      }
                      break compare
                    }
                    ca = 0
                  }
                  if(ib <= eb) {
                    cb = user[ib]
                  }else {
                    cb = 0
                  }
                  if(ca != cb) {
                    if(ca < cb) {
                      t = usel;
                      usel = user;
                      user = t;
                      tlen = usellen;
                      usellen = userlen;
                      userlen = tlen;
                      res.ind = -res.ind
                    }
                    break compare
                  }
                  ia++;
                  ib++
                }
              }
            }
          }
        }while(false)
      }while(false)
    }
    res.mant = this.byteaddsub(usel, usellen, user, userlen, mult, false);
    return res.finish(set, false)
  }
  function compareTo() {
    var set;
    if(arguments.length == 2) {
      set = arguments[1]
    }else {
      if(arguments.length == 1) {
        set = this.plainMC
      }else {
        throw"compareTo(): " + arguments.length + " arguments given; expected 1 or 2";
      }
    }
    var rhs = arguments[0];
    var thislength = 0;
    var i = 0;
    var newrhs;
    if(set.lostDigits) {
      this.checkdigits(rhs, set.digits)
    }
    if(this.ind == rhs.ind && this.exp == rhs.exp) {
      thislength = this.mant.length;
      if(thislength < rhs.mant.length) {
        return-this.ind
      }
      if(thislength > rhs.mant.length) {
        return this.ind
      }
      if(thislength <= set.digits || set.digits == 0) {
        var $6 = thislength;
        i = 0;
        i:for(;$6 > 0;$6--, i++) {
          if(this.mant[i] < rhs.mant[i]) {
            return-this.ind
          }
          if(this.mant[i] > rhs.mant[i]) {
            return this.ind
          }
        }
        return 0
      }
    }else {
      if(this.ind < rhs.ind) {
        return-1
      }
      if(this.ind > rhs.ind) {
        return 1
      }
    }
    newrhs = this.clone(rhs);
    newrhs.ind = -newrhs.ind;
    return this.add(newrhs, set).ind
  }
  function divide() {
    var set;
    var scale = -1;
    if(arguments.length == 2) {
      if(typeof arguments[1] == "number") {
        set = new MathContext(0, MathContext.prototype.PLAIN, false, arguments[1])
      }else {
        set = arguments[1]
      }
    }else {
      if(arguments.length == 3) {
        scale = arguments[1];
        if(scale < 0) {
          throw"divide(): Negative scale: " + scale;
        }
        set = new MathContext(0, MathContext.prototype.PLAIN, false, arguments[2])
      }else {
        if(arguments.length == 1) {
          set = this.plainMC
        }else {
          throw"divide(): " + arguments.length + " arguments given; expected between 1 and 3";
        }
      }
    }
    var rhs = arguments[0];
    return this.dodivide("D", rhs, set, scale)
  }
  function divideInteger() {
    var set;
    if(arguments.length == 2) {
      set = arguments[1]
    }else {
      if(arguments.length == 1) {
        set = this.plainMC
      }else {
        throw"divideInteger(): " + arguments.length + " arguments given; expected 1 or 2";
      }
    }
    var rhs = arguments[0];
    return this.dodivide("I", rhs, set, 0)
  }
  function max() {
    var set;
    if(arguments.length == 2) {
      set = arguments[1]
    }else {
      if(arguments.length == 1) {
        set = this.plainMC
      }else {
        throw"max(): " + arguments.length + " arguments given; expected 1 or 2";
      }
    }
    var rhs = arguments[0];
    if(this.compareTo(rhs, set) >= 0) {
      return this.plus(set)
    }else {
      return rhs.plus(set)
    }
  }
  function min() {
    var set;
    if(arguments.length == 2) {
      set = arguments[1]
    }else {
      if(arguments.length == 1) {
        set = this.plainMC
      }else {
        throw"min(): " + arguments.length + " arguments given; expected 1 or 2";
      }
    }
    var rhs = arguments[0];
    if(this.compareTo(rhs, set) <= 0) {
      return this.plus(set)
    }else {
      return rhs.plus(set)
    }
  }
  function multiply() {
    var set;
    if(arguments.length == 2) {
      set = arguments[1]
    }else {
      if(arguments.length == 1) {
        set = this.plainMC
      }else {
        throw"multiply(): " + arguments.length + " arguments given; expected 1 or 2";
      }
    }
    var rhs = arguments[0];
    var lhs;
    var padding;
    var reqdig;
    var multer = null;
    var multand = null;
    var multandlen;
    var acclen = 0;
    var res;
    var acc;
    var n = 0;
    var mult = 0;
    if(set.lostDigits) {
      this.checkdigits(rhs, set.digits)
    }
    lhs = this;
    padding = 0;
    reqdig = set.digits;
    if(reqdig > 0) {
      if(lhs.mant.length > reqdig) {
        lhs = this.clone(lhs).round(set)
      }
      if(rhs.mant.length > reqdig) {
        rhs = this.clone(rhs).round(set)
      }
    }else {
      if(lhs.exp > 0) {
        padding = padding + lhs.exp
      }
      if(rhs.exp > 0) {
        padding = padding + rhs.exp
      }
    }
    if(lhs.mant.length < rhs.mant.length) {
      multer = lhs.mant;
      multand = rhs.mant
    }else {
      multer = rhs.mant;
      multand = lhs.mant
    }
    multandlen = multer.length + multand.length - 1;
    if(multer[0] * multand[0] > 9) {
      acclen = multandlen + 1
    }else {
      acclen = multandlen
    }
    res = new BigDecimal;
    acc = this.createArrayWithZeros(acclen);
    var $7 = multer.length;
    n = 0;
    n:for(;$7 > 0;$7--, n++) {
      mult = multer[n];
      if(mult != 0) {
        acc = this.byteaddsub(acc, acc.length, multand, multandlen, mult, true)
      }
      multandlen--
    }
    res.ind = lhs.ind * rhs.ind;
    res.exp = lhs.exp + rhs.exp - padding;
    if(padding == 0) {
      res.mant = acc
    }else {
      res.mant = this.extend(acc, acc.length + padding)
    }
    return res.finish(set, false)
  }
  function negate() {
    var set;
    if(arguments.length == 1) {
      set = arguments[0]
    }else {
      if(arguments.length == 0) {
        set = this.plainMC
      }else {
        throw"negate(): " + arguments.length + " arguments given; expected 0 or 1";
      }
    }
    var res;
    if(set.lostDigits) {
      this.checkdigits(null, set.digits)
    }
    res = this.clone(this);
    res.ind = -res.ind;
    return res.finish(set, false)
  }
  function plus() {
    var set;
    if(arguments.length == 1) {
      set = arguments[0]
    }else {
      if(arguments.length == 0) {
        set = this.plainMC
      }else {
        throw"plus(): " + arguments.length + " arguments given; expected 0 or 1";
      }
    }
    if(set.lostDigits) {
      this.checkdigits(null, set.digits)
    }
    if(set.form == MathContext.prototype.PLAIN) {
      if(this.form == MathContext.prototype.PLAIN) {
        if(this.mant.length <= set.digits) {
          return this
        }
        if(set.digits == 0) {
          return this
        }
      }
    }
    return this.clone(this).finish(set, false)
  }
  function pow() {
    var set;
    if(arguments.length == 2) {
      set = arguments[1]
    }else {
      if(arguments.length == 1) {
        set = this.plainMC
      }else {
        throw"pow(): " + arguments.length + " arguments given; expected 1 or 2";
      }
    }
    var rhs = arguments[0];
    var n;
    var lhs;
    var reqdig;
    var workdigits = 0;
    var L = 0;
    var workset;
    var res;
    var seenbit;
    var i = 0;
    if(set.lostDigits) {
      this.checkdigits(rhs, set.digits)
    }
    n = rhs.intcheck(this.MinArg, this.MaxArg);
    lhs = this;
    reqdig = set.digits;
    if(reqdig == 0) {
      if(rhs.ind == this.isneg) {
        throw"pow(): Negative power: " + rhs.toString();
      }
      workdigits = 0
    }else {
      if(rhs.mant.length + rhs.exp > reqdig) {
        throw"pow(): Too many digits: " + rhs.toString();
      }
      if(lhs.mant.length > reqdig) {
        lhs = this.clone(lhs).round(set)
      }
      L = rhs.mant.length + rhs.exp;
      workdigits = reqdig + L + 1
    }
    workset = new MathContext(workdigits, set.form, false, set.roundingMode);
    res = this.ONE;
    if(n == 0) {
      return res
    }
    if(n < 0) {
      n = -n
    }
    seenbit = false;
    i = 1;
    i:for(;;i++) {
      n <<= 1;
      if(n < 0) {
        seenbit = true;
        res = res.multiply(lhs, workset)
      }
      if(i == 31) {
        break i
      }
      if(!seenbit) {
        continue i
      }
      res = res.multiply(res, workset)
    }
    if(rhs.ind < 0) {
      res = this.ONE.divide(res, workset)
    }
    return res.finish(set, true)
  }
  function remainder() {
    var set;
    if(arguments.length == 2) {
      set = arguments[1]
    }else {
      if(arguments.length == 1) {
        set = this.plainMC
      }else {
        throw"remainder(): " + arguments.length + " arguments given; expected 1 or 2";
      }
    }
    var rhs = arguments[0];
    return this.dodivide("R", rhs, set, -1)
  }
  function subtract() {
    var set;
    if(arguments.length == 2) {
      set = arguments[1]
    }else {
      if(arguments.length == 1) {
        set = this.plainMC
      }else {
        throw"subtract(): " + arguments.length + " arguments given; expected 1 or 2";
      }
    }
    var rhs = arguments[0];
    var newrhs;
    if(set.lostDigits) {
      this.checkdigits(rhs, set.digits)
    }
    newrhs = this.clone(rhs);
    newrhs.ind = -newrhs.ind;
    return this.add(newrhs, set)
  }
  function equals(obj) {
    var rhs;
    var i = 0;
    var lca = null;
    var rca = null;
    if(obj == null) {
      return false
    }
    if(!(obj instanceof BigDecimal)) {
      return false
    }
    rhs = obj;
    if(this.ind != rhs.ind) {
      return false
    }
    if(this.mant.length == rhs.mant.length && this.exp == rhs.exp && this.form == rhs.form) {
      var $8 = this.mant.length;
      i = 0;
      i:for(;$8 > 0;$8--, i++) {
        if(this.mant[i] != rhs.mant[i]) {
          return false
        }
      }
    }else {
      lca = this.layout();
      rca = rhs.layout();
      if(lca.length != rca.length) {
        return false
      }
      var $9 = lca.length;
      i = 0;
      i:for(;$9 > 0;$9--, i++) {
        if(lca[i] != rca[i]) {
          return false
        }
      }
    }
    return true
  }
  function format() {
    var explaces;
    var exdigits;
    var exformint;
    var exround;
    if(arguments.length == 6) {
      explaces = arguments[2];
      exdigits = arguments[3];
      exformint = arguments[4];
      exround = arguments[5]
    }else {
      if(arguments.length == 2) {
        explaces = -1;
        exdigits = -1;
        exformint = MathContext.prototype.SCIENTIFIC;
        exround = this.ROUND_HALF_UP
      }else {
        throw"format(): " + arguments.length + " arguments given; expected 2 or 6";
      }
    }
    var before = arguments[0];
    var after = arguments[1];
    var num;
    var mag = 0;
    var thisafter = 0;
    var lead = 0;
    var newmant = null;
    var chop = 0;
    var need = 0;
    var oldexp = 0;
    var a;
    var p = 0;
    var newa = null;
    var i = 0;
    var places = 0;
    if(before < -1 || before == 0) {
      this.badarg("format", 1, before)
    }
    if(after < -1) {
      this.badarg("format", 2, after)
    }
    if(explaces < -1 || explaces == 0) {
      this.badarg("format", 3, explaces)
    }
    if(exdigits < -1) {
      this.badarg("format", 4, exdigits)
    }
    if(exformint == MathContext.prototype.SCIENTIFIC) {
    }else {
      if(exformint == MathContext.prototype.ENGINEERING) {
      }else {
        if(exformint == -1) {
          exformint = MathContext.prototype.SCIENTIFIC
        }else {
          this.badarg("format", 5, exformint)
        }
      }
    }
    if(exround != this.ROUND_HALF_UP) {
      try {
        if(exround == -1) {
          exround = this.ROUND_HALF_UP
        }else {
          new MathContext(9, MathContext.prototype.SCIENTIFIC, false, exround)
        }
      }catch($10) {
        this.badarg("format", 6, exround)
      }
    }
    num = this.clone(this);
    setform:do {
      if(exdigits == -1) {
        num.form = MathContext.prototype.PLAIN
      }else {
        if(num.ind == this.iszero) {
          num.form = MathContext.prototype.PLAIN
        }else {
          mag = num.exp + num.mant.length;
          if(mag > exdigits) {
            num.form = exformint
          }else {
            if(mag < -5) {
              num.form = exformint
            }else {
              num.form = MathContext.prototype.PLAIN
            }
          }
        }
      }
    }while(false);
    if(after >= 0) {
      setafter:for(;;) {
        if(num.form == MathContext.prototype.PLAIN) {
          thisafter = -num.exp
        }else {
          if(num.form == MathContext.prototype.SCIENTIFIC) {
            thisafter = num.mant.length - 1
          }else {
            lead = (num.exp + num.mant.length - 1) % 3;
            if(lead < 0) {
              lead = 3 + lead
            }
            lead++;
            if(lead >= num.mant.length) {
              thisafter = 0
            }else {
              thisafter = num.mant.length - lead
            }
          }
        }
        if(thisafter == after) {
          break setafter
        }
        if(thisafter < after) {
          newmant = this.extend(num.mant, num.mant.length + after - thisafter);
          num.mant = newmant;
          num.exp = num.exp - (after - thisafter);
          if(num.exp < this.MinExp) {
            throw"format(): Exponent Overflow: " + num.exp;
          }
          break setafter
        }
        chop = thisafter - after;
        if(chop > num.mant.length) {
          num.mant = this.ZERO.mant;
          num.ind = this.iszero;
          num.exp = 0;
          continue setafter
        }
        need = num.mant.length - chop;
        oldexp = num.exp;
        num.round(need, exround);
        if(num.exp - oldexp == chop) {
          break setafter
        }
      }
    }
    a = num.layout();
    if(before > 0) {
      var $11 = a.length;
      p = 0;
      p:for(;$11 > 0;$11--, p++) {
        if(a[p] == ".") {
          break p
        }
        if(a[p] == "E") {
          break p
        }
      }
      if(p > before) {
        this.badarg("format", 1, before)
      }
      if(p < before) {
        newa = new Array(a.length + before - p);
        var $12 = before - p;
        i = 0;
        i:for(;$12 > 0;$12--, i++) {
          newa[i] = " "
        }
        this.arraycopy(a, 0, newa, i, a.length);
        a = newa
      }
    }
    if(explaces > 0) {
      var $13 = a.length - 1;
      p = a.length - 1;
      p:for(;$13 > 0;$13--, p--) {
        if(a[p] == "E") {
          break p
        }
      }
      if(p == 0) {
        newa = new Array(a.length + explaces + 2);
        this.arraycopy(a, 0, newa, 0, a.length);
        var $14 = explaces + 2;
        i = a.length;
        i:for(;$14 > 0;$14--, i++) {
          newa[i] = " "
        }
        a = newa
      }else {
        places = a.length - p - 2;
        if(places > explaces) {
          this.badarg("format", 3, explaces)
        }
        if(places < explaces) {
          newa = new Array(a.length + explaces - places);
          this.arraycopy(a, 0, newa, 0, p + 2);
          var $15 = explaces - places;
          i = p + 2;
          i:for(;$15 > 0;$15--, i++) {
            newa[i] = "0"
          }
          this.arraycopy(a, p + 2, newa, i, places);
          a = newa
        }
      }
    }
    return a.join("")
  }
  function intValueExact() {
    var lodigit;
    var useexp = 0;
    var result;
    var i = 0;
    var topdig = 0;
    if(this.ind == this.iszero) {
      return 0
    }
    lodigit = this.mant.length - 1;
    if(this.exp < 0) {
      lodigit = lodigit + this.exp;
      if(!this.allzero(this.mant, lodigit + 1)) {
        throw"intValueExact(): Decimal part non-zero: " + this.toString();
      }
      if(lodigit < 0) {
        return 0
      }
      useexp = 0
    }else {
      if(this.exp + lodigit > 9) {
        throw"intValueExact(): Conversion overflow: " + this.toString();
      }
      useexp = this.exp
    }
    result = 0;
    var $16 = lodigit + useexp;
    i = 0;
    i:for(;i <= $16;i++) {
      result = result * 10;
      if(i <= lodigit) {
        result = result + this.mant[i]
      }
    }
    if(lodigit + useexp == 9) {
      topdig = div(result, 1E9);
      if(topdig != this.mant[0]) {
        if(result == -2147483648) {
          if(this.ind == this.isneg) {
            if(this.mant[0] == 2) {
              return result
            }
          }
        }
        throw"intValueExact(): Conversion overflow: " + this.toString();
      }
    }
    if(this.ind == this.ispos) {
      return result
    }
    return-result
  }
  function movePointLeft(n) {
    var res;
    res = this.clone(this);
    res.exp = res.exp - n;
    return res.finish(this.plainMC, false)
  }
  function movePointRight(n) {
    var res;
    res = this.clone(this);
    res.exp = res.exp + n;
    return res.finish(this.plainMC, false)
  }
  function scale() {
    if(this.exp >= 0) {
      return 0
    }
    return-this.exp
  }
  function setScale() {
    var round;
    if(arguments.length == 2) {
      round = arguments[1]
    }else {
      if(arguments.length == 1) {
        round = this.ROUND_UNNECESSARY
      }else {
        throw"setScale(): " + arguments.length + " given; expected 1 or 2";
      }
    }
    var scale = arguments[0];
    var ourscale;
    var res;
    var padding = 0;
    var newlen = 0;
    ourscale = this.scale();
    if(ourscale == scale) {
      if(this.form == MathContext.prototype.PLAIN) {
        return this
      }
    }
    res = this.clone(this);
    if(ourscale <= scale) {
      if(ourscale == 0) {
        padding = res.exp + scale
      }else {
        padding = scale - ourscale
      }
      res.mant = this.extend(res.mant, res.mant.length + padding);
      res.exp = -scale
    }else {
      if(scale < 0) {
        throw"setScale(): Negative scale: " + scale;
      }
      newlen = res.mant.length - (ourscale - scale);
      res = res.round(newlen, round);
      if(res.exp != -scale) {
        res.mant = this.extend(res.mant, res.mant.length + 1);
        res.exp = res.exp - 1
      }
    }
    res.form = MathContext.prototype.PLAIN;
    return res
  }
  function signum() {
    return this.ind
  }
  function toString() {
    return this.layout().join("")
  }
  function layout() {
    var cmant;
    var i = 0;
    var sb = null;
    var euse = 0;
    var sig = 0;
    var csign = 0;
    var rec = null;
    var needsign;
    var mag;
    var len = 0;
    cmant = new Array(this.mant.length);
    var $18 = this.mant.length;
    i = 0;
    i:for(;$18 > 0;$18--, i++) {
      cmant[i] = this.mant[i] + ""
    }
    if(this.form != MathContext.prototype.PLAIN) {
      sb = "";
      if(this.ind == this.isneg) {
        sb += "-"
      }
      euse = this.exp + cmant.length - 1;
      if(this.form == MathContext.prototype.SCIENTIFIC) {
        sb += cmant[0];
        if(cmant.length > 1) {
          sb += "."
        }
        sb += cmant.slice(1).join("")
      }else {
        engineering:do {
          sig = euse % 3;
          if(sig < 0) {
            sig = 3 + sig
          }
          euse = euse - sig;
          sig++;
          if(sig >= cmant.length) {
            sb += cmant.join("");
            var $19 = sig - cmant.length;
            for(;$19 > 0;$19--) {
              sb += "0"
            }
          }else {
            sb += cmant.slice(0, sig).join("");
            sb += ".";
            sb += cmant.slice(sig).join("")
          }
        }while(false)
      }
      if(euse != 0) {
        if(euse < 0) {
          csign = "-";
          euse = -euse
        }else {
          csign = "+"
        }
        sb += "E";
        sb += csign;
        sb += euse
      }
      return sb.split("")
    }
    if(this.exp == 0) {
      if(this.ind >= 0) {
        return cmant
      }
      rec = new Array(cmant.length + 1);
      rec[0] = "-";
      this.arraycopy(cmant, 0, rec, 1, cmant.length);
      return rec
    }
    needsign = this.ind == this.isneg ? 1 : 0;
    mag = this.exp + cmant.length;
    if(mag < 1) {
      len = needsign + 2 - this.exp;
      rec = new Array(len);
      if(needsign != 0) {
        rec[0] = "-"
      }
      rec[needsign] = "0";
      rec[needsign + 1] = ".";
      var $20 = -mag;
      i = needsign + 2;
      i:for(;$20 > 0;$20--, i++) {
        rec[i] = "0"
      }
      this.arraycopy(cmant, 0, rec, needsign + 2 - mag, cmant.length);
      return rec
    }
    if(mag > cmant.length) {
      len = needsign + mag;
      rec = new Array(len);
      if(needsign != 0) {
        rec[0] = "-"
      }
      this.arraycopy(cmant, 0, rec, needsign, cmant.length);
      var $21 = mag - cmant.length;
      i = needsign + cmant.length;
      i:for(;$21 > 0;$21--, i++) {
        rec[i] = "0"
      }
      return rec
    }
    len = needsign + 1 + cmant.length;
    rec = new Array(len);
    if(needsign != 0) {
      rec[0] = "-"
    }
    this.arraycopy(cmant, 0, rec, needsign, mag);
    rec[needsign + mag] = ".";
    this.arraycopy(cmant, mag, rec, needsign + mag + 1, cmant.length - mag);
    return rec
  }
  function intcheck(min, max) {
    var i;
    i = this.intValueExact();
    if(i < min || i > max) {
      throw"intcheck(): Conversion overflow: " + i;
    }
    return i
  }
  function dodivide(code, rhs, set, scale) {
    var lhs;
    var reqdig;
    var newexp;
    var res;
    var newlen;
    var var1;
    var var1len;
    var var2;
    var var2len;
    var b2b;
    var have;
    var thisdigit = 0;
    var i = 0;
    var v2 = 0;
    var ba = 0;
    var mult = 0;
    var start = 0;
    var padding = 0;
    var d = 0;
    var newvar1 = null;
    var lasthave = 0;
    var actdig = 0;
    var newmant = null;
    if(set.lostDigits) {
      this.checkdigits(rhs, set.digits)
    }
    lhs = this;
    if(rhs.ind == 0) {
      throw"dodivide(): Divide by 0";
    }
    if(lhs.ind == 0) {
      if(set.form != MathContext.prototype.PLAIN) {
        return this.ZERO
      }
      if(scale == -1) {
        return lhs
      }
      return lhs.setScale(scale)
    }
    reqdig = set.digits;
    if(reqdig > 0) {
      if(lhs.mant.length > reqdig) {
        lhs = this.clone(lhs).round(set)
      }
      if(rhs.mant.length > reqdig) {
        rhs = this.clone(rhs).round(set)
      }
    }else {
      if(scale == -1) {
        scale = lhs.scale()
      }
      reqdig = lhs.mant.length;
      if(scale != -lhs.exp) {
        reqdig = reqdig + scale + lhs.exp
      }
      reqdig = reqdig - (rhs.mant.length - 1) - rhs.exp;
      if(reqdig < lhs.mant.length) {
        reqdig = lhs.mant.length
      }
      if(reqdig < rhs.mant.length) {
        reqdig = rhs.mant.length
      }
    }
    newexp = lhs.exp - rhs.exp + lhs.mant.length - rhs.mant.length;
    if(newexp < 0) {
      if(code != "D") {
        if(code == "I") {
          return this.ZERO
        }
        return this.clone(lhs).finish(set, false)
      }
    }
    res = new BigDecimal;
    res.ind = lhs.ind * rhs.ind;
    res.exp = newexp;
    res.mant = this.createArrayWithZeros(reqdig + 1);
    newlen = reqdig + reqdig + 1;
    var1 = this.extend(lhs.mant, newlen);
    var1len = newlen;
    var2 = rhs.mant;
    var2len = newlen;
    b2b = var2[0] * 10 + 1;
    if(var2.length > 1) {
      b2b = b2b + var2[1]
    }
    have = 0;
    outer:for(;;) {
      thisdigit = 0;
      inner:for(;;) {
        if(var1len < var2len) {
          break inner
        }
        if(var1len == var2len) {
          compare:do {
            var $22 = var1len;
            i = 0;
            i:for(;$22 > 0;$22--, i++) {
              if(i < var2.length) {
                v2 = var2[i]
              }else {
                v2 = 0
              }
              if(var1[i] < v2) {
                break inner
              }
              if(var1[i] > v2) {
                break compare
              }
            }
            thisdigit++;
            res.mant[have] = thisdigit;
            have++;
            var1[0] = 0;
            break outer
          }while(false);
          ba = var1[0]
        }else {
          ba = var1[0] * 10;
          if(var1len > 1) {
            ba = ba + var1[1]
          }
        }
        mult = div(ba * 10, b2b);
        if(mult == 0) {
          mult = 1
        }
        thisdigit = thisdigit + mult;
        var1 = this.byteaddsub(var1, var1len, var2, var2len, -mult, true);
        if(var1[0] != 0) {
          continue inner
        }
        var $23 = var1len - 2;
        start = 0;
        start:for(;start <= $23;start++) {
          if(var1[start] != 0) {
            break start
          }
          var1len--
        }
        if(start == 0) {
          continue inner
        }
        this.arraycopy(var1, start, var1, 0, var1len)
      }
      if(have != 0 || thisdigit != 0) {
        res.mant[have] = thisdigit;
        have++;
        if(have == reqdig + 1) {
          break outer
        }
        if(var1[0] == 0) {
          break outer
        }
      }
      if(scale >= 0) {
        if(-res.exp > scale) {
          break outer
        }
      }
      if(code != "D") {
        if(res.exp <= 0) {
          break outer
        }
      }
      res.exp = res.exp - 1;
      var2len--
    }
    if(have == 0) {
      have = 1
    }
    if(code == "I" || code == "R") {
      if(have + res.exp > reqdig) {
        throw"dodivide(): Integer overflow";
      }
      if(code == "R") {
        remainder:do {
          if(res.mant[0] == 0) {
            return this.clone(lhs).finish(set, false)
          }
          if(var1[0] == 0) {
            return this.ZERO
          }
          res.ind = lhs.ind;
          padding = reqdig + reqdig + 1 - lhs.mant.length;
          res.exp = res.exp - padding + lhs.exp;
          d = var1len;
          i = d - 1;
          i:for(;i >= 1;i--) {
            if(!(res.exp < lhs.exp && res.exp < rhs.exp)) {
              break
            }
            if(var1[i] != 0) {
              break i
            }
            d--;
            res.exp = res.exp + 1
          }
          if(d < var1.length) {
            newvar1 = new Array(d);
            this.arraycopy(var1, 0, newvar1, 0, d);
            var1 = newvar1
          }
          res.mant = var1;
          return res.finish(set, false)
        }while(false)
      }
    }else {
      if(var1[0] != 0) {
        lasthave = res.mant[have - 1];
        if(lasthave % 5 == 0) {
          res.mant[have - 1] = lasthave + 1
        }
      }
    }
    if(scale >= 0) {
      scaled:do {
        if(have != res.mant.length) {
          res.exp = res.exp - (res.mant.length - have)
        }
        actdig = res.mant.length - (-res.exp - scale);
        res.round(actdig, set.roundingMode);
        if(res.exp != -scale) {
          res.mant = this.extend(res.mant, res.mant.length + 1);
          res.exp = res.exp - 1
        }
        return res.finish(set, true)
      }while(false)
    }
    if(have == res.mant.length) {
      res.round(set);
      have = reqdig
    }else {
      if(res.mant[0] == 0) {
        return this.ZERO
      }
      newmant = new Array(have);
      this.arraycopy(res.mant, 0, newmant, 0, have);
      res.mant = newmant
    }
    return res.finish(set, true)
  }
  function bad(prefix, s) {
    throw prefix + "Not a number: " + s;
  }
  function badarg(name, pos, value) {
    throw"Bad argument " + pos + " to " + name + ": " + value;
  }
  function extend(inarr, newlen) {
    var newarr;
    if(inarr.length == newlen) {
      return inarr
    }
    newarr = createArrayWithZeros(newlen);
    this.arraycopy(inarr, 0, newarr, 0, inarr.length);
    return newarr
  }
  function byteaddsub(a, avlen, b, bvlen, m, reuse) {
    var alength;
    var blength;
    var ap;
    var bp;
    var maxarr;
    var reb;
    var quickm;
    var digit;
    var op = 0;
    var dp90 = 0;
    var newarr;
    var i = 0;
    alength = a.length;
    blength = b.length;
    ap = avlen - 1;
    bp = bvlen - 1;
    maxarr = bp;
    if(maxarr < ap) {
      maxarr = ap
    }
    reb = null;
    if(reuse) {
      if(maxarr + 1 == alength) {
        reb = a
      }
    }
    if(reb == null) {
      reb = this.createArrayWithZeros(maxarr + 1)
    }
    quickm = false;
    if(m == 1) {
      quickm = true
    }else {
      if(m == -1) {
        quickm = true
      }
    }
    digit = 0;
    op = maxarr;
    op:for(;op >= 0;op--) {
      if(ap >= 0) {
        if(ap < alength) {
          digit = digit + a[ap]
        }
        ap--
      }
      if(bp >= 0) {
        if(bp < blength) {
          if(quickm) {
            if(m > 0) {
              digit = digit + b[bp]
            }else {
              digit = digit - b[bp]
            }
          }else {
            digit = digit + b[bp] * m
          }
        }
        bp--
      }
      if(digit < 10) {
        if(digit >= 0) {
          quick:do {
            reb[op] = digit;
            digit = 0;
            continue op
          }while(false)
        }
      }
      dp90 = digit + 90;
      reb[op] = this.bytedig[dp90];
      digit = this.bytecar[dp90]
    }
    if(digit == 0) {
      return reb
    }
    newarr = null;
    if(reuse) {
      if(maxarr + 2 == a.length) {
        newarr = a
      }
    }
    if(newarr == null) {
      newarr = new Array(maxarr + 2)
    }
    newarr[0] = digit;
    var $24 = maxarr + 1;
    i = 0;
    i:for(;$24 > 0;$24--, i++) {
      newarr[i + 1] = reb[i]
    }
    return newarr
  }
  function diginit() {
    var work;
    var op = 0;
    var digit = 0;
    work = new Array(90 + 99 + 1);
    op = 0;
    op:for(;op <= 90 + 99;op++) {
      digit = op - 90;
      if(digit >= 0) {
        work[op] = digit % 10;
        BigDecimal.prototype.bytecar[op] = div(digit, 10);
        continue op
      }
      digit = digit + 100;
      work[op] = digit % 10;
      BigDecimal.prototype.bytecar[op] = div(digit, 10) - 10
    }
    return work
  }
  function clone(dec) {
    var copy;
    copy = new BigDecimal;
    copy.ind = dec.ind;
    copy.exp = dec.exp;
    copy.form = dec.form;
    copy.mant = dec.mant;
    return copy
  }
  function checkdigits(rhs, dig) {
    if(dig == 0) {
      return
    }
    if(this.mant.length > dig) {
      if(!this.allzero(this.mant, dig)) {
        throw"Too many digits: " + this.toString();
      }
    }
    if(rhs == null) {
      return
    }
    if(rhs.mant.length > dig) {
      if(!this.allzero(rhs.mant, dig)) {
        throw"Too many digits: " + rhs.toString();
      }
    }
    return
  }
  function round() {
    var len;
    var mode;
    if(arguments.length == 2) {
      len = arguments[0];
      mode = arguments[1]
    }else {
      if(arguments.length == 1) {
        var set = arguments[0];
        len = set.digits;
        mode = set.roundingMode
      }else {
        throw"round(): " + arguments.length + " arguments given; expected 1 or 2";
      }
    }
    var adjust;
    var sign;
    var oldmant;
    var reuse = false;
    var first = 0;
    var increment;
    var newmant = null;
    adjust = this.mant.length - len;
    if(adjust <= 0) {
      return this
    }
    this.exp = this.exp + adjust;
    sign = this.ind;
    oldmant = this.mant;
    if(len > 0) {
      this.mant = new Array(len);
      this.arraycopy(oldmant, 0, this.mant, 0, len);
      reuse = true;
      first = oldmant[len]
    }else {
      this.mant = this.ZERO.mant;
      this.ind = this.iszero;
      reuse = false;
      if(len == 0) {
        first = oldmant[0]
      }else {
        first = 0
      }
    }
    increment = 0;
    modes:do {
      if(mode == this.ROUND_HALF_UP) {
        if(first >= 5) {
          increment = sign
        }
      }else {
        if(mode == this.ROUND_UNNECESSARY) {
          if(!this.allzero(oldmant, len)) {
            throw"round(): Rounding necessary";
          }
        }else {
          if(mode == this.ROUND_HALF_DOWN) {
            if(first > 5) {
              increment = sign
            }else {
              if(first == 5) {
                if(!this.allzero(oldmant, len + 1)) {
                  increment = sign
                }
              }
            }
          }else {
            if(mode == this.ROUND_HALF_EVEN) {
              if(first > 5) {
                increment = sign
              }else {
                if(first == 5) {
                  if(!this.allzero(oldmant, len + 1)) {
                    increment = sign
                  }else {
                    if(this.mant[this.mant.length - 1] % 2 == 1) {
                      increment = sign
                    }
                  }
                }
              }
            }else {
              if(mode == this.ROUND_DOWN) {
              }else {
                if(mode == this.ROUND_UP) {
                  if(!this.allzero(oldmant, len)) {
                    increment = sign
                  }
                }else {
                  if(mode == this.ROUND_CEILING) {
                    if(sign > 0) {
                      if(!this.allzero(oldmant, len)) {
                        increment = sign
                      }
                    }
                  }else {
                    if(mode == this.ROUND_FLOOR) {
                      if(sign < 0) {
                        if(!this.allzero(oldmant, len)) {
                          increment = sign
                        }
                      }
                    }else {
                      throw"round(): Bad round value: " + mode;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }while(false);
    if(increment != 0) {
      bump:do {
        if(this.ind == this.iszero) {
          this.mant = this.ONE.mant;
          this.ind = increment
        }else {
          if(this.ind == this.isneg) {
            increment = -increment
          }
          newmant = this.byteaddsub(this.mant, this.mant.length, this.ONE.mant, 1, increment, reuse);
          if(newmant.length > this.mant.length) {
            this.exp++;
            this.arraycopy(newmant, 0, this.mant, 0, this.mant.length)
          }else {
            this.mant = newmant
          }
        }
      }while(false)
    }
    if(this.exp > this.MaxExp) {
      throw"round(): Exponent Overflow: " + this.exp;
    }
    return this
  }
  function allzero(array, start) {
    var i = 0;
    if(start < 0) {
      start = 0
    }
    var $25 = array.length - 1;
    i = start;
    i:for(;i <= $25;i++) {
      if(array[i] != 0) {
        return false
      }
    }
    return true
  }
  function finish(set, strip) {
    var d = 0;
    var i = 0;
    var newmant = null;
    var mag = 0;
    var sig = 0;
    if(set.digits != 0) {
      if(this.mant.length > set.digits) {
        this.round(set)
      }
    }
    if(strip) {
      if(set.form != MathContext.prototype.PLAIN) {
        d = this.mant.length;
        i = d - 1;
        i:for(;i >= 1;i--) {
          if(this.mant[i] != 0) {
            break i
          }
          d--;
          this.exp++
        }
        if(d < this.mant.length) {
          newmant = new Array(d);
          this.arraycopy(this.mant, 0, newmant, 0, d);
          this.mant = newmant
        }
      }
    }
    this.form = MathContext.prototype.PLAIN;
    var $26 = this.mant.length;
    i = 0;
    i:for(;$26 > 0;$26--, i++) {
      if(this.mant[i] != 0) {
        if(i > 0) {
          delead:do {
            newmant = new Array(this.mant.length - i);
            this.arraycopy(this.mant, i, newmant, 0, this.mant.length - i);
            this.mant = newmant
          }while(false)
        }
        mag = this.exp + this.mant.length;
        if(mag > 0) {
          if(mag > set.digits) {
            if(set.digits != 0) {
              this.form = set.form
            }
          }
          if(mag - 1 <= this.MaxExp) {
            return this
          }
        }else {
          if(mag < -5) {
            this.form = set.form
          }
        }
        mag--;
        if(mag < this.MinExp || mag > this.MaxExp) {
          overflow:do {
            if(this.form == MathContext.prototype.ENGINEERING) {
              sig = mag % 3;
              if(sig < 0) {
                sig = 3 + sig
              }
              mag = mag - sig;
              if(mag >= this.MinExp) {
                if(mag <= this.MaxExp) {
                  break overflow
                }
              }
            }
            throw"finish(): Exponent Overflow: " + mag;
          }while(false)
        }
        return this
      }
    }
    this.ind = this.iszero;
    if(set.form != MathContext.prototype.PLAIN) {
      this.exp = 0
    }else {
      if(this.exp > 0) {
        this.exp = 0
      }else {
        if(this.exp < this.MinExp) {
          throw"finish(): Exponent Overflow: " + this.exp;
        }
      }
    }
    this.mant = this.ZERO.mant;
    return this
  }
  function isGreaterThan(other) {
    return this.compareTo(other) > 0
  }
  function isLessThan(other) {
    return this.compareTo(other) < 0
  }
  function isGreaterThanOrEqualTo(other) {
    return this.compareTo(other) >= 0
  }
  function isLessThanOrEqualTo(other) {
    return this.compareTo(other) <= 0
  }
  function isPositive() {
    return this.compareTo(BigDecimal.prototype.ZERO) > 0
  }
  function isNegative() {
    return this.compareTo(BigDecimal.prototype.ZERO) < 0
  }
  function isZero() {
    return this.equals(BigDecimal.prototype.ZERO)
  }
  return BigDecimal
}(MathContext);
(function(ast) {
  var messages = Assert.messages;
  Assert.reserveCodeRange(2E3, 2999, "mathmodel");
  messages[2001] = "Factoring of multi-variate polynomials with all terms of degree greater than one is not supported";
  messages[2002] = "[unused]";
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
  messages[2016] = "Exponents should be wrapped in braces.";
  messages[2017] = "Units with different base units not allowed in a single expression. Found: %1";
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
  var nodeImaginary = variableNode("i");
  var nodeE = variableNode("e");
  function stripNids(node) {
    forEach(keys(node), function(k) {
      if(indexOf(k, "Nid") > 0) {
        delete node[k]
      }
    });
    if(node.args) {
      forEach(node.args, function(n) {
        stripNids(n)
      })
    }
    return node
  }
  function hashCode(str) {
    var hash = 0, i, chr, len;
    if(str.length == 0) {
      return hash
    }
    for(i = 0, len = str.length;i < len;i++) {
      chr = str.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0
    }
    return hash
  }
  function isChemCore() {
    return!!Model.env["Au"]
  }
  function undefinedNode() {
    var node = numberNode((new Date).getTime() + Math.random());
    node.isUndefined = true;
    return node
  }
  function isUndefined(node) {
    return node.isUndefined
  }
  function newNode(op, args) {
    return{op:op, args:args}
  }
  function binaryNode(op, args, flatten) {
    if(args.length < 2) {
      return args[0]
    }
    var aa = [];
    forEach(args, function(n) {
      if(flatten && n.op === op) {
        aa = aa.concat(n.args)
      }else {
        aa.push(n)
      }
    });
    return newNode(op, aa)
  }
  function abs(n) {
    if(n === null) {
      return null
    }else {
      if(n instanceof BigDecimal) {
        if(n === null) {
          return null
        }
        n = toNumber(n)
      }else {
        if(n.op) {
          n = mathValue(n, true);
          if(n === null) {
            return null
          }
        }else {
          if(isNaN(n)) {
            return null
          }
        }
      }
    }
    return toDecimal(Math.abs(n))
  }
  function isNeg(n) {
    var mv;
    if(n === null) {
      return false
    }
    if(n.op) {
      mv = mathValue(n, true);
      if(!mv) {
        if(n.op === Model.MUL && isMinusOne(n.args[0]) || n.op === Model.NUM && n.args[0] === "-Infinity") {
          return true
        }
        return false
      }
    }else {
      if(!(n instanceof BigDecimal)) {
        return false
      }else {
        mv = n
      }
    }
    return mv.compareTo(bigZero) < 0
  }
  function numberNode(val, doScale, roundOnly, isRepeating) {
    assert(!(val instanceof Array));
    var mv, node, minusOne;
    if(doScale) {
      var scale = option("decimalPlaces");
      if(isRepeating) {
      }
      mv = toDecimal(val);
      if(isNeg(mv) && !isMinusOne(mv)) {
        minusOne = bigMinusOne.setScale(scale, BigDecimal.ROUND_HALF_UP);
        mv = bigMinusOne.multiply(mv)
      }
      if(mv !== null && (!roundOnly || mv.scale() > scale)) {
        mv = mv.setScale(scale, BigDecimal.ROUND_HALF_UP)
      }
    }else {
      mv = toDecimal(val);
      if(isNeg(mv) && !isMinusOne(mv)) {
        minusOne = bigMinusOne;
        mv = abs(mv)
      }
    }
    if(minusOne) {
      node = multiplyNode([newNode(Model.NUM, [String(minusOne)]), newNode(Model.NUM, [String(mv)])])
    }else {
      if(mv) {
        node = newNode(Model.NUM, [String(mv)])
      }else {
        node = newNode(Model.NUM, [String(val)])
      }
    }
    return node
  }
  function multiplyNode(args, flatten) {
    return binaryNode(Model.MUL, args, flatten)
  }
  function fractionNode(n, d) {
    return multiplyNode([n, binaryNode(Model.POW, [d, nodeMinusOne])], true)
  }
  function unaryNode(op, args) {
    assert(args.length === 1, "Wrong number of arguments for unary node");
    if(op === Model.ADD) {
      return args[0]
    }else {
      return newNode(op, args)
    }
  }
  function variableNode(name) {
    assert(typeof name === "string");
    return newNode(Model.VAR, [name])
  }
  function negate(n) {
    if(typeof n === "number") {
      return-n
    }else {
      if(n.op === Model.MUL) {
        var args = n.args.slice(0);
        if(isMinusOne(n.args[0])) {
          args.shift();
          return multiplyNode(args)
        }else {
          return multiplyNode([negate(args.shift())].concat(args))
        }
      }else {
        if(n.op === Model.NUM) {
          if(n.args[0] === "1") {
            return nodeMinusOne
          }else {
            if(n.args[0] === "-1") {
              return nodeOne
            }else {
              if(n.args[0] === "Infinity") {
                return nodeMinusInfinity
              }else {
                if(n.args[0] === "-Infinity") {
                  return nodeInfinity
                }else {
                  if(n.args[0].charAt(0) === "-") {
                    return unaryNode(Model.SUB, [n])
                  }else {
                    return numberNode("-" + n.args[0])
                  }
                }
              }
            }
          }
        }else {
          if(n.op === Model.POW && isMinusOne(n.args[1])) {
            return binaryNode(Model.POW, [negate(n.args[0]), nodeMinusOne])
          }
        }
      }
    }
    return multiplyNode([nodeMinusOne, n])
  }
  function isInfinity(n) {
    if(n === Number.POSITIVE_INFINITY || (n === Number.NEGATIVE_INFINITY || n.op === Model.NUM && (n.args[0] === "Infinity" || n.args[0] === "-Infinity"))) {
      return true
    }
    return false
  }
  function isE(n) {
    if(n === null) {
      return false
    }else {
      if(n instanceof BigDecimal) {
        return!bigE.compareTo(n)
      }else {
        if(typeof n === "number") {
          return n === Math.E
        }else {
          if(n.op === Model.NUM && +n.args[0] === Math.E) {
            return true
          }else {
            if(n.op === Model.VAR && n.args[0] === "e") {
              return true
            }else {
              return false
            }
          }
        }
      }
    }
  }
  function isZero(n) {
    if(n === null) {
      return false
    }else {
      if(n instanceof BigDecimal) {
        return!bigZero.compareTo(n)
      }else {
        if(typeof n === "number") {
          return n === 0
        }else {
          if(n.op === Model.NUM && +n.args[0] === 0) {
            return true
          }else {
            return false
          }
        }
      }
    }
  }
  function isOne(n) {
    if(n === null) {
      return false
    }else {
      if(n instanceof BigDecimal) {
        return!bigOne.compareTo(n)
      }else {
        if(typeof n === "number") {
          return n === 1
        }else {
          if(n.op === Model.NUM) {
            return!bigOne.compareTo(mathValue(n))
          }else {
            return false
          }
        }
      }
    }
  }
  function isMinusOne(n) {
    if(n === null) {
      return false
    }else {
      if(n instanceof BigDecimal) {
        return!bigMinusOne.compareTo(n)
      }else {
        if(typeof n === "number") {
          return n === -1
        }else {
          if(n.op !== undefined) {
            var mv = mathValue(n, true);
            if(mv) {
              return!bigMinusOne.compareTo(mathValue(n, true))
            }else {
              return false
            }
          }
        }
      }
    }
    assert(false, "Internal error: unable to compare with zero.")
  }
  function toNumber(n) {
    var str;
    if(n === null) {
      return Number.NaN
    }else {
      if(typeof n === "number") {
        return n
      }else {
        if(n instanceof BigDecimal) {
          str = n.toString()
        }else {
          if(n.op === Model.NUM) {
            str = n.args[0]
          }else {
            return Number.NaN
          }
        }
      }
    }
    return parseFloat(str)
  }
  function toDecimal(val) {
    var str;
    if(val === null || (isNaN(val) || (isInfinity(val) || typeof val === "string" && indexOf(val, "Infinity") >= 0))) {
      return null
    }else {
      if(val instanceof BigDecimal) {
        return val
      }else {
        if(val.op === Model.NUM) {
          str = val.args[0]
        }else {
          str = val.toString()
        }
      }
    }
    return new BigDecimal(str)
  }
  function toRadians(node) {
    assert(node.op);
    var val = bigOne, uu;
    var args = [];
    if(node.op === Model.MUL) {
      forEach(node.args, function(n) {
        if(n.op === Model.VAR) {
          switch(n.args[0]) {
            case "\\degree":
              args.push(numberNode((new BigDecimal("" + Math.PI)).divide(new BigDecimal("180"))));
              break;
            case "\\radians":
              break;
            default:
              args.push(toRadians(n));
              break
          }
        }else {
          args.push(n)
        }
      });
      node = multiplyNode(args)
    }else {
      node = node
    }
    return node
  }
  function logBase(b, v) {
    var n = Math.log(toNumber(v)) / Math.log(toNumber(b));
    if(!isNaN(n)) {
      return new BigDecimal(String(n))
    }
    return null
  }
  var factCache = [bigOne, bigOne];
  var i = 2;
  function factorial(n) {
    if(typeof factCache[n] != "undefined") {
      return factCache[n]
    }
    var result = factCache[i - 1];
    for(;i <= n;i++) {
      Assert.checkTimeout();
      factCache[i] = result = result.multiply(new BigDecimal(i.toString()))
    }
    return result
  }
  var varMap = {};
  var varNames = [];
  function reset() {
    varMap = {};
    varNames = []
  }
  function hint(val, node, str) {
    if(!val) {
      if(!node.hints) {
        node.hints = []
      }
      node.hints.push(str)
    }
  }
  var normalNumber = numberNode("298230487121230434902874");
  normalNumber.is_normal = true;
  function Visitor(ast) {
    function visit(node, visit, resume) {
      assert(node.op && node.args, "Visitor.visit() op=" + node.op + " args = " + node.args);
      switch(node.op) {
        case Model.NUM:
          node = visit.numeric(node, resume);
          break;
        case Model.ADD:
        ;
        case Model.SUB:
        ;
        case Model.PM:
        ;
        case Model.BACKSLASH:
          if(node.args.length === 1) {
            node = visit.unary(node, resume)
          }else {
            node = visit.additive(node, resume)
          }
          break;
        case Model.MUL:
        ;
        case Model.DIV:
        ;
        case Model.FRAC:
          node = visit.multiplicative(node, resume);
          break;
        case Model.POW:
        ;
        case Model.LOG:
          node = visit.exponential(node, resume);
          break;
        case Model.VAR:
        ;
        case Model.SUBSCRIPT:
          node = visit.variable(node, resume);
          break;
        case Model.SQRT:
        ;
        case Model.SIN:
        ;
        case Model.COS:
        ;
        case Model.TAN:
        ;
        case Model.ARCSIN:
        ;
        case Model.ARCCOS:
        ;
        case Model.ARCTAN:
        ;
        case Model.SEC:
        ;
        case Model.CSC:
        ;
        case Model.COT:
        ;
        case Model.PERCENT:
        ;
        case Model.M:
        ;
        case Model.ABS:
        ;
        case Model.FACT:
        ;
        case Model.FORALL:
        ;
        case Model.EXISTS:
        ;
        case Model.IN:
        ;
        case Model.SUM:
        ;
        case Model.LIM:
        ;
        case Model.EXP:
        ;
        case Model.TO:
        ;
        case Model.INT:
        ;
        case Model.PROD:
        ;
        case Model.ION:
        ;
        case Model.POW:
        ;
        case Model.SUBSCRIPT:
        ;
        case Model.OVERLINE:
        ;
        case Model.OVERSET:
        ;
        case Model.UNDERSET:
        ;
        case Model.NONE:
        ;
        case Model.DEGREE:
        ;
        case Model.DOT:
          node = visit.unary(node, resume);
          break;
        case Model.COMMA:
        ;
        case Model.MATRIX:
        ;
        case Model.VEC:
        ;
        case Model.ROW:
        ;
        case Model.COL:
        ;
        case Model.INTERVAL:
        ;
        case Model.LIST:
          node = visit.comma(node, resume);
          break;
        case Model.EQL:
        ;
        case Model.LT:
        ;
        case Model.LE:
        ;
        case Model.GT:
        ;
        case Model.GE:
        ;
        case Model.NE:
        ;
        case Model.APPROX:
        ;
        case Model.COLON:
        ;
        case Model.RIGHTARROW:
          node = visit.equals(node, resume);
          break;
        case Model.FORMAT:
          node = visit.format(node);
          break;
        default:
          if(visit.name !== "normalizeLiteral" && visit.name !== "sort") {
            assert(false, "Should not get here. Unhandled node operator " + node.op)
          }
          break
      }
      return node
    }
    function degree(root, notAbsolute) {
      if(!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return 0
      }
      return visit(root, {name:"degree", exponential:function(node) {
        var args = node.args;
        var d;
        if(node.op === Model.POW) {
          var expo = mathValue(args[1], true);
          if(expo) {
            if(notAbsolute) {
              d = degree(args[0], notAbsolute) * toNumber(expo)
            }else {
              d = degree(args[0], notAbsolute) * Math.abs(toNumber(expo))
            }
          }else {
            d = Number.POSITIVE_INFINITY
          }
        }else {
          if(node.op === Model.LOG) {
            d = Number.POSITIVE_INFINITY
          }
        }
        return d
      }, multiplicative:function(node) {
        var args = node.args;
        var d = 0;
        forEach(args, function(n) {
          d += degree(n, notAbsolute)
        });
        return d
      }, additive:function(node) {
        var args = node.args;
        var d = 0;
        var t;
        forEach(args, function(n) {
          t = degree(n, notAbsolute);
          if(t > d) {
            d = t
          }
        });
        return d
      }, numeric:function(node) {
        return 0
      }, unary:function(node) {
        var args = node.args;
        var d = degree(args[0], notAbsolute);
        switch(node.op) {
          case Model.ADD:
          ;
          case Model.SUB:
          ;
          case Model.COS:
          ;
          case Model.SIN:
          ;
          case Model.TAN:
          ;
          case Model.ARCSIN:
          ;
          case Model.ARCCOS:
          ;
          case Model.ARCTAN:
          ;
          case Model.SEC:
          ;
          case Model.CSC:
          ;
          case Model.COT:
          ;
          case Model.PM:
          ;
          case Model.PERCENT:
          ;
          case Model.M:
          ;
          case Model.ABS:
            return d;
          case Model.SQRT:
            assert(args.length === 1, message(2003));
            return d / 2;
          case Model.FACT:
            if(d !== 0) {
              return nodeInfinity
            }
            return 0;
          case Model.DEGREE:
          ;
          case Model.NONE:
          ;
          default:
            return 0
        }
      }, variable:function(node) {
        if(!name || node.args[0] === name) {
          return 1
        }
        return 0
      }, comma:function(node) {
        var args = node.args;
        var dd = [];
        forEach(args, function(n) {
          dd = dd.concat(degree(n, notAbsolute))
        });
        return dd
      }, equals:function(node) {
        var args = node.args;
        var d = 0;
        var t;
        forEach(args, function(n) {
          t = degree(n, notAbsolute);
          if(t > d) {
            d = t
          }
        });
        return d
      }})
    }
    function constantPart(root) {
      var env = Model.env;
      if(!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return nodeZero
      }
      return visit(root, {name:"constantPart", exponential:function(node) {
        var vars = variables(node.args[0], env);
        vars = vars.concat(variables(node.args[1], env));
        if(vars.length === 0) {
          return node
        }else {
          return nodeOne
        }
      }, multiplicative:function(node) {
        var args = node.args;
        var val = bigOne;
        var ff = [];
        forEach(args, function(n) {
          var vars = variables(n);
          if(vars.length === 0) {
            var mv = mathValue(n, env);
            if(isOne(mv)) {
            }else {
              if(isZero(mv)) {
                ff.push(nodeZero)
              }else {
                ff.push(n)
              }
            }
          }
        });
        if(ff.length === 0) {
          return nodeOne
        }else {
          if(ff.length === 1) {
            return ff[0]
          }
        }
        return multiplyNode(ff)
      }, additive:function(node) {
        var vars = variables(node);
        if(vars.length !== 0) {
          node = nodeOne
        }
        return node
      }, unary:function(node) {
        var vars = variables(node.args[0], env);
        if(vars.length === 0) {
          return node
        }else {
          return nodeOne
        }
      }, numeric:function(node) {
        return node
      }, variable:function(node) {
        return nodeOne
      }, comma:function(node) {
        var vars = variables(node.args[0], env);
        if(vars.length === 0) {
          return node
        }else {
          return nodeOne
        }
        return null
      }, equals:function(node) {
        return null
      }})
    }
    function variables(root) {
      if(!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return 0
      }
      return visit(root, {name:"variables", exponential:function(node) {
        var args = node.args;
        var val = [];
        forEach(args, function(n) {
          var vars = variables(n);
          forEach(vars, function(v) {
            if(indexOf(val, v) < 0) {
              val.push(v)
            }
          })
        });
        return val
      }, multiplicative:function(node) {
        var args = node.args;
        var val = [];
        forEach(args, function(n) {
          var vars = variables(n);
          forEach(vars, function(v) {
            if(indexOf(val, v) < 0) {
              val.push(v)
            }
          })
        });
        return val
      }, additive:function(node) {
        var args = node.args;
        var val = [];
        forEach(args, function(n) {
          var vars = variables(n);
          forEach(vars, function(v) {
            if(indexOf(val, v) < 0) {
              val.push(v)
            }
          })
        });
        return val
      }, unary:function(node) {
        var args = [];
        forEach(node.args, function(n) {
          args = args.concat(variables(n))
        });
        return args
      }, numeric:function(node) {
        return[]
      }, variable:function(node) {
        if(node.args[0] === "0") {
          return[]
        }
        return[node.args[0]]
      }, comma:function(node) {
        var args = node.args;
        var val = [];
        forEach(args, function(n) {
          var vars = variables(n);
          forEach(vars, function(v) {
            if(indexOf(val, v) < 0) {
              val.push(v)
            }
          })
        });
        return val
      }, equals:function(node) {
        var args = node.args;
        var val = [];
        forEach(args, function(n) {
          var vars = variables(n);
          forEach(vars, function(v) {
            if(indexOf(val, v) < 0) {
              val.push(v)
            }
          })
        });
        return val
      }})
    }
    function hint(root) {
      if(!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return 0
      }
      return visit(root, {name:"hints", exponential:function(node) {
        var hints = [];
        if(node.hints instanceof Array) {
          hints = hints.concat(node.hints)
        }
        forEach(node.args, function(n) {
          hints = hints.concat(hint(n))
        });
        if(!node.args[1].lbrk) {
          hints.push(message(2016))
        }
        return hints
      }, multiplicative:function(node) {
        var hints = [];
        if(node.hints instanceof Array) {
          hints = hints.concat(node.hints)
        }
        forEach(node.args, function(n) {
          hints = hints.concat(hint(n))
        });
        return hints
      }, additive:function(node) {
        var hints = [];
        if(node.hints instanceof Array) {
          hints = hints.concat(node.hints)
        }
        forEach(node.args, function(n) {
          hints = hints.concat(hint(n))
        });
        return hints
      }, unary:function(node) {
        var hints = [];
        if(node.hints instanceof Array) {
          hints = hints.concat(node.hints)
        }
        forEach(node.args, function(n) {
          hints = hints.concat(hint(n))
        });
        return hints
      }, numeric:function(node) {
        var hints = [];
        if(node.hints instanceof Array) {
          hints = hints.concat(node.hints)
        }
        return hints
      }, variable:function(node) {
        var hints = [];
        if(node.hints instanceof Array) {
          hints = hints.concat(node.hints)
        }
        return hints
      }, comma:function(node) {
        var hints = [];
        if(node.hints instanceof Array) {
          hints = hints.concat(node.hints)
        }
        forEach(node.args, function(n) {
          hints = hints.concat(hint(n))
        });
        return hints
      }, equals:function(node) {
        var hints = [];
        if(node.hints instanceof Array) {
          hints = hints.concat(node.hints)
        }
        forEach(node.args, function(n) {
          hints = hints.concat(hint(n))
        });
        return hints
      }})
    }
    function m2e(root) {
      if(!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return 0
      }
      return visit(root, {name:"m2e", exponential:function(node) {
        var args = [];
        forEach(node.args, function(n) {
          args = args.concat(m2e(n))
        });
        var str = "exponential " + args;
        return str
      }, multiplicative:function(node) {
        var args = [];
        forEach(node.args, function(n) {
          args = args.concat(m2e(n))
        });
        var str = args[0] + " times " + args[1];
        return str
      }, additive:function(node) {
        var args = [];
        forEach(node.args, function(n) {
          args = args.concat(m2e(n))
        });
        var str = "additive " + args;
        return str
      }, unary:function(node) {
        var args = [];
        forEach(node.args, function(n) {
          args = args.concat(m2e(n))
        });
        var str = "unary " + args;
        return str
      }, numeric:function(node) {
        var args = [];
        forEach(node.args, function(n) {
          args = args.concat(n)
        });
        var str = args;
        return str
      }, variable:function(node) {
        var args = [];
        forEach(node.args, function(n) {
          args = args.concat(n)
        });
        var str = args;
        return str
      }, comma:function(node) {
        var args = [];
        forEach(node.args, function(n) {
          args = args.concat(m2e(n))
        });
        var str = "list " + args;
        return str
      }, equals:function(node) {
        var args = [];
        forEach(node.args, function(n) {
          args = args.concat(m2e(n))
        });
        var str = "equals " + args;
        return str
      }})
    }
    function variablePart(root) {
      var env = Model.env;
      if(!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return null
      }
      return visit(root, {name:"variablePart", exponential:function(node) {
        if(variables(node.args[0]).length > 0 || variables(node.args[1]).length > 0) {
          return node
        }
        return null
      }, multiplicative:function(node) {
        var args = node.args;
        var vals = [];
        forEach(args, function(n) {
          var v = variablePart(n);
          if(v !== null) {
            vals.push(v)
          }
        });
        if(vals.length === 0) {
          return null
        }else {
          if(vals.length === 1) {
            return vals[0]
          }
        }
        return multiplyNode(vals)
      }, additive:function(node) {
        if(variables(node).length > 0) {
          return node
        }
        return null
      }, unary:function(node) {
        var vp = variablePart(node.args[0]);
        if(vp !== null) {
          return node
        }
        return null
      }, numeric:function(node) {
        return null
      }, variable:function(node) {
        return node
      }, comma:function(node) {
        var vars = variables(node.args[0], env);
        if(vars.length !== 0) {
          return node
        }
        return null
      }, equals:function(node) {
        return null
      }})
    }
    function terms(root) {
      if(!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return 0
      }
      return visit(root, {name:"terms", exponential:function(node) {
        return[node]
      }, multiplicative:function(node) {
        return[node]
      }, additive:function(node) {
        var vals = [];
        forEach(node.args, function(n) {
          vals = vals.concat(terms(n))
        });
        return vals
      }, unary:function(node) {
        return[node]
      }, numeric:function(node) {
        return[node]
      }, variable:function(node) {
        return[node]
      }, comma:function(node) {
        var vals = [];
        forEach(node.args, function(n) {
          vals = vals.concat(terms(n))
        });
        return vals
      }, equals:function(node) {
        var vals = [];
        forEach(node.args, function(n) {
          vals = vals.concat(terms(n))
        });
        return vals
      }})
    }
    function normalizeFormatObject(fmt) {
      var list = [];
      switch(fmt.op) {
        case Model.VAR:
          list.push({code:fmt.args[0]});
          break;
        case Model.MUL:
          var code = "";
          var length = undefined;
          forEach(fmt.args, function(f) {
            if(f.op === Model.VAR) {
              code += f.args[0]
            }else {
              if(f.op === Model.NUM) {
                length = +f.args[0]
              }
            }
          });
          list.push({code:code, length:length});
          break;
        case Model.COMMA:
          forEach(fmt.args, function(f) {
            list = list.concat(normalizeFormatObject(f))
          });
          break
      }
      return list
    }
    function checkNumberFormat(fmt, node) {
      var fmtList = normalizeFormatObject(fmt);
      return some(fmtList, function(f) {
        var code = f.code;
        var length = f.length;
        switch(code) {
          case "\\integer":
            if(node.numberFormat === "integer") {
              if(length === undefined || length === node.args[0].length) {
                return true
              }
            }
            break;
          case "\\decimal":
            if(node.numberFormat === "decimal" && node.isRepeating) {
              if(length === undefined) {
                return true
              }else {
                return false
              }
            }
            if(node.numberFormat === "decimal") {
              if(length === undefined || (length === 0 && indexOf(node.args[0], ".") === -1 || length === node.args[0].substring(indexOf(node.args[0], ".") + 1).length)) {
                return true
              }
            }
            break;
          case "\\number":
            if(node.numberFormat === "decimal" && node.isRepeating) {
              if(length === undefined) {
                return true
              }else {
                return false
              }
            }
            if(node.numberFormat === "integer" || node.numberFormat === "decimal") {
              var brk = indexOf(node.args[0], ".");
              if(length === undefined || (length === 0 && brk === -1 || brk >= 0 && length === node.args[0].substring(brk + 1).length)) {
                return true
              }
            }
            break;
          case "\\scientific":
            if(node.isScientific) {
              var coeff = node.args[0].args[0];
              if(length === undefined || (length === 0 && indexOf(coeff, ".") === -1 || length === coeff.substring(indexOf(coeff, ".") + 1).length)) {
                return true
              }
            }
            break;
          case "\\fraction":
            if(node.isFraction || node.isMixedFraction) {
              return true
            }
            break;
          case "\\simpleFraction":
          ;
          case "\\nonMixedFraction":
            if(node.isFraction) {
              return true
            }
            break;
          case "\\mixedFraction":
            if(node.isMixedFraction) {
              return true
            }
            break;
          case "\\fractionOrDecimal":
            if(node.isFraction || (node.isMixedFraction || node.numberFormat === "decimal")) {
              return true
            }
            break;
          default:
            assert(false, message(2015, [code]));
            break
        }
      })
    }
    function checkVariableFormat(fmt, id) {
      var fmtList = normalizeFormatObject(fmt);
      assert(fmtList.length === 1);
      var code = fmtList[0].code;
      var length = fmtList[0].length;
      var name;
      switch(code) {
        case "\\variable":
          if(length === undefined) {
            name = "_"
          }else {
            if(!(name = varMap[id])) {
              if(indexOf(varNames, "_" + length) < 0) {
                varMap[id] = name = "_" + length;
                varNames.push(name)
              }else {
                name = id
              }
            }
          }
          break;
        case "\\integer":
        ;
        case "\\decimal":
        ;
        case "\\number":
        ;
        case "\\scientific":
        ;
        case "\\fraction":
        ;
        case "\\mixedFraction":
        ;
        case "\\nonMixedFraction":
        ;
        case "\\fractionOrDecimal":
          name = id;
          break;
        default:
          assert(false, message(2015, [code]));
          break
      }
      return name
    }
    function isEmptyNode(node) {
      return node.op === Model.VAR && node.args[0] === "0"
    }
    function normalizeSyntax(root, ref) {
      var options = Model.options ? Model.options : {};
      if(!ref || !ref.args) {
        ref = {args:[]}
      }
      if(!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return 0
      }
      var nid = ast.intern(root);
      var node = Model.create(visit(root, {name:"normalizeSyntax", format:function(node) {
        var fmtList = normalizeFormatObject(node.args[0]);
        if(fmtList[0].code === "\\variable") {
          var id;
          if(fmtList[0].length === undefined) {
            id = "_"
          }else {
            id = "_" + fmtList[0].length
          }
          return variableNode(id)
        }
        return normalNumber
      }, numeric:function(node) {
        if(ref && (ref.op === Model.SUB && (ref.args.length === 1 && ref.args[0].op === Model.FORMAT))) {
          ref = ref.args[0]
        }
        if(ref && (ref.op === Model.FORMAT && checkNumberFormat(ref.args[0], node))) {
          return normalNumber
        }
        return node
      }, additive:function(node) {
        var args = [];
        if(ref && (ref.op === Model.FORMAT && checkNumberFormat(ref.args[0], node))) {
          return normalNumber
        }
        forEach(node.args, function(n, i) {
          n = normalizeSyntax(n, ref.args[i]);
          args.push(n)
        });
        return binaryNode(Model.ADD, args)
      }, multiplicative:function(node) {
        var args = [];
        if(ref && (ref.op === Model.FORMAT && checkNumberFormat(ref.args[0], node))) {
          return normalNumber
        }
        forEach(node.args, function(n, i) {
          n = normalizeSyntax(n, ref.args[i]);
          if(!isMinusOne(n)) {
            args.push(n)
          }
        });
        return binaryNode(Model.MUL, args)
      }, unary:function(node) {
        var arg0 = normalizeSyntax(node.args[0], ref.args[0]);
        switch(node.op) {
          case Model.PERCENT:
            node = unaryNode(node.op, [arg0]);
            break;
          case Model.SUB:
            if(ref && (ref.op === Model.FORMAT && checkNumberFormat(ref.args[0], node.args[0]))) {
              return normalNumber
            }
            node = negate(arg0);
            break;
          default:
            node = unaryNode(node.op, [arg0]);
            break
        }
        return node
      }, variable:function(node) {
        var id = node.args[0];
        var name;
        if(ref && ref.op === Model.FORMAT) {
          name = checkVariableFormat(ref.args[0], id)
        }else {
          name = id
        }
        return variableNode(name)
      }, exponential:function(node) {
        var args = [];
        forEach(node.args, function(n, i) {
          n = normalizeSyntax(n, ref.args[i]);
          args.push(n)
        });
        return binaryNode(node.op, args)
      }, comma:function(node) {
        var vals = [];
        forEach(node.args, function(n, i) {
          vals = vals.concat(normalizeSyntax(n, ref.args[i]))
        });
        var node = newNode(node.op, vals);
        return node
      }, equals:function(node) {
        var args = [];
        forEach(node.args, function(n, i) {
          n = normalizeSyntax(n, ref.args[i]);
          args.push(n)
        });
        return binaryNode(node.op, args)
      }}), root.location);
      return node
    }
    function cancelFactors(node) {
      if(node.op !== Model.MUL) {
        return node
      }
      var changed = false;
      var numers = {};
      var denoms = {};
      forEach(node.args, function(n, i) {
        var isDenom = false;
        var f;
        if(isMinusOne(n)) {
          n = newNode(Model.POW, [nodeMinusOne, nodeMinusOne]);
          changed = true
        }
        if(n.op === Model.POW && isMinusOne(n.args[1])) {
          f = n.args[0];
          isDenom = true
        }else {
          f = n
        }
        var mv = mathValue(f, true);
        var key = mv !== null ? String(mv) : "nid$" + ast.intern(f);
        if(isDenom) {
          if(!denoms[key]) {
            denoms[key] = []
          }
          denoms[key].push(n)
        }else {
          if(!numers[key]) {
            numers[key] = []
          }
          numers[key].push(n)
        }
      });
      var nKeys = keys(numers);
      var dKeys = keys(denoms);
      if(nKeys.length === 0 || (dKeys.length === 0 || dKeys.length === 1 && dKeys[0] === "-1")) {
        return node
      }
      var args = [];
      forEach(nKeys, function(k) {
        var nn = numers[k];
        var dd = denoms[k];
        if(dd) {
          var count = dd.length > nn.length ? nn.length : dd.length;
          numers[k] = nn.slice(count);
          denoms[k] = dd.slice(count);
          changed = true
        }
      });
      if(!changed) {
        return node
      }
      forEach(nKeys, function(k) {
        args = args.concat(numers[k])
      });
      forEach(dKeys, function(k) {
        args = args.concat(denoms[k])
      });
      if(args.length) {
        return multiplyNode(args)
      }else {
        return nodeOne
      }
    }
    function cancelTerms(node, location) {
      if(node.op !== Model.ADD) {
        return node
      }
      var pos = {};
      var neg = {};
      forEach(node.args, function(n, i) {
        var isNegative = false;
        var f;
        if(isNeg(constantPart(n))) {
          isNegative = true;
          f = negate(n)
        }else {
          f = n
        }
        var mv = mathValue(f, true);
        var key = mv !== null ? String(mv) : "nid$" + ast.intern(f);
        if(isNegative) {
          if(!neg[key]) {
            neg[key] = []
          }
          neg[key].push(n)
        }else {
          if(!pos[key]) {
            pos[key] = []
          }
          pos[key].push(n)
        }
      });
      var pKeys = keys(pos);
      var nKeys = keys(neg);
      if(pKeys.length === 0 || (nKeys.length === 0 || nKeys.length === 1 && nKeys[0] === "-1")) {
        return node
      }
      var args = [];
      var changed = false;
      forEach(pKeys, function(k) {
        var nn = pos[k];
        var dd = neg[k];
        if(dd) {
          var count = dd.length > nn.length ? nn.length : dd.length;
          pos[k] = nn.slice(count);
          neg[k] = dd.slice(count);
          changed = true
        }
      });
      if(!changed) {
        return node
      }
      forEach(pKeys, function(k) {
        args = args.concat(pos[k])
      });
      forEach(nKeys, function(k) {
        args = args.concat(neg[k])
      });
      if(args.length) {
        return binaryNode(Model.ADD, args)
      }else {
        return nodeZero
      }
    }
    function cancelEquals(node) {
      if(!isComparison(node.op) || (node.args.length != 2 || (isZero(node.args[0]) || isZero(node.args[1])))) {
        return node
      }
      var lnode = node.args[0];
      var rnode = node.args[1];
      var largs, rargs;
      if(lnode.op === Model.MUL) {
        largs = lnode.args
      }else {
        largs = [lnode]
      }
      if(rnode.op === Model.MUL) {
        rargs = rnode.args
      }else {
        rargs = [rnode]
      }
      var lhs = {};
      var rhs = {};
      forEach(largs, function(n) {
        var mv = mathValue(n, true);
        var key = mv !== null ? String(mv) : "lvars";
        if(!lhs[key]) {
          lhs[key] = []
        }
        lhs[key].push(n)
      });
      forEach(rargs, function(n) {
        var mv = mathValue(n, true);
        var key = mv !== null ? String(mv) : "rvars";
        if(!rhs[key]) {
          rhs[key] = []
        }
        rhs[key].push(n)
      });
      var lKeys = keys(lhs);
      var rKeys = keys(rhs);
      var args = [];
      var changed = false;
      forEach(lKeys, function(k) {
        var ll = lhs[k];
        var rr = rhs[k];
        if(rr) {
          var count = rr.length > ll.length ? ll.length : rr.length;
          lhs[k] = ll.slice(count);
          rhs[k] = rr.slice(count);
          changed = true
        }
      });
      if(!changed) {
        return node
      }
      var largs = [];
      var rargs = [];
      forEach(lKeys, function(k) {
        largs = largs.concat(lhs[k])
      });
      forEach(rKeys, function(k) {
        rargs = rargs.concat(rhs[k])
      });
      var larg, rarg;
      if(largs.length === 0) {
        larg = nodeOne
      }else {
        larg = multiplyNode(largs)
      }
      if(rargs.length === 0) {
        rarg = nodeOne
      }else {
        rarg = multiplyNode(rargs)
      }
      var lmv, rmv;
      if((lmv = mathValue(larg)) && ((rmv = mathValue(rarg)) && lmv.compareTo(rmv) === 0)) {
        larg = rarg = nodeZero
      }
      return binaryNode(node.op, [larg, rarg])
    }
    var normalizedNodes = [];
    function normalize(root) {
      if(!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return 0
      }
      var nid = ast.intern(root);
      if(root.normalizeNid === nid) {
        return root
      }
      var cachedNode;
      if((cachedNode = normalizedNodes[nid]) !== undefined) {
        return cachedNode
      }
      var rootNid = nid;
      var node = Model.create(visit(root, {name:"normalize", numeric:function(node) {
        if(!option("dontConvertDecimalToFraction") && isDecimal(node)) {
          node = decimalToFraction(node)
        }else {
          if(isNeg(node)) {
            node = numberNode(node.args[0])
          }
        }
        return node
      }, additive:function(node) {
        if(node.op === Model.SUB) {
          assert(node.args.length === 2);
          node = binaryNode(Model.ADD, [node.args[0], negate(node.args[1])], true)
        }else {
          if(node.op === Model.PM) {
            assert(node.args.length === 2, "Operator pm can only be used on binary nodes");
            node = binaryNode(Model.ADD, [node.args[0], unaryNode(Model.PM, [node.args[1]])])
          }
        }
        var args = [];
        if(node.op === Model.MATRIX) {
          return node
        }
        node = flattenNestedNodes(node);
        return sort(node)
      }, multiplicative:function(node) {
        assert(node.op !== Model.DIV, "Divsion should be eliminated during parsing");
        if(node.op === Model.FRAC) {
          node = newNode(Model.MUL, [node.args[0], newNode(Model.POW, [node.args[1], nodeMinusOne])])
        }
        var args = [];
        var hasPM;
        forEach(node.args, function(n) {
          n = normalize(n);
          if(ast.intern(n) === ast.intern(nodeOne)) {
            return
          }
          if(args.length > 0 && (isMinusOne(n) && isMinusOne(args[args.length - 1]))) {
            args.pop();
            return
          }
          if(n.op === Model.MUL) {
            args = args.concat(n.args)
          }else {
            if(n.op === Model.PM) {
              hasPM = true;
              args.push(n.args[0])
            }else {
              args.push(n)
            }
          }
        });
        if(args.length === 0) {
          node = nodeOne
        }else {
          if(args.length === 1) {
            node = args[0]
          }else {
            node = sort(binaryNode(node.op, args))
          }
        }
        if(hasPM) {
          node = unaryNode(Model.PM, [node])
        }
        return node
      }, unary:function(node) {
        var args = [];
        forEach(node.args, function(n) {
          args = args.concat(normalize(n))
        });
        node = newNode(node.op, args);
        switch(node.op) {
          case Model.SUB:
            node = negate(args[0]);
            break;
          case Model.PERCENT:
            node = multiplyNode([binaryNode(Model.POW, [numberNode("100"), nodeMinusOne]), args[0]]);
            break;
          case Model.PM:
            if(isNeg(mathValue(args[0], true))) {
              var args = node.args.slice(0);
              node = newNode(node.op, [negate(args.shift())].concat(args))
            }
            break;
          case Model.FACT:
            var mv = mathValue(args[0]);
            if(mv) {
              node = numberNode(factorial(mv))
            }else {
              node = unaryNode(node.op, [args[0]])
            }
            break;
          default:
            break
        }
        return node
      }, variable:function(node) {
        if(node.args[0] === "i" && !option("dontSimplifyImaginary")) {
          node = nodeImaginary
        }
        return node
      }, exponential:function(node) {
        var args = [];
        switch(node.op) {
          case Model.LOG:
            if(ast.intern(node.args[0]) === ast.intern(nodeE)) {
              args.push(nodeE)
            }else {
              args.push(normalize(node.args[0]))
            }
            break;
          case Model.POW:
            if(isMinusOne(node.args[0]) && toNumber(mathValue(node.args[1], true)) === 0.5) {
              return nodeImaginary
            }
          ;
          default:
            args.push(normalize(node.args[0]));
            break
        }
        args.push(normalize(node.args[1]));
        return binaryNode(node.op, args)
      }, comma:function(node) {
        var vals = [];
        forEach(node.args, function(n) {
          vals = vals.concat(normalize(n))
        });
        var node = newNode(node.op, vals);
        return sort(node)
      }, equals:function(node) {
        assert(node.args.length === 2, message(2006));
        var args = [];
        forEach(node.args, function(n) {
          n = normalize(n);
          args.push(n)
        });
        node = binaryNode(node.op, args);
        if(node.op === Model.GT || node.op === Model.GE) {
          node.op = node.op === Model.GT ? Model.LT : Model.LE;
          var t = node.args[0];
          node.args[0] = node.args[1];
          node.args[1] = t
        }
        node = sort(node);
        if(node.op !== Model.COLON && !isZero(mathValue(node.args[1], true))) {
          node = binaryNode(node.op, [binaryNode(Model.ADD, [node.args[0], multiplyNode([nodeMinusOne, node.args[1]], true)], true), nodeZero])
        }else {
          if(!isZero(mathValue(node.args[1], true)) && !isOne(mathValue(node.args[1], true))) {
            node = binaryNode(node.op, [multiplyNode([node.args[0], binaryNode(Model.POW, [node.args[1], nodeMinusOne], true)]), nodeOne])
          }
        }
        if(node.op === Model.COLON) {
          node = node.args[0]
        }
        return node
      }}), root.location);
      while(nid !== ast.intern(node)) {
        nid = ast.intern(node);
        node = normalize(node)
      }
      node.normalizeNid = nid;
      normalizedNodes[rootNid] = node;
      return node
    }
    var sortedNodes = [];
    function sort(root) {
      Assert.checkTimeout();
      if(!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return 0
      }
      var nid = ast.intern(root);
      if(root.sortNid === nid) {
        return root
      }
      var cachedNode;
      if((cachedNode = sortedNodes[nid]) !== undefined) {
        return cachedNode
      }
      var rootNid = nid;
      var node = visit(root, {name:"sort", numeric:function(node) {
        return node
      }, additive:function(node) {
        var args = [];
        forEach(node.args, function(n, i) {
          if(i > 0 && node.op === Model.SUB) {
            n = negate(n)
          }
          args.push(sort(n))
        });
        var op = node.op === Model.SUB ? Model.ADD : node.op;
        node = binaryNode(op, args, true);
        if(node.op === Model.PM || node.op === Model.BACKSLASH) {
          return node
        }
        var d0, d1;
        var n0, n1;
        var v0, v1;
        var c0, c1;
        var s0, s1;
        var cp0, cp1;
        for(var i = 0;i < node.args.length - 1;i++) {
          n0 = node.args[i];
          n1 = node.args[i + 1];
          d0 = degree(node.args[i]);
          d1 = degree(node.args[i + 1]);
          if(d0 < d1) {
            node.args[i] = n1;
            node.args[i + 1] = n0
          }else {
            if(d0 === d1) {
              v0 = variables(n0);
              v1 = variables(n1);
              if(v0.length !== v1.length) {
                if(v0.length < v1.length) {
                  node.args[i] = n1;
                  node.args[i + 1] = n0
                }
              }else {
                if(v0.length > 0) {
                  if((s0 = v0.join(",")) !== (s1 = v1.join(","))) {
                    if(s0 < s1) {
                      node.args[i] = n1;
                      node.args[i + 1] = n0
                    }
                  }else {
                    if((c0 = isPolynomial(n0)) && ((c1 = isPolynomial(n1)) && (s0 = c0.join(",")) !== (s1 = c1.join(",")))) {
                      if(s0 < s1) {
                        node.args[i] = n1;
                        node.args[i + 1] = n0
                      }
                    }else {
                      if(isLessThan(constantPart(n0), constantPart(n1))) {
                        node.args[i] = n1;
                        node.args[i + 1] = n0
                      }
                    }
                  }
                }else {
                  if(d0 === 0) {
                    if(exponent(n0) !== exponent(n1)) {
                      if(exponent(n0) < exponent(n1)) {
                        node.args[i] = n1;
                        node.args[i + 1] = n0
                      }
                    }else {
                      if(isLessThan(cp0 = constantPart(n0), cp1 = constantPart(n1))) {
                        node.args[i] = n1;
                        node.args[i + 1] = n0
                      }else {
                        if(!cp0 && cp1) {
                          node.args[i] = n1;
                          node.args[i + 1] = n0
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        return node
      }, multiplicative:function(node) {
        var args = [];
        forEach(node.args, function(n, i) {
          args.push(sort(n))
        });
        node = binaryNode(node.op, args);
        if(node.op === Model.FRAC) {
          return node
        }
        var d0, d1;
        var n0, n1;
        var v0, v1;
        var c0, c1;
        for(var i = 0;i < node.args.length - 1;i++) {
          var s0, s1;
          n0 = node.args[i];
          n1 = node.args[i + 1];
          d0 = Math.abs(degree(n0));
          d1 = Math.abs(degree(n1));
          if(d0 > d1) {
            node.args[i] = n1;
            node.args[i + 1] = n0
          }else {
            if(d0 === d1) {
              v0 = variables(n0);
              v1 = variables(n1);
              var e0 = exponent(n0);
              var e1 = exponent(n1);
              if(e0 !== e1 && (!isNaN(e0) && !isNaN(e1))) {
                if(e0 < e1) {
                  node.args[i] = n1;
                  node.args[i + 1] = n0
                }
              }else {
                if(v0.length !== v1.length) {
                  if(v0.length < v1.length) {
                    node.args[i] = n1;
                    node.args[i + 1] = n0
                  }
                }else {
                  if(n0.op === Model.POW && (n1.op === Model.POW && v0.length === 0)) {
                    if(mathValue(n0.args[0]) < mathValue(n1.args[0])) {
                      node.args[i] = n1;
                      node.args[i + 1] = n0
                    }
                  }else {
                    if(n0.op !== n1.op) {
                      if(hashCode(n0.op) < hashCode(n1.op)) {
                        node.args[i] = n1;
                        node.args[i + 1] = n0
                      }
                    }else {
                      if(v0.length > 0) {
                        if((s0 = v0.join(",")) !== (s1 = v1.join(","))) {
                          if(s0 < s1) {
                            node.args[i] = n1;
                            node.args[i + 1] = n0
                          }
                        }else {
                          if((c0 = isPolynomial(n0)) && ((c1 = isPolynomial(n1)) && (s0 = c0.join(",")) !== (s1 = c1.join(",")))) {
                            if(s0 < s1) {
                              node.args[i] = n1;
                              node.args[i + 1] = n0
                            }
                          }else {
                            if(isLessThan(constantPart(n0), constantPart(n1))) {
                              node.args[i] = n1;
                              node.args[i + 1] = n0
                            }
                          }
                        }
                      }else {
                        if(isLessThan(leadingCoeff(n0), leadingCoeff(n1))) {
                          node.args[i] = n1;
                          node.args[i + 1] = n0
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        return node
      }, unary:function(node) {
        var args = [];
        forEach(node.args, function(n) {
          args = args.concat(sort(n))
        });
        return newNode(node.op, args)
      }, exponential:function(node) {
        var args = [];
        forEach(node.args, function(n, i) {
          args.push(sort(n))
        });
        node = binaryNode(node.op, args);
        return node
      }, variable:function(node) {
        return node
      }, comma:function(node) {
        var args = [];
        forEach(node.args, function(n) {
          args.push(sort(n))
        });
        switch(node.op) {
          case Model.COMMA:
            args.sort(function(a, b) {
              a = JSON.stringify(a);
              b = JSON.stringify(b);
              if(a < b) {
                return-1
              }
              if(a > b) {
                return 1
              }
              return 0
            });
            break;
          default:
            break
        }
        return newNode(node.op, args)
      }, equals:function(node) {
        forEach(node.args, function(n, i) {
          node.args[i] = sort(n)
        });
        if(node.op === Model.COLON || (node.op === Model.RIGHTARROW || (node.op === Model.GT || (node.op === Model.GE || (node.op === Model.LT || node.op === Model.LE))))) {
          return node
        }
        var d0, d1;
        var n0, n1;
        var v0, v1;
        for(var i = 0;i < node.args.length - 1;i++) {
          n0 = node.args[i];
          n1 = node.args[i + 1];
          if((d0 = degree(node.args[i], true)) < (d1 = degree(node.args[i + 1], true))) {
            node.args[i] = n1;
            node.args[i + 1] = n0
          }else {
            if(d0 === d1) {
              v0 = variables(n0);
              v1 = variables(n1);
              if(v0.length !== v1.length) {
                if(v0.length < v1.length) {
                  var t = node.args[i];
                  node.args[i] = n1;
                  node.args[i + 1] = n0
                }
              }else {
                if(v0.length > 0) {
                  if(v0[0] < v1[0]) {
                    var t = node.args[i];
                    node.args[i] = n1;
                    node.args[i + 1] = n0
                  }
                }else {
                  if(!isZero(n1) && isLessThan(mathValue(n0), mathValue(n1))) {
                    var t = node.args[i];
                    node.args[i] = n1;
                    node.args[i + 1] = n0
                  }
                }
              }
            }
          }
        }
        return node
      }});
      while(nid !== ast.intern(node)) {
        nid = ast.intern(node);
        node = sort(node)
      }
      node.sortNid = nid;
      sortedNodes[rootNid] = node;
      return node
    }
    function normalizeLiteral(root) {
      if(!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return 0
      }
      var nid = ast.intern(root);
      if(root.normalizeLiteralNid === nid) {
        return root
      }
      var node = visit(root, {name:"normalizeLiteral", numeric:function(node) {
        return node
      }, additive:function(node) {
        var args = [];
        forEach(node.args, function(n) {
          args.push(normalizeLiteral(n))
        });
        if(Model.option("ignoreOrder") && node.op === Model.SUB) {
          assert(args.length === 2);
          return binaryNode(Model.ADD, [args[0], negate(args[1])])
        }
        return binaryNode(node.op, args)
      }, multiplicative:function(node) {
        var equivLiteralDivAndFrac = false;
        var args = [];
        forEach(node.args, function(n) {
          args.push(normalizeLiteral(n))
        });
        if(equivLiteralDivAndFrac && node.op === Model.FRAC) {
          return newNode(Model.MUL, [args[0], newNode(Model.POW, [args[1], nodeMinusOne])])
        }
        return binaryNode(node.op, args, true)
      }, unary:function(node) {
        var args = [];
        forEach(node.args, function(n) {
          args.push(normalizeLiteral(n))
        });
        if(Model.option("ignoreOrder") && node.op === Model.SUB) {
          assert(args.length === 1);
          return negate(args[0])
        }
        return newNode(node.op, args)
      }, exponential:function(node) {
        var args = [];
        forEach(node.args, function(n) {
          args.push(normalizeLiteral(n))
        });
        node.args = args;
        return node
      }, variable:function(node) {
        return node
      }, comma:function(node) {
        var args = [];
        forEach(node.args, function(n) {
          args.push(normalizeLiteral(n))
        });
        node.args = args;
        return node
      }, equals:function(node) {
        var args = [];
        forEach(node.args, function(n) {
          args.push(normalizeLiteral(n))
        });
        if(option("ignoreOrder") && (node.op === Model.GT || node.op === Model.GE)) {
          assert(args.length === 2, "Internal error: comparisons have only two operands");
          var t = args[0];
          args[0] = args[1];
          args[1] = t;
          node.op = node.op === Model.GT ? Model.LT : Model.LE;
          node.args = args
        }else {
          node.args = args
        }
        return node
      }});
      while(nid !== ast.intern(node)) {
        nid = ast.intern(node);
        node = normalizeLiteral(node)
      }
      node.normalizeLiteralNid = nid;
      return node
    }
    function normalizeExpanded(root) {
      if(!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return 0
      }
      var nid = ast.intern(root);
      if(root.normalizeExpandedNid === nid) {
        return root
      }
      var node = visit(root, {name:"normalizeExpanded", numeric:function(node) {
        return node
      }, additive:function(node) {
        var args = [];
        forEach(node.args, function(n) {
          args.push(normalizeExpanded(n))
        });
        node.args = args;
        return groupLikes(node)
      }, multiplicative:function(node) {
        var equivLiteralDivAndFrac = false;
        var args = [];
        forEach(node.args, function(n) {
          args.push(normalizeExpanded(n))
        });
        node.args = args;
        return flattenNestedNodes(groupLikes(node))
      }, unary:function(node) {
        var args = [];
        forEach(node.args, function(n) {
          args.push(normalizeExpanded(n))
        });
        node.args = args;
        return node
      }, exponential:function(node) {
        var args = [];
        forEach(node.args, function(n) {
          args.push(normalizeExpanded(n))
        });
        node.args = args;
        return node
      }, variable:function(node) {
        return node
      }, comma:function(node) {
        var args = [];
        forEach(node.args, function(n) {
          args.push(normalizeExpanded(n))
        });
        node.args = args;
        return node
      }, equals:function(node) {
        var args = [];
        forEach(node.args, function(n) {
          args.push(normalizeExpanded(n))
        });
        node.args = args;
        return node
      }});
      while(nid !== ast.intern(node)) {
        nid = ast.intern(node);
        node = normalizeExpanded(node)
      }
      node.normalizeExpandedNid = nid;
      return node
    }
    function isAdditive(node) {
      return node.op === Model.ADD || (node.op === Model.SUB || (node.op === Model.PM || node.op === Model.BACKSLASH))
    }
    function isMultiplicative(node) {
      return node.op === Model.MUL || node.op === Model.DIV
    }
    function isInteger(node) {
      var mv;
      if(!node) {
        return false
      }
      if(node.op === Model.NUM && ((mv = mathValue(node, true)) !== null && isInteger(mv))) {
        return true
      }else {
        if(node instanceof BigDecimal) {
          return node.remainder(bigOne).compareTo(bigZero) === 0
        }
      }
      return false
    }
    function isDecimal(node) {
      var mv;
      if(!node) {
        return false
      }
      if(node.op === Model.NUM && ((mv = mathValue(node, true)) !== null && !isInteger(mv))) {
        return true
      }else {
        if(node instanceof BigDecimal && !isInteger(node)) {
          return true
        }
      }
      return false
    }
    function isRepeating(node) {
      assert(node.op === Model.NUM);
      return node.isRepeating
    }
    function findRepeatingPattern(s, p, x) {
      if(!p) {
        assert(typeof s === "string" && s.length > 0);
        p = s.charAt(0);
        s = s.substring(1);
        x = ""
      }
      if(s.length === 0) {
        return p
      }
      if(indexOf(s, p) === 0) {
        x += p;
        s = s.substring(p.length);
        return findRepeatingPattern(s, p, x)
      }else {
        p += x + s.charAt(0);
        x = "";
        s = s.substring(1);
        return findRepeatingPattern(s, p, x)
      }
    }
    function repeatingDecimalToFraction(node) {
      assert(isRepeating(node));
      var str = node.args[0];
      if(str.charAt(0) === "0") {
        str = str.slice(1)
      }
      var pos = indexOf(str, ".");
      var integerPart = str.slice(0, pos);
      var decimalPart = findRepeatingPattern(str.slice(pos + 1));
      var decimalPlaces = decimalPart.length;
      var numer = numberNode(integerPart + decimalPart);
      var denom = binaryNode(Model.ADD, [binaryNode(Model.POW, [numberNode("10"), numberNode(decimalPlaces)]), nodeMinusOne]);
      return fractionNode(numer, denom)
    }
    function decimalToFraction(node) {
      assert(node.op === Model.NUM);
      if(isRepeating(node)) {
        return repeatingDecimalToFraction(node)
      }
      var str = node.args[0];
      if(str.charAt(0) === "0") {
        str = str.slice(1)
      }
      var pos = indexOf(str, ".");
      var decimalPlaces = str.length - pos - 1;
      var numer = numberNode(str.slice(0, pos) + str.slice(pos + 1));
      var denom = binaryNode(Model.POW, [numberNode("10"), negate(numberNode(decimalPlaces))]);
      return multiplyNode([numer, denom])
    }
    function isLessThan(n1, n2) {
      if(n1 && n1.op !== undefined) {
        n1 = mathValue(n1, true)
      }
      if(n2 && n2.op !== undefined) {
        n2 = mathValue(n2, true)
      }
      if(n1 === null || (!(n1 instanceof BigDecimal) || (n2 === null || !(n1 instanceof BigDecimal)))) {
        return false
      }
      return n1.compareTo(n2) < 0
    }
    function isPos(bd) {
      return bd.compareTo(bigZero) > 0
    }
    function pow(b, e) {
      var val;
      if(b === null || e === null) {
        return null
      }
      if(b instanceof BigDecimal) {
        if(isInteger(e)) {
          val = b.pow(e.abs());
          if(isNeg(e)) {
            val = divide(bigOne, val)
          }
          return val
        }else {
          b = toNumber(b);
          e = toNumber(e);
          val = Math.pow(b, e);
          if(isNaN(val)) {
            return null
          }
          return toDecimal(val)
        }
      }else {
        return toDecimal(Math.pow(b, e))
      }
    }
    function sqrtNode(node) {
      return binaryNode(Model.POW, [node, nodeOneHalf])
    }
    function divide(n, d) {
      if(n === null || d === null) {
        return null
      }
      if(n instanceof BigDecimal) {
        n = toNumber(n)
      }
      if(d instanceof BigDecimal) {
        d = toNumber(d)
      }
      if(d === 0) {
        return null
      }
      return toDecimal(n / d)
    }
    function sqrt(n) {
      if(n instanceof BigDecimal) {
        if(n === null) {
          return null
        }
        n = toNumber(n)
      }
      if(isNaN(n)) {
        return null
      }
      return toDecimal(Math.sqrt(n)).setScale(option("decimalPlaces"), BigDecimal.ROUND_HALF_UP)
    }
    function trig(n, op) {
      if(n === null) {
        return null
      }else {
        if(n instanceof BigDecimal) {
          n = toNumber(n)
        }else {
          if(isNaN(n)) {
            return null
          }
        }
      }
      var f;
      switch(op) {
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
          break
      }
      var result = toDecimal(f(n));
      return result
    }
    function flattenNestedNodes(node, doSimplify) {
      var args = [];
      if(node.op === Model.NUM || node.op === Model.VAR) {
        return node
      }
      forEach(node.args, function(n) {
        if(doSimplify) {
          n = simplify(n)
        }
        n = normalize(n);
        if(n.op === node.op) {
          args = args.concat(n.args)
        }else {
          args.push(n)
        }
      });
      return binaryNode(node.op, args)
    }
    function factorGroupingKey(root) {
      if(!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return 0
      }
      return visit(root, {name:"factorGroupingKey", exponential:function(node) {
        return factorGroupingKey(node.args[1]) + Model.POW + factorGroupingKey(node.args[0])
      }, multiplicative:function(node) {
        var key = "";
        key += variables(node).join("");
        if(!key) {
          key = factorGroupingKey(node.args[0])
        }
        return key
      }, additive:function(node) {
        var key = "";
        forEach(node.args, function(n) {
          key += "+" + factorGroupingKey(n)
        });
        return key
      }, unary:function(node) {
        return factorGroupingKey(node.args[0])
      }, numeric:function(node) {
        return Model.NUM
      }, variable:function(node) {
        return node.args[0]
      }, comma:function(node) {
        return Model.COMMA
      }, equals:function(node) {
        return Model.EQL
      }})
    }
    var groupedNodes = [];
    function groupLikes(node) {
      var hash = {};
      var vp, keyid;
      if(node.op !== Model.MUL && node.op !== Model.ADD) {
        return node
      }
      assert(node.args.length > 1);
      var nid = ast.intern(node);
      var cachedNode;
      if((cachedNode = groupedNodes[nid]) !== undefined) {
        return cachedNode
      }
      var rootNid = nid;
      node = flattenNestedNodes(node);
      forEach(node.args, function(n, i) {
        var key;
        if(node.op === Model.MUL) {
          key = factorGroupingKey(n)
        }else {
          if(node.op === Model.ADD) {
            key = variablePart(n)
          }
        }
        if(!key) {
          var mv;
          if((mv = mathValue(n, true)) !== null) {
            if(n.op === Model.POW) {
              mv = abs(mathValue(n.args[0], true));
              if(mv !== null) {
                key = "number"
              }else {
                key = "none"
              }
            }else {
              mv = abs(mv);
              if(mv !== null) {
                key = "number"
              }else {
                key = "none"
              }
            }
          }else {
            key = n
          }
        }
        assert(key);
        if(typeof key === "string") {
          key = variableNode(key)
        }
        keyid = ast.intern(key);
        var list = hash[keyid] ? hash[keyid] : hash[keyid] = [];
        list.push(n)
      });
      var args = [];
      var numberArgs = [];
      forEach(keys(hash), function(k) {
        var exprs = hash[k];
        assert(exprs);
        var cp = [];
        var vp = [];
        forEach(exprs, function(n) {
          var c = constantPart(n);
          if(c) {
            cp.push(c)
          }
        });
        forEach(exprs, function(n) {
          var c = variablePart(n);
          if(c) {
            vp.push(c)
          }
        });
        if(indexOf(cp, null) >= 0) {
          return node
        }
        if(node.op === Model.ADD) {
          var nd;
          if(cp.length > 0) {
            nd = binaryNode(node.op, cp);
            var mv = mathValue(nd);
            var tempArgs = [];
            if(mv !== null) {
              nd = numberNode(mv)
            }else {
              nd = simplify(nd, {dontGroup:true})
            }
          }else {
            nd = nodeOne
          }
          if(vp.length > 0) {
            var v = vp[0];
            if(isZero(nd)) {
              args.push(nodeZero)
            }else {
              if(isOne(nd)) {
                args.push(v)
              }else {
                args.push(simplify(binaryNode(Model.MUL, [nd, v]), {dontGroup:true}))
              }
            }
          }else {
            if(nd) {
              if(nd.op === Model.NUM) {
                numberArgs.push(nd)
              }else {
                args.push(nd)
              }
            }
          }
        }else {
          if(node.op === Model.MUL) {
            var nd;
            if(cp.length > 0) {
              nd = binaryNode(node.op, cp);
              var mv = mathValue(nd);
              var tempArgs = [];
              if(mv !== null) {
                if(isOne(mv)) {
                }else {
                  numberArgs.push(numberNode(mv.toString()))
                }
                nd = null
              }else {
                nd = simplify(nd, {dontGroup:true})
              }
            }else {
              nd = null
            }
            if(vp.length > 0) {
              if(nd === null || isOne(nd)) {
                args.push(simplify(binaryNode(Model.MUL, vp), {dontGroup:true}))
              }else {
                if(isZero(nd)) {
                  args.push(nodeZero)
                }else {
                  args.push(simplify(binaryNode(Model.MUL, [nd].concat(vp)), {dontGroup:true}))
                }
              }
            }else {
              if(nd) {
                if(mathValue(nd, true)) {
                  numberArgs.push(nd)
                }else {
                  args.push(nd)
                }
              }
            }
          }else {
            args.push(binaryNode(node.op, exprs))
          }
        }
      });
      if(numberArgs.length > 0) {
        var nd = binaryNode(node.op, numberArgs);
        var mv = mathValue(nd);
        if(mv === null) {
          args.push(nd)
        }else {
          args.push(numberNode(mv))
        }
      }
      if(args.length === 0) {
        node = nodeOne
      }else {
        if(args.length === 1) {
          node = args[0]
        }else {
          node = binaryNode(node.op, args)
        }
      }
      node = sort(node);
      groupedNodes[rootNid] = node;
      return node
    }
    function hasLikeFactors(node) {
      if(node.op !== Model.MUL) {
        return false
      }
      var hash = {};
      var vp, vpnid, list;
      var result = !every(node.args, function(n) {
        vpnid = ast.intern(n);
        list = hash[vpnid] ? hash[vpnid] : hash[vpnid] = [];
        list.push(n);
        return list.length < 2 || isAdditive(n)
      });
      return result
    }
    function squareRoot(node) {
      var e = 2;
      var args;
      if(node.op === Model.NUM) {
        args = factors(node, {}, false, true)
      }else {
        if(node.op === Model.MUL) {
          args = node.args
        }else {
          return sqrtNode(node)
        }
      }
      var hash = {};
      var vp, vpnid, list;
      forEach(args, function(n) {
        vpnid = ast.intern(n);
        list = hash[vpnid] ? hash[vpnid] : hash[vpnid] = [];
        list.push(n)
      });
      var inList = [], outList = [];
      forEach(keys(hash), function(k) {
        list = hash[k];
        if(list.length >= e) {
          while(list.length >= e) {
            outList.push(list[0]);
            list = list.slice(e)
          }
          inList = inList.concat(list)
        }else {
          inList = inList.concat(list)
        }
      });
      if(inList.length > 0) {
        outList = outList.concat(sqrtNode(multiplyNode(inList)))
      }
      return multiplyNode(outList)
    }
    function listNodeIDs(node) {
      var aa = [];
      if(node.op === Model.COMMA) {
        forEach(node.args, function(n) {
          aa.push(ast.intern(n))
        })
      }else {
        aa.push(ast.intern(node))
      }
      return aa
    }
    function diffSets(n1, n2) {
      if(n1.op === Model.MUL) {
        assert(n1.args.length === 2);
        assert(n1.args[1].op === Model.COMMA);
        var t = n2;
        n2 = n1.args[1];
        n1 = t
      }
      var a1 = listNodeIDs(n1);
      var a2 = listNodeIDs(n2);
      var nids = filter(a1, function(i) {
        return indexOf(a2, i) < 0
      });
      var args = [];
      forEach(nids, function(nid) {
        args.push(ast.node(nid))
      });
      return newNode(Model.COMMA, args)
    }
    function isPolynomialDenominatorWithNegativeTerm(node) {
      return node.op === Model.POW && (isMinusOne(node.args[1]) && (node.args[0].op === Model.ADD && (variables(node.args[0]).length > 0 && some(node.args[0].args, function(n) {
        return isNeg(constantPart(n))
      }))))
    }
    var simplifiedNodes = [];
    function simplify(root, env, resume) {
      if(!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return 0
      }
      assert(root.op !== Model.MUL || root.args.length > 1);
      var nid = ast.intern(root);
      if(root.simplifyNid === nid) {
        return root
      }
      var node = Model.create(visit(root, {name:"simplify", numeric:function(node) {
        return node
      }, additive:function(node) {
        assert(node.op !== Model.SUB, "simplify() additive node not normalized: " + JSON.stringify(node));
        if(node.op === Model.PM) {
          return node
        }
        node = cancelTerms(node);
        if(!env || !env.dontGroup) {
          node = groupLikes(node)
        }
        if(!isAdditive(node)) {
          return node
        }
        var args = [];
        forEach(node.args, function(n, i) {
          args = args.concat(simplify(n, env))
        });
        node = newNode(node.op, args);
        if(node.op === Model.PM) {
          return node
        }else {
          if(node.op === Model.BACKSLASH || node.op === Model.ADD && (node.args.length === 2 && (node.args[0].op === Model.MUL && (node.args[0].args.length === 2 && (node.args[0].args[0].op === Model.NUM && (node.args[0].args[0].args[0] === "-1" && (node.args[0].args[1].op === Model.COMMA && node.args[1].op === Model.COMMA))))))) {
            return diffSets(node.args[0], node.args[1])
          }
        }
        if(!option("dontFactorDenominators")) {
          node = commonDenom(node)
        }
        if(!isAdditive(node)) {
          return node
        }
        var args = node.args.slice(0);
        var n0 = [simplify(args.shift(), env)];
        forEach(args, function(n1, i) {
          n1 = simplify(n1, env);
          n0 = n0.concat(fold(n0.pop(), n1))
        });
        if(n0.length < 2) {
          node = n0[0]
        }else {
          node = binaryNode(node.op, n0)
        }
        assert(node.args.length > 0);
        return node;
        function commonDenom(node) {
          var n0 = node.args;
          if(!isChemCore()) {
            var denoms = [];
            forEach(n0, function(n1) {
              denoms = denom(n1, denoms)
            });
            if(denoms.length > 1 || denoms.length === 1 && !isOne(denoms[0])) {
              var denominator = binaryNode(Model.POW, [multiplyNode(denoms, true), nodeMinusOne]);
              var n2 = [];
              forEach(n0, function(n1) {
                var d, n;
                d = denom(n1, []);
                n = numer(n1, d[0], denoms);
                n2 = n2.concat(n)
              });
              n0 = binaryNode(node.op, n2);
              node = multiplyNode([n0, denominator])
            }else {
              node = node
            }
          }
          return node
        }
        function numer(n, d, denoms) {
          var dd = denoms.slice(0);
          var ff = factors(n, {}, true, true);
          var hasNumer = false;
          var n0, nn = [];
          forEach(ff, function(n) {
            if(n.op !== Model.POW || !isNeg(mathValue(n.args[1], true))) {
              nn.push(n)
            }
          });
          if(nn.length === 0) {
            n0 = nodeOne
          }else {
            n0 = multiplyNode(nn)
          }
          var nid0 = ast.intern(d);
          var index = -1;
          some(dd, function(n, i) {
            var nid1 = ast.intern(n);
            if(nid0 === nid1) {
              index = i;
              return true
            }
            return false
          });
          if(index > -1) {
            dd.splice(index, 1)
          }
          return multiplyNode([].concat(n0).concat(dd), true)
        }
        function denom(n, denoms) {
          var ff = factors(n, {}, true, true);
          var hasDenom = false;
          var d0, dd = [];
          forEach(ff, function(n) {
            d0 = n.args[0];
            if(n.op === Model.POW && isNeg(mathValue(n.args[1], true))) {
              dd.push(binaryNode(Model.POW, [d0, simplify(negate(n.args[1]), env)]))
            }
          });
          if(dd.length === 0) {
            d0 = nodeOne
          }else {
            d0 = multiplyNode(dd)
          }
          if(every(denoms, function(d) {
            return ast.intern(d) !== ast.intern(d0)
          })) {
            denoms.push(d0)
          }
          return denoms
        }
        function unfold(lnode, rnode) {
          var ldeg = degree(lnode);
          var rdeg = degree(rnode);
          if(isZero(ldeg) && isZero(rdeg)) {
            var lfact = factors(lnode, null, false, true);
            var rfact = factors(rnode, null, false, true);
            var ldenom = nodeOne, lnumer = nodeOne;
            forEach(lfact, function(n) {
              if(n.op === Model.POW && isMinusOne(mathValue(n.args[1]))) {
                if(!isOne(ldenom)) {
                  ldenom = multiplyNode([ldenom, n.args[0]], true)
                }else {
                  ldenom = n.args[0]
                }
              }else {
                if(!isOne(lnumer)) {
                  lnumer = multiplyNode([lnumer, n], true)
                }else {
                  lnumer = n
                }
              }
            });
            var rdenom = nodeOne, rnumer = nodeOne;
            forEach(rfact, function(n) {
              if(n.op === Model.POW && isMinusOne(mathValue(n.args[1]))) {
                if(!isOne(rdenom)) {
                  rdenom = multiplyNode([rdenom, n.args[0]], true)
                }else {
                  rdenom = n.args[0]
                }
              }else {
                if(!isOne(rnumer)) {
                  rnumer = multiplyNode([rnumer, n], true)
                }else {
                  rnumer = n
                }
              }
            });
            var mvldenom = mathValue(ldenom, true);
            var mvrdenom = mathValue(rdenom, true);
            if(mvldenom !== null && (mvrdenom !== null && isZero(mvldenom.compareTo(mvrdenom)))) {
              if(isZero(mvldenom.compareTo(bigOne))) {
                return[binaryNode(Model.ADD, [lnumer, rnumer])]
              }else {
                return[multiplyNode([binaryNode(Model.ADD, [lnumer, rnumer]), binaryNode(Model.POW, [ldenom, nodeMinusOne])])]
              }
            }else {
              lnumer = multiplyNode([rdenom, lnumer], true);
              rnumer = multiplyNode([ldenom, rnumer], true);
              return[multiplyNode([binaryNode(Model.ADD, [lnumer, rnumer]), binaryNode(Model.POW, [multiplyNode([ldenom, rdenom]), nodeMinusOne])])]
            }
          }
          return[lnode, rnode]
        }
        function fold(lnode, rnode) {
          var ldegr = degree(lnode);
          var rdegr = degree(rnode);
          var lcoeff = constantPart(lnode);
          var rcoeff = constantPart(rnode);
          if(isZero(lcoeff)) {
            return rnode
          }
          if(isZero(rcoeff)) {
            return lnode
          }
          if(ldegr === rdegr) {
            var lvpart = variablePart(lnode);
            var rvpart = variablePart(rnode);
            if(lvpart !== null && (rvpart !== null && ast.intern(lvpart) === ast.intern(rvpart))) {
              var c = binaryNode(Model.ADD, [lcoeff, rcoeff]);
              var cmv = mathValue(c);
              if(isZero(cmv)) {
                return nodeZero
              }else {
                if(isOne(cmv)) {
                  return lvpart
                }
              }
              return multiplyNode([c, lvpart])
            }else {
              if(lnode.op === Model.LOG && (rnode.op === Model.LOG && ast.intern(lnode.args[0]) === ast.intern(rnode.args[0]))) {
                return simplify(newNode(Model.LOG, [lnode.args[0], multiplyNode([lnode.args[1], rnode.args[1]])]), env)
              }else {
                if(ldegr === 0 && rdegr === 0) {
                  var mv1 = mathValue(lnode, true);
                  var mv2 = mathValue(rnode, true);
                  if(isInteger(mv1) && isInteger(mv2)) {
                    return numberNode(mv1.add(mv2))
                  }else {
                    if(ast.intern(lnode) === ast.intern(rnode)) {
                      return multiplyNode([numberNode("2"), lnode])
                    }else {
                      if((!env || !env.dontGroup) && (!option("dontFactorTerms") && commonFactors(lnode, rnode).length > 0)) {
                        return[factorTerms(lnode, rnode)]
                      }else {
                        return[lnode, rnode]
                      }
                    }
                  }
                }
              }
            }
          }
          if(ast.intern(lnode) === ast.intern(rnode)) {
            return multiplyNode([numberNode("2"), lnode])
          }else {
            if(isZero(mathValue(lcoeff))) {
              return rnode
            }else {
              if(isZero(mathValue(rcoeff))) {
                return lnode
              }else {
                if(!option("dontFactorTerms") && (!isOne(mathValue(lcoeff)) && !isOne(mathValue(rcoeff)))) {
                  if(commonFactors(lnode, rnode).length > 0) {
                    var node = [factorTerms(lnode, rnode)];
                    return node
                  }
                }
              }
            }
          }
          return[lnode, rnode]
        }
      }, multiplicative:function(node) {
        assert(node.op === Model.MUL, "simplify() multiplicative node not normalized: " + JSON.stringify(node));
        if(!env || !env.dontGroup) {
          node = groupLikes(node)
        }
        if(!isMultiplicative(node)) {
          return node
        }
        var nid = ast.intern(node);
        var args = node.args.slice(0);
        var n0 = [simplify(args.shift(), env)];
        if(n0[0].op === Model.MUL) {
          n0 = n0[0].args.slice(0)
        }
        forEach(args, function(n1, i) {
          n1 = simplify(n1, env);
          n0 = n0.concat(fold(n0.pop(), n1))
        });
        if(n0.length < 2) {
          node = n0[0]
        }else {
          assert(n0.length);
          node = sort(flattenNestedNodes(multiplyNode(n0)))
        }
        node = cancelFactors(node);
        return node;
        function fold(lnode, rnode) {
          if(isUndefined(lnode) || isUndefined(rnode)) {
            return undefinedNode()
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
          if(ldegr === 0 && isZero(lcoeffmv) || rdegr === 0 && isZero(rcoeffmv)) {
            if(units(lnode).length || units(rnode).length) {
              return[lnode, rnode]
            }else {
              return nodeZero
            }
          }else {
            if(ldegr === 0 && isOne(lcoeffmv)) {
              return rnode
            }else {
              if(rdegr === 0 && isOne(rcoeffmv)) {
                return lnode
              }else {
                if(isInfinity(lnode)) {
                  if(isNeg(rnode)) {
                    return negate(lnode)
                  }else {
                    return lnode
                  }
                }else {
                  if(isInfinity(rnode)) {
                    if(isNeg(lnode)) {
                      return negate(rnode)
                    }else {
                      return rnode
                    }
                  }else {
                    if(ldegr === 0 && rdegr === 0) {
                      if(isOne(rcoeffmv) && isOne(lcoeffmv)) {
                        return nodeOne
                      }
                      var lexpo = exponent(lnode);
                      var rexpo = exponent(rnode);
                      var lbase = base(lnode);
                      var rbase = base(rnode);
                      if(lbase !== null && (rbase !== null && (Math.abs(lexpo) === 1 && Math.abs(rexpo) === 1))) {
                        if(lexpo === rexpo) {
                          if(isMinusOne(lbase) || isMinusOne(rbase)) {
                            node = [lnode, rnode]
                          }else {
                            node = multiplyNode([numberNode(lbase), numberNode(rbase)]);
                            if(mv = mathValue(node)) {
                              node = numberNode(mv)
                            }
                            if(lexpo === -1) {
                              node = binaryNode(Model.POW, [node, nodeMinusOne])
                            }
                          }
                        }else {
                          var mv;
                          if(isZero(lnode)) {
                            node = nodeZero
                          }else {
                            if(mv = mathValue(multiplyNode([lnode, rnode]))) {
                              node = numberNode(mv)
                            }else {
                              var lbaseN = toNumber(lbase);
                              var rbaseN = toNumber(rbase);
                              var d = gcd(lbaseN, rbaseN);
                              if(d === (d | 0)) {
                                lbase = divide(lbase, toDecimal(d));
                                rbase = divide(rbase, toDecimal(d))
                              }
                              if(lexpo < 0 && isOne(lbase)) {
                                node = numberNode(rbase)
                              }else {
                                if(rexpo < 0 && isOne(rbase)) {
                                  node = numberNode(lbase)
                                }else {
                                  var n = lexpo === 1 ? lbase : rbase;
                                  var d = lexpo === 1 ? rbase : lbase;
                                  if(isOne(n)) {
                                    node = binaryNode(Model.POW, [numberNode(d), nodeMinusOne])
                                  }else {
                                    var q = divide(n, d);
                                    if(isInteger(q)) {
                                      node = numberNode(q)
                                    }else {
                                      if(isNeg(n) && isNeg(d)) {
                                        n = n.multiply(toDecimal("-1"));
                                        d = d.multiply(toDecimal("-1"))
                                      }
                                      node = [numberNode(n), binaryNode(Model.POW, [numberNode(d), nodeMinusOne])]
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }else {
                        if(lnode.op === Model.POW && (rnode.op === Model.POW && ast.intern(lnode.args[1]) === ast.intern(rnode.args[1]))) {
                          var lbase = lnode.args[0];
                          var rbase = rnode.args[0];
                          var lexpo = exponent(lnode);
                          var rexpo = exponent(rnode);
                          if(lexpo === 0.5 && ast.intern(lbase) === ast.intern(rbase)) {
                            node = lbase
                          }else {
                            node = [lnode, rnode]
                          }
                        }else {
                          node = [lnode, rnode]
                        }
                      }
                    }else {
                      if(lvpart && (rvpart && ast.intern(lvpart) === ast.intern(rvpart))) {
                        var lnode = multiplyNode([lcoeff, rcoeff]);
                        if(lvpart.op === Model.POW) {
                          assert(lvpart.args.length === 2 && rvpart.args.length === 2, "Exponents of exponents not handled here.");
                          var lexpo = lvpart.args[1];
                          var rexpo = rvpart.args[1];
                          var rnode = binaryNode(Model.POW, [lvpart.args[0], binaryNode(Model.ADD, [lexpo, rexpo])])
                        }else {
                          var rnode = binaryNode(Model.POW, [lvpart, numberNode("2")])
                        }
                        if(isZero(mathValue(lnode))) {
                          node = []
                        }else {
                          if(isOne(mathValue(lnode))) {
                            node = rnode
                          }else {
                            node = [lnode, rnode]
                          }
                        }
                      }else {
                        if(ast.intern(lnode.op === Model.POW ? lnode.args[0] : lnode) === ast.intern(rnode.op === Model.POW ? rnode.args[0] : rnode)) {
                          var b, el, er;
                          if(lnode.op === Model.POW) {
                            b = lnode.args[0]
                          }else {
                            b = lnode
                          }
                          if(lnode.op === Model.POW) {
                            el = lnode.args[1]
                          }else {
                            el = nodeOne
                          }
                          if(rnode.op === Model.POW) {
                            er = rnode.args[1]
                          }else {
                            er = nodeOne
                          }
                          var e = simplify(binaryNode(Model.ADD, [el, er]), env);
                          if(isZero(e)) {
                            node = nodeOne
                          }else {
                            if(isOne(e)) {
                              node = b
                            }else {
                              node = binaryNode(Model.POW, [b, e])
                            }
                          }
                        }else {
                          if(ldegr === 0 && isOne(lcoeffmv)) {
                            return rnode
                          }else {
                            if(rdegr === 0 && isOne(rcoeffmv)) {
                              return lnode
                            }else {
                              if(ldegr === 0) {
                                if(sign(lnode) < 0 && isPolynomialDenominatorWithNegativeTerm(rnode)) {
                                  return[negate(lnode), expand(negate(rnode))]
                                }
                                var v = mathValue(lnode);
                                if(v !== null) {
                                  node = [numberNode(v), rnode]
                                }else {
                                  node = [lnode, rnode]
                                }
                              }else {
                                if(rdegr === 0) {
                                  var v = mathValue(rnode);
                                  if(v !== null) {
                                    node = [numberNode(v), lnode]
                                  }else {
                                    node = [lnode, rnode]
                                  }
                                }else {
                                  if(option("dontExpandPowers") && (lnode.op === Model.POW && (rnode.op === Model.POW && ast.intern(lnode.args[1]) === ast.intern(rnode.args[1])))) {
                                    var lbase = lnode.args[0];
                                    var rbase = rnode.args[0];
                                    var lexpo = exponent(lnode);
                                    var rexpo = exponent(rnode);
                                    var args = [];
                                    if(lbase.op === Model.MUL) {
                                      args = args.concat(lbase.args)
                                    }else {
                                      args.push(lbase)
                                    }
                                    if(rbase.op === Model.MUL) {
                                      args = args.concat(rbase.args)
                                    }else {
                                      args.push(rbase)
                                    }
                                    node = binaryNode(Model.POW, [multiplyNode(args), lnode.args[1]])
                                  }else {
                                    node = [lnode, rnode]
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          if(lnode.op === Model.PM || rnode.op === Model.PM) {
            if(node instanceof Array) {
              node = binaryNode(Model.PM, node)
            }else {
              node = unaryNode(Model.PM, [node])
            }
          }
          return node
        }
      }, unary:function(node) {
        switch(node.op) {
          case Model.SUB:
            node = multiplyNode([node.args[0], nodeMinusOne]);
            break;
          case Model.ABS:
            var mv = mathValue(node.args[0]);
            if(mv !== null) {
              node = numberNode(abs(mv))
            }
            break;
          case Model.M:
            var mv = mathValue(node);
            if(mv !== null) {
              node = numberNode(mv)
            }
            break;
          case Model.PM:
            node = unaryNode(node.op, [simplify(node.args[0], env)]);
            break;
          default:
            node = unaryNode(node.op, [simplify(node.args[0], env)])
        }
        return node
      }, exponential:function(node) {
        var base = node.args[0];
        var nid = ast.intern(node);
        var args = node.args.slice(0).reverse();
        var n0 = [simplify(args.shift(), env)];
        forEach(args, function(n1, i) {
          n1 = simplify(n1, env);
          n0 = n0.concat(fold(node.op, n0.pop(), n1))
        });
        if(n0.length === 1) {
          var n = n0[0];
          if(n.op !== Model.NUM || (isInteger(n) || (isInfinity(n) || isUndefined(n)))) {
            node = n
          }
        }else {
          if(isInfinity(n0[1]) && isNeg(n0[0])) {
            return nodeZero
          }
          node = binaryNode(node.op, n0.reverse())
        }
        return node;
        function fold(op, expo, base) {
          var mv, node;
          var bmv = mathValue(base);
          var emv = mathValue(expo, {}, true);
          if(op === Model.POW) {
            if(isZero(bmv)) {
              if(isNeg(emv)) {
                return[undefinedNode()]
              }else {
                return[nodeZero]
              }
            }else {
              if(isZero(emv)) {
                return[nodeOne]
              }else {
                if(isOne(bmv)) {
                  return[nodeOne]
                }else {
                  if(isOne(emv)) {
                    return[base]
                  }else {
                    if(ast.intern(base) === ast.intern(nodeImaginary) && emv !== null) {
                      if(emv.remainder(bigFour).compareTo(bigZero) === 0) {
                        return[nodeOne]
                      }else {
                        if(emv.remainder(bigTwo).compareTo(bigZero) === 0) {
                          return[nodeMinusOne]
                        }else {
                          if(emv.remainder(bigThree).compareTo(bigZero) === 0) {
                            return[multiplyNode([nodeMinusOne, nodeImaginary])]
                          }else {
                            return[nodeImaginary]
                          }
                        }
                      }
                      return[expo, base]
                    }else {
                      if(ast.intern(expo) === ast.intern(nodeOneHalf)) {
                        return squareRoot(base)
                      }else {
                        if(!option("dontExpandPowers") && base.op === Model.MUL) {
                          var args = [];
                          forEach(base.args, function(n) {
                            if(n.op === Model.POW) {
                              args.push(binaryNode(Model.POW, [n.args[0], multiplyNode([n.args[1], expo])]))
                            }else {
                              args.push(binaryNode(Model.POW, [n, expo]))
                            }
                          });
                          return multiplyNode(args)
                        }else {
                          if(base.op === Model.POW) {
                            return binaryNode(Model.POW, [base.args[0], multiplyNode([base.args[1], expo])])
                          }else {
                            if(bmv !== null && (emv !== null && !isNeg(bmv))) {
                              var b = pow(bmv, emv);
                              base = numberNode(b);
                              return base;
                              if(ff.length === 0) {
                                return base
                              }else {
                                if(ff.length === 1) {
                                  return[ff[0], base]
                                }else {
                                  if(ff.length === 0) {
                                    assert(false)
                                  }
                                  return[multiplyNode(ff), base]
                                }
                              }
                            }else {
                              var b = pow(bmv, emv);
                              if(b !== null) {
                                return numberNode(b)
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }else {
            if(op === Model.LOG) {
              if(emv !== null && isE(base)) {
                var mv = toDecimal(Math.log(toNumber(emv)));
                if(isInteger(mv)) {
                  return numberNode(mv)
                }
              }
            }
          }
          return[expo, base]
        }
      }, variable:function(node) {
        return node
      }, comma:function(node) {
        var args = [];
        forEach(node.args, function(n) {
          args = args.concat(simplify(n, env))
        });
        return newNode(node.op, args)
      }, equals:function(node) {
        var args = [];
        forEach(node.args, function(n) {
          args = args.concat(simplify(n, env))
        });
        assert(args.length === 2);
        if(isZero(args[1])) {
          var mv = mathValue(args[0], true);
          if(mv !== null) {
            return newNode(node.op, args)
          }
          var ff = factors(args[0], {}, true, true, true);
          if(isMinusOne(ff[0])) {
            ff.shift()
          }
          var args0 = [];
          var foundZero = false;
          forEach(ff, function(n) {
            var mv = mathValue(n, true);
            if(foundZero || (mv !== null && (!isZero(mv) && ff.length > 1) || (n.op === Model.VAR && (units(n).length > 0 && ff.length > 1) || (n.op === Model.POW && (units(n.args[0]).length > 0 && (mathValue(n.args[0]) !== null && ff.length > 1)) || n.op === Model.POW && isNeg(n.args[1]))))) {
              if(args0.length > 0 && (node.op !== Model.EQL && (node.op !== Model.APPROX && isNeg(n)))) {
                args0.push(expand(multiplyNode([nodeMinusOne, args0.pop()])))
              }
            }else {
              if(isZero(mv)) {
                args0 = [nodeZero];
                foundZero = true
              }else {
                args0 = args0.concat(n)
              }
            }
          });
          if(args0.length > 0) {
            args[0] = multiplyNode(args0)
          }else {
            args[0] = nodeZero
          }
        }
        return newNode(node.op, args)
      }}), root.location);
      while(nid !== ast.intern(node)) {
        nid = ast.intern(node);
        node = simplify(node, env)
      }
      node.simplifyNid = nid;
      return node
    }
    function leadingCoeff(node) {
      var tt, c;
      switch(node.op) {
        case Model.ADD:
          c = constantPart(node.args[0]);
          break;
        default:
          c = constantPart(node);
          break
      }
      return c
    }
    function sign(node) {
      var s = 0;
      var tt = terms(node);
      forEach(tt, function(n) {
        var mv = mathValue(n);
        if(isNeg(leadingCoeff(n))) {
          s -= 1
        }else {
          s += 1
        }
      });
      if(s === 0) {
        if(isNeg(leadingCoeff(tt[0]))) {
          s = -1
        }else {
          s = 1
        }
      }
      return s
    }
    function base(node) {
      var op = node.op;
      var base = op === Model.POW ? mathValue(node.args[0]) : mathValue(node);
      return base
    }
    function exponent(node) {
      return node.op === Model.POW ? toNumber(mathValue(node.args[1], {}, true)) : 1
    }
    function log(b, x) {
      return Math.log(x) / Math.log(b)
    }
    function mathValue(root, env, allowDecimal) {
      if(allowDecimal === undefined && typeof env === "boolean") {
        allowDecimal = env;
        env = {}
      }
      if(!root) {
        return null
      }
      if(!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return 0
      }
      return visit(root, {name:"simplify", numeric:function(node) {
        if(isUndefined(node)) {
          return null
        }
        return toDecimal(node.args[0])
      }, additive:function(node) {
        if(node.op === Model.PM) {
          return null
        }
        var val = bigZero;
        forEach(node.args, function(n) {
          var mv = mathValue(n, env, true);
          if(mv && val) {
            val = val.add(mv)
          }else {
            val = null
          }
        });
        if(allowDecimal || isInteger(val)) {
          return val
        }else {
          return null
        }
      }, multiplicative:function(node) {
        var val = bigOne;
        forEach(node.args, function(n) {
          var mv = mathValue(n, env, true);
          if(val !== null && mv != null) {
            val = val.multiply(mv)
          }else {
            val = null
          }
        });
        if(allowDecimal || isInteger(val)) {
          return val
        }
        return null
      }, unary:function(node) {
        switch(node.op) {
          case Model.SUB:
            var val = mathValue(node.args[0], env, allowDecimal);
            if(val === null) {
              return null
            }
            return val.multiply(bigMinusOne);
          case Model.FACT:
            var n = mathValue(node.args[0], env, allowDecimal);
            if(n) {
              return toDecimal(factorial(n))
            }else {
              return null
            }
          ;
          case Model.M:
            var args = [];
            if(node.args[0].op === Model.MUL) {
              forEach(node.args[0].args, function(n) {
                assert(n.op === Model.VAR, "Internal error: invalid arguments to the M tag");
                var sym = Model.env[n.args[0]];
                assert(sym && sym.mass, "Internal error: missing chemical symbol");
                var count = n.args[1] ? toNumber(mathValue(n.args[1], env, allowDecimal)) : 1;
                args.push(numberNode(sym.mass * count))
              })
            }else {
              var n = node.args[0];
              assert(n.op === Model.VAR, "Internal error: invalid arguments to the M tag");
              var sym = Model.env[n.args[0]];
              assert(sym && sym.mass, "Internal error: missing chemical symbol");
              var count = n.args[1] ? toNumber(mathValue(n.args[1], env, allowDecimal)) : 1;
              args.push(numberNode(sym.mass * count))
            }
            return mathValue(makeTerm(args), env, allowDecimal);
          case Model.ABS:
            return abs(mathValue(node.args[0], env, allowDecimal));
          case Model.SIN:
          ;
          case Model.COS:
          ;
          case Model.TAN:
          ;
          case Model.ARCSIN:
          ;
          case Model.ARCCOS:
          ;
          case Model.ARCTAN:
            if(allowDecimal) {
              var val = mathValue(toRadians(node.args[0]), env, allowDecimal);
              return trig(val, node.op)
            }
            return null;
          case Model.ADD:
            return mathValue(node.args[0], env, allowDecimal);
          case Model.DEGREE:
            return mathValue(toRadians(node.args[0]), env, allowDecimal);
          default:
            return null
        }
      }, exponential:function(node) {
        var args = node.args.slice(0).reverse();
        var val = mathValue(args.shift(), env, allowDecimal);
        var op = node.op;
        if(op === Model.POW) {
          forEach(args, function(n) {
            var mv = mathValue(n, env, true);
            if(val !== null && mv != null) {
              val = pow(mv, val)
            }else {
              val = null
            }
          })
        }else {
          if(op === Model.LOG) {
            assert(args.length === 1);
            var mv;
            var emv = val;
            var base = args[0];
            var bmv = mathValue(base, true);
            if(emv !== null) {
              if(bmv !== null) {
                val = logBase(bmv, emv)
              }else {
                if(base.op === Model.VAR && base.args[0] === "e") {
                  val = toDecimal(Math.log(toNumber(emv)))
                }
              }
            }
          }
        }
        if(allowDecimal || isInteger(val)) {
          return val
        }
        return null
      }, variable:function(node) {
        var val, n;
        if(env && (val = env[node.args[0]])) {
          switch(val.type) {
            case "unit":
            ;
            case "const":
              n = val.value;
              break;
            default:
              n = val;
              break
          }
          return toDecimal(n)
        }
        return null
      }, comma:function(node) {
        return null
      }, equals:function(node) {
        return null
      }});
      function exponent(node) {
        return node.op === Model.POW ? +node.args[1].args[0] : 1
      }
    }
    function getUnique(list) {
      var u = {}, a = [];
      for(var i = 0, l = list.length;i < l;++i) {
        if(u.hasOwnProperty(list[i])) {
          continue
        }
        a.push(list[i]);
        u[list[i]] = 1
      }
      return a
    }
    function units(root, env) {
      if(!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return 0
      }
      return getUnique(visit(root, {name:"terms", exponential:function(node) {
        return units(node.args[0], env)
      }, multiplicative:function(node) {
        var uu = [];
        forEach(node.args, function(n) {
          uu = uu.concat(units(n, env))
        });
        return uu
      }, additive:function(node) {
        var uu = [];
        forEach(node.args, function(n) {
          uu = uu.concat(units(n, env))
        });
        return uu
      }, unary:function(node) {
        return[]
      }, numeric:function(node) {
        return[]
      }, variable:function(node) {
        var val, env = Model.env;
        if(env && (val = env[node.args[0]])) {
          if(val.type === "unit") {
            return[node.args[0]]
          }
        }
        return[]
      }, comma:function(node) {
        var uu = [];
        forEach(node.args, function(n) {
          uu = uu.concat(units(n, env))
        });
        return uu
      }, equals:function(node) {
        var uu = [];
        forEach(node.args, function(n) {
          uu = uu.concat(units(n, env))
        });
        return uu
      }}))
    }
    function dummy(root, env, resume) {
      console.log("dummy() root=" + JSON.stringify(root, null, 2));
      if(!root || !root.args) {
        assert(false, "Should not get here. Illformed node.")
      }
      var nid = Ast.intern(root);
      visit(root, {name:"dummy", exponential:function(node) {
      }, multiplicative:function(node) {
        resume(null, node)
      }, additive:function(node) {
        resume(null, node)
      }}, function(err, val) {
        if(Ast.intern(val) === nid) {
          resume(err, val)
        }
        dummy(val, env, resume)
      })
    }
    function multiplyMatrix(lnode, rnode) {
      var snode, mnode;
      if(lnode.op !== Model.MATRIX) {
        return multiplyScalarAndMatrix(lnode, rnode)
      }else {
        if(rnode.op !== Model.MATRIX) {
          return multiplyScalarAndMatrix(rnode, lnode)
        }
      }
      var rowArgs = [];
      var rows = lnode.args[0].args;
      forEach(rows, function(row) {
        var colArgs = [];
        var cols = rnode.args[0].args[0].args;
        assert(rows.length === cols.length, message(2013));
        forEach(cols, function(col, n) {
          col = getMatrixCol(rnode, n);
          colArgs.push(multiplyVectors(row.args, col))
        });
        rowArgs.push(newNode(Model.COL, colArgs))
      });
      return newNode(Model.MATRIX, [newNode(Model.ROW, rowArgs)])
    }
    function addMatrix(lnode, rnode) {
      var snode, mnode;
      if(lnode.op !== Model.MATRIX) {
        return addScalarAndMatrix(lnode, rnode)
      }else {
        if(rnode.op !== Model.MATRIX) {
          return addScalarAndMatrix(rnode, lnode)
        }
      }
      var rowArgs = [];
      var lrows = lnode.args[0].args;
      forEach(lrows, function(lrow, i) {
        var colArgs = [];
        var rrows = rnode.args[0].args;
        assert(lrows.length === rrows.length, message(2013));
        var rrow = rrows[i];
        colArgs = addVectors(lrow.args, rrow.args);
        rowArgs.push(newNode(Model.COL, colArgs))
      });
      return newNode(Model.MATRIX, [newNode(Model.ROW, rowArgs)])
    }
    function getMatrixCol(mnode, n) {
      var vec = [];
      var rows = mnode.args[0].args;
      forEach(rows, function(row) {
        var cols = row.args;
        vec.push(cols[n])
      });
      return vec
    }
    function addVectors(v1, v2) {
      var args = [];
      forEach(v1, function(n1, i) {
        var n2 = v2[i];
        args.push(binaryNode(Model.ADD, [n1, n2]))
      });
      return args
    }
    function multiplyVectors(v1, v2) {
      var args = [];
      forEach(v1, function(n1, i) {
        var n2 = v2[i];
        args.push(multiplyNode([n1, n2]))
      });
      return binaryNode(Model.ADD, args)
    }
    function multiplyScalarAndMatrix(snode, mnode) {
      var rowArgs = [];
      var rows = mnode.args[0].args;
      forEach(rows, function(row) {
        var colArgs = [];
        var cols = row.args;
        forEach(cols, function(col) {
          colArgs.push(multiplyNode([snode, col]))
        });
        rowArgs.push(newNode(Model.COL, colArgs))
      });
      return newNode(Model.MATRIX, [newNode(Model.ROW, rowArgs)])
    }
    function addScalarAndMatrix(snode, mnode) {
      var rowArgs = [];
      var rows = mnode.args[0].args;
      forEach(rows, function(row) {
        var colArgs = [];
        var cols = row.args;
        forEach(cols, function(col) {
          colArgs.push(binaryNode(Model.ADD, [snode, col]))
        });
        rowArgs.push(newNode(Model.COL, colArgs))
      });
      return newNode(Model.MATRIX, [newNode(Model.ROW, rowArgs)])
    }
    function multiplyTerms(lterms, rterms, expo) {
      var args = [];
      forEach(lterms, function(n0) {
        forEach(rterms, function(n1) {
          var args1 = [];
          if(n0.op === Model.MUL) {
            args1 = args1.concat(n0.args)
          }else {
            args1.push(n0)
          }
          if(n1.op === Model.MUL) {
            args1 = args1.concat(n1.args)
          }else {
            args1.push(n1)
          }
          args.push(multiplyNode(args1))
        })
      });
      var node = binaryNode(Model.ADD, args);
      if(expo !== undefined) {
        node = binaryNode(Model.POW, [node, numberNode(expo.toString())])
      }
      return[sort(node)]
    }
    var expandedNodes = [];
    function expand(root, env) {
      if(!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return 0
      }
      var nid = ast.intern(root);
      if(root.expandNid === nid) {
        return root
      }
      var cachedNode;
      if((cachedNode = expandedNodes[nid]) !== undefined) {
        return cachedNode
      }
      var rootNid = nid;
      var node = Model.create(visit(root, {name:"expand", numeric:function(node) {
        assert(typeof node.args[0] === "string");
        return node
      }, additive:function(node) {
        var nid = ast.intern(node);
        var args = node.args.slice(0);
        var n0 = [expand(args.shift())];
        forEach(args, function(n1) {
          n1 = expand(n1);
          n0 = n0.concat(unfold(n0.pop(), n1))
        });
        if(n0.length < 2) {
          node = n0[0]
        }else {
          node = binaryNode(node.op, n0)
        }
        if(node.op === Model.MATRIX) {
          return node
        }
        node = cancelTerms(node, "expand");
        return node;
        function unfold(lnode, rnode) {
          if(lnode.op === Model.MATRIX || rnode.op === Model.MATRIX) {
            return addMatrix(lnode, rnode)
          }
          return[lnode, rnode]
        }
      }, multiplicative:function(node) {
        var nid = ast.intern(node);
        var args = node.args.slice(0);
        var n0 = [expand(args.shift())];
        forEach(args, function(n1, i) {
          n1 = expand(n1);
          n0 = n0.concat(unfold(n0.pop(), n1))
        });
        if(n0.length < 2) {
          node = n0[0]
        }else {
          node = multiplyNode(n0)
        }
        if(node.op === Model.MATRIX) {
          return node
        }
        return node;
        function unfold(lnode, rnode) {
          var expo, lterms, rterms;
          if(lnode.op === Model.MATRIX || rnode.op === Model.MATRIX) {
            return multiplyMatrix(lnode, rnode)
          }
          if(lnode.op === Model.POW && (rnode.op === Model.POW && exponent(lnode) === exponent(rnode))) {
            lterms = terms(lnode.args[0]);
            rterms = terms(rnode.args[0]);
            expo = exponent(lnode)
          }else {
            lterms = terms(lnode);
            rterms = terms(rnode)
          }
          if((!isAggregate(lnode) && lterms.length > 1 || !isAggregate(rnode) && rterms.length > 1) && ((lnode.args.length < 64 || rnode.args.length < 2) && (lnode.args.length < 2 || rnode.args.length < 64))) {
            return multiplyTerms(lterms, rterms, expo)
          }
          var result = [];
          if(lnode.op === Model.MUL) {
            result = result.concat(lnode.args)
          }else {
            result.push(lnode)
          }
          if(rnode.op === Model.MUL) {
            result = result.concat(rnode.args)
          }else {
            result.push(rnode)
          }
          return result
        }
      }, unary:function(node) {
        assert(node.op !== Model.SQRT, "Internal error: SQRT removed during parsing");
        switch(node.op) {
          case Model.SUB:
            node = multiplyNode([expand(node.args[0]), nodeMinusOne]);
            node.args[0] = expand(node.args[0]);
            break;
          case Model.TAN:
            var arg0 = expand(node.args[0]);
            node = multiplyNode([newNode(Model.SIN, [arg0]), binaryNode(Model.POW, [newNode(Model.COS, [arg0]), nodeMinusOne])]);
            break;
          case Model.COT:
            var arg0 = expand(node.args[0]);
            node = multiplyNode([newNode(Model.COS, [arg0]), binaryNode(Model.POW, [newNode(Model.SIN, [arg0]), nodeMinusOne])]);
            break;
          case Model.SEC:
            var arg0 = expand(node.args[0]);
            node = multiplyNode([nodeOne, binaryNode(Model.POW, [newNode(Model.COS, [arg0]), nodeMinusOne])]);
            break;
          case Model.CSC:
            var arg0 = expand(node.args[0]);
            node = multiplyNode([nodeOne, binaryNode(Model.POW, [newNode(Model.SIN, [arg0]), nodeMinusOne])]);
            break;
          default:
            node = unaryNode(node.op, [expand(node.args[0])]);
            break
        }
        return node
      }, exponential:function(node) {
        var nid = ast.intern(node);
        var args = node.args.slice(0).reverse();
        var n0 = [expand(args.shift())];
        forEach(args, function(n1, i) {
          n1 = expand(n1);
          n0 = n0.concat(unfold(node.op, n0.pop(), n1))
        });
        var node2;
        if(n0.length < 2) {
          var n = n0[0];
          node2 = n
        }else {
          node2 = binaryNode(node.op, n0.reverse())
        }
        if(node2.op === Model.LOG) {
          var base = node2.args[0];
          var expo = node2.args[1];
          if(!isE(base)) {
            node2 = binaryNode(Model.MUL, [binaryNode(Model.LOG, [nodeE, expo]), binaryNode(Model.POW, [binaryNode(Model.LOG, [nodeE, base]), nodeMinusOne])])
          }
        }
        return node2;
        function unfold(op, expo, base) {
          var node;
          var emv = mathValue(expo);
          if(op === Model.POW) {
            var ff = factors(base, null, false, true);
            if(ff.length === 0) {
              return nodeOne
            }
            var args = [];
            var dontExpandPowers = option("dontExpandPowers");
            forEach(ff, function(n) {
              if(expo.op === Model.ADD) {
                forEach(expo.args, function(e) {
                  args.push(newNode(op, [n, e]))
                })
              }else {
                if(isInteger(emv)) {
                  var ea = Math.abs(toNumber(emv));
                  if(isZero(emv)) {
                    args.push(nodeOne)
                  }else {
                    if(ea < 10 && (isAdditive(n) || !dontExpandPowers)) {
                      var invert = isNeg(emv);
                      for(var i = 0;i < ea;i++) {
                        if(invert) {
                          args.push(binaryNode(Model.POW, [n, nodeMinusOne]))
                        }else {
                          args.push(n)
                        }
                      }
                    }else {
                      args.push(newNode(op, [n, expo]))
                    }
                  }
                }else {
                  args.push(newNode(op, [n, expo]))
                }
              }
            })
          }else {
            if(op === Model.LOG) {
              var args = [];
              var dontExpandPowers = option("dontExpandPowers");
              if(isMultiplicative(expo)) {
                var aa = [];
                forEach(expo.args, function(e) {
                  if(e.op === Model.POW) {
                    aa.push(multiplyNode([e.args[1], newNode(Model.LOG, [base, e.args[0]])]))
                  }else {
                    aa.push(newNode(op, [base, e]))
                  }
                });
                args.push(binaryNode(Model.ADD, aa))
              }else {
                if(expo.op === Model.POW) {
                  args.push(multiplyNode([expo.args[1], newNode(Model.LOG, [base, expo.args[0]])]))
                }
              }
            }
          }
          if(args.length > 1) {
            return[multiplyNode(args)]
          }else {
            if(args.length === 1) {
              return[args[0]]
            }
          }
          return[expo, base]
        }
      }, variable:function(node) {
        return node
      }, comma:function(node) {
        var args = [];
        forEach(node.args, function(n) {
          args = args.concat(expand(n))
        });
        return newNode(node.op, args)
      }, equals:function(node) {
        var args = [];
        forEach(node.args, function(n) {
          args = args.concat(expand(n))
        });
        return newNode(node.op, args)
      }}), root.location);
      while(nid !== ast.intern(node)) {
        nid = ast.intern(node);
        node = expand(node)
      }
      node.expandNid = nid;
      expandedNodes[rootNid] = node;
      return node
    }
    function factors(root, env, ignorePrimeFactors, preserveNeg, factorAdditive) {
      if(!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return 0
      }
      return visit(root, {name:"factors", numeric:function(node) {
        if(ignorePrimeFactors || isInfinity(node)) {
          return[node]
        }
        var ff = [];
        if(preserveNeg && isNeg(node)) {
          ff.push(nodeMinusOne)
        }
        var absv = Math.abs(+node.args[0]);
        var pff = primeFactors(absv);
        if(pff.length === 0 && !isOne(absv)) {
          ff.push(numberNode(absv))
        }else {
          forEach(primeFactors(+node.args[0]), function(n) {
            ff.push(numberNode(n))
          })
        }
        return ff
      }, additive:function(node) {
        if(!factorAdditive) {
          return[node]
        }
        var args = node.args.slice(0);
        var n0 = [multiplyNode(factors(args.shift(), {}, true, true))];
        forEach(args, function(n1, i) {
          n1 = multiplyNode(factors(n1, {}, true, true));
          var n;
          if(commonFactors(n = n0.pop(), n1).length > 0) {
            n0 = n0.concat(factorTerms(n, n1))
          }else {
            n0 = n0.concat([n, n1])
          }
        });
        if(n0.length === 1 && n0[0].op === Model.MUL) {
          return n0[0].args
        }
        return[node]
      }, multiplicative:function(node) {
        switch(node.op) {
          case Model.MUL:
            var ff = [];
            forEach(node.args, function(n) {
              ff = ff.concat(factors(n, env, ignorePrimeFactors, preserveNeg))
            });
            return ff;
          default:
            assert(false, "Node not normalized");
            break
        }
        return[node]
      }, unary:function(node) {
        return[node]
      }, exponential:function(node) {
        if(node.op === Model.POW) {
          if(mathValue(node.args[1]) < 0) {
            return[node]
          }else {
            var ff = [];
            var e = mathValue(node.args[1]);
            var ea = Math.abs(toNumber(e));
            if(e !== null && (isInteger(e) && ea < 5)) {
              for(var i = toNumber(e);i > 0;i--) {
                ff.push(node.args[0])
              }
              return ff
            }else {
              return[node]
            }
          }
        }else {
          if(node.op === Model.LOG) {
            return[node]
          }
        }
      }, variable:function(node) {
        return[node]
      }, comma:function(node) {
        var args = [];
        forEach(node.args, function(n) {
          args = args.concat(factors(n))
        });
        return[newNode(node.op, args)]
      }, equals:function(node) {
        return[node]
      }})
    }
    function commonFactors(lnode, rnode) {
      var t1 = [lnode, rnode];
      var t;
      var t2 = [];
      forEach(t1, function(n) {
        t = factors(n, null, false, true);
        var ff = [];
        forEach(t, function(n) {
          ff.push(ast.intern(n))
        });
        t2.push(ff)
      });
      var intersect = t2.shift();
      forEach(t2, function(a) {
        intersect = filter(intersect, function(n) {
          var i = indexOf(a, n);
          if(i !== -1) {
            delete a[i];
            return true
          }
          return false
        })
      });
      return intersect
    }
    function factorTerms(lnode, rnode) {
      var cfacts = commonFactors(lnode, rnode);
      var lfacts = factors(lnode, null, false, true);
      var rfacts = factors(rnode, null, false, true);
      var lfacts2 = [], rfacts2 = [];
      var cf = cfacts.slice(0);
      var i;
      forEach(lfacts, function(f) {
        if((i = indexOf(cf, ast.intern(f))) === -1) {
          lfacts2.push(f)
        }else {
          delete cf[i]
        }
      });
      var cf = cfacts.slice(0);
      forEach(rfacts, function(f) {
        if((i = indexOf(cf, ast.intern(f))) === -1) {
          rfacts2.push(f)
        }else {
          delete cf[i]
        }
      });
      var aa = [];
      aa = aa.concat(makeFactor(lfacts2));
      aa = aa.concat(makeFactor(rfacts2));
      var args = [];
      if(aa.length > 0) {
        args.push(makeTerm(aa))
      }
      forEach(cfacts, function(i) {
        args.push(ast.node(i))
      });
      return makeFactor(args)[0]
    }
    function makeFactor(args) {
      if(args.length === 0) {
        return[nodeOne]
      }else {
        if(args.length === 1) {
          return args
        }
      }
      return[multiplyNode(args)]
    }
    function makeTerm(args) {
      assert(args.length > 0, "Too few arguments in makeTerm()");
      if(args.length === 1) {
        return args[0]
      }
      return binaryNode(Model.ADD, args)
    }
    function scale(root) {
      if(!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return 0
      }
      var node = Model.create(visit(root, {name:"scale", exponential:function(node) {
        var mv, nd;
        if((mv = mathValue(node, true)) && (nd = numberNode(mv, true))) {
          return nd
        }
        var args = [];
        forEach(node.args, function(n) {
          args.push(scale(n))
        });
        return newNode(node.op, args)
      }, multiplicative:function(node) {
        var mv, nd;
        if((mv = mathValue(node, true)) && (nd = numberNode(mv, true))) {
          return nd
        }
        var args = [];
        var mv2 = bigOne;
        forEach(node.args, function(n) {
          if(mv = mathValue(multiplyNode([numberNode(mv2), n]), true)) {
            mv2 = mv
          }else {
            args.push(scale(n))
          }
        });
        if(!isOne(mv2)) {
          args.unshift(numberNode(mv2, true))
        }
        return multiplyNode(args)
      }, additive:function(node) {
        var mv;
        if(mv = mathValue(node, true)) {
          return numberNode(mv, true)
        }
        var lc, args = [];
        if(isPolynomial(node) && !isOne(abs(leadingCoeff(node)))) {
          lc = leadingCoeff(node);
          forEach(node.args, function(n) {
            args.push(fractionNode(n, lc))
          });
          node = binaryNode(Model.ADD, args)
        }
        var args = [];
        var mv2 = bigZero;
        forEach(node.args, function(n) {
          if(mv = mathValue(binaryNode(Model.ADD, [numberNode(mv2), n]), true)) {
            mv2 = mv
          }else {
            args.push(scale(n))
          }
        });
        if(!isZero(mv2)) {
          args.unshift(numberNode(mv2, true))
        }
        return binaryNode(Model.ADD, args)
      }, unary:function(node) {
        var mv;
        if(mv = mathValue(node, true)) {
          return numberNode(mv, true)
        }
        return unaryNode(node.op, [scale(node.args[0])])
      }, numeric:function(node) {
        return numberNode(node.args[0], true)
      }, variable:function(node) {
        if(node.args[0] === "\\pi") {
          node = numberNode(Math.PI, true)
        }
        if(node.args[0] === "e") {
          node = numberNode(Math.E, true)
        }
        return node
      }, comma:function(node) {
        var args = [];
        forEach(node.args, function(n) {
          args.push(scale(n))
        });
        return newNode(node.op, args)
      }, equals:function(node) {
        var args = [];
        var c, cc;
        if((node.op === Model.EQL || node.op === Model.APPROX) && ((cc = isPolynomial(node.args[0])) && cc[cc.length - 1] < 0 || !cc && sign(node.args[0]) < 0)) {
          node.args[0] = simplify(expand(negate(node.args[0])))
        }
        forEach(node.args, function(n) {
          args.push(scale(n))
        });
        return newNode(node.op, args)
      }}), root.location);
      return node
    }
    function isFactorised(root, env) {
      if(!root || !root.args) {
        assert(false, "Should not get here. Illformed node.");
        return 0
      }
      return visit(root, {name:"isFactorised", numeric:function(node) {
        return true
      }, additive:function(node) {
        if(node.op === Model.PM) {
          return true
        }
        var vars = variables(node);
        var coeffs, vals;
        var t1 = terms(normalize(node));
        var t;
        var t2 = [];
        forEach(t1, function(n) {
          t = factors(n);
          var ff = [];
          forEach(t, function(n) {
            ff.push(ast.intern(n))
          });
          t2.push(ff)
        });
        var intersect = t2.shift();
        forEach(t2, function(a) {
          intersect = filter(intersect, function(n) {
            return indexOf(a, n) != -1
          })
        });
        if(intersect.length > 0) {
          return false
        }
        if((coeffs = isPolynomial(node)) && coeffs.length < 3) {
          return true
        }else {
          if(coeffs !== null && variables(node).length === 1) {
            if(coeffs.length === 3) {
              return!solveQuadratic(coeffs[2], coeffs[1], coeffs[0])
            }
            return!hasRoot(node, coeffs)
          }else {
            if(some(t1, function(n) {
              var d = degree(n, true);
              if(d === Number.POSITIVE_INFINITY) {
                assert(false, message(2003));
                return undefined
              }
            })) {
              return true
            }else {
              if(some(t1, function(n) {
                var d = degree(n, true);
                if(d >= 0 && d < 2) {
                  return true
                }
              })) {
                return true
              }
            }
          }
        }
        assert(vars.length < 2, message(2001));
        return undefined
      }, multiplicative:function(node) {
        switch(node.op) {
          case Model.MUL:
            var result = every(node.args, function(n) {
              return isFactorised(n)
            });
            return result ? !hasLikeFactors(node) : false;
          default:
            assert(false, "isFactorised(): node not normalized");
            break
        }
        return false
      }, unary:function(node) {
        return true
      }, exponential:function(node) {
        return true
      }, variable:function(node) {
        return true
      }, comma:function(node) {
        var result = every(node.args, function(n) {
          return isFactorised(n)
        });
        return result
      }, equals:function(node) {
        var result = every(node.args, function(n) {
          return isFactorised(n)
        });
        return result
      }})
    }
    var primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
    var primesCache = {};
    forEach(primes, function(v) {
      primesCache[v] = true
    });
    function findPossibleRoots(coeffs) {
      var c0 = coeffs[0];
      var c1 = coeffs[coeffs.length - 1];
      var f0 = primeFactors(c0);
      var f1 = primeFactors(c1);
      f0.push(1);
      f0.push(c0);
      f1.push(1);
      f1.push(c1);
      var possibleRoots = [];
      forEach(f0, function(n) {
        var n0 = numberNode(n);
        var n1 = negate(numberNode(n));
        forEach(f1, function(d) {
          var d = numberNode(d);
          possibleRoots.push(fractionNode(n0, d));
          possibleRoots.push(fractionNode(n1, d))
        })
      });
      return possibleRoots
    }
    function hasRoot(node, coeffs) {
      var rr = findPossibleRoots(coeffs);
      var field = option("field");
      return some(rr, function(r) {
        r = toNumber(mathValue(r, true));
        var nn = variables(node);
        assert(nn.length === 1);
        var env = {};
        env[nn[0]] = r;
        var x = toNumber(mathValue(node, env, true));
        return x === 0 && (field === "integer" && r === (r | 0) || field === "real")
      })
    }
    function isPolynomial(node) {
      var n0 = JSON.parse(JSON.stringify(node));
      var tt = terms(expand(n0));
      var a = bigZero, b = bigZero, c = bigZero, notPolynomial = false;
      var cc = [];
      forEach(tt, function(v) {
        var d = degree(v, true);
        if(d === Number.POSITIVE_INFINITY || (d < 0 || d !== Math.floor(d))) {
          notPolynomial = true;
          return
        }
        if(cc[d] === undefined) {
          var i = d;
          while(i >= 0 && cc[i] === undefined) {
            cc[i] = 0;
            i--
          }
        }
        cc[d] = cc[d] + toNumber(mathValue(constantPart(v)))
      });
      if(notPolynomial || variables(node).length > 1) {
        return null
      }
      return cc
    }
    function solveQuadratic(a, b, c) {
      a = toNumber(a);
      b = toNumber(b);
      c = toNumber(c);
      var x0 = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
      var x1 = (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a);
      var opt = option("field");
      var hasSolution = opt === "integer" && (x0 === (x0 | 0) && x1 === (x1 | 0)) || (opt === "real" && b * b - 4 * a * c >= 0 || opt === "complex");
      if(hasSolution) {
        return true
      }
      return false
    }
    function primeFactors(n) {
      var absN = Math.abs(n);
      if(absN <= 1 || (isNaN(n) || isInfinity(n))) {
        return[]
      }else {
        if(isPrime(absN)) {
          return[absN]
        }
      }
      var maxf = Math.sqrt(absN);
      for(var f = 2;f <= maxf;f++) {
        if(n % f === 0) {
          return primeFactors(f).concat(primeFactors(absN / f))
        }
      }
    }
    function isPrime(n) {
      if(primesCache[n] !== void 0) {
        return primesCache[n]
      }
      if(n <= 1) {
        primesCache[n] = false;
        return false
      }else {
        if(n <= 1 || n > 2 && n % 2 === 0) {
          return primesCache[n] = false
        }else {
          for(var i = 3, sqrt = Math.sqrt(n);i <= sqrt;i += 2) {
            if(n % i === 0) {
              return primesCache[n] = false
            }
          }
        }
        return primesCache[n] = true
      }
    }
    function gcd(a, b) {
      if(arguments.length > 2) {
        var rest = [].slice.call(arguments, 1);
        return gcd(a, gcd.apply(rest))
      }else {
        var mod;
        a = Math.abs(a);
        b = Math.abs(b);
        while(b) {
          mod = a % b;
          a = b;
          b = mod
        }
        return a
      }
    }
    function lcm(a, b) {
      if(arguments.length > 2) {
        var rest = [].slice.call(arguments, 1);
        return lcm(a, lcm.apply(rest))
      }else {
        return Math.abs(a * b) / gcd(a, b)
      }
    }
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
    this.hint = hint;
    this.m2e = m2e
  }
  var ast = new Ast;
  var visitor = new Visitor(ast);
  function degree(node, notAbsolute) {
    return visitor.degree(node, notAbsolute)
  }
  function constantPart(node) {
    return visitor.constantPart(node)
  }
  function variables(node) {
    return visitor.variables(node)
  }
  function hint(node) {
    return visitor.hint(node)
  }
  function m2e(node) {
    var visitor = new Visitor(new Ast);
    return visitor.m2e(node)
  }
  function variablePart(node) {
    return visitor.variablePart(node)
  }
  function sort(node) {
    var visitor = new Visitor(ast);
    var prevLocation = Assert.location;
    if(node.location) {
      Assert.setLocation(node.location)
    }
    var result = visitor.sort(node);
    Assert.setLocation(prevLocation);
    return result
  }
  function normalize(node) {
    var visitor = new Visitor(ast);
    var prevLocation = Assert.location;
    if(node.location) {
      Assert.setLocation(node.location)
    }
    var result = visitor.normalize(node);
    Assert.setLocation(prevLocation);
    return result
  }
  function normalizeLiteral(node) {
    var prevLocation = Assert.location;
    if(node.location) {
      Assert.setLocation(node.location)
    }
    var result = visitor.normalizeLiteral(node);
    Assert.setLocation(prevLocation);
    return result
  }
  function normalizeSyntax(node, ref) {
    var prevLocation = Assert.location;
    if(node.location) {
      Assert.setLocation(node.location)
    }
    var result = visitor.normalizeSyntax(node, ref);
    Assert.setLocation(prevLocation);
    return result
  }
  function normalizeExpanded(node) {
    var prevLocation = Assert.location;
    if(node.location) {
      Assert.setLocation(node.location)
    }
    var result = visitor.normalizeExpanded(node);
    Assert.setLocation(prevLocation);
    return result
  }
  function mathValue(node, env, allowDecimal) {
    var prevLocation = Assert.location;
    if(node.location) {
      Assert.setLocation(node.location)
    }
    var result = visitor.mathValue(node, env, allowDecimal);
    Assert.setLocation(prevLocation);
    return result
  }
  function units(node, env) {
    var prevLocation = Assert.location;
    if(node.location) {
      Assert.setLocation(node.location)
    }
    var result = visitor.units(node, env);
    Assert.setLocation(prevLocation);
    return result
  }
  function simplify(node, env) {
    var visitor = new Visitor(ast);
    var prevLocation = Assert.location;
    if(node.location) {
      Assert.setLocation(node.location)
    }
    var result = visitor.simplify(node, env);
    Assert.setLocation(prevLocation);
    return result
  }
  function dummy(node, env, resume) {
    var prevLocation = Assert.location;
    if(node.location) {
      Assert.setLocation(node.location)
    }
    visitor.dummy(node, env, function(err, val) {
      Assert.setLocation(prevLocation);
      resume(err, val)
    })
  }
  function hasLikeFactors(node, env) {
    var prevLocation = Assert.location;
    if(node.location) {
      Assert.setLocation(node.location)
    }
    var result = visitor.hasLikeFactors(node, env);
    Assert.setLocation(prevLocation);
    return result
  }
  function expand(node, env) {
    var prevLocation = Assert.location;
    if(node.location) {
      Assert.setLocation(node.location)
    }
    var result = visitor.expand(node, env);
    Assert.setLocation(prevLocation);
    return result
  }
  function terms(node, env) {
    var prevLocation = Assert.location;
    if(node.location) {
      Assert.setLocation(node.location)
    }
    var result = visitor.terms(node, env);
    Assert.setLocation(prevLocation);
    return result
  }
  function factorGroupingKey(node, env) {
    var prevLocation = Assert.location;
    if(node.location) {
      Assert.setLocation(node.location)
    }
    var result = visitor.factorGroupingKey(node, env);
    Assert.setLocation(prevLocation);
    return result
  }
  function factors(node, env) {
    var prevLocation = Assert.location;
    if(node.location) {
      Assert.setLocation(node.location)
    }
    var result = visitor.factors(node, env);
    Assert.setLocation(prevLocation);
    return result
  }
  function isFactorised(node, env) {
    var prevLocation = Assert.location;
    if(node.location) {
      Assert.setLocation(node.location)
    }
    var result = visitor.isFactorised(node, env);
    Assert.setLocation(prevLocation);
    return result
  }
  function scale(node) {
    var prevLocation = Assert.location;
    if(node.location) {
      Assert.setLocation(node.location)
    }
    var result = visitor.scale(node);
    Assert.setLocation(prevLocation);
    return result
  }
  var env = Model.env;
  function precision(bd) {
    var scale = bd.scale();
    var prec = bd.mant.length;
    for(var i = 0;i < scale;i++) {
      if(bd.mant[prec - 1 - i] !== 0) {
        break
      }
    }
    return prec
  }
  function stripTrailingZeros(n) {
    if(n.op !== Model.NUM) {
      var mv = mathValue(n);
      if(!mv) {
        return n
      }
      n = newNode(Model.NUM, [String(mv)])
    }
    var decimalPoint;
    var s = n.args[0];
    for(var i = 0;i < s.length;i++) {
      var c = s.charCodeAt(i);
      if(c === 46) {
        decimalPoint = i
      }else {
        if(c < 48 || (c > 57 || c === 45)) {
          return n
        }
      }
    }
    if(decimalPoint !== undefined) {
      for(var i = s.length - 1;i > decimalPoint;i--) {
        if(s.charCodeAt(i) === 48) {
          s = s.substring(0, i)
        }else {
          break
        }
      }
      if(s.charCodeAt(s.length - 1) === 46) {
        s = s.substring(0, s.length - 1)
      }
    }
    return numberNode(s)
  }
  function distributeUnits(n1, n2) {
    var n1units = units(n1);
    var n2units = units(n2);
    assert(n1units.length < 2, message(2004));
    assert(n2units.length < 2, message(2004));
    var n1unit = n1units[0];
    var n2unit = n2units[0];
    var n1new, n2new;
    if(n1unit === undefined && n2unit !== undefined) {
      n1new = multiplyNode([n1, variableNode(n2unit)]);
      n2new = n2
    }else {
      if(n2unit === undefined && n1unit !== undefined) {
        n1new = n1;
        n2new = multiplyNode([n2, variableNode(n1unit)])
      }else {
        n1new = n1;
        n2new = n2
      }
    }
    return[n1new, n2new]
  }
  Model.fn.equivValue = function equivValue(n1, n2, op) {
    var options = Model.options = Model.options ? Model.options : {};
    var scale = options.decimalPlaces != undefined ? +options.decimalPlaces : 10;
    var env = Model.env;
    var inverseResult = option("inverseResult");
    var result;
    var v1t = bigZero;
    var v2t = bigZero;
    var args = [];
    if(isComparison(n1.op) && isComparison(n2.op)) {
      var n1l = n1.args[0];
      var n1r = n1.args[1];
      var n2l = n2.args[0];
      var n2r = n2.args[1];
      if(option("compareSides")) {
        if(n1.op !== n2.op) {
          return false
        }
        var v1 = equivValue(n1l, n2l);
        var v2 = equivValue(n1r, n2r);
        var result = v1 && v2
      }else {
        var v1 = Model.create(n1l).equivValue(n1r, n1.op);
        var v2 = Model.create(n2l).equivValue(n2r, n2.op);
        var result = v1 === v2
      }
      return inverseResult ? !result : result
    }
    if(n1.op === Model.PM && n1.args.length > 1) {
      var args = distributeUnits(n1.args[0], n1.args[1]);
      n1 = binaryNode(Model.PM, args)
    }
    if(n2.op === Model.PM && n2.args.length > 1) {
      var args = distributeUnits(n2.args[0], n2.args[1]);
      n2 = binaryNode(Model.PM, args)
    }
    var n1b, n2b, n1t, n2t;
    if(n1.op === Model.PM && n1.args.length > 1) {
      n1b = simplify(expand(normalize(n1.args[0])));
      n1t = simplify(expand(normalize(n1.args[1])));
      var v1 = mathValue(n1b, env, true);
      var v1t = mathValue(n1t, env, true)
    }else {
      n1b = simplify(expand(normalize(n1)));
      var v1 = mathValue(n1b, env, true)
    }
    if(n2.op === Model.PM && n2.args.length > 1) {
      n2b = simplify(expand(normalize(n2.args[0])));
      n2t = simplify(expand(normalize(n2.args[1])));
      var v2 = mathValue(n2b, env, true);
      var v2t = mathValue(n2t, env, true)
    }else {
      n2b = simplify(expand(normalize(n2)));
      var v2 = mathValue(n2b, env, true)
    }
    if(isUndefined(n1b) || isUndefined(n2b)) {
      result = false;
      return inverseResult ? !result : result
    }
    if(n1b.op === Model.COMMA && n2b.op === Model.COMMA || n1b.op === Model.LIST && n2b.op === Model.LIST) {
      assert(n1t === undefined && n2t === undefined, message(2007));
      var result = every(n1b.args, function(a, i) {
        return equivValue(n1b.args[i], n2b.args[i])
      });
      if(result && n1b.lbrk === n2b.lbrk || n1b.rbrk === n2b.rbrk) {
        result = true
      }else {
        result = false
      }
      return inverseResult ? !result : result
    }
    var vp1 = variablePart(n1b);
    var vp2 = variablePart(n2b);
    if(!n1t && (!n2t && (vp1 && (vp2 && ast.intern(vp1) === ast.intern(vp2))))) {
      n1b = constantPart(n1b);
      n2b = constantPart(n2b);
      if(n1b === undefined && n2b === undefined) {
        result = true;
        return inverseResult ? !result : result
      }
    }
    var nid1 = ast.intern(n1b);
    var nid2 = ast.intern(n2b);
    if(nid1 === nid2 && (n1t === undefined && (n2t === undefined && (op === undefined || isEqualsComparison(op))))) {
      result = true;
      return inverseResult ? !result : result
    }
    if(n1b.op === Model.LIST && n2b.op === Model.LIST) {
      assert(n1t === undefined && n2t === undefined, message(2007));
      if(n1b.lbrk !== n2b.lbrk || n1b.rbrk !== n2b.rbrk) {
        return false
      }
      var l1 = n1b.args;
      var l2 = n2b.args;
      return every(l1, function(a, i) {
        var result = equivValue(a, l2[i]);
        return inverseResult ? !result : result
      })
    }
    var v1 = mathValue(n1b, env, true);
    var v2 = mathValue(n2b, env, true);
    assert(v1 !== null || isComparison(n1b.op), message(2005), "spec");
    assert(n1b.op !== Model.PM || v1t !== null, message(2005), "spec");
    assert(v2 !== null || isComparison(n2b.op), message(2005), "user");
    assert(n2b.op !== Model.PM || v2t !== null, message(2005), "user");
    Assert.clearLocation();
    if(v1 !== null && v2 !== null) {
      assert(baseUnit(n1b) === undefined && baseUnit(n2b) === undefined || baseUnit(n1b) !== undefined && baseUnit(n2b) !== undefined, message(2009));
      v2 = baseUnitConversion(n1b, n2b)(v2);
      if(!isZero(v2t)) {
        v2t = baseUnitConversion(n1b, n2b)(v2t)
      }
      v1 = v1.setScale(scale, BigDecimal.ROUND_HALF_UP);
      v2 = v2.setScale(scale, BigDecimal.ROUND_HALF_UP);
      Model.options = options;
      if(isZero(v1t) && isZero(v2t)) {
        var cmp = v1.compareTo(v2);
        switch(op) {
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
            break
        }
        return inverseResult ? !result : result
      }else {
        v1t = v1t.setScale(scale, BigDecimal.ROUND_HALF_UP);
        v2t = v2t.setScale(scale, BigDecimal.ROUND_HALF_UP);
        var v1min = v1.subtract(v1t);
        var v2min = v2.subtract(v2t);
        var v1max = v1.add(v1t);
        var v2max = v2.add(v2t);
        if(v1min.compareTo(v2min) >= 0 && v1max.compareTo(v2min) <= 0 || (v1min.compareTo(v2max) >= 0 && v1max.compareTo(v2max) <= 0 || (v2min.compareTo(v1min) >= 0 && v2max.compareTo(v1max) <= 0 || v2min.compareTo(v1max) >= 0 && v2max.compareTo(v1max) <= 0))) {
          result = true;
          return inverseResult ? !result : result
        }
      }
    }
    var result = false;
    return inverseResult ? !result : result;
    function baseUnit(node) {
      var env = Model.env;
      var prevLocation = Assert.location;
      if(node.location) {
        Assert.setLocation(node.location)
      }
      var uu = units(node, env);
      var baseUnits = [];
      forEach(uu, function(u) {
        var unit = env[u];
        assert(unit.type === "unit");
        if(indexOf(baseUnits, unit.base) < 0) {
          baseUnits.push(unit.base)
        }
      });
      Assert.setLocation(prevLocation);
      assert(baseUnits.length < 2, message(2017, [baseUnits]));
      return baseUnits[0]
    }
    function baseUnitConversion(u1, u2) {
      var NaN = Math.NaN;
      var baseUnitConversions = {"g/lb":function(v) {
        return v.multiply(toDecimal("453.592"))
      }, "lb/g":function(v) {
        return v.multiply(toDecimal("0.00220462"))
      }, "m/ft":function(v) {
        return v.multiply(toDecimal("0.3048"))
      }, "ft/m":function(v) {
        return v.multiply(toDecimal("3.28084"))
      }, "L/fl":function(v) {
        return v.multiply(toDecimal("0.02957353"))
      }, "fl/L":function(v) {
        return v.multiply(toDecimal("33.814022702"))
      }, "\\degree K/\\degree C":function(v) {
        return v.add(toDecimal("273.15"))
      }, "\\degree C/\\degree K":function(v) {
        return v.subtract(toDecimal("273.15"))
      }, "\\degree C/\\degree F":function(v) {
        return v.subtract(toDecimal("32")).multiply(toDecimal("5")).divide(toDecimal("9"))
      }, "\\degree F/\\degree C":function(v) {
        return v.multiply(toDecimal("9")).divide(toDecimal("5")).add(toDecimal("32"))
      }, "\\degree K/\\degree F":function(v) {
        return v.add(toDecimal("459.67")).multiply(toDecimal("5")).divide(toDecimal("9"))
      }, "\\degree F/\\degree K":function(v) {
        return v.multiply(toDecimal("9")).divide(toDecimal("5")).subtract(toDecimal("459.67"))
      }};
      var bu1 = baseUnit(u1);
      var bu2 = baseUnit(u2);
      var fn = bu1 === bu2 ? function(v) {
        return v
      } : baseUnitConversions[bu1 + "/" + bu2];
      return fn
    }
  };
  function compareTrees(actual, expected) {
  }
  Model.fn.equivSyntax = function(n1, n2) {
    reset();
    var ignoreOrder = option("ignoreOrder");
    var inverseResult = option("inverseResult");
    var options = Model.options ? Model.options : {};
    var result = false;
    if(!(n1 instanceof Array)) {
      n1 = [n1]
    }
    result = some(n1, function(n) {
      try {
        options.is_normal = true;
        var n1n = normalizeSyntax(n, n);
        delete options.is_normal
      }catch(e) {
        throw e;
      }
      var n2n = normalizeSyntax(n2, n);
      return ast.intern(n1n) === ast.intern(n2n)
    });
    var input = "";
    delete options.is_normal;
    var not = options.not;
    if(not) {
      input += "NOT ";
      delete options.not
    }
    return inverseResult ? !result : result
  };
  Model.fn.equivLiteral = function equivLiteral(n1, n2) {
    var inverseResult = option("inverseResult");
    if(terms(n1).length !== terms(n2).length) {
      return inverseResult ? true : false
    }
    var ignoreOrder = option("ignoreOrder");
    n1 = normalizeLiteral(n1);
    n2 = normalizeLiteral(n2);
    if(ignoreOrder) {
      n1 = sort(n1);
      n2 = sort(n2)
    }
    var nid1 = ast.intern(n1);
    var nid2 = ast.intern(n2);
    var result = nid1 === nid2;
    return inverseResult ? !result : result
  };
  function formulaKind(node) {
    var kind;
    switch(node.op) {
      case Model.EQL:
        kind = Model.EQL;
        break;
      case Model.GE:
      ;
      case Model.LE:
        kind = Model.GE;
        break;
      case Model.GT:
      ;
      case Model.LT:
        kind = Model.GT;
        break;
      default:
        kind = 0;
        break
    }
    return kind
  }
  Model.fn.equivSymbolic = function(n1, n2, resume) {
    var n1o = n1;
    var n2o = n2;
    var result;
    var inverseResult = option("inverseResult");
    if(!inverseResult && !option("strict")) {
      var ignoreOrder = option("ignoreOrder", true);
      try {
        var result = Model.fn.equivLiteral(n1, n2);
        option("ignoreOrder", ignoreOrder)
      }catch(e) {
        option("ignoreOrder", ignoreOrder);
        throw e;
      }
      if(result) {
        return true
      }
    }
    if(formulaKind(n1) !== formulaKind(n2)) {
      var result = false
    }else {
      if(option("compareSides") && (isComparison(n1.op) && n1.op === n2.op)) {
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
        var result = nid1l === nid2l && nid1r === nid2r
      }else {
        n1 = scale(normalize(simplify(expand(normalize(n1)))));
        n2 = scale(normalize(simplify(expand(normalize(n2)))));
        var nid1 = ast.intern(n1);
        var nid2 = ast.intern(n2);
        var result = nid1 === nid2;
        if(!result && !inverseResult) {
          if(isComparison(n1.op)) {
            n1 = scale(normalize(simplify(expand(normalize(n1)))));
            n2 = scale(normalize(simplify(expand(normalize(n2)))));
            nid1 = ast.intern(n1);
            nid2 = ast.intern(n2);
            result = nid1 === nid2
          }else {
            if(!isComparison(n2.op) && (!isAggregate(n1) && !isAggregate(n2))) {
              n1 = newNode(Model.SUB, [n1o, n2o]);
              n2 = nodeZero;
              n1 = scale(normalize(simplify(expand(normalize(n1)))));
              n2 = scale(normalize(simplify(expand(normalize(n2)))));
              nid1 = ast.intern(n1);
              nid2 = ast.intern(n2);
              result = nid1 === nid2
            }
          }
        }
      }
    }
    if(result) {
      return inverseResult ? false : true
    }
    return inverseResult ? true : false
  };
  function isEqualsComparison(op) {
    return op === Model.LE || (op === Model.GE || op === Model.EQL)
  }
  function isAggregate(node) {
    if(node.op === Model.COMMA || (node.op === Model.LIST || (node.op === Model.MATRIX || node.op === Model.INTERVAL))) {
      return true
    }else {
      if(node.op === Model.NUM || node.op === Model.VAR) {
        return false
      }
    }
    return some(node.args, function(n) {
      return isAggregate(n)
    })
  }
  function isComparison(op) {
    return op === Model.LT || (op === Model.LE || (op === Model.GT || (op === Model.GE || (op === Model.NE || (op === Model.APPROX || op === Model.EQL)))))
  }
  Model.fn.isTrue = function(n1) {
    var prevLocation = Assert.location;
    if(n1.location) {
      Assert.setLocation(n1.location)
    }
    var result;
    if(isComparison(n1.op)) {
      try {
        result = Model.create(n1.args[0]).equivValue(n1.args[1], n1.op)
      }catch(e) {
        result = false
      }
      Assert.setLocation(prevLocation);
      return result
    }else {
      var mv = mathValue(n1);
      if(mv && !isZero(mv)) {
        result = true
      }else {
        result = false
      }
      Assert.setLocation(prevLocation)
    }
    var inverseResult = option("inverseResult");
    return inverseResult ? !result : result
  };
  Model.fn.calculate = function(n1) {
    var prevLocation = Assert.location;
    if(n1.location) {
      Assert.setLocation(n1.location)
    }
    var node = stripTrailingZeros(scale(numberNode(mathValue(normalize(n1), Model.env, true))));
    var result = node.op === Model.NUM ? node.args[0] : "ERROR";
    Assert.setLocation(prevLocation);
    return result
  };
  Model.fn.isExpanded = function isExpanded(node) {
    var n1, n2, nid1, nid2, result;
    if(node.op === Model.COMMA) {
      result = every(node.args, function(n) {
        return isExpanded(n)
      })
    }else {
      if(isComparison(node.op)) {
        var inverseResult = option("inverseResult", false);
        result = isExpanded(node.args[0]) && isExpanded(node.args[1]);
        option("inverseResult", inverseResult)
      }else {
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
        if(nid1 === nid2 && !hasLikeFactors(n1)) {
          result = true
        }else {
          result = false
        }
      }
    }
    var inverseResult = option("inverseResult");
    return inverseResult ? !result : result
  };
  function hasDenominator(node) {
    var tt = terms(node);
    var result = some(tt, function(t) {
      if(variablePart(t)) {
        var ff = factors(t);
        return some(ff, function(f) {
          return f.op === Model.POW && isNeg(f.args[1])
        })
      }else {
        return false
      }
    });
    return result
  }
  Model.fn.isSimplified = function isSimplified(node, resume) {
    var n1, n2, nid1, nid2, result;
    var dontExpandPowers = option("dontExpandPowers", true);
    var dontFactorDenominators = option("dontFactorDenominators", true);
    var dontFactorTerms = option("dontFactorTerms", true);
    var dontConvertDecimalToFraction = option("dontConvertDecimalToFraction", true);
    var dontSimplifyImaginary = option("dontSimplifyImaginary", true);
    var inverseResult = option("inverseResult");
    if(node.op === Model.COMMA) {
      result = every(node.args, function(n) {
        return isSimplified(n)
      })
    }else {
      if(isComparison(node.op) && (!isZero(node.args[0]) && !isZero(node.args[1]))) {
        var n = normalize(binaryNode(Model.ADD, [node.args[0], node.args[1]]));
        result = true;
        var inverseResult = option("inverseResult", false);
        if(!isSimplified(n)) {
          result = false
        }
        option("inverseResult", inverseResult);
        if(result && hasDenominator(n)) {
          result = false
        }
        if(result && !isFactorised(n)) {
          result = false
        }
      }else {
        n1 = normalize(node);
        n2 = normalize(simplify(expand(normalize(node))));
        nid1 = ast.intern(n1);
        nid2 = ast.intern(n2);
        result = nid1 === nid2
      }
    }
    option("dontExpandPowers", dontExpandPowers);
    option("dontFactorDenominators", dontFactorDenominators);
    option("dontFactorTerms", dontFactorTerms);
    option("dontConvertDecimalToFraction", dontConvertDecimalToFraction);
    option("dontSimplifyImaginary", dontSimplifyImaginary);
    if(result) {
      return inverseResult ? false : true
    }
    return inverseResult ? true : false
  };
  Model.fn.isFactorised = function(n1) {
    var inverseResult = option("inverseResult");
    var result = isFactorised(normalize(n1));
    return inverseResult ? !result : result
  };
  Model.fn.isUnit = function(n1, n2) {
    var inverseResult = option("inverseResult");
    var u1 = units(normalize(n1), env);
    var u2 = units(normalize(n2), env);
    if(!(u2 instanceof Array)) {
      u2 = [u2]
    }
    var result = false;
    if(u1.length === 0 && (u2.length === 0 && n2.op !== Model.NONE)) {
      result = true
    }else {
      if(u2.length) {
        result = every(u2, function(v) {
          return indexOf(u1, v) >= 0
        })
      }
    }
    return inverseResult ? !result : result
  };
  function getRE(re) {
    if(typeof re === "string") {
      if(re === "latex") {
        re = /^[\\]/
      }else {
        if(re === "not latex") {
          re = /^[^\\]/
        }else {
          assert(false, "Expecting 'latex' or 'not latex'")
        }
      }
    }
    return re
  }
  Model.fn.variables = function(n1, pattern) {
    var names = variables(n1);
    var filtered = [];
    var re = getRE(pattern);
    forEach(names, function(n) {
      if(!re || re.test(n)) {
        filtered.push(n)
      }
    });
    return filtered
  };
  Model.fn.known = function(n1, pattern) {
    var env = n1.env ? n1.env : [];
    var names = variables(n1);
    var re = getRE(pattern);
    var filtered = [];
    forEach(names, function(n) {
      if(env[n] && (!re || re.test(n))) {
        filtered.push(n)
      }
    });
    return filtered
  };
  Model.fn.unknown = function(n1, pattern) {
    var env = n1.env ? n1.env : [];
    var names = variables(n1);
    var re = getRE(pattern);
    var filtered = [];
    forEach(names, function(n) {
      if(!env[n] && (!re || re.test(n))) {
        filtered.push(n)
      }
    });
    return filtered
  };
  Model.fn.hint = function(n1) {
    return hint(n1)
  };
  Model.fn.m2e = function(n1) {
    return m2e(n1)
  };
  var option = Model.option = function option(p, v) {
    var options = Model.options;
    var opt = options && options[p];
    if(v !== undefined) {
      Model.options = options = options ? options : {};
      options[p] = v
    }
    if(opt === undefined) {
      switch(p) {
        case "field":
          opt = "integer";
          break;
        case "decimalPlaces":
          opt = 10;
          break;
        case "setThousandsSeparator":
        ;
        case "setDecimalSeparator":
        ;
        case "dontExpandPowers":
        ;
        case "dontFactorDenominators":
        ;
        case "dontFactorTerms":
        ;
        case "dontConvertDecimalToFraction":
        ;
        case "strict":
          opt = undefined;
          break;
        default:
          opt = false;
          break
      }
    }
    return opt
  };
  var RUN_SELF_TESTS = false;
  if(RUN_SELF_TESTS) {
    var env = {};
    trace("\nMath Model self testing");
    (function() {
    })()
  }
})(new Ast);
var MathCore = function() {
  Assert.reserveCodeRange(3E3, 3999, "mathcore");
  var messages = Assert.messages;
  var message = Assert.message;
  var assert = Assert.assert;
  messages[3001] = "No Math Core spec provided.";
  messages[3002] = "No Math Core solution provided.";
  messages[3003] = "No Math Core spec value provided.";
  messages[3004] = "Invalid Math Core spec method '%1'.";
  messages[3005] = "Operation taking more than %1 milliseconds.";
  messages[3006] = "Invalid option name '%1'.";
  messages[3007] = "Invalid option value '%2' for option '%1'.";
  messages[3008] = "Internal error: %1";
  var u = 1;
  var k = 1E3;
  var c = new BigDecimal("1E-2");
  var m = new BigDecimal("1E-3");
  var mu = new BigDecimal("1E-6");
  var n = new BigDecimal("1E-9");
  var env = {"g":{type:"unit", value:u, base:"g"}, "s":{type:"unit", value:u, base:"s"}, "m":{type:"unit", value:u, base:"m"}, "L":{type:"unit", value:u, base:"L"}, "kg":{type:"unit", value:k, base:"g"}, "km":{type:"unit", value:k, base:"m"}, "ks":{type:"unit", value:k, base:"s"}, "kL":{type:"unit", value:k, base:"L"}, "cg":{type:"unit", value:c, base:"g"}, "cm":{type:"unit", value:c, base:"m"}, "cs":{type:"unit", value:c, base:"s"}, "cL":{type:"unit", value:c, base:"L"}, "mg":{type:"unit", value:m, 
  base:"g"}, "mm":{type:"unit", value:m, base:"m"}, "ms":{type:"unit", value:m, base:"s"}, "mL":{type:"unit", value:m, base:"L"}, "\\mug":{type:"unit", value:mu, base:"g"}, "\\mus":{type:"unit", value:mu, base:"s"}, "\\mum":{type:"unit", value:mu, base:"m"}, "\\muL":{type:"unit", value:mu, base:"L"}, "ng":{type:"unit", value:n, base:"g"}, "nm":{type:"unit", value:n, base:"m"}, "ns":{type:"unit", value:n, base:"s"}, "nL":{type:"unit", value:n, base:"L"}, "in":{type:"unit", value:1 / 12, base:"ft"}, 
  "ft":{type:"unit", value:u, base:"ft"}, "yd":{type:"unit", value:3, base:"ft"}, "mi":{type:"unit", value:5280, base:"ft"}, "fl":{type:"unit", value:1, base:"fl"}, "cup":{type:"unit", value:8, base:"fl"}, "pt":{type:"unit", value:16, base:"fl"}, "qt":{type:"unit", value:32, base:"fl"}, "gal":{type:"unit", value:128, base:"fl"}, "oz":{type:"unit", value:1 / 16, base:"lb"}, "lb":{type:"unit", value:1, base:"lb"}, "st":{type:"unit", value:1 / 1614, base:"lb"}, "qtr":{type:"unit", value:28, base:"lb"}, 
  "cwt":{type:"unit", value:112, base:"lb"}, "t":{type:"unit", value:2240, base:"lb"}, "$":{type:"unit", value:u, base:"$"}, "i":{type:"unit", value:null, base:"i"}, "min":{type:"unit", value:60, base:"s"}, "hr":{type:"unit", value:3600, base:"s"}, "day":{type:"unit", value:24 * 3600, base:"s"}, "\\radian":{type:"unit", value:u, base:"radian"}, "\\degree":{type:"unit", value:Math.PI / 180, base:"radian"}, "\\degree K":{type:"unit", value:u, base:"\\degree K"}, "\\degree C":{type:"unit", value:u, 
  base:"\\degree C"}, "\\degree F":{type:"unit", value:u, base:"\\degree F"}, "R":{name:"reals"}, "matrix":{}, "pmatrix":{}, "bmatrix":{}, "Bmatrix":{}, "vmatrix":{}, "Vmatrix":{}, "array":{}, "\\alpha":{type:"var"}, "\\beta":{type:"var"}, "\\gamma":{type:"var"}, "\\delta":{type:"var"}, "\\epsilon":{type:"var"}, "\\zeta":{type:"var"}, "\\eta":{type:"var"}, "\\theta":{type:"var"}, "\\iota":{type:"var"}, "\\kappa":{type:"var"}, "\\lambda":{type:"var"}, "\\mu":{type:"const", value:mu}, "\\nu":{type:"var"}, 
  "\\xi":{type:"var"}, "\\pi":{type:"const", value:Math.PI}, "e":{type:"const", value:Math.E}, "\\rho":{type:"var"}, "\\sigma":{type:"var"}, "\\tau":{type:"var"}, "\\upsilon":{type:"var"}, "\\phi":{type:"var"}, "\\chi":{type:"var"}, "\\psi":{type:"var"}, "\\omega":{type:"var"}};
  function evaluate(spec, solution, resume) {
    try {
      assert(spec, message(3001, [spec]));
      assert(solution != undefined, message(3002, [solution]));
      Assert.setTimeout(timeoutDuration, message(3005, [timeoutDuration]));
      var evaluator = makeEvaluator(spec);
      evaluator.evaluate(solution, function(err, val) {
        resume(null, val)
      })
    }catch(e) {
      trace(e + "\n" + e.stack);
      resume(e.stack, undefined)
    }
  }
  function evaluateVerbose(spec, solution, resume) {
    var model;
    try {
      assert(spec, message(3001, [spec]));
      Assert.setTimeout(timeoutDuration, message(3005, [timeoutDuration]));
      var evaluator = makeEvaluator(spec);
      var errorCode = 0, msg = "Normal completion", stack, location;
      evaluator.evaluate(solution, function(err, val) {
        model = evaluator.model;
        resume([], {result:val, errorCode:errorCode, message:msg, stack:stack, location:location, toString:function() {
          return this.errorCode + ": (" + location + ") " + msg + "\n" + this.stack
        }})
      })
    }catch(e) {
      if(!e.message) {
        try {
          assert(false, message(3008, [e]))
        }catch(x) {
          e = x
        }
      }
      var errorCode = parseErrorCode(e.message);
      var msg = parseMessage(e.message);
      var stack = e.stack;
      var location = e.location;
      console.log("ERROR evaluateVerbose stack=" + stack);
      resume([e.stack], undefined)
    }
    function parseErrorCode(e) {
      var code = +e.slice(0, indexOf(e, ":"));
      if(!isNaN(code)) {
        return code
      }
      return 0
    }
    function parseMessage(e) {
      var code = parseErrorCode(e);
      if(code) {
        return e.slice(indexOf(e, ":") + 2)
      }
      return e
    }
  }
  var timeoutDuration = 3E4;
  function setTimeoutDuration(duration) {
    timeoutDuration = duration
  }
  function validateOption(p, v) {
    switch(p) {
      case "field":
        switch(v) {
          case void 0:
          ;
          case "integer":
          ;
          case "real":
          ;
          case "complex":
            break;
          default:
            assert(false, message(3007, [p, v]));
            break
        }
        break;
      case "decimalPlaces":
        if(v === void 0 || +v >= 0 && +v <= 20) {
          break
        }
        assert(false, message(3007, [p, v]));
        break;
      case "allowDecimal":
      ;
      case "allowInterval":
      ;
      case "dontExpandPowers":
      ;
      case "dontFactorDenominators":
      ;
      case "dontFactorTerms":
      ;
      case "dontConvertDecimalToFraction":
      ;
      case "dontSimplifyImaginary":
      ;
      case "ignoreOrder":
      ;
      case "inverseResult":
      ;
      case "requireThousandsSeparator":
      ;
      case "ignoreText":
      ;
      case "ignoreTrailingZeros":
      ;
      case "allowThousandsSeparator":
      ;
      case "compareSides":
      ;
      case "ignoreCoefficientOne":
      ;
      case "strict":
        if(typeof v === "undefined" || typeof v === "boolean") {
          break
        }
        assert(false, message(3007, [p, v]));
        break;
      case "setThousandsSeparator":
        if(typeof v === "undefined" || (typeof v === "string" && v.length === 1 || v instanceof Array)) {
          break
        }
        assert(false, message(3007, [p, v]));
        break;
      case "setDecimalSeparator":
        if(typeof v === "undefined" || (typeof v === "string" && v.length === 1 || v instanceof Array && (v.length > 0 && v[0].length === 1))) {
          break
        }
        assert(false, message(3007, [p, JSON.stringify(v)]));
        break;
      default:
        assert(false, message(3006, [p]));
        break
    }
    return
  }
  function validateOptions(options) {
    if(options) {
      forEach(keys(options), function(option) {
        validateOption(option, options[option])
      })
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
    if(valueNode) {
      valueNode.env = env
    }
    Model.popEnv();
    var evaluate = function evaluate(solution, resume) {
      Assert.setLocation("user");
      assert(solution != undefined, message(3002));
      Model.pushEnv(env);
      var solutionNode = Model.create(solution, "user");
      if(!outerResult.model) {
        solutionNode.env = env;
        outerResult.model = solutionNode
      }
      Assert.setLocation("spec");
      var result;
      switch(method) {
        case "equivValue":
          assert(value != undefined, message(3003));
          result = valueNode.equivValue(solutionNode);
          break;
        case "equivLiteral":
          assert(value != undefined, message(3003));
          result = valueNode.equivLiteral(solutionNode);
          break;
        case "equivSyntax":
          assert(value != undefined, message(3003));
          if(!(valueNode instanceof Array)) {
            valueNode = [valueNode]
          }
          result = some(valueNode, function(n) {
            return n.equivSyntax(solutionNode)
          });
          break;
        case "equivSymbolic":
          assert(value != undefined, message(3003));
          result = valueNode.equivSymbolic(solutionNode);
          break;
        case "isFactorised":
          result = solutionNode.isFactorised();
          break;
        case "isSimplified":
          result = solutionNode.isSimplified();
          break;
        case "isExpanded":
          result = solutionNode.isExpanded();
          break;
        case "isUnit":
          result = valueNode.isUnit(solutionNode);
          break;
        case "isTrue":
          result = solutionNode.isTrue();
          break;
        case "calculate":
          result = solutionNode.calculate();
          break;
        case "validSyntax":
          result = true;
          break;
        default:
          assert(false, message(3004, [method]));
          break
      }
      Model.popEnv();
      resume(null, result)
    };
    var outerResult = {evaluate:evaluate, model:valueNode};
    return outerResult
  }
  return{evaluate:evaluate, evaluateVerbose:evaluateVerbose, makeEvaluator:makeEvaluator, setTimeoutDuration:setTimeoutDuration, Model:Model, Ast:Ast}
}();

  return MathCore;
})();
export default MathCore;

