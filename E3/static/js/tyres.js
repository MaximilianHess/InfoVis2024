export { init_tyre_plot, update_tyre_plot, update_tyre_plot_first_lap, adjust_x_axis_tyre_plot };




var margin = { top: 100, right: 50, bottom: 50, left: 50 },
    width = 1000 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom

const default_year = 2020
const default_round = 1
const default_lap = 40

// global scale because it makes it easier to adjust 
var x, y

const compound_colors = {
    'SOFT': '#FF0100',
    'MEDIUM': '#FFEA00',
    'HARD': 'white',
    'INTERMEDIATE': '#0DBD00',
    'WET': '#007BE1'
}


function init_tyre_plot() {
    render_tyre_plot()
}



function render_tyre_plot() {


    //const tyre_data = fetch_tyre_data(default_year, default_round, default_lap)
    //const stacked_data = stack_data(tyre_data)
    //const height = caluculate_height_of_plot(stacked_data)

    let svg = d3.select("#tyre_plot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")")

    x = d3.scaleLinear()
        .domain([0, 100])
        .range([0, width]);

    y = d3.scaleBand()
        .domain([0, 20])
        .range([height, 0])
        .padding(0.2)

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x)
            .tickSizeOuter(0)
            .tickFormat(d3.format("d"))
        );

    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y)
            .tickSizeOuter(0)
        );

    /*     const color = get_color_scale()
    
    
        svg.append("g")
            .selectAll()
            .data(stacked_data)
            .join("g")
            .attr("fill", d => color(d.key))
            .selectAll("rect")
            .data(D => D.map(d => (d.key = D.key, d)))
            .join("rect")
            .attr("x", d => x(d[0]))
            .attr("y", d => y(d.data[0]))
            .attr("height", y.bandwidth())
            .attr("width", d => x(d[1]) - x(d[0])) */
}


function update_tyre_plot(year, round_number, lap) {
    d3.json(`/get_tyre_data/${year}/${round_number}/${lap-1}`).then(function (data) {
        // Assuming data is an object with keys as drivers (ALB, BOT, GAS, ...)
        const tyre_data = Object.values(data); // Extract values (lap data) from the object

        console.log(tyre_data);


        // Select the SVG element
        const svg = d3.select("#tyre_plot").select("svg").select("g");
        svg.selectAll("rect")
            .remove();

        svg.selectAll("rect")
            .data(tyre_data)
            .enter()
            .append("rect")
            .attr("x", function (d) { return x(d["first_lap_stint"]) }) // x axis with the team names
            .attr("y", function (d) { return y(d["Driver"]) })    // y axis with the metrics
            .attr("width", d => x(d["last_lap_stint"]+1) - x(d["first_lap_stint"]))
            .attr("height", y.bandwidth())
            .attr("class", "square")
            .attr("rx", 2)
            .attr("ry", 2)
            .style("fill", function (d) { return compound_colors[d["compound"]] }) // fill the rectangles based on the value according to the color scale
            .style("stroke", "black")  // Border color
            .style("stroke-width", 1);  // Border thickness
    });
}


function update_tyre_plot_first_lap(year, round_number) {
    d3.json(`/get_tyre_data/${year}/${round_number}/${1}`).then(function (data) {

        // Assuming data is an object with keys as drivers (ALB, BOT, GAS, ...)
        const tyre_data = Object.values(data); // Extract values (lap data) from the object


        // Extract all drivers from the first entry (assuming all entries have the same drivers)
        var all_drivers = new Set();

        // Iterate through array and add each driver to Set
        tyre_data.forEach(item => {
            all_drivers.add(item.Driver);
        });

        all_drivers = Array.from(all_drivers).sort();


        // Select the SVG element
        const svg = d3.select("#tyre_plot").select("svg").select("g");

        // Update y scale domain based on the new drivers list
        y = d3.scaleBand()
            .domain(all_drivers)
            .range([height, 0])
            .padding(0.2);

        // Update y axis
        svg.select(".y-axis")
            .transition()
            .duration(500)
            .call(d3.axisLeft(y).tickSizeOuter(0))

        svg.selectAll("rect")
            .remove();

        svg.selectAll("rect")
            .data(tyre_data)
            .enter()
            .append("rect")
            .attr("x", function (d) { return x(d["first_lap_stint"]) }) // x axis with the team names
            .attr("y", function (d) { return y(d["Driver"]) })    // y axis with the metrics
            .attr("width", d => x(d["last_lap_stint"]+0.5) - x(d["first_lap_stint"]))
            .attr("height", y.bandwidth())
            .attr("class", "square")
            .attr("rx", 2)
            .attr("ry", 2)
            .style("fill", function (d) { return compound_colors[d["compound"]] }) // fill the rectangles based on the value according to the color scale
            .style("stroke", "black")  // Border color
            .style("stroke-width", 1);  // Border thickness
    });
}

function adjust_x_axis_tyre_plot(total_laps) {

    const svg = d3.select("#tyre_plot").select("svg").select("g");

    x = d3.scaleLinear()
        .domain([0, total_laps])
        .range([0, width])
    svg.select(".x-axis")
        .transition()
        .duration(300)
        .call(d3.axisBottom(x)
            .tickSizeOuter(0)
            .tickFormat(d3.format("d")))
}
