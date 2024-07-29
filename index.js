const width = 1000;
const height = 960;
const radius = 50;
const anomalyOffset = 100; // from circle to points
const circleRadius = 2;
const transitionDuration = 2000; // transition duration in milliseconds
const years = [1982, 1992, 2002, 2012, 2022];

const svg = d3
  .select("#myVis")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .style("background-color", "black");

let oceanData = [];
d3.json("oceanData.json")
  .then(function (data) {
    oceanData = data;
    animate();
  })
  .catch(function (error) {
    console.error("Error loading the data:", error);
  });

function getSeasonColor(season) {
  if ((season === "winter")) {
    return "floralwhite";
  } else if ((season === "spring")) {
    return "yellow";
  } else if ((season === "summer")) {
    return "green";
  } else if ((season === "fall")) {
    return "brown";
  }
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
   const angleScale = d3.scaleLinear()
   .domain([0, 12]) // Start from 0 to 12 for equal spacing
   .range([-Math.PI / 2, 3 * Math.PI / 2]); // Start from -90 degrees to 270 degrees


    // Max anomaly for scaling
    const anomalyMax = d3.max(tempData, (d) => d.anomaly);

    const anomalyScale = d3
      .scaleLinear()
      .domain([0, anomalyMax])
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
      .attr("y", height/4) 
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
      .style("stroke", "red")
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
      .style("stroke", function (d) {
        return getSeasonColor(d.season);
        
      })
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
