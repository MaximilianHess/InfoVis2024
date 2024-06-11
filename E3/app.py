from flask import Flask, render_template, jsonify
import pandas as pd
from sklearn import decomposition, preprocessing
import numpy as np
import fastf1
from fastf1.ergast import Ergast

ergast = Ergast()   # connection to Ergast API 
app = Flask(__name__)

# Prevent caching the elements in the browser
app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0
# Show changes without restarting the Flask server
app.config["TEMPLATES_AUTO_RELOAD"] = True

# Load data once at startup
df_circuits_geo = pd.read_csv("static/data/circuit_geo.csv")
df_circuits = pd.read_parquet("static/data/all_tracks_new.parquet")
circuit_data = df_circuits.merge(df_circuits_geo, left_on='circuit_code', right_on='circuitId', how='left')

def get_world_data():
    with open('static/data/world.json', 'r') as file:
        data = file.read()
    return data

def get_circuit_data(season):
    data = ergast.get_circuits(season=season, result_type='pandas')  
    data = data.to_json(orient="records")
    return data

@app.route("/update_circuit_data/<int:season>")
def update_circuit_data(season):
    data = ergast.get_circuits(season=season, result_type='pandas')  
    return jsonify(data.to_dict(orient="records"))

@app.route("/")
def index():
    globe_data = get_world_data()
    circuit_data = get_circuit_data(2020)  # Initial data for the default season
    
    return render_template("index.html", globe_data=globe_data, circuit_data=circuit_data)

# Initiate the server in debug mode
if __name__ == "__main__":
    app.run(debug=True)
