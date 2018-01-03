/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
var fs=require('graceful-fs');

var basedir = "./20171006/math/";

var walk = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) {
      console.log("walk() ERROR err=" + JSON.stringify(err));
      return done(err);
    }
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) return done(null, results);
      file = dir + file;
      fs.stat(file, function(err, stats) {
        if (stats) {
          if (stats.isDirectory()) {
            walk(file, function(err, res) {
              results = results.concat(res);
              next();
            });
          } else if (stats.isFile()) {
            results.push(file);
            next();
          } else {
            console.log("walk() ERROR file=" + file);
          }
        }
      });
    })();
  });
};

var ticket = 1;

function makeGCOptions(options) {
  if (!options || typeof options !== "object") {
    return "";
  }
  var str = "";
  Object.keys(options).forEach(function (key) {
    var val = options[key];
    switch (key) {
    case "field":
      switch (val) {
      case void 0: // undefined means use default
      case "integer":
      case "real":
      case "complex":
        val = "\"" + val + "\"";
        break;
      default:
        console.log("ERROR: Invalid field value: " + val);
        break;
      }
      break;
    case "decimalPlaces":
      if (isNaN(+val)) {
        key = undefined;
      }
      val = "\"" + val + "\"";
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
    case "ignoreCoefficientOne":
    case "allowThousandsSeparator":
    case "compareSides":
      if (val !== true) {
        key = undefined;
      }
      val = "";
      break;
    case "setThousandsSeparator":
    case "setDecimalSeparator":
      if (typeof v !== "string" &&
          !val instanceof Array || val.length === 0) {
        key = undefined;
      } else if (val.length > 0) {
        val = JSON.stringify(val);
      }
      break;
    case "ignoreLeadingAndTrailingSpaces":
      key = undefined; // Erase it.
      break;
    default:
      break;
    }
    if (key) {
      str += " " + key + " " + val;
    }
  });
  return str;
}

function makeGC118Options(options) {
  if (!options || typeof options !== "object") {
    return "";
  }
  var str = "";
  Object.keys(options).forEach(function (key) {
    var val = options[key];
    switch (key) {
    // case "field":
    //   switch (val) {
    //   case void 0: // undefined means use default
    //   case "integer":
    //   case "real":
    //   case "complex":
    //     val = "\"" + val + "\"";
    //     break;
    //   default:
    //     console.log("ERROR: Invalid field value: " + val);
    //     break;
    //   }
    //   break;
    // case "decimalPlaces":
    //   if (isNaN(+val)) {
    //     key = undefined;
    //   }
    //   val = "\"" + val + "\"";
    //   break;
    // case "allowDecimal":
    // case "allowInterval":
    // case "dontExpandPowers":
    // case "dontFactorDenominators":
    // case "dontFactorTerms":
    // case "dontConvertDecimalToFraction":
    // case "dontSimplifyImaginary":
    // case "ignoreOrder":
    // case "inverseResult":
    // case "requireThousandsSeparator":
    // case "ignoreText":
    // case "ignoreTrailingZeros":
    // case "ignoreCoefficientOne":
    // case "compareSides":
    case "allowThousandsSeparator":
      if (val !== true) {
        key = undefined;
      }
      val = "";
      break;
    // case "setThousandsSeparator":
    // case "setDecimalSeparator":
    //   if (typeof v !== "string" &&
    //       !val instanceof Array) {
    //     key = undefined;
    //   } else if (val.length > 0) {
    //     val = JSON.stringify(val);
    //   }
    //   break;
    default:
      key = undefined;
      break;
    }
    if (key) {
      str += " " + key + " " + val;
    }
  });
  return str;
}

function parseFormat(pattern) {
  var index = pattern.indexOf("{");
  if (index !== -1) {
    var type = pattern.substring(0, pattern.indexOf("{"));
    var size = +pattern.substring(index+1, pattern.indexOf("}"));
  } else {
    var type = pattern;
    var size = null;
  }
  return {
    type: type,
    size: size,
  };
}

