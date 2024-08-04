const width = window.innerWidth;
const height = window.innerHeight;
const radius = 100;
const anomalyOffset = 100; // from circle to points
const circleRadius = 3;
const transitionDuration = 2000; // transition duration in milliseconds
const years = [1982, 1992, 2002, 2012, 2022];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const svg = d3
  .select("#myVis")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .style("background-color", "black")
  .style("margin", 0)
  .style("padding", 0);

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

  // https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform
  //Did not know how to access the height variable, so just formatted a string for the translate attribute
  //Initial hidden position
  var translateString = "translate(0, " + height + ")";
  //Position when shown
  var translateStringOut = "translate(0, " + (height - 300) + ")";

  var annotationText =
    "The color of the big circle represents the average Sea Surface Temperature for the year, and shows a change for each year. " + 
    "The colored points represent anomalies in the average global land temperature of each month in the relevant year. " +
    //"The position of the anomaly points are relative to the outline of the bigger circle. " +
    "Any points located on top of the circle's outline have temperature anomaly of 0 degrees celsius. " +
    "Points outside the circle represent positive celsius degrees, while points inside the circle represent negative celsius degrees. " +
    "Hover the points to see specific information.";

  const legendContainer = svg
    .append("g")
    .attr("id", "legendContainer")
    .attr("transform", translateString) 
    .style("transition", "transform 0.5s");

  legendContainer
    .append("foreignObject")
    .attr("width", width / 3)
    .attr("height", 200)
    .attr("x", 100)
    .attr("y", 95)
    .append("xhtml:div")
    .style("font-size", "16px")
    .style("color", "white")
    .style("overflow", "hidden")
    .style("padding", 0)
    .style("margin", 0)
    .text(annotationText);

  // Circle colors for the months
  legendContainer
    .selectAll("anomalyCircles")
    .data(months)
    .enter()
    .append("circle")
    .attr("cx", width / 2)
    .attr("cy", function (d, i) {
      return 100 + i * 30;
    })
    .attr("r", 7)
    .style("fill", function (d, i) {
      return colors[i];
    });

  //Color labels description
  legendContainer
    .selectAll("anomalyLabel")
    .data(months)
    .enter()
    .append("text")
    .attr("x", width / 2 + 20)
    .attr("y", function (d, i) {
      return 100 + i * 30;
    })
    // .style("fill", function (d, i) {
    //   return colors[i];
    // })
    .style("fill", "white")
    .text(function (d) {
      return d;
    })
    .attr("text-anchor", "left")
    .style("font-size", "16px")
    .style("alignment-baseline", "middle");

  // Legend visibility on button click
  svg.on("click", function () {
    if (legendContainer.classed("visible")) {
      legendContainer
        .classed("visible", false)
        .attr("transform", translateString); // Move
    } else {
      legendContainer
        .classed("visible", true)
        .attr("transform", translateStringOut); // Move on-screen
    }
  });

  //https://www.freshconsulting.com/insights/blog/d3-js-gradients-the-easy-way/
  var gradient = legendContainer
    .append("defs")
    .append("linearGradient")
    .attr("id", "idGradient")
    .attr("x1", "0%")
    .attr("x2", "0%")
    .attr("y1", "100%")
    .attr("y2", "0%");

  gradient
    .append("stop")
    .attr("class", "start")
    .attr("offset", "0%")
    .attr("stop-color", "darkblue")
    .attr("stop-opacity", 1);

  gradient
    .append("stop")
    .attr("class", "end")
    .attr("offset", "100%")
    .attr("stop-color", "red")
    .attr("stop-opacity", 1);

  var colorBar = legendContainer
    .append("rect")
    .attr("x", width - 200)
    .attr("y", 110)
    .attr("width", 50)
    .attr("height", 70)
    //.attr("stroke", "url(#idGradient)")
    .attr("fill", "url(#idGradient)");

  var hottestSST = legendContainer
    .append("text")
    .attr("x", width - 175)
    .attr("y", 100)
    .text("20.65 °C")
    .style("fill", "white")
    .style("font-size", "14px")
    .style("text-anchor", "middle");

  var coldestSST = legendContainer
    .append("text")
    .attr("x", width - 175)
    .attr("y", 200)
    .text("20.05 °C")
    .style("fill", "white")
    .style("font-size", "14px")
    .style("text-anchor", "middle");
}

