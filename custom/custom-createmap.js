{
var width = 960, // sets the variable width, which we refer to in creating the svg image
	height = 550; // sets the variable height, which we refer to in creating the svg image

// Color-code values for choropleth
var quantize = d3.scale.quantize() // sets the variable quantize to the quantize (variant of linear scale) function of D3
	.domain([0, .15]) // sets the range of the scale (0% min and 15% max); I had to skip the default of 0, 1 because the vast majority of my cases are below 15%, with a few outliers skewing the scale (note: D3 allows chaining to the child object by using a dot (.))
	.range(d3.range(9).map(function(i) { return "q" + i + "-9"; })); // draws from the colors q(i)-9 to color the different ranges

var path = d3.geo.path(); // sets the variable path to the D3 path generator

// Info for SVG file
var svg = d3.select("#map").append("svg") // sets the variable svg to the D3 selector of the element(s) with an id "map", adding an svg element to it
	.attr("width", width) // which has the width set in the earlier variable
	.attr("height", height); // and has the height set in the earlier variable
    
// Map Drawing Section
function ready(error, us, centroid, immfb) { // create the function ready, using any error information as 'error', the US map data as 'us', the AP data as 'centroid', and the ACS data as 'immfb'
	// County Info (Choropleth)
	var rateById = {}; // sets the variable rateById to an empty object literal

	immfb.forEach(function(d) { rateById[d.id] = +d.pctfb; }); // for each case in immfb, add the respective 'pctfb' value to the rateById object literal

	svg.append("g") // create a new group and add it to the svg object defined earlier
	   	.attr("id", "counties") // give the object the id 'counties'
		.attr("class", "counties") // give the object a class also named 'counties'
	    .selectAll("path") // select all elements of type path within that group
			.data(topojson.object(us, us.objects.counties).geometries) // uses the topojson library to draw all of the county paths using the data from 'us'
	    .enter().append("path") // for each county, create a new path
			.attr("class", function(d) { return quantize(rateById[d.id]); }) // for each path, assign the respective scale color class attribute
			.attr("d", path); // provide the path information to the 'd' attribute, for drawing
	
	// AP Circle Info (Symbols)
	var centrange = []; // set the variable 'centrange' to an empty array, which we will fill with the AP story amount values
	
	for (i in centroid.features) { // for each element in the 'centroid' data
		centrange.push(centroid.features[i].properties.amount); // find the respective 'amount' value and add it to the array
	}
   
	var minX = d3.min(centrange); // set the variable 'minX' to the minimum value in the 'centrange' array
	var maxX = d3.max(centrange); // set the variable 'maxX' to the maximum value in the 'centrange' array

	var radius = d3.scale.sqrt() // sets the variable 'radius' (radius of each AP story circle) to the result of the square-root scale (used to preserve proportions)
	    .domain([minX, maxX]) // sets the minimum and maximum values using the 'minX' and 'maxX' variables
	    .range([3, 20]); // and we set the minimum and maximum size of the radii

  	svg.append("g") // create a new group and add it to the svg object defined earlier
		.attr("id", "apcircles") // give the object the id 'apcircles'
  		.attr("class", "apcircles") // give the object the class 'apcircles'
	.selectAll(".symbol") // select all elements within that group that have a 'symbol' class
  		.data(centroid.features.sort(function(a, b) { return b.properties.amount - a.properties.amount; })) // gets the AP data from 'centroids' and sorts it descending (this way, bigger dots are drawn first and the smaller dots placed on top of them)
    .enter() // returns the placeholder for missing elements
    .append("path") // for each case (city), create a new path
		.attr("class", "symbol hasInfobox") // for each path, assign the classes 'symbol' and 'hasInfobox'
		.attr("d", path.pointRadius(function(d) { return radius(d.properties.amount); }))  // provide the path information to the 'd' attribute, for drawing, using a radius that is proportional to 'amount'
		.on("mouseover", function(d, i) { d3.select("#infobox").style("display","block"); d3.select("#infobox").style("left", mouseX + "px"); d3.select("#infobox").style("top", mouseY + "px"); d3.select("#infobox #name").text(d.properties.name); d3.select("#infobox #amount").text(d.properties.amount); }).on("mouseout", function(d, i) { d3.select("#infobox").style("display","none"); }); // sets the on mouseover and mouseout options for changing the name and amount on the div '#infobox', and setting the position of the div relative to the mouse poition; it then either shows it (mouseover) or hides it (mouseout) depending on the event
}

// Draw Legend (Manual)
var gradcolors = [{ "offset": "0%", "stopcolor": "rgb(198, 219, 239)", "stopopacity": "1" },
	            { "offset": "100%", "stopcolor": "rgb(8, 48, 107)", "stopopacity": "1" }]; // sets variable 'gradcolors' to the start, middle, and end color values for the choropleth legend

	svg.append('svg:defs') // creates an element for definitions for the svg
		.append("linearGradient") // creates an element for the linearGradient definition
			.attr('id', 'legendgrad') // assigns the id 'legendgrad' to the gradient definition
	
	var diventer = d3.select("#legendgrad").selectAll("stop") // sets the variable 'diventer' to the selection of the id 'legendgrad' and select all elements 'stop'
		.data(gradcolors) // use the data from the 'gradcolors' array
		.enter().append("stop") // for each of these, create a new element 'stop'
			.attr("offset", function(d) { return d.offset; }) // assign the attribute 'offset' using the 'offset' data
			.style("stop-color", function(d) { return d.stopcolor; }) // assign the attribute 'stop-color' using the 'stopcolor' data
			.style("stop-opacity", function(d) { return d.stopopacity; }); // assign the attribute 'stopcolor' using the 'stopopacity' data

	svg.append('svg:rect') // create a new rectangle for the scale legend
		.attr('id','legend') // give the object the id 'legend'
		.attr('transform', 'translate(405, 505)') // sets the x and y-coordinate displacement relative to the svg (svg midpoint minus half the rectangle width for centering; y displacement is near the bottom of the svg)
		.attr('width','150') // set the width of the object to 150px
		.attr('height','20') // set the height of the object to 20px
		.attr('fill', 'url(#legendgrad)') // fill the object using the gradient with the id 'legendgrad'
		
	svg.append('svg:text') // create a new text area for the label for the starting point of the gradient
		.attr('id','minlabel') // give the object the id 'minlabel'
		.attr('transform', 'translate(405, 500)') // sets the x and y-coordinate displacement relative to the svg (starting point of rect for x and just a few pixels less on y so it sits comfortably above)
		.attr('font-family','Arial') // sets the font family to Arial, for a nicer look
		.text('0%') // the text of the label (our lowest value)
	
		svg.append('svg:text') // create a new text area for the label for the ending point of the gradient
		.attr('id','maxlabel') // give the object the id 'maxlabel'
		.attr('transform', 'translate(555, 500)') // sets the x and y-coordinate displacement relative to the svg (ending point of rect for x and just a few pixels less on y so it sits comfortably above)
		.attr('text-anchor', 'end') // set 'text-achor' to right so that it works right-to-left so that the end of the label is at the end of the rect
		.attr('font-family','Arial') // sets the font family to Arial, for a nicer look
		.text('>15%') // the text of the label (our maximum value and everything above it)
		
		svg.append('svg:text') // create a new text area for the label for the legend
		.attr('id','legendlabel') // give the object the id 'legendlabel'
		.attr('transform', 'translate(480, 545)') // sets the x and y-coordinate displacement relative to the svg (middle of rect for x and just a few pixels more on y so it sits comfortably below)
		.attr('text-anchor', 'middle') // set 'text-achor' to middle so that it distributes the text evenly left and right so that our text remains centered
		.attr('font-family','Arial') // sets the font family to Arial, for a nicer look
		.text('Foreign-born as pct. of total pop.') // the text of the label (description of what the scale represents)
}


// Form Settings for User Interaction
function changecentroids() { // creats function for turning AP circles on and off
	var centroid_yn = document.getElementById("centroid_yn").value; // sets the variable 'centroid_yn' to the value of the form input element 'centroid_yn'
	if (centroid_yn==1) { d3.select("#apcircles").style("display","block"); } // if option 1 is selected, display the circles
	if (centroid_yn==2) { d3.select("#apcircles").style("display","none"); } // if option 2 is selected, hide the circles
}

function changemapcolor() { // creates the function for turning off the choropleth coloring
	var county_yn = document.getElementById("county_yn").value; // sets the variable 'county_yn' to the value of the form input element 'county_yn'
	if (county_yn==1) { // if option 1 is selected, set the class values for the range of choropleth colors and show legend
		d3.selectAll(".q0-9").style("fill","rgb(198, 219, 239)");
		d3.selectAll(".q1-9").style("fill","rgb(174, 197, 222)");
		d3.selectAll(".q2-9").style("fill","rgb(150, 176, 206)");
		d3.selectAll(".q3-9").style("fill","rgb(126, 154, 189)");
		d3.selectAll(".q4-9").style("fill","rgb(103, 133, 173)");
		d3.selectAll(".q5-9").style("fill","rgb(79, 112, 156)");
		d3.selectAll(".q6-9").style("fill","rgb(55, 90, 140)");
		d3.selectAll(".q7-9").style("fill","rgb(31, 69, 123)");
		d3.selectAll(".q8-9").style("fill","rgb(8, 48, 107)");
		d3.select("#legend").style("display","block");
		d3.select("#minlabel").style("display","block");
		d3.select("#maxlabel").style("display","block");
		d3.select("#legendlabel").style("display","block");
		}
	if (county_yn==2) { // if option 2 is selected, set the class values for entire choropleth range to a single color and hide legend
		d3.selectAll(".q0-9").style("fill","#ccc");
		d3.selectAll(".q1-9").style("fill","#ccc");
		d3.selectAll(".q2-9").style("fill","#ccc");
		d3.selectAll(".q3-9").style("fill","#ccc");
		d3.selectAll(".q4-9").style("fill","#ccc");
		d3.selectAll(".q5-9").style("fill","#ccc");
		d3.selectAll(".q6-9").style("fill","#ccc");
		d3.selectAll(".q7-9").style("fill","#ccc");
		d3.selectAll(".q8-9").style("fill","#ccc");
		d3.select("#legend").style("display","none");
		d3.select("#minlabel").style("display","none");
		d3.select("#maxlabel").style("display","none");
		d3.select("#legendlabel").style("display","none");
		}
}

// Load data and draw map
queue() // sets a queue so we can load all the data first
    .defer(d3.json, "data/us.json") // load the US map data, which has the county paths
    .defer(d3.json, "data/immstories-usa.json") // load the AP data file (for circles)
    .defer(d3.tsv, "data/immfb.tsv") // load the ACS data file (for county color-coding)
    .await(ready); // and when that's done, execute the function ready, providing the above items as arguments, in order