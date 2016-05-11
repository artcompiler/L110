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
    var hash = {};
    list.forEach(function (item, lineNum) {
      if (item === "") {
        eraseCount++;
        return;
      }
      //item = escapeXML(item);
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
      decomp(n, hash);
      return;
    });
    var items = Object.keys(hash);
    console.log("scanned " + items.length + " validations");
    console.log("erased " + eraseCount + " validations");
    console.log("[");
    items.forEach(function (s, i) {
      console.log("\"" + s + "\",");
    });
    console.log("]");
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


function decomp(node, hash) {
  if (!node) {
    return [];
  }
  switch(node.tag) {
  case "NUM":
  case "STR":
  case "IDENT":
    hash[node.elts[0]] = node.elts[0];
    break;
  default:
    switch (node.tag) {
    case "EQUIV-SYMBOLIC":
    case "EQUIV-VALUE":
    case "EQUIV-SYNTAX":
    case "EQUIV-LITERAL":
    case "IS-TRUE":
    case "IS-SIMPLIFIED":
    case "IS-FACTORISED":
    case "IS-EXPANDED":
    case "VALID-SYNTAX":
    case "IS-UNIT":
    case "PROG":
    case "EXPRS":
    case "LIST":
    if (node.elts) {
      node.elts.reverse().forEach(function (n, i) {
        decomp(n, hash);
      });
    }
    case "IGNORE-ORDER":
    case "DECIMAL-PLACES":
    case "ALLOW-DECIMAL":
    case "ALLOW-INTERVAL":
    case "ALLOW-THOUSANDS-SEPARATOR":
    case "SET-THOUSANDS-SEPARATOR":
    case "SET-DECIMAL-SEPARATOR":
    case "INVERSE-RESULT":
    case "NOT":
    case "IGNORE-TRAILING-ZEROS":
    case "IGNORE-COEFFICIENT-ONE":
    case "COMPARE-SIDES":
    case "FIELD":
    case "IGNORE-TEXT":
      break;
    default:
      console.log("ERROR " + node.tag);
      break;
    }
    break;
  }
  return hash;
}

