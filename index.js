const width = 1000;
const height = 960;
const radius = 90;
const anomalyOffset = 100; // from circle to points
const circleRadius = 2 + 4;
const transitionDuration = 2000; // transition duration in milliseconds
const years = [1982, 1992, 2002, 2012, 2022];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


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
    const tempData = oceanData[yearIndex]; 
    console.log("tempData is: " + tempData);

    const avgSST = d3.mean(tempData, (d) => d.SST);
    const centerX = width / 2;
    const centerY = height / 2;

    var AverageSSTofYears = [];

    oceanData.forEach((d) => {
      if (d.length > 0) {
        AverageSSTofYears.push(d[0].SST);
      }
    });

    console.log("AverageSSTofYears: " + AverageSSTofYears);

    const minSST = d3.min(AverageSSTofYears);
    const maxSST = d3.max(AverageSSTofYears);

  
    const colorScale = d3.scaleLinear()
                        .domain([minSST, AverageSSTofYears[1], AverageSSTofYears[2], AverageSSTofYears[3], maxSST])
                        .range(["darkblue", "rgb(51, 70, 181)", "purple", "rgb(194, 62, 194)", "red"]);


    const angleScale = d3.scaleLinear()
      .domain([0, 12]) 
      .range([-Math.PI / 2, 3 * Math.PI / 2]); 


    
    const anomalyMax = d3.max(tempData, (d) => d.anomaly);

    const anomalyScale = d3
      .scaleLinear()
      .domain([0, anomalyMax])
      .range([0, anomalyOffset]); 

 
    const points = tempData.map((d) => {
      const angle = angleScale(d.month - 1); 
      const scaledRadius = radius + anomalyScale(d.anomaly); 

      return {
        month: d.month,
        season: d.season,
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
      .attr("y", height/4) 
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
      .style("stroke", "red")
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
      .style("stroke", function (d) {
        return getSeasonColor(d.season);
        
      })
      .style("fill", function (d) {
        return getSeasonColor(d.season);
      });

    anomalyPoints.exit().remove();

  
    var infoBox = svg.append("rect")
          .attr("class", "box")
          .attr("height", 20)
          .attr("width", 60)
          .style("fill", "rgba(255, 255, 255, 0.6)")
          .style("opacity", 0);

    var textBox = svg.append("text")
          .style("font-size", 12)
          .style("fill", "rgba(2, 38, 132, 0.91)")
          .style("stroke", "black")
          .style("stroke-width", "0.55px")
          .style("opacity", 0);

    

    function showInfo(x, y, d) {
        infoBox.transition()
                .duration(100)
                .style("opacity", 1)
                .attr("x", x + 10)
                .attr("y", y - 20);

        textBox.transition()
                .duration(100)
                .style("opacity", 1)
                .attr("x", x + 15)
                .attr("y", y - 5)
                .text(monthNames[d.month - 1]);
    }

    function hideInfo() {
        infoBox.transition()
                .duration('200')
                .style("opacity", 0);
        textBox.transition()
                .duration('200')
                .style("opacity", 0);
    }

    
    anomalyPoints.on("mouseover", function(event, d) {
          d3.select(this).transition()
            .duration("100")
            .attr("r", 10);
          showInfo(d.x, d.y, d)
        })
        anomalyPoints.on("mouseout", function(d) {
          d3.select(this).transition()
            .duration("100")
            .attr("r", circleRadius);
          hideInfo();
        })
   
    
    yearIndex = (yearIndex + 1) % years.length;
    setTimeout(update, transitionDuration);
  }

  update()
}

hideInfo();
