const width = window.innerWidth;
const height = window.innerHeight;
const radius = 100;
const anomalyOffset = 100; // from circle to points
const circleRadius = 3;
const transitionDuration = 2000; // transition duration in milliseconds
const years = [1982, 1992, 2002, 2012, 2022];

const svg = d3
  .select("#myVis")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .style("background-color", "black")
  .style("margin", 0)
  .style("padding", 0)

let oceanData = [];
d3.json("oceanData.json")
  .then(function (data) {
    oceanData = data;
    animate();
    legend();
  })
  .catch(function (error) {
    console.error("Error loading the data:", error);
  });

//https://htmlcolorcodes.com/color-picker/
function getSeasonColor(season) {
  if (season === "winter") {
    return "#4682B4";
  } else if (season === "spring") {
    return "#FCF55F";
  } else if (season === "summer") {
    return "#4CBB17";
  } else if (season === "fall") {
    return "#F08000";
  }
}

function legend() {
  var months = [
    "Winter months: December, January, February",
    "Spring months: March, April, May",
    "Summer months: June, July, August",
    "Fall months: September, October, November",
  ];
  var colors = ["#4682B4", "#FCF55F", "#4CBB17", "#F08000"];
  // Create and style the button
  const button = d3
    .select("body")
    .append("button")
    .attr("id", "toggleLegend")
    .text("Toggle Legend")
    .style("position", "absolute")
    .style("top", "20px")
    .style("left", "20px")
    .style("padding", "10px 20px")
   // .style("z-index", 1000);

  // https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform

  //Did not know how to access the height variable, so just formatted a string for the translate attribute
  //Initial hidden position
  var translateString = "translate(0, " + height + ")"
  //Position when shown
  var translateStringOut = "translate(0, " + (height-300) + ")"

  var annotationText = 
    "The colored points represent anomalies in the average global land temperature of each month in the relevant year. " +
    "The position of the anomaly points are relative to the outline of the bigger circle. " +
    "Any points located on top of the circle's outline have temperature anomaly of 0 degrees celcius. " +
    "Points outside the circle represent positive celcius degrees, while points inside the circle represent negative celcius degrees. " +
    "Hover the points to see specific information."
  
  const legendContainer = svg
    .append("g")
    .attr("id", "legendContainer")
    .attr("transform", translateString) // Position it off-screen initially
    .style("transition", "transform 0.5s"); // CSS transition for sliding

  legendContainer
  .append("foreignObject")
  .attr("width",400)
  .attr("height",200)
  .attr("x", 100)
  .attr("y", 100)
  .append("xhtml:div")
  .style("font-size", "16px")
  .style("color", "white")
  .style("overflow", "hidden")
  .text(annotationText);

  // Add the circles to the legend
  legendContainer
    .selectAll("anomalyCircles")
    .data(months)
    .enter()
    .append("circle")
    .attr("cx", width/2)
    .attr("cy", function (d, i) {
      return 100 + i * 30;
    })
    .attr("r", 7)
    .style("fill", function (d, i) {
      return colors[i];
    });

  // Add the labels to the legend
  legendContainer
    .selectAll("anomalyLabel")
    .data(months)
    .enter()
    .append("text")
    .attr("x", width/2 + 20)
    .attr("y", function (d, i) {
      return 100 + i * 30;
    })
    .style("fill", function (d, i) {
      return colors[i];
    })
    .text(function (d) {
      return d;
    })
    .attr("text-anchor", "left")
    .style("font-size", "16px")
    .style("alignment-baseline", "middle");

  // Toggle legend visibility on button click
  button.on("click", function () {
    if (legendContainer.classed("visible")) {
      legendContainer
        .classed("visible", false)
        .attr("transform", translateString); // Move off-screen
    } else {
      legendContainer
        .classed("visible", true)
        .attr("transform", translateStringOut); // Move on-screen
    }
  });
}

function animate() {
  let yearIndex = 0;

  function update() {
    const tempData = oceanData[yearIndex]; // Access the data for the current year
    console.log(tempData);

    const avgSST = d3.mean(tempData, (d) => d.SST);
    const centerX = width / 2;
    const centerY = height / 2;

    //Retrieve the SST's for each year and put into an array for domain.
    var AverageSSTofYears = [];

    oceanData.forEach((d) => {
      if (d.length > 0) {
        // First months SST of the year, since the SST is the same for every month
        AverageSSTofYears.push(d[0].SST);
      }
    });

    console.log(AverageSSTofYears);

    const minSST = d3.min(AverageSSTofYears);
    const maxSST = d3.max(AverageSSTofYears);

    // Color scale for SST
    const colorScale = d3
      .scaleLinear()
      .domain([minSST, maxSST]) // Adjust the domain based on the SST range
      .range(["blue", "red"]); // Blue for cold, red for hot

    // Angle scale for positioning points around the circle, with 0 degrees at the top
    const angleScale = d3
      .scaleLinear()
      .domain([0, 12]) // Start from 0 to 12 for equal spacing
      .range([-Math.PI / 2, (3 * Math.PI) / 2]); // Start from -90 degrees to 270 degrees

    // Max anomaly for scaling
    const anomalyMax = d3.max(tempData, (d) => d.anomaly);

    const anomalyScale = d3
      .scaleLinear()
      .domain([0, 2.01]) //change this to 2.01
      .range([0, anomalyOffset]); // This is from 0 to 100 which is how far from the circle it can be

    // Calculate points for the current year
    const points = tempData.map((d) => {
      const angle = angleScale(d.month - 1); // Adjust to start from 0 for equal spacing
      const scaledRadius = radius + anomalyScale(d.anomaly); // Distance from center

      return {
        season: d.season,
        x: centerX + scaledRadius * Math.cos(angle),
        y: centerY + scaledRadius * Math.sin(angle),
        angle: angle,
        scaledRadius: scaledRadius,
      };
    });

    const label = svg.selectAll(".label").data([years[yearIndex]]); // Use the current year as data

    // Enter selection for adding new labels
    label
      .enter()
      .append("text")
      .attr("class", "label")
      .merge(label)
      .attr("x", width / 2)
      .attr("y", height / 4)
      .style("fill", "white")
      .style("font-size", "40px")
      .style("text-anchor", "middle")
      .text(years[yearIndex]); // Update the text after fading out

    // Update central circle
    const circle = svg.selectAll(".circle").data([avgSST]);
    circle
      .enter()
      .append("circle")
      .attr("class", "circle")
      .merge(circle)
      .transition()
      .duration(transitionDuration)
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", radius)
      .style("stroke", "white")
      .style("fill", colorScale(avgSST));

    // Update anomaly points
    const anomalyPoints = svg.selectAll(".anomaly-point").data(points);

    anomalyPoints
      .enter()
      .append("circle")
      .attr("class", "anomaly-point")
      .merge(anomalyPoints)
      .transition()
      .duration(transitionDuration)
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", circleRadius)
      .style("stroke", "black")
      .style("fill", function (d) {
        return getSeasonColor(d.season);
      });

    anomalyPoints.exit().remove();

    // Schedule the next update
    yearIndex = (yearIndex + 1) % years.length;
    setTimeout(update, transitionDuration);
  }

  update();
}
