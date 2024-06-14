export { init_circuit, update_race_data_and_race, set_circuit_from_globe }
import { update_driver_pos_chart, update_driver_pos_first_lap, adjust_x_axis_pos_plot } from "./positions.js";
import { update_tyre_plot, update_tyre_plot_first_lap, adjust_x_axis_tyre_plot } from "./tyres.js";

// Global Variables
var driver_dots, x_scale, y_scale, race_interval, line_circuit, svg, width, height, race_data, total_laps, last_index
var global_index = 0
var race_restart = false
var selected_round = 1
var selected_year = 2020
var max_width_or_height = window.innerWidth/2;
var animation_speed = 270
var global_circuit_data
var current_lap = 1
var current_leader = 1


function init_circuit(circuit_data) {
    global_circuit_data = circuit_data
    update_race_data_and_race(selected_year, selected_round)
    update_driver_pos_first_lap(selected_year, selected_round)
    calculate_width_and_height(circuit_data)
    render_circuit()
    set_circuit(circuit_data)
}

var margin = { top: 50, right: 50, bottom: 50, left: 50 }

function render_circuit() {

    let circuit_data = global_circuit_data.filter(function (d) {
        return (d["round_number"] == selected_round && d["year"] == selected_year)
    })

    svg = d3.select("#circuit")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("id", "circuit_plot")
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")")



    x_scale = d3.scaleLinear()
        .domain(d3.extent(circuit_data, function (d) { return d["x"] }))
        .range([0, width])


    // append the x axis
    /*svg.append("g")
        .attr("class", "xAxis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x_scale)
            .tickSizeOuter(0)
            .tickFormat(d3.format("d")) // format the years stores as integers to show like "2,000" -> "2000"
        )
*/

    y_scale = d3.scaleLinear()
        .domain(d3.extent(circuit_data, function (d) { return d["y"] }))
        .range([height, 0])

    // append y axis
    /*svg.append("g")
        .attr("class", "yAxis")
        .call(d3.axisLeft(y_scale)
            .tickSizeOuter(0))*/

    line_circuit = svg
        .append("g")
        .append("path")
        .datum(circuit_data)
        .attr("stroke", "#636363")
        .style("stroke-width", 6)
        .style("fill", "none")
        .attr("d", d3.line()
            .x(function (d) { return x_scale(d["x"]) })
            .y(function (d) { return y_scale(d["y"]) })
        )

    // append the title
    svg.append("text")
        .attr("x", width / 2) // centered horizontally
        .attr("y", -20)
        .style("text-anchor", "middle")
        .style("font-size", "16px")
        .text(window.selectedCircuit_global + " " + window.selectedYear_global);

    // TODO: This button has to be redone for the final design
    d3.select("#start_race").on("click", start_race)
    d3.select("#stop_race").on("click", stop_race)
    d3.select("#resume_race").on("click", resume_race)
}



function start_race() {
    stop_race()

    const lap_slider = document.getElementById("lapSlider");
    lap_slider.value = 1    

    const speed_slider = document.getElementById("speedSlider")
    speed_slider.value = -270
    animation_speed = 270

    init_lap_counter_and_slider(race_data)
    driver_dots
        .attr("cx", d => x_scale(d.positions[0].x))
        .attr("cy", d => y_scale(d.positions[0].y))

    animate_race(0)

}

function stop_race() {
    clearInterval(race_interval)
}

function resume_race() {
    stop_race()
    animate_race(global_index)
}


function animate_race(index) {

    function update(i) {
        try {
            driver_dots.transition()
                .duration(animation_speed)
                .ease(d3.easeLinear)  // Use linear easing function
                .attr("cx", d => x_scale(d.positions[i].x))
                .attr("cy", d => y_scale(d.positions[i].y))

        } catch (TypeError) {
            stop_race()
        }

    }


    race_interval = setInterval(() => {
        index = index + 1
        update(index)
        update_lap(index)
        global_index = index

    }, animation_speed);

}

function set_circuit_from_globe(sel_year, sel_round) {
    selected_round = sel_round
    selected_year = sel_year
    update_circuit()
    update_race_data_and_race(selected_year, selected_round)
}

function set_circuit() {
    d3.select("#selectCircuit").on("change", function (d) {
        selected_round = d3.select(this).property("value")
        update_circuit()
        update_race_data_and_race(selected_year, selected_round)
    })

    d3.select("#select_year").on("change", function (d) {
        selected_year = d3.select(this).property("value")
        update_circuit()
        update_race_data_and_race(selected_year, selected_round)
    })
}

function update_circuit() {
    var filtered_circuit_data = global_circuit_data.filter(function (d) {
        return (d["round_number"] == selected_round && d["year"] == selected_year)
    })
    calculate_width_and_height(global_circuit_data)
    update_driver_pos_first_lap(selected_year, selected_round)
    update_tyre_plot_first_lap(selected_year, selected_round)

    const lap_slider = document.getElementById("lapSlider");
    lap_slider.value = 1
    lap_slider.max = total_laps

    const speed_slider = document.getElementById("speedSlider")
    speed_slider.value = -270

    global_index = 0

    d3.select('#circuit').selectAll("*").remove();
    render_circuit()

    x_scale.domain(d3.extent(filtered_circuit_data, function (d) { return d["x"] }))
    y_scale.domain(d3.extent(filtered_circuit_data, function (d) { return d["y"] }))

    /*svg.select(".yAxis")
        .call(d3.axisLeft(y_scale)
            .tickSizeOuter(0))

    svg.select(".xAxis")
        .call(d3.axisBottom(x_scale)
            .tickSizeOuter(0))*/


    line_circuit
        .datum(filtered_circuit_data)
        .attr("d", d3.line()
            .x(function (d) { return x_scale(d["x"]) })
            .y(function (d) { return y_scale(d["y"]) })
        )
}

// Define a function to update data based on selected year
function update_race_data_and_race(selected_year, selected_round) {
    d3.json(`/update_race_data/${selected_year}/${selected_round}`)
        .then(function (race_data) {
            init_lap_counter_and_slider(race_data)
            set_race_global_race_data(race_data)
            update_race(race_data)
        })
        .catch(function (error) {
            console.error("Error updating data:", error);
        });
}

// driver tooltip
const driver_tooltip = d3.select("body")
    .append("div")
    .attr("id", "driver_tooltip")
    .attr("class", "tooltip");

function update_race(race_data) {
    stop_race();
    svg.selectAll("circle").remove();

  driver_dots = svg.selectAll("circle")
    .data(race_data)
    .enter()
    .append("circle")
    .attr("stroke", "#636363")
    .attr("stroke-width", 0.1)
    .attr("cx", d => x_scale(d.positions[0].x))
    .attr("cy", d => y_scale(d.positions[0].y))
    .attr("r", 6)
    .style("fill", d => `#${d.team_color}`)
    .on("mouseover", function(event, d) {
        // Calculate the tooltip position
        const [x, y] = d3.pointer(event);
        driver_tooltip
            .style("left", `${x + 30}px`)
            .style("top", `${y + 10}px`)  
            .style("display", "block")
            .html(`<span class="tooltip-bold"></span> ${d.abbreviation}`);
    })
    .on("mouseout", function() {
        driver_tooltip.style("display", "none");
    });
}


function calculate_width_and_height(circuit_data) {

    var filtered_circuit_data = circuit_data.filter(function (d) {
        return (d["round_number"] == selected_round && d["year"] == selected_year)
    })

    var ratio = (d3.max(filtered_circuit_data, d => d["x"]) - d3.min(filtered_circuit_data, d => d["x"])) / (d3.max(filtered_circuit_data, d => d["y"]) - d3.min(filtered_circuit_data, d => d["y"]))
    if (ratio >= 1) {
        width = (max_width_or_height - margin.left - margin.right)
        height = Math.round(max_width_or_height / ratio - margin.top - margin.bottom)

    }

    else {
        width = Math.round(max_width_or_height * ratio - margin.left - margin.right)
        height = (max_width_or_height - margin.top - margin.bottom)
    }
}



function set_race_global_race_data(rd) {
    race_data = rd
}

function init_lap_counter_and_slider(rd) {


    var allLaps = rd.flatMap(d => d.lap)
    var lapNumbers = allLaps.map(lap => lap.LapNumber);
    total_laps = d3.max(lapNumbers);

    adjust_x_axis_pos_plot(total_laps)
    adjust_x_axis_tyre_plot(total_laps)

    d3.select("#lap_display").text(`Lap 1/${total_laps}`)

    d3.select("#lapSlider")
        .attr("max", total_laps)
        .on("input", function () {
            stop_race()
            update_animation_lap(this.value)
            resume_race()
        })

    d3.select("#speedSlider")
        .on("input", function () {
            stop_race()
            animation_speed = -this.value;
            resume_race()
        })
}
function update_lap(index) {
    function update(driver_index) {
        current_leader = driver_index;
        current_lap = race_data[driver_index]["lap"][index]["LapNumber"];


    const lap_slider = document.getElementById("lapSlider");
    lap_slider.value = current_lap    


        d3.select("#lap_display").text(`Lap ${current_lap}/${total_laps}`);
        update_driver_pos_chart(selected_year, selected_round, current_lap);
        update_tyre_plot(selected_year, selected_round, current_lap)
    }

    function get_leading_driver() {
        for (let i = 0; i < race_data.length; i++) {
            if (race_data[i]["pos"][index]["Position"] == 1) {
                return i;
            }
        }
        return -1; // Falls kein führender Fahrer gefunden wird
    }

    let leading_driver_index = get_leading_driver();

    if (leading_driver_index !== -1 && race_data[leading_driver_index]["lap"][index]["LapNumber"] != current_lap) {
        update(leading_driver_index);
    }
}


function update_animation_lap(new_lap) {


    race_data.forEach((race, raceIndex) => {
        try {
            const temp_index = race.lap.findIndex(lap => lap.LapNumber == new_lap);
            if (temp_index != -1 && race.pos[temp_index].Position == 1) {
                global_index = temp_index;
                current_leader = raceIndex;
            }
        } catch (error) {
            if (error instanceof TypeError) {
                console.error('TypeError encountered:', error);
            } else {
                throw error;  // Re-throw if it's not the expected TypeError
            }
        }
    });

}