function makeJasmineItem(method, options, value, name) {
  var values = [];
  switch (method) {
  case "equivSyntax":
    if (!value || options.inverseResult) {
      return "";
    }
    if (!options.syntax) {
      throw new Error("ERROR equivSyntax with missing format pattern.");
    }
    var pattern = options.syntax;
    values[0] = "\\format{" + pattern + "}";
    var format = parseFormat(pattern);
    switch (format.type) {
    case "\\integer":
    case "\\number":
      values[1] = "31415";
      break;
    case "\\decimal":
      values[1] = "3.1415";
      break;
    case "\\scientific":
      values[1] = "3.1415\times10^2";
      break;
    case "\\variable":
      values[1] = "x";
      break;
    case "\\fraction":
    case "\\fractionOrDecimal":
    case "\\nonMixedFraction":
      values[1] = "\\frac{1}{2}";
      break;
    case "\\mixedFraction":
      values[1] = "1\\frac{1}{2}";
      break;
    default:
      console.log("ERROR: unknown format type: " + format.type);
    }
    break;
  case "stringMatch":
      return "";
  default:
    if (!value || options.inverseResult) {
      return "";
    }
    values.push(value);
    values.push(value);
    break;
  }
  if (!options) {
    options = {};
  }
  delete options.syntax;  // Clean up
  delete options.argument;
  return method + 
    makeGCOptions(options) +
    " \"" + values[0] + "\"" +
    " \"" + values[1] + "\"" +
    ".. | " + name + "." + ticket++;
}

function makeGC118Item(method, options, value, name) {
  var values = [];
  switch (method) {
  case "equivSyntax":
  case "stringMatch":
      return "";
  default:
    if (!value || !isNaN(parseInt(value))) {
      // Filter trivial values
      return "";
    }
    values.push(value);
    break;
  }
  if (!options) {
    options = {};
  }
  delete options.syntax;  // Clean up
  delete options.argument;
  return (
    makeGC118Options(options) +
    " \"" + values[0] + "\""
  );
}

//let makeGCItem = makeGC118Item;
let makeGCItem = makeJasmineItem;

walk(basedir, function(err, files) {
  let items = {};
  if (err) throw err;
  console.log("scanning " + files.length + " files");
  files.forEach(function(file) {
    var name = file.substring(file.indexOf("/") + 1).substring(0, file.lastIndexOf("/")).replace(/\//g, ".").replace(/\.\./g, ".").replace("math", "lrn.math");
    fs.readFile(file, 'utf-8', function(err, data){
      try {
      if (err) {
		    console.log("ERROR: " + err + " data=" + data);
	    } else {
		    var obj = JSON.parse(data);
		    if (obj.valid_response) {
		      obj.valid_response.value.forEach(function (value) {
			      if (value.method) {
				      var str = makeGCItem(value.method, value.options, value.value, name);
              if (items[str]) {
                items[str]++;
              } else {
                items[str] = 1;
                if (str) console.log(str + ",");
              }
			      } else if (value instanceof Array) {
			        value.forEach(function (value) {
				        var str = makeGCItem(value.method, value.options, value.value, name);
                if (items[str]) {
                  items[str]++;
                } else {
                  items[str] = 1;
                  if (str) console.log(str + ",");
                }
              });
			      }
		      });
		    } else if (obj.valid_responses) {
		      obj.valid_responses.forEach(function (valid_response) {
			      valid_response.forEach(function (value) {
			        if (value.method) {
				        var str = makeGCItem(value.method, value.options, value.value, name);
                if (items[str]) {
                  items[str]++;
                } else {
                  items[str] = 1;
                  if (str) console.log(str + ",");
                }
			        } else {
				        console.log("[2] MISSING METHOD: " + JSON.stringify(value));
			        }
			      });
		      });
		    } else {
          console.log(data + ",");
          if (items[data]) {
            items[data]++;
          } else {
            items[data] = 1;
            if (str) console.log(str);
          }
          items[data] = items[data] ? items[data]++ : 1;
		    }
	    }
      } catch (x) {
//        console.log("ERROR invalid validation object. Skipping: " + file);
//        console.log(JSON.stringify(JSON.parse(data), null, 2));
//        console.log(x.stack);
      }
    });
  });
});

function dumpDir(subdir) {
  var ticket = 1;
  dir = basedir + subdir;
  fs.readdirSync(dir, function(err, files) {
    console.log(files);
    return;
    if (err) throw err;
    var c=0;
  });
}
