/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
var fs=require('graceful-fs');

load();

function escapeXML(str) {
  return String(str)
//    .replace(/&(?!\w+;)/g, "&amp;")
//    .replace(/\n/g, " ")
    .replace(/\\/g, "\\\\")
//    .replace(/</g, "&lt;")
//    .replace(/>/g, "&gt;")
//    .replace(/"/g, "&quot;");
}

function load() {
  var items = [];
  var eraseCount = 0;
  fs.readFile("l106.out", 'utf-8', function(err, data) {
    var list = data.split("\n");
    list.forEach(function (item, lineNum) {
      if (item === "") {
        eraseCount++;
        return;
      }
      var id = item.substring(0, item.indexOf("|"));
      item = item.substring(id.length + 1);
      try {
        var obj = JSON.parse(item);
        if (typeof obj === "string") {
          // Try again.
          obj = JSON.parse(obj);
          if (typeof obj !== "object") {
            eraseCount++;
            return;
          }
        }
//        console.log("obj=" + JSON.stringify(obj, null, 2));
      } catch (x) {
        console.log("ERASING: " + x);
        console.log(item);
        eraseCount++;
        return;
      }
      var n = node(obj, obj.root);
      var s = decomp(n);
      if (s === "") {
        eraseCount++;
        return;
      }
      items.push(s + ".. | " + lineNum + ":" + id.trim());
      return;
    });
    console.log("scanned " + items.length + " validations");
    console.log("erased " + eraseCount + " validations");
    items.forEach(function (s, i) {
      console.log(s);
    });
  });
}

function node(pool, nid) {
  var n = pool[nid];
  if (!n) {
    return {};
  }
  var elts = [];
  switch (n.tag) {
  case "NUM":
  case "STR":
  case "IDENT":
    elts[0] = n.elts[0];
    break;
  default:
    for (var i=0; i < n.elts.length; i++) {
      elts[i] = node(pool, n.elts[i]);
    }
    break;
  }
  return {
    tag: n.tag,
    elts: elts,
  };
}


function decomp(node) {
  if (!node) {
    return "";
  }
  var str = "";
  var numArgs = 0;
  switch(node.tag) {
  case "NUM":
  case "STR":
  case "IDENT":
    str = " \"" + node.elts[0] + "\"";
    break;
  default:
    switch (node.tag) {
    case "EQUIV-SYMBOLIC":
      str = "equivSymbolic";
      numArgs = 2;
      break;
    case "FORMAT":
      str = "format";
      numArgs = 2;
      break;
    case "EQUIV-VALUE":
      numArgs = 2;
      str = "equivValue";
      break;
    case "EQUIV-SYNTAX":
      numArgs = 2;
      str = "equivSyntax";
      break;
    case "EQUIV-LITERAL":
      numArgs = 2;
      str = "equivLiteral";
      break;
    case "IS-TRUE":
      numArgs = 1;
      str = "isTrue";
      break;
    case "IS-SIMPLIFIED":
      numArgs = 1;
      str = "isSimplified";
      break;
    case "IS-FACTORISED":
      numArgs = 1;
      str = "isFactorised";
      break;
    case "IS-EXPANDED":
      numArgs = 1;
      str = "isExpanded";
      break;
    case "VALID-SYNTAX":
      numArgs = 1;
      str = "validSyntax";
      break;
    case "IGNORE-ORDER":
      numArgs = 1;
      str = " ignoreOrder";
      break;
    case "DECIMAL-PLACES":
      numArgs = 2;
      str = " decimalPlaces";
      break;
    case "ALLOW-DECIMAL":
      numArgs = 1;
      str = " allowDecimal";
      break;
    case "ALLOW-EULERS-NUMBER":
      numArgs = 1;
      str = " allowEulersNumber";
      break;
    case "ALLOW-INTERVAL":
      numArgs = 1;
      str = " allowInterval";
      break;
    case "ALLOW-THOUSANDS-SEPARATOR":
      numArgs = 1;
      str = " allowThousandsSeparator";
      break;
    case "SET-THOUSANDS-SEPARATOR":
      numArgs = 2;
      str = " setThousandsSeparator";
      break;
    case "SET-DECIMAL-SEPARATOR":
      numArgs = 2;
      str = " setDecimalSeparator";
      break;
    case "INVERSE-RESULT":
    case "NOT":
      numArgs = 1;
      str = " inverseResult";
      break;
    case "IGNORE-TRAILING-ZEROS":
      numArgs = 1;
      str = " ignoreTrailingZeros";
      break;
    case "IGNORE-COEFFICIENT-ONE":
      numArgs = 1;
      str = " ignoreCoefficientOne";
      break;
    case "COMPARE-SIDES":
      numArgs = 1;
      str = " compareSides";
      break;
    case "FIELD":
      numArgs = 2;
      str = " field";
      break;
    case "IS-UNIT":
      numArgs = 2;
      str = "isUnit";
      break;
    case "IGNORE-TEXT":
      numArgs = 1;
      str = " ignoreText";
      break;
    case "PROG":
    case "EXPRS":
      break;
    case "LIST":
      break;
    default:
      console.log("ERROR " + node.tag);
      break;
    }
    if (node.elts) {
      node.elts.forEach(function (n, i) {
        if (str === " inverseResult") {
          str = decomp(n);
          var prefix = str.substring(0, str.indexOf(" "));
          var suffix = str.substring(str.indexOf(" "));
          str = prefix + " inverseResult" + suffix;
        } else {
          if (node.tag === "LIST" && i !== 0) {
            str += "," + decomp(n);
          } else {
            if (i <= numArgs) {
              let s = decomp(n);
              if (methods.indexOf(s.substring(0, s.indexOf(" "))) >= 0) {
                // We have more than one method, so toss the first one.
                str = s;
              } else if (eraseMethods.indexOf(s.substring(0, s.indexOf(" "))) >= 0) {
                str = "";
              } else {
                str += s;
              }
              let i = str.indexOf("inverseResult");
              if (i > 0) {
                str = str.substring(0, i) + str.substring(i + "inverseResult".length);
                var prefix = str.substring(0, str.indexOf(" "));
                var suffix = str.substring(str.indexOf(" "));
                str = prefix + " inverseResult" + suffix;
              }
            }
          }
        }
      });
      if (node.tag === "LIST") {
        str = " [" + str + "]";
      }
    }
    break;
  }
  return str;
}


var eraseMethods = [
  "format",
];
var methods = [
  "equivValue",
  "equivLiteral",
  "equivSyntax",
  "equivSymbolic",
  "isFactorised",
  "isSimplified",
  "isExpanded",
  "isUnit",
  "isTrue",
  "validSyntax",
];
