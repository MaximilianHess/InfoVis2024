export { init_tyre_plot }



const width = 928;
const marginTop = 30;
const marginRight = 10;
const marginBottom = 0;
const marginLeft = 30;
var compound_colors = {
    'SOFT': '#FF0100',
    'MEDIUM': '#FFEA00',
    'HARD': 'white',
    'INTERMEDIATE': '#0DBD00',
    'WET': '#007BE1'
}


function init_tyre_plot() {
    console.log("Hello World");
    fetch_tyre_data(2020,1,20)
    console.log(compound_colors);
}



function render_tyre_plot() {

}


function fetch_tyre_data(year, round_number,lap) {
    d3.json(`/get_tyre_data/${year}/${round_number}/${lap}`)
        .then(function (tyre_data) {
            console.log(Object.values(tyre_data));
        })
}