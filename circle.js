var w = 1000;
var h = 800;
var rectW = 10;
var margin = rectW * 4;
   // Create canvas
   var svg = d3.select("#myVis").append("svg")
   .attr("width", w)
   .attr("height", h)
   .style("background-color", "black");

// Global variable for data
var oceanData = [
   { "year": 1980, "sst_average": 21.5, "temperature_anomaly": 0.30, "continent": "africa" },
   { "year": 1980, "sst_average": 21.9, "temperature_anomaly": 0.22, "continent": "asia"},
   { "year": 1980, "sst_average": 20.5, "temperature_anomaly": 0.22, "continent": "europe"},
   { "year": 1990, "sst_average": 24.0, "temperature_anomaly": 0.45, "continent": "africa"},
   { "year": 1990, "sst_average": 23.0, "temperature_anomaly": 0.40, "continent": "asia"},
   { "year": 1990, "sst_average": 22.6, "temperature_anomaly": 0.30, "continent": "europe"},
   { "year": 2000, "sst_average": 23.0, "temperature_anomaly": 0.55 },
   { "year": 2010, "sst_average": 27.0, "temperature_anomaly": 0.70 },
   { "year": 2020, "sst_average": 30.0, "temperature_anomaly": 0.99 }
];

// Draw function
function draw() {
   var r = 10;
   var margin = r * 2;

   // Extracting years and SSTs for scales
   var years = oceanData.map(function(d) { return d.year; });
   var sst = oceanData.map(function(d) { return d.sst_average; });

   // Defining the scale for x-axis
   var xScale = d3.scaleBand()
       .domain(years)
       .range([margin * 3, w - margin * 3])
       .padding(0.1);

   // Defining the scale for y-axis
   var yScale = d3.scaleLinear()
       .domain([d3.min(sst) - 1, d3.max(sst) + 1])
       .range([h - margin * 3, margin * 3]);

   // Adding circles for each data point
   var circles = svg.selectAll("circle")
       .data(oceanData)
       .enter()
       .append("circle")
       .attr("cx", function(d) { return xScale(d.year) + xScale.bandwidth() / 2; })
       .attr("cy", function(d) { return yScale(d.sst_average); })
       .attr("r", function(d){return d.temperature_anomaly * r * 5})
       .attr("fill", "white"); 

         // Adding x-axis
         svg.append("g")
         .attr("transform", "translate(0," + (h - margin * 3) + ")")
         .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

     // Adding y-axis
     svg.append("g")
         .attr("transform", "translate(" + (margin * 3) + ",0)")
         .call(d3.axisLeft(yScale));
 }

 // Initial draw call
 draw();