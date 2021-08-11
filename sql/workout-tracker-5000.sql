-- Build Workout Table
CREATE TABLE Workouts(
    workout_id INT AUTO_INCREMENT PRIMARY KEY,
    workout_duration INT NOT NULL
);
-- Build Exercises Table
CREATE TABLE Exercises(
    exercise_id INT AUTO_INCREMENT PRIMARY KEY,
    exercise_name VARCHAR(255) NOT NULL
);
-- Build Workout_Exercise Table
CREATE TABLE Workout_Exercise(
    workout_id INT NOT NULL,
    exercise_id INT NOT NULL,
    PRIMARY KEY(workout_id, exercise_id),
    FOREIGN KEY(workout_id) REFERENCES Workouts(workout_id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY(exercise_id) REFERENCES Exercises(exercise_id) ON UPDATE CASCADE ON DELETE CASCADE
);
-- Build Sets Table
CREATE TABLE Sets(
    set_id INT AUTO_INCREMENT PRIMARY KEY,
    weight DECIMAL(4, 1) NOT NULL,
    reps INT NOT NULL,
    workout_id INT NOT NULL,
    exercise_id INT NOT NULL,
    FOREIGN KEY(workout_id, exercise_id) REFERENCES Workout_Exercise(workout_id, exercise_id) ON UPDATE CASCADE ON DELETE CASCADE
);