from flask import Flask, render_template, request, redirect, url_for
from flaskext.mysql import MySQL
from math import floor
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


@app.route("/save_workout", methods=["POST"])
def save_workout():
    if request.method == "POST":
        parsed_data = parse(request.form)
        cursor = database.get_db().cursor()

        # create workout
        cursor.execute("INSERT INTO Workouts(workout_duration) "
                       "VALUES(%s)", parsed_data["duration"])
        database.get_db().commit()
        workout_id = cursor.lastrowid
        parsed_data.pop("duration")

        for exercise in parsed_data:
            exercise_data = parsed_data[exercise]
            exercise_id = exercise_data[0]
            cursor.execute("INSERT INTO Workout_Exercise(workout_id, exercise_id) "
                           "VALUES(%s, %s)", (workout_id, exercise_id))

            for set in exercise_data[1]:
                cursor.execute("INSERT INTO Sets(weight, reps, workout_id, exercise_id) "
                               "VALUES(%s, %s, %s, %s)", (set[0], set[1], workout_id, exercise_id))

            database.get_db().commit()

        return redirect(url_for("view_workout", id=workout_id))
    else:
        return "Failure"


@app.route("/workouts")
def workouts():
    cursor = database.get_db().cursor()

    # get workouts
    cursor.execute("SELECT w.workout_id, w.workout_date FROM Workouts w")
    workouts = cursor.fetchall()

    return render_template("workouts.html", workouts=workouts)


@app.route("/workout/<id>")
def view_workout(id):
    cursor = database.get_db().cursor()

    # get workout duration
    cursor.execute("SELECT w.workout_duration, w.workout_date "
                   "FROM Workouts w WHERE w.workout_id = %s", (id))
    workout_info = cursor.fetchone()
    workout_duration = workout_info[0]
    time_tuple = convert_secs_to_human_readable_time(workout_duration)

    # get exercises performed
    cursor.execute("SELECT e.exercise_id, e.exercise_name "
                   "FROM Workouts w "
                   "INNER JOIN Workout_Exercise we "
                   "INNER JOIN Exercises e "
                   "WHERE w.workout_id = %s "
                   "AND w.workout_id = we.workout_id "
                   "AND we.exercise_id = e.exercise_id", (id))
    exercises = cursor.fetchall()

    # get sets for each exercise
    cursor.execute("SELECT s.exercise_id, s.reps, s.weight "
                   "FROM Sets s WHERE s.workout_id = %s", (id))
    sets = cursor.fetchall()

    return render_template("workout.html",
                           id=id,
                           duration=time_tuple,
                           date=workout_info[1],
                           exercises=exercises,
                           sets=sets)


# helper functions
def parse(form_data):
    parsed = {}

    for key in form_data:
        if key == "duration":
            parsed[key] = form_data[key]

        if key.startswith("exercise"):
            parsed[key.split("-")[1]] = [form_data[key], []]

    for key in form_data:
        if key.startswith("reps"):
            split_key = key.split("-")
            parsed[split_key[1]][1].append([form_data[key]])

    for key in form_data:
        if key.startswith("weight"):
            split_key = key.split("-")
            parsed[split_key[1]][1][int(
                split_key[2]) - 1].append(form_data[key])

    return parsed


def convert_secs_to_human_readable_time(seconds):
    hr_dec = seconds / 3600
    hr = floor(hr_dec)

    min_dec = (hr_dec - hr) * 60
    mins = floor(min_dec)

    sec_dec = (min_dec - mins) * 60
    sec = floor(sec_dec)

    return ("{:02}".format(hr), "{:02}".format(mins), "{:02}".format(sec))
