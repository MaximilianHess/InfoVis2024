The following steps must be carried out to be able to run the project locally.

1. Installation of git lfs (https://git-lfs.com/) 

```
git lfs install
```

2. Clone the repository (https://github.com/MaximilianHess/InfoVis2024.git)
3. Install the required libraries using requirements.txt
```
python3 -m venv f1venv
source venv/bin/activate
pip install -r requirements.txt
```
5. Fetch all data files from github
```
git lfs pull
```
4. Run the flask app from E3
``` 
cd E3
flask --app app.py run --debug 
```

Data sources: 
- https://ergast.com/
- https://github.com/theOehrly/Fast-F1