function animate() {
  let yearIndex = 0;

  function update() {
    const tempData = oceanData[yearIndex];
    const avgSST = d3.mean(tempData, (d) => d.SST);
    const centerX = width / 2;
    const centerY = height / 2;

    var AverageSSTofYears = [];

    oceanData.forEach((d) => {
      if (d.length > 0) {
        AverageSSTofYears.push(d[0].SST);
      }
    });

    const minSST = d3.min(AverageSSTofYears);
    const maxSST = d3.max(AverageSSTofYears);

    const colorScale = d3.scaleLinear()
      .domain([minSST, maxSST])
      .range(["darkblue", "red"]);

    // Angle scale for positioning points around the circle, with 0 degrees at the top
    const angleScale = d3
      .scaleLinear()
      .domain([0, 12]) // Start from 0 to 12 for equal spacing
      .range([-Math.PI / 2, (3 * Math.PI) / 2]); // Start from -90 degrees to 270 degrees

    const anomalyMax = d3.max(tempData, (d) => d.anomaly);

    const anomalyScale = d3
      .scaleLinear()
      .domain([0, 2.01]) //change this to 2.01
      .range([0, anomalyOffset]); // This is from 0 to 100 which is how far from the circle it can be

    const points = tempData.map((d) => {
      const angle = angleScale(d.month - 1);
      const scaledRadius = radius + anomalyScale(d.anomaly);

      return {
        month: d.month,
        season: d.season,
        anomaly: d.anomaly,
        x: centerX + scaledRadius * Math.cos(angle),
        y: centerY + scaledRadius * Math.sin(angle),
        angle: angle,
        scaledRadius: scaledRadius,
      };
    });

    const label = svg.selectAll(".label").data([years[yearIndex]]);

    label
      .enter()
      .append("text")
      .attr("class", "label")
      .merge(label)
      .attr("x", width / 2)
      .attr("y", height / 5)
      .style("fill", "white")
      .style("font-size", "40px")
      .style("text-anchor", "middle")
      .text(years[yearIndex]);

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


    //creating infobox and adding its attributes
    var infoBox = svg.selectAll(".info-box").data([null]);

    infoBox.enter()
      .append("rect")
      .attr("class", "info-box")
      .attr("height", 30)
      .attr("width", 100)
      .style("fill", "rgba(255, 255, 255, 0.6)")
      .style("opacity", 0)
      .merge(infoBox);


    //creating the textbox inside the infobox and adding its attributes (this is the one for the months)
    var monthText = svg.selectAll(".month-text").data([null]);

    monthText.enter()
      .append("text")
      .attr("class", "month-text")
      .style("font-size", 12)
      .style("fill", "rgba(2, 38, 132, 0.91)")
      .style("stroke", "black")
      .style("stroke-width", "0.55px")
      .style("opacity", 0)
      .merge(monthText);


    //creating the textbox inside the infobox and adding its attributes (this is the one for the anomaly)
    var anomalyText = svg.selectAll(".anomaly-text").data([null]);

    anomalyText.enter()
      .append("text")
      .attr("class", "anomaly-text")
      .style("font-size", 12)
      .style("fill", "rgba(2, 38, 132, 0.91)")
      .style("stroke", "black")
      .style("stroke-width", "0.55px")
      .style("opacity", 0)
      .merge(anomalyText);

    
    //function that makes the infobox transition and displays both the month and the anomaly text
    function showInfo(x, y, d) {
      infoBox.transition()
        .duration(100)
        .style("opacity", 1)
        .attr("x", x + 10)
        .attr("y", y - 35);

      monthText.transition()
        .duration(100)
        .style("opacity", 1)
        .attr("x", x + 15)
        .attr("y", y - 25)
        .text(monthNames[d.month - 1]);

      anomalyText.transition()
        .duration(100)
        .style("opacity", 1)
        .attr("x", x + 15)
        .attr("y", y - 10)
        .text("Anomaly: " + d.anomaly)
    }


    //function that hides the infobox by making the opacity of the box 0
    function hideInfo() {
      infoBox.transition()
        .duration(200)
        .style("opacity", 0);
      monthText.transition()
        .duration(200)
        .style("opacity", 0);
      anomalyText.transition()
        .duration(200)
        .style("opacity", 0);
    }


    //mouseevent on the anomaly points which triggers the showInfo function when it's a 'mouseover' event and triggers the hideInfo when it's a 'mouseout' event
    anomalyPoints.on("mouseover", function (event, d) {
      d3.select(this).transition()
        .duration(100)
      showInfo(d.x, d.y, d);
    })
    .on("mouseout", function () {
      d3.select(this).transition()
        .duration(100)
      hideInfo();
    });

    yearIndex = (yearIndex + 1) % years.length;
    setTimeout(update, transitionDuration);
  }

  update();
}


