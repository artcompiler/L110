/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/* copyright (c) 2014, Jeff Dyer */
window.gcexports.viewer = (function () {
  var height;
  function updateObj(obj) {
    objCodeMirror.setValue(obj);
  }
  function update(el, obj, src, pool) {
    if (!obj) {
      d3.select(el).html('<g/>');
      var bbox = $("#graff-view svg g")[0].getBBox();
      $(el).attr("height", (bbox.height + 20) + "px");
      return;
    }
    var fill, fontStyle;
    var validation = obj.objectCode
      ? obj.objectCode.validation   // Legacy.
      : obj.validation;
    var value = validation.valid_response.value[0];
    var options = "";
    var method = obj.methods || value.method;
    Object.keys(value.options).sort().forEach(function (v) {
      switch(v) {
      case "inverseResult":
        if (value.options[v] === true) {
          method = "NOT " + method;
        }
        break;
      case "dontExpandPowers":
      case "dontFactorDenominators":
        // Erase.
        delete value.options[v];
        break;
      case "decimalPlaces":
      case "field":
        options += v + JSON.stringify(value.options[v]) + " ";
        break;
      default:
        options += v + " ";
        break;
      }
    });
    var svg = obj.svg;
    function getSize(svg) {
      svg = svg.slice(svg.indexOf("width=") + 7 + 5);
      var width = svg.slice(0, svg.indexOf("ex")) * 8;  // ex=8px
      svg = svg.slice(svg.indexOf("height=") + 8 + 5);
      var height = svg.slice(0, svg.indexOf("ex")) * 8 + 5;
      if (isNaN(width) || isNaN(height)) {
        width = 640;
        height = 30;
      }
      return {
        width: width,
        height: height
      }
    }
    if (obj.score === undefined) {
      method = "SAMPLE";
      var text =
        "<text x='4' y='20'>" +
        "<tspan font-size='12' font-weight='400' stroke='none' fill='#999'>" + method + "</tspan>" +
        "</text>";
    } else {
      var text =
        "<text x='30' y='20'>" +
        "<tspan font-size='14' font-weight='600'>" + method + "</tspan> " +
        "<tspan font-size='12' font-weight='400' font-style='italic'>" + options  + "</tspan>" +
        "</text>";
    }
    var svg;
    if (obj.valueSVG) {
      var valueSize = getSize(obj.valueSVG);
      var responseSize = getSize(obj.responseSVG);
      svg =
        "<image width='" + valueSize.width +
        "' height='" + valueSize.height +
        "' x='4' y='30' xlink:href=\"data:image/svg+xml;utf8," + obj.valueSVG +
        "\"/><image width='" + responseSize.width +
        "' height='" + responseSize.height +
        "' x='4' y='" + (valueSize.height + 40) +
        "' xlink:href=\"data:image/svg+xml;utf8," + obj.responseSVG +
        "\"/>";
    } else {
      var valueHeight = 0;
      if (obj.value) {
        text += 
          "<text x='4' y='45'><tspan font-size='12' font-weight='400'>" +
          obj.value +
          "</tspan></text>";
        valueHeight = 20;
      }
      var responseSize = getSize(obj.responseSVG);
      svg =
        "<image width='" + responseSize.width +
        "' height='" + responseSize.height +
        "' x='4' y='" + (valueHeight + 35) + "' xlink:href='data:image/svg+xml;utf8," + obj.responseSVG +
        "'/>";
    }
    var border;
    if (obj.score === undefined) {
      checkSrc = "";
    } else if (obj.score > 0) {
      fill = "#FFF";
      border = "rgb(100,255,100)";
      fontStyle = "normal";
      checkSrc = 
        '<rect x="4" y="4" width="20" height="20" fill="rgb(100, 255, 100)" ' +
        'fill-opacity="1" stroke-opacity="0"/> ';
    } else if (obj.score < 0) {
      fill = "#FFF";
      border = "rgb(255,100,100)";
      fontStyle = "normal";
      checkSrc = 
        '<rect x="4" y="4" width="20" height="20" fill="rgb(255, 100, 100)" ' +
        'fill-opacity="1" stroke-opacity="0"/> ';
    } else {
      fill = "#FFF";
      border = "rgb(255,255,100)";
      fontStyle = "italic";
      text = "Invalid program code.";
      checkSrc = 
        '<rect x="4" y="4" width="20" height="20" fill="rgb(255, 255, 100)" ' +
        'fill-opacity="1" stroke-opacity="0"/> ';
    }
    var data = [];
    data.push(text);
    height = 28;
    $(el)
      .html('<g>' + checkSrc + text + svg + '</g>');
    var bbox = $("#graff-view svg g")[0].getBBox();
    $(el).attr("height", (bbox.height + 20) + "px");
//    $(el).attr("width", (bbox.width + 40) + "px");
  }
  function unescapeXML(str) {
    return String(str)
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, "'");
  }
  function capture(el) {
    // My SVG file as s string.
    var mySVG = $(el).html();
/*
    // Create a Data URI.
    // Load up our image.
    // Set up our canvas on the page before doing anything.
    var old = document.getElementById('graff-view').children[0];
    var myCanvas = document.createElement('canvas');
    var bbox = $("#graff-view svg g")[0].getBBox();
    myCanvas.height = bbox.height + 12;
    myCanvas.width = bbox.width + 40;
    document.getElementById('graff-view').replaceChild(myCanvas, old);
    // Get drawing context for the Canvas
    var myCanvasContext = myCanvas.getContext('2d');
    // Load up our image.
    // Render our SVG image to the canvas once it loads.
    var source = new Image();
    source.src = "data:image/svg+xml;base64," + window.btoa(mySVG);
    myCanvasContext.drawImage(source,0,0);
    var dataURL = myCanvas.toDataURL();
    document.getElementById('graff-view').replaceChild(old, myCanvas);
    return '<html><img class="thumbnail" src="' + dataURL + '"/></html>';
*/
    return mySVG;
  }
  return {
    update: update,
    capture: capture,
  };
})();

