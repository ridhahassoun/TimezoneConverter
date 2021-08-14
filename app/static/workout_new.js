document.addEventListener("DOMContentLoaded", setUp);
var exercises = {};
var show_complete = false;
var list_of_exercises = {};

function setUp() {
    startTimer();
    bindAddButton();
    bindCompleteButton();

    let req = new XMLHttpRequest();
    req.open("GET", "/list_of_exercises");
    req.addEventListener("load", () => {
        list_of_exercises = JSON.parse(req.responseText);
    });
    req.send(null);

    bindList();
}

function startTimer() {
    var total_secs = 0;
    var start_time = Date.now();

    setInterval(() => {
        total_secs = Math.floor((Date.now() - start_time) / 1000);
        
        var hr_dec = total_secs / 3600;
        var hr = Math.floor(hr_dec);

        var min_dec = (hr_dec - hr) * 60;
        var min = Math.floor(min_dec);

        var sec_dec = (min_dec - min) * 60;
        var sec = Math.floor(sec_dec);

        header = document.getElementById("header");
        header.innerText = `${String(hr).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
        document.getElementById("duration").value = total_secs;
    }, 1000);
}

function bindAddButton() {
    document.getElementById("add").addEventListener("click", (event) => {
        let number_of_exercises = Object.keys(exercises).length;
        exercises[number_of_exercises + 1] = 1;

        document.querySelector("ul").appendChild(buildExerciseForm(number_of_exercises + 1));

        var begin = document.getElementById("begin");
        if (begin.style.visibility != "hidden") {
            begin.style.visibility = "hidden";
        }

        if (!show_complete) {
            let complete_button = document.getElementById("complete");
            complete_button.className = complete_button.className.replace("d-none", "d-inline-block");
            show_complete = true;
        }

        event.preventDefault();
    });
}

function bindCompleteButton() {
    document.getElementById("complete").addEventListener("click", (event) => {
        document.getElementById("workout").submit();

        event.preventDefault();
    });
}

function bindList() {
    document.getElementById("exercises").addEventListener("click", (event) => {
        let target = event.target;

        if (target.tagName != "A") {
            return;
        }

        if (target.name == "delete_set") {
            let row = target.parentElement.parentElement;
            row.parentElement.removeChild(row);

            event.preventDefault();

            return;
        }

        let which_exercise = target.parentElement.parentElement.firstChild.name;
        which_exercise = which_exercise.split("-")[1];

        if (target.name == "add_set") {
            let rows = document.getElementById(`exercise-${which_exercise}-sets`);
            rows.appendChild(buildSetRow(which_exercise, exercises[which_exercise] + 1));

            exercises[which_exercise] = rows.children.length;

            event.preventDefault();

            return;
        }

        if (target.name == "delete_exercise") {
            let li = target.parentElement.parentElement;
            li.parentElement.removeChild(li);

            delete exercises[which_exercise];

            if (Object.keys(exercises).length == 0) {
                document.getElementById("begin").style.visibility = "visible";

                let complete_button = document.getElementById("complete");
                complete_button.className = complete_button.className.replace("d-inline-block", "d-none");
                show_complete = false;
            }

            event.preventDefault();

            return;
        }
    });
}

function buildExerciseForm(exercise_number) {
    let li = document.createElement("li");
    li.className = "list-group-item";

    let select = document.createElement("select");
    select.className = "form-select";
    select.name = `exercise-${exercise_number}`;
    select.onchange = (event) => {
        let exercise_choice = event.target.options[event.target.selectedIndex].value;
        let exercise_name = list_of_exercises[exercise_choice];

        let payload = {
            "workout": exercise_name
        };

        let req = new XMLHttpRequest();
        req.open("POST", "http://flip3.engr.oregonstate.edu:3625/");
        req.addEventListener("load", () => {
            let json = JSON.parse(req.responseText);
            let description = document.getElementById(`exercise-${exercise_number}-description`);
            description.innerText = json.description;
        });
        req.setRequestHeader("Content-Type", "application/json");
        req.send(JSON.stringify(payload));
    };

    for (const id in list_of_exercises) {
        let option = document.createElement("option");
        option.value = id;
        option.innerText = list_of_exercises[id];
        select.appendChild(option);
    }

    li.appendChild(select);

    let description = document.createElement("p");
    description.className = "overflow-scroll";
    description.style.height = "3em";
    description.id = `exercise-${exercise_number}-description`;
    description.innerText = "The bench press, or chest press, is an upper-body weight training exercise in which the trainee presses a weight upwards while lying on a weight training bench. The exercise uses the pectoralis major, the anterior deltoids, and the triceps, among other stabilizing muscles. A barbell is generally used to hold the weight, but a pair of dumbbells can also be used."
    li.appendChild(description);

    let rows = document.createElement("div");
    rows.id = `exercise-${exercise_number}-sets`;

    for (var i = 1; i < exercises[exercise_number] + 1; i++) {
        rows.appendChild(buildSetRow(exercise_number, i));
    }

    li.appendChild(rows);

    let modify_exercise_buttons = document.createElement("div");
    modify_exercise_buttons.className = "text-center";

    let add_set_button = document.createElement("a");
    add_set_button.className = "d-inline m-2 btn btn-outline-primary";
    add_set_button.href = "#";
    add_set_button.role = "buttton";
    add_set_button.name = "add_set";
    add_set_button.innerText = "add set";

    let delete_exercise_button = document.createElement("a");
    delete_exercise_button.className = "d-inline m-2 btn btn-outline-danger";
    delete_exercise_button.href = "#";
    delete_exercise_button.role = "buttton";
    delete_exercise_button.name = "delete_exercise";
    delete_exercise_button.innerText = "delete exercise";

    modify_exercise_buttons.appendChild(delete_exercise_button);
    modify_exercise_buttons.appendChild(add_set_button);

    li.appendChild(modify_exercise_buttons);

    return li;
}

function buildSetRow(exercise_number, set_number) {
        let row = document.createElement("div");
        row.className = "row g-1";

        let reps_col = document.createElement("div");
        reps_col.className = "col input-group mb-3";

        let reps_input = document.createElement("input");
        reps_input.type = "number";
        reps_input.min = "0";
        reps_input.className = "form-control";
        reps_input.name = `reps-${exercise_number}-${set_number}`;

        let reps_span = document.createElement("span");
        reps_span.className = "input-group-text";
        reps_span.innerText = "reps";

        reps_col.appendChild(reps_input);
        reps_col.appendChild(reps_span);

        let weight_col = document.createElement("div");
        weight_col.className = "col input-group mb-3";

        let weight_input = document.createElement("input");
        weight_input.type = "number";
        weight_input.min = "0";
        weight_input.className = "form-control";
        weight_input.name = `weight-${exercise_number}-${set_number}`;

        let weight_span = document.createElement("span");
        weight_span.className = "input-group-text";
        weight_span.innerText = "lbs";

        weight_col.appendChild(weight_input);
        weight_col.appendChild(weight_span);

        let delete_col = document.createElement("div");
        delete_col.className = "col-1 mb-3";

        let delete_set_button = document.createElement("a");
        delete_set_button.className = "btn btn-outline-danger";
        delete_set_button.href = "#";
        delete_set_button.role = "buttton";
        delete_set_button.name = "delete_set";
        delete_set_button.innerText = "x";

        delete_col.appendChild(delete_set_button);

        row.appendChild(reps_col);
        row.appendChild(weight_col);
        row.appendChild(delete_col);

        return row;
}
