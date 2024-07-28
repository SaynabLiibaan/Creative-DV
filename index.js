// Data
const data1983 = [
    { year: 1982, SST: 20.05, month: 1, anomaly: -0.29 , season: "winter"},
    { year: 1982, SST: 20.05, month: 2, anomaly: 0.23, season: "winter"},
    { year: 1992, SST: 20.05, month: 3, anomaly: -0.26, season: "spring" },
    { year: 1982, SST: 20.05, month: 4, anomaly: 0.06, season: "spring" },
    { year: 1982, SST: 20.05, month: 5, anomaly: 0.03, season: "spring" },
    { year: 1982, SST: 20.05, month: 6, anomaly: -0.15 , season: "summer"},
    { year: 1982, SST: 20.05, month: 7, anomaly: 0.25 , season: "summer"},
    { year: 1982, SST: 20.05, month: 8, anomaly: -0.03 , season: "summer"},
    { year: 1982, SST: 20.05, month: 9, anomaly: 0.02 , season: "autumn"},
    { year: 1982, SST: 20.05, month: 10, anomaly: -0.14 , season: "autumn"},
    { year: 1982, SST: 20.05, month: 11, anomaly: -0.16 , season: "autumn"},
    { year: 1982, SST: 20.05, month: 12, anomaly: 0.64 , season: "winter"}
];

const width = 1000;
const height = 960;
const radius = 50;
const anomalyOffset = 100; // from circle to points
const circleRadius = 2;
const margin = { top: 20, right: 20, bottom: 50, left: 50 }; // Added space for axis labels

const svg = d3.select("#myVis").append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background-color", "black");

// Define scales
const xScale = d3.scaleLinear()
    .domain([1970, 2030])
    .range([margin.left, width - margin.right]);

const yScale = d3.scaleLinear()
    .domain([0, 40])
    .range([height - margin.bottom, margin.top]);

// Add x-axis
const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis)
    .selectAll("text")
    .style("fill", "white"); // Set text color to white

// Add x-axis label
svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - margin.bottom + 40)
    .attr("fill", "red")
    .style("text-anchor", "middle")
    .text("Years");

// Add y-axis
const yAxis = d3.axisLeft(yScale);
svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis)
    .selectAll("text")
    .style("fill", "white"); // Set text color to white

// Add y-axis label
svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", margin.left - 40)
    .attr("fill", "red")
    .style("text-anchor", "middle")
    .text("SST");

// Compute the center of the circle using the average SST and the year
const avgSST = d3.mean(data1983, d => d.SST);
const centerX = xScale(1982); // Year 1982 as per your data
const centerY = yScale(avgSST);

// Draw the central circle
svg.append("circle")
    .attr("cx", centerX)
    .attr("cy", centerY)
    .attr("r", radius)
    .attr("class", "circle")
    .style("stroke", "white");

// The points around the circle 
const angleScale = d3.scaleLinear()
    .domain([0, 12]) // Start from 0 to 12 for equal spacing
    .range([0, 2 * Math.PI]); // This starts from 0 to 2 * Math.PI

// Define anomaly scale to map anomaly values to distances from the circle's edge
const anomalyMax = d3.max(data1983, d => d.anomaly);

const anomalyScale = d3.scaleLinear()
    .domain([0, anomalyMax])
    .range([0, anomalyOffset]); // Adjust distance for the anomaly points


    var arrayColors = [...new Set(data1983.map(d => d.season))];

    var colorScale = d3.scaleOrdinal()
        .domain(arrayColors)
        .range(["blue", "green", "yellow", "orange"]); 
    

// Calculate points and draw them for data1983
const points1983 = data1983.map(d => {
    
    const angle = angleScale(d.month - 1); // Adjust to start from 0 for equal spacing
    
   
    const scaledRadius = radius + anomalyScale(d.anomaly); // Distance from center


    return {
        x: centerX + scaledRadius * Math.cos(angle),
        y: centerY + scaledRadius * Math.sin(angle),
        angle: angle,
        scaledRadius: scaledRadius,
        season: d.season 
    };
});

// Draw anomaly points for data1983
svg.selectAll(".anomaly-point-1983")
    .data(points1983)
    .enter()
    .append("circle")
    .attr("class", "anomaly-point-1983")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", circleRadius)
    .style("fill", d => colorScale(d.season));

// Calculate touching points on the central circle for data1983
const touchingPoints1983 = data1983.map(d => {
    const angle = angleScale(d.month - 1);
    return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        season: d.season 
    };
});

// Create path points that include both the central circle touching points and the anomaly points for data1983
const pathPoints1983 = touchingPoints1983.map((tp, i) => {
    const nextIndex = (i + 1) % touchingPoints1983.length;
    const nextTp = touchingPoints1983[nextIndex];
    const anomalyPoint = points1983[i];
    
    return [
        tp, // Touching point
        anomalyPoint, // Anomaly point
        nextTp // Next touching point
    ];
}).flat();



// Draw path connecting the points for data1983
const line = d3.line()
    .x(d => d.x)
    .y(d => d.y)
    .curve(d3.curveLinear); // Smooth curve

svg.append("path")
    .data([pathPoints1983])
    .attr("class", "line-1983")
    .attr("d", line)
    .style("stroke", function(d){ return colorScale(d.season)})
    .style("fill", "none");

// Set axis path color to white
svg.selectAll(".domain").style("stroke", "white");
svg.selectAll(".tick line").style("stroke", "white");


/*

// Repeat the same steps for data1990
const anomalyMax1990 = d3.max(data1990, d => d.anomaly);

const anomalyScale1990 = d3.scaleLinear()
    .domain([0, anomalyMax1990])
    .range([0, anomalyOffset]); // Adjust distance for the anomaly points

const points1990 = data1990.map(d => {
    const angle = angleScale(d.month - 1); // Adjust to start from 0 for equal spacing
    const scaledRadius = radius + anomalyScale1990(d.anomaly); // Distance from center
    return {
        x: centerX + scaledRadius * Math.cos(angle),
        y: centerY + scaledRadius * Math.sin(angle),
        angle: angle,
        scaledRadius: scaledRadius
    };
});

svg.selectAll(".anomaly-point-1990")
    .data(points1990)
    .enter()
    .append("circle")
    .attr("class", "anomaly-point-1990")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", circleRadius)
    .style("fill", "blue");

const touchingPoints1990 = data1990.map(d => {
    const angle = angleScale(d.month - 1);
    return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
    };
});

const pathPoints1990 = touchingPoints1990.map((tp, i) => {
    const nextIndex = (i + 1) % touchingPoints1990.length;
    const nextTp = touchingPoints1990[nextIndex];
    const anomalyPoint = points1990[i];
    
    return [
        tp, // Touching point
        anomalyPoint, // Anomaly point
        nextTp // Next touching point
    ];
}).flat();

svg.append("path")
    .data([pathPoints1990])
    .attr("class", "line-1990")
    .attr("d", line)
    .style("stroke", "blue")
    .style("fill", "none");
*/