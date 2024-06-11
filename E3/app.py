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

def get_world_data():
    with open('static/data/world.json', 'r') as file:
        data = file.read()
    return data

def get_circuit_data(season):
    circuit_data = pd.read_csv("static/data/circuit_data.csv")
    data = circuit_data.loc[circuit_data["year"] == season]
    data_json = data.to_json(orient="records")
    return data_json

@app.route("/update_circuit_data/<int:season>")
def update_circuit_data(season):
    return get_circuit_data(season)

@app.route("/")
def index():
    globe_data = get_world_data()
    circuit_data = get_circuit_data(2020)  # Initial data for the default season
    
    return render_template("index.html", globe_data=globe_data, circuit_data=circuit_data)

# Initiate the server in debug mode
if __name__ == "__main__":
    app.run(debug=True)
