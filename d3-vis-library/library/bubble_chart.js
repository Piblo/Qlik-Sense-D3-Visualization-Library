var viz = function($element, layout, _this) {
	var id = senseUtils.setupContainer($element,layout,"d3vl_zoom_partition"),
		ext_width = $element.width(),
		ext_height = $element.height();

	var data = layout.qHyperCube.qDataPages[0].qMatrix;

	var dim_count = layout.qHyperCube.qDimensionInfo.length;



	var root = {name: layout.title, children: senseD3.createFamily(data,dim_count)};

	var diameter = Math.min(ext_width,ext_height),
	    format = d3.format(",d"),
	    color = d3.scale.category20c();

	var bubble = d3.layout.pack()
	    .sort(null)
	    .size([diameter, diameter])
	    .padding(1.5);

	var svg = d3.select("#" + id).append("svg")
	    .attr("width", diameter)
	    .attr("height", diameter)
	    .attr("class", "bubble");

	
	  var node = svg.selectAll(".node")
	      .data(bubble.nodes(classes(root))
	      .filter(function(d) { return !d.children; }))
	    .enter().append("g")
	      .attr("class", "node")
	      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

	  node.append("title")
	      .text(function(d) { return d.className + ": " + format(d.value); });

	  node.append("circle")
	      .each(function(d){
	      	d.classDim = d.depth > 0 ? layout.qHyperCube.qDimensionInfo[layout.qHyperCube.qDimensionInfo.length-1].qFallbackTitle.replace(/\s+/g, '-') : "-";
	      	d.cssID = d.className.replace(/\s+/g, '-');
	      })
	      .attr("class", function(d){
	      	return d.classDim;
	      })
	      .attr("id", function(d) { return d.cssID; })
	      .attr("r", function(d) { return d.r; })
	      .style("fill", function(d) { return color(d.packageName); })
	      .on("click", function(d) {
	      	console.log(d);
	      })
  		  .on("mouseover", function(d){
			d3.selectAll($("."+d.classDim+"#"+d.cssID)).classed("highlight",true);
	      	d3.selectAll($("."+d.classDim+"[id!="+d.cssID+"]")).classed("dim",true);
	      	d3.selectAll($("circle"+"[id!="+d.cssID+"]")).classed("dim",true);
		  })
		  .on("mouseout", function(d){
			d3.selectAll($("."+d.classDim+"#"+d.cssID)).classed("highlight",false);
	      	d3.selectAll($("."+d.classDim+"[id!="+d.cssID+"]")).classed("dim",false);
	      	d3.selectAll($("circle"+"[id!="+d.cssID+"]")).classed("dim",false);
		  });

	  node.append("text")
	      .attr("dy", ".3em")
	      .style("text-anchor", "middle")
	      .text(function(d) { return d.className.substring(0, d.r / 3); });

	// Returns a flattened hierarchy containing all leaf nodes under the root.
	function classes(root) {
	  var classes = [];

	  function recurse(name, node) {
	    if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
	    else classes.push({packageName: name, className: node.name, value: node.size});
	  }

	  recurse(null, root);
	  return {children: classes};
	}


}