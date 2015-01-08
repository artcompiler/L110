/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/* copyright (c) 2014, Jeff Dyer */

exports.viewer = (function () {
  function reset() {
  }
  var height;

  function updateObj(obj) {
    objCodeMirror.setValue(obj);
  }

  function update(obj, src, pool) {
    reset();
    exports.src = src;
    exports.pool = pool;
    exports.obj = obj;
    obj = JSON.parse(obj);
    var fill, fontStyle;
    var value = obj.json.validation.valid_response.value[0];
    var options = "";
    var method = value.method;
    Object.keys(value.options).sort().forEach(function (v) {
      switch(v) {
      case "dontExpandPowers":
      case "dontFactorDenominators":
        // Erase.
        delete value.options[v];
        break;
      case "decimalPlaces":
        options += v + "=" + value.options[v] + " ";
        break;
      default:
        options += v + " ";
        break;
      }
    });
    updateObj(JSON.stringify(obj.json, null, 2));
    var input =
      "<tspan font-size='14' font-weight='600'>" + method + "</tspan> " +
      "<tspan font-weight='400' font-style='italic'>" + options  +"</tspan> " +
      (value.value !== undefined ? "<tspan font-weight='400'>\"" + value.value  +"\"</tspan> " : "") +
      "<tspan font-weight='400'>\"" + obj.response + "\"</tspan>";   // obj.input;
    var response = obj.response;
    var border;
    if (obj.score > 0) {
      fill = "#FFF";
      border = "rgb(100,255,100)";
      fontStyle = "normal";
      heading = input;
      checkSrc = 
        '<rect x="4" y="4" width="20" height="20" fill="rgb(100, 255, 100)" ' +
        'fill-opacity="1" stroke-opacity="0"/> ';
    } else if (obj.score < 0) {
      fill = "#FFF";
      border = "rgb(255,100,100)";
      fontStyle = "normal";
      heading = input;
      checkSrc = 
        '<rect x="4" y="4" width="20" height="20" fill="rgb(255, 100, 100)" ' +
        'fill-opacity="1" stroke-opacity="0"/> ';
    } else {
      fill = "#FFF";
      border = "rgb(255,255,100)";
      fontStyle = "italic";
      heading = "ERROR " + src;
      text = "Invalid program code.";
      checkSrc = 
        '<rect x="4" y="4" width="20" height="20" fill="rgb(255, 255, 100)" ' +
        'fill-opacity="1" stroke-opacity="0"/> ';
    }
    var data = []; //text.split("\n");
    data.push(input);
    height = (data.length * 13 + 15);
    $("#graff-view")
      .html('<svg style="background-color:' + fill +
            '" xmlns="http://www.w3.org/2000/svg" width="640" height="' +
            height +
            '">' + checkSrc +
            '<rect x="0" y="0" width="640" height="' + height +
            '" fill-opacity="0" stroke-width="4" stroke-opacity="1" stroke="' + border + '"/>' +
            '<g/></svg>');
    var svg = d3.select("#graff-view svg g");
    var line = svg.selectAll("text")
      .data(data);
    line.exit().remove();
    line.enter()
      .append("text")
      .attr("x", function(d, i) {
        for (var i = 0; i < d.length; i++) {
          if (d.charAt(i) !== " ") {
            break;
          }
        }
        return i * 7 + 10 + 20;
      })
      .attr("y", function(d, i) {
        return i * 13 + 18;
      })
      .attr("font-family", function (d, i) {
        if (i < 2) {
          return "Courier New";
        } else {
          return "Courier New";
        }
      }) 
      .attr("font-weight", function (d, i) {
        if (i < 2) {
          return "400";
        } else {
          return "400";
        }
      }) 
      .attr("font-size", 13)
      .attr("font-style", fontStyle)
      .style("fill", "#000")
      .html(function(d) {
        return d
      });
  }
  function capture() {
    // My SVG file as s string.
    var mySVG = $("#graff-view").html();
    // Create a Data URI.
    // Load up our image.

    // Set up our canvas on the page before doing anything.
    var old = document.getElementById('graff-view').children[0];
    var myCanvas = document.createElement('canvas');
    myCanvas.width = 640;
    myCanvas.height = height;
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
  }
  return {
    update: update,
    capture: capture,
  };
})();
