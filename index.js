const width = 1000;
const height = 960;
const radius = 50;
const anomalyOffset = 100; // from circle to points
const circleRadius = 2;
const transitionDuration = 2000; // transition duration in milliseconds
const years = [1982, 1992, 2002, 2012, 2022];

const svg = d3.select("#myVis").append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background-color", "black");

let oceanData = [];
d3.json("oceanData.json")
    .then(function(data) {
        oceanData = data;
        animate();
    })
    .catch(function(error) {
        console.error('Error loading the data:', error);
    });

function animate() {
    let yearIndex = 0;

    function update() {
        const tempData = oceanData[yearIndex]; // Access the data for the current year
        console.log(tempData);

        const avgSST = d3.mean(tempData, d => d.SST);
        const centerX = width / 2;
        const centerY = height / 2;

        // This is the color scale for SST
        const colorScale = d3.scaleLinear()
            .domain([0, 40]) // the SST range - it can change here maybe smaller range?
            .range(["blue", "red"]); // just change the colors of what suits you honeyyy

        // Angle scale for positioning points around the circle
        const angleScale = d3.scaleLinear()
        .domain([0, 12]) // Start from 0 to 12 for equal spacing
        .range([-Math.PI / 2, 3 * Math.PI / 2]);
        // Max anomaly for scaling
        const anomalyMax = d3.max(tempData, d => d.anomaly);

        const anomalyScale = d3.scaleLinear()
            .domain([0, anomalyMax])
            .range([0, anomalyOffset]); // this is from 0 to 100 which is how far from the circle it can be, not too long honey

        // Calculate points for the current year
        const points = tempData.map(d => {
            const angle = angleScale(d.month - 1); // Adjust to start from 0 for equal spacing
            const scaledRadius = radius + anomalyScale(d.anomaly); // Distance from center

            return {
                x: centerX + scaledRadius * Math.cos(angle),
                y: centerY + scaledRadius * Math.sin(angle),
                angle: angle,
                scaledRadius: scaledRadius
            };
        });

        // Update central circle - mainly the color change, but it happens before 
        const circle = svg.selectAll(".circle")
            .data([avgSST]);

        // the central circle 
        circle.enter()
            .append("circle")
            .attr("class", "circle")
            .merge(circle)
            .transition()
            .duration(transitionDuration)
            .attr("cx", centerX)
            .attr("cy", centerY)
            .attr("r", radius)
            .style("stroke", "red")
            .style("fill", colorScale(avgSST));

        // Update anomaly points - here the points change according to new data
        const anomalyPoints = svg.selectAll(".anomaly-point")
            .data(points);

        // the points are drawn
        anomalyPoints.enter()
            .append("circle")
            .attr("class", "anomaly-point")
            .merge(anomalyPoints)
            .transition()
            .duration(transitionDuration)
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("r", circleRadius)
            .style("fill", "red");

        anomalyPoints.exit().remove();

        // next update, for new data according to the new year
        yearIndex = (yearIndex + 1) % years.length;
        setTimeout(update, transitionDuration);
    }

    update();
}
