/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/* copyright (c) 2014, Jeff Dyer */

exports.viewer = (function () {

  function reset() {
  }

  function update(obj, src, pool) {
    reset();
    exports.src = src;
    exports.pool = pool;
    exports.obj = obj;

    $("#graff-view").html(obj);
/*
    var svg = d3.select("#graff-view svg");
    var circle = svg.selectAll("circle")
      .data(data);

    circle.exit().remove();
    
    circle.enter().append("circle")
      .attr("r", 1);
    
    circle
      .attr("cx", function(d) { return d.cx; })
      .attr("cy", function(d) { return d.cy; })
      .attr("r", function(d) { return d.r; })
      .style("fill", function(d) { return d.fill; })
      .style("stroke", function(d) { return d.stroke; });
*/
    var bbox = $("#graff-view svg g")[0].getBBox();
    $("#graff-view svg").attr("height", (bbox.height + 40) + "px");
    $("#graff-view svg").attr("width", (bbox.width + 40) + "px");
  }

  function capture() {

    // My SVG file as s string.
    var mySVG = $("#graff-view .graffiti").html();
    // Create a Data URI.
    // Load up our image.

    // Set up our canvas on the page before doing anything.
    var old = document.getElementById('graff-view').children[0];
    var myCanvas = document.createElement('canvas');
    myCanvas.width = 640;
    myCanvas.height = 360;

    document.getElementById('graff-view').replaceChild(myCanvas, old);
    // Get drawing context for the Canvas
    var myCanvasContext = myCanvas.getContext('2d');
    // Load up our image.
    // Render our SVG image to the canvas once it loads.
    var source = new Image();
    source.src = "data:image/svg+xml;base64," + window.btoa(mySVG);
    myCanvasContext.drawImage(source,0,0);
    var dataURL = myCanvas.toDataURL();
    return '<html><img class="thumbnail" src="' + dataURL + '"/></html>';
  }

  return {
    update: update,
    capture: capture,
  };
})();
