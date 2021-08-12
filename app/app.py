from flask import Flask, render_template
from flaskext.mysql import MySQL
from credentials import credentials

app = Flask(__name__)
app.config["MYSQL_DATABASE_USER"] = credentials["user"]
app.config["MYSQL_DATABASE_PASSWORD"] = credentials["pass"]
app.config["MYSQL_DATABASE_DB"] = credentials["db"]
app.config["MYSQL_DATABASE_HOST"] = credentials["host"]
database = MySQL(app)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/workout_new")
def workout_new():
    return render_template("workout_new.html")


@app.route("/list_of_exercises")
def list_of_exercises():
    cursor = database.get_db().cursor()
    cursor.execute("SELECT * FROM Exercises")
    result = cursor.fetchall()

    data = {}
    for (id, exercise) in result:
        data[str(id)] = exercise

    return data
