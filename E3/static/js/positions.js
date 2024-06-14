export { update_driver_pos_chart, init_pos_plot, update_driver_pos_first_lap, adjust_x_axis_pos_plot }

var y
var x
var svg
var line

var margin = { top: 40, right: 50, bottom: 40, left: 70 }
var width = window.innerWidth/2 ;
var height = window.innerHeight/2 - 100;

function init_pos_plot() {
    render_pos_chart()
}


// driver tooltip
const driver_tooltip = d3.select("body")
    .append("div")
    .attr("id", "driver_tooltip")
    .attr("class", "tooltip");

function render_pos_chart() {

    // append the svg object to the body of the page
    svg = d3.select("#pos_plot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")")
    
    // title
    svg.append("text")
            .attr("x", (width + margin.left + margin.right) / 2)
            .attr("y", -(margin.top - 25)) 
            .style("text-anchor", "middle")
            .style("font-size", "14px")
            .text("Drivers' positions per lap");
    
    // x axis label
    svg.append("text")
            .attr("x", (width + margin.left + margin.right) / 2)
            .attr("y",  height + 35) 
            .style("text-anchor", "middle")
            .style("font-size", "10px")
            .text("Lap number");

    // y axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height / 2)) 
        .attr("y", -margin.left + 20) 
        .style("text-anchor", "middle")
        .style("font-size", "10px")
        .text("Position");

    x = d3.scaleLinear()
        .domain([0, 100])
        .range([0, width])

    // append the x axis
    svg.append("g")
        .attr("class", "x-axis-pos")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x)
            .tickSizeOuter(0)
        )

    // scale y axis
    y = d3.scaleLinear()
        .domain([20.9, 1])
        .range([height, 0])

    // Append y axis
    svg.append("g")
        .attr("class", "y-axis-pos")
        .call(d3.axisLeft(y)
            .tickSizeOuter(0)  // Hides the outer tick on the axis
            .ticks(19)
            .tickPadding(10))  // Adjust padding between ticks and the axis
        .selectAll(".tick line")
        .classed("tick-line", true);  // Add class to tick lines

    svg.selectAll(".y-axis-pos .tick text")
        .attr("class", "ticks")

    svg.selectAll(".x-axis-pos .tick text")
        .attr("class", "ticks")


    line = d3.line()
        .x(d => x(d.lap))
        .y(d => y(d.pos));
}

function update_driver_pos_first_lap(year, round_number) {
    d3.json(`/get_lap_data/${year}/${round_number}/${1}`)
        .then(function (lap_data) {

            update_driver_pos_chart(year, round_number, 1)

            lap_data = Object.values(lap_data)

            svg.selectAll(".line-border")
                .data(lap_data)
                .enter()
                .append("path")
                .attr("class", "line-border")
                .attr("d", function (d) {
                    // Generate the line path string
                    return d3.line()
                        .x(function (d) { return x(d.lap); }) // Access the lap value
                        .y(function (d) { return y(d.pos); })(d.values); // Access the position value
                })
                .attr("stroke", "#636363") 
                .attr("stroke-width", 4.5)
                .style("fill", "none");

            svg.selectAll(".line")
                .data(lap_data)
                .enter()
                .append("path")
                .attr("class", "line")
                .attr("d", function (d) {
                    // Generate the line path string
                    return d3.line()
                        .x(function (d) { return x(d.lap); }) // Access the lap value
                        .y(function (d) { return y(d.pos); })(d.values); // Access the position value
                })
                .attr("stroke", d => d.color) // Set stroke color
                .attr("stroke-width", 4)
                .style("fill", "none")



            const lap_data_dots = lap_data.map(d => {
                return {
                    color: d.color,
                    lap: d.values[d.values.length - 1].lap,
                    pos: d.values[d.values.length - 1].pos,
                    first_name: d.first_name,
                    last_name: d.last_name,
                    team_name: d.team_name,
                    abbr: d.abbr
                };
            });


            svg.selectAll(".dots_line_plot")
                .data(lap_data_dots)
                .enter()
                .append("circle")
                .attr("class", "dots_line_plot")
                .attr("cx", function (d) { return x(d.lap); }) // Set the x position of the cycle marker
                .attr("cy", function (d) { return y(d.pos); }) // Set the y position of the cycle marker
                .attr("r", 5) // Set the radius of the cycle marker
                .style("fill", d => d.color)
                .style("stroke", "#636363")
                .style("stroke-width", 0.2)
                .on("mouseover", function (_, data) { // to do when the mouse hovers over
                    svg.selectAll("g.tick")
                        .filter(function (d) { return d == data["pos"] })
                        .style("font-size", "120%")
                        .classed("bold_tick", true)
                })
                .on("mouseout", function () {
                    d3.selectAll("g.tick.bold_tick")
                        .style("font-weight", "normal")
                        .style("font-size", "100%")
                        .classed("bold_tick", false)
                })
        })

}


function update_driver_pos_chart(year, round_number, lap) {
    d3.json(`/get_lap_data/${year}/${round_number}/${lap}`)
        .then(function (lap_data) {
            lap_data = Object.values(lap_data)

            svg.selectAll(".line-border")
                .data(lap_data)
                .attr("d", function (d) {
                    // Generate the line path string
                    return d3.line()
                        .x(function (d) { return x(d.lap); }) // Access the lap value
                        .y(function (d) { return y(d.pos); })(d.values); // Access the position value
                })

            svg.selectAll(".line")
                .data(lap_data)
                .attr("d", function (d) {
                    // Generate the line path string
                    return d3.line()
                        .x(function (d) { return x(d.lap); }) // Access the lap value
                        .y(function (d) { return y(d.pos); })(d.values); // Access the position value
                })
                .attr("stroke", d => d.color)


            const lap_data_dots = lap_data.map(d => {
                return {
                    color: d.color,
                    lap: d.values[d.values.length - 1].lap,
                    pos: d.values[d.values.length - 1].pos,
                    first_name: d.first_name,
                    last_name: d.last_name,
                    team_name: d.team_name,
                    abbr: d.abbr
                };
            });


            svg.selectAll(".dots_line_plot")
                .data(lap_data_dots)
                .attr("cx", function (d) { return x(d.lap); }) // Set the x position of the cycle marker
                .attr("cy", function (d) { return y(d.pos); }) // Set the y position of the cycle marker
                .style("fill", d => d.color)
                .on("mouseover", function (event, d) {
                    
                    svg.selectAll("g.tick")
                    .filter(function (data) { return data == d["pos"] })
                    .style("font-size", "120%")
                    .classed("bold_tick", true)

                    // Position tooltip above the dot
                    driver_tooltip
                        .style("left", `${x(d.lap)}px`- width - 100)
                        .style("top", `${y(d.pos)}px`)
                        .style("display", "block")
                        .html(`<span class="tooltip-bold">${d.first_name}, ${d.last_name}</span><br>
                              <span class="tooltip-regular">${d.team_name}</span>`);
                })
                .on("mouseout", function () {
                    driver_tooltip.style("display", "none");
                    d3.selectAll("g.tick.bold_tick")
                    .style("font-weight", "normal")
                    .style("font-size", "100%")
                    .classed("bold_tick", false)
                });

            svg.selectAll(".dot_labels")
            .data(lap_data_dots)
            .join("text") 
            .attr("class", "dot_labels")
            .attr("x", function(d) { return x(d.lap) + 8; }) 
            .attr("y", function(d) { return y(d.pos) + 4; }) 
            .text(function(d) { return `${d.abbr}`; }); 
        })
}

function adjust_x_axis_pos_plot(total_laps) {
    x.domain([0, total_laps])

    svg.select(".x-axis-pos")
        .transition()
        .duration(300)
        .call(d3.axisBottom(x)
            .tickSizeOuter(0)
            .tickFormat(d3.format("d")))


    svg.selectAll("g.tick text")
        .attr("class", "ticks")

    svg.selectAll("g.tick text")
        .attr("class", "ticks")
}
