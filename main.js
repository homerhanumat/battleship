d3.select("#the-body").append("svg")
  .attr("width", 500).attr("height", 500)
  .attr("id", "drop-area");

document.getElementById("drop-area").addEventListener("click", function(e) {
  let target = e.target;
  let dim = target.getBoundingClientRect();
  let x = e.clientX - dim.left;
  let y = e.clientY - dim.top;
  console.log("click");
  const radius = document.getElementById("radius").value; 
  d3.select("#drop-area")
  .append("svg:circle") //attach circle from d3js library
  .attr("stroke", "black") //border color
  .attr("fill", "lightgrey") //color of inside of circle
  .attr("r", radius) //radius
  .attr("cx", x) //x-coordinate of center of circle
  .attr("cy", y) //y-coordinate of center of circle
});