function parse(str, lineNum) {
  var i = 0;
  var obj = {};
  var comment = "";
  var method;
  var options = {};
  var values = [];
  var value, response;
  var end;
  out:
  for (; i < str.length; i++) {
    //console.log("[1] str[" + i + "]=" + str.charCodeAt(i) + ":" + str[i]);
    // Look for comment or method.
    switch (str[i]) {
    case "|":
    case "/":
      comment += scanComment();
      continue;
    case "e":
    case "i":
    case "v":
      method = scanMethod();
      break out;
    case " ":
    case "\t":
      // skip whitespace
      continue;
    case "\n":
      break out;
    default:
      console.log("[1] ERROR: unexpected character " + str[i] + " at Ln " + lineNum + " Col " + i);
      console.log(str);
      break;
    }
  }
  out:
  for (; i < str.length; i++) {
    //console.log("[2] str[" + i + "]=" + str.charCodeAt(i) + ":" + str[i]);
    // Look for comment, option or value.
    switch (str[i]) {
    case "|":
    case "/":
      comment += scanComment();
      break;
    case "f":
    case "d":
    case "a":
    case "i":
    case "r":
    case "c":
    case "s":
    case "n":
      var opt = scanOption();
      var key = Object.keys(opt);
      if (key.length === 1) {
        options[key] = opt[key];
      }
      break;
    case " ":
    case "\t":
    case "\n":
      // skip whitespace
      break;
    case "\"":
    case "\'":
      // Found string so done with options.
      break out;
    default:
      console.log("[2] ERROR: unexpected character " + str[i] + " at Ln " + lineNum + " Col " + i);
      console.log(str);
      break;
    }
  }
  out:
  for (; i < str.length; i++) {
//    console.log("[3] str[" + i + "]=" + str.charCodeAt(i) + ":" + str[i]);
    // Look for comment or value.
    switch (str[i]) {
    case "|":
    case "/":
      comment += scanComment();
      break;
    case "\"":
    case "\'":
      values.push(scanString());
      continue;
    case ".":
      i++;
      break out;
    case " ":
    case "\t":
    case "\n":
      // skip whitespace
      break;
    default:
      console.log("[3] ERROR: unexpected character " + str[i] + " at Ln " + lineNum + " Col " + i);
      console.log(str);
      break;
    }
  }
  out:
  for (; i < str.length; i++) {
//    console.log("[3] str[" + i + "]=" + str.charCodeAt(i) + ":" + str[i]);
    // Look for comment or value.
    switch (str[i]) {
    case "|":
    case "/":
      comment += scanComment();
      break;
    case "\"":
    case "\'":
      values.push(scanString());
      continue;
    case ".":
      i++;
      break out;
    case " ":
    case "\t":
    case "\n":
      // skip whitespace
      break;
    default:
      console.log("[3] ERROR: unexpected character " + str[i] + " at Ln " + lineNum + " Col " + i);
      console.log(str);
      break;
    }
  }
  for (; i < str.length; i++) {
//    console.log("[4] str[" + i + "]=" + str.charCodeAt(i) + ":" + str[i]);
    // Look for end of program and comment.
    switch (str[i]) {
    case "|":
    case "/":
      comment += scanComment();
      break;
    case ".":
      break;
    case " ":
    case "\t":
    case "\n":
      // skip whitespace
      continue;
    default:
      console.log("[4] ERROR: unexpected character " + str[i] + " at Ln " + lineNum + " Col " + i);
      console.log(str);
      break;
    }
  }
  //console.log(JSON.stringify({
  //  method: method,
  //  options: options,
  //  values: values,
  //  comment: comment
  //}));
  return {
    method: method,
    options: options,
    values: values,
    comment: comment
  };

  function scanOption() {
    var key = "", val;
    var options = [];
    out:
    for (; i < str.length; i++) {
      //console.log("str[" + i + "]=" + str.charCodeAt(i) + ":" + str[i]);
      switch (str[i]) {
      case "\n":
      case "\t":
      case " ":
        i++;
        // fall through
      case "\"":
      case "\'":
        if (!key) {
          // No option
          key = null;
        }
        i--;
        break out;
      default:
        key += str[i];
        continue;
      }
    }
    switch (key) {
    case "field":
      val = scanString();
      i--;
      break;
    case "decimalPlaces":
      val = scanStringOrNumber();
      break;
    case "allowDecimal":
    case "allowInterval":
    case "dontExpandPowers":
    case "dontFactorDenominators":
    case "dontFactorTerms":
    case "dontConvertDecimalToFraction":
    case "dontSimplifyImaginary":
    case "ignoreOrder":
    case "inverseResult":
    case "requireThousandsSeparator":
    case "ignoreText":
    case "ignoreTrailingZeros":
    case "allowThousandsSeparator":
    case "compareSides":
      val = true;
      break;
    case "setThousandsSeparator":
    case "setDecimalSeparator":
      val = scanListOrString();
      break;
    case "not":
      key = "inverseResult";
      val = true;
      break;
    case null:
      break;
    default:
//      console.log("ERROR invalid option name: " + key);
      key = null;
      break;
    }
    var opt = {};
    if (key) {
      opt[key] = val;
    }
    return opt;
  }
  
  function scanMethod() {
    var method = "";
    loop:
    for (; i < str.length; i++) {
//      console.log("str[" + i + "]=" + str.charCodeAt(i) + ":" + str[i]);
      switch (str[i]) {
      case "\n":
      case "\t":
      case " ":
        i++;
        // Done.
        break loop;
      default:
        method += str[i];
        continue;
      }
    }
    if (methods.indexOf(method) < 0) {
      console.log("ERROR invalid method name: " + method);
    }
    return method;
  }

  function scanString() {
    while (str[i] !== "\"") i++;
    var s = "";
    s += str[i];
    var delim = str[i++];
    out:
    for (; i < str.length; i++) {
      //console.log("str[" + i + "]=" + str.charCodeAt(i) + ":" + str[i]);
      switch (str[i]) {
      case "\n":
        console.log("ERROR: unterminated string");
        i++;
        break out;
      case delim:
        s += str[i];
        i++;
        break out;
      default:
        s += str[i];
        break;
      }
    }
    return s;
  }

  function scanStringOrNumber() {
    var s = "";
    var delim;
    out:
    for (; i < str.length; i++) {
      switch (str[i]) {
      case "\n":
      case "\t":
      case " ":
        // Eat whitespace
        break;
      case "\"":
      case "\'":
        delim = str[i];
        s += str[i];
        i++;
        break out;
      case "0":
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        // Got a number
        delim = "";
        break out;
      default:
        console.log("ERROR: unexpected character looking for string or number: " + str[i]);
        break;
      }
    }
    out:
    for (; i < str.length; i++) {
      switch (str[i]) {
      case delim:
        s += str[i];
        i++;
        break out;
      default:
        if (delim === "" && isNaN(parseInt(str[i]))) {
          break out;
        }
        s += str[i];
        break;
      }
    }
    return s;
  }

  function scanListOrString() {
    var s = "";
    while (str[i] === " ") i++;
    if (str[i] === "\"" || str[i] === "'") {
      s += str[i];
      var delim = str[i++];
    }
    out:
    for (; i < str.length; i++) {
//      console.log("scanListOrString() str[" + i + "]=" + str.charCodeAt(i) + ":" + str[i]);
      switch (str[i]) {
      case "\n":
        console.log("ERROR: unterminated string");
        i++
        break out;
      case delim:
        s += str[i];
        i++;
        break out;
      case "[":
        s = scanList();
        break out;
      default:
        s += str[i];
        break;
      }
    }
    return s;
  }

  function scanList() {
    var list = [];
    out:
    for (; i < str.length; i++) {
//      console.log("str[" + i + "]=" + str.charCodeAt(i) + ":" + str[i]);
      switch (str[i]) {
      case "\n":
      case "\t":
      case " ":
        // Eat whitespace.
        break;
      case "[":
      case ",":
        i++;
        list.push(scanString());
        i--;  // want , or ] to be the next char
        break;
      case "]":
        i++;
        break out;
      default:
        console.log("ERROR scanList, prefix=" + str.substring(i));
        break;
      }
    }
    return list;
  }

  function scanComment() {
    var comment = "";
    for (; i < str.length; i++) {
      switch (str[i]) {
      case "\n":
        i++;
        // Done.
        break;
      default:
        comment += str[i];
        continue;
      }
    }
    return comment;
  }
}

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
