document.addEventListener("DOMContentLoaded", setUp);

function setUp() {
    startTimer();
}

function startTimer() {
    var total_secs = 0;
    var hr = 0;
    var min = 0;
    var sec = 0;

    setInterval(() => {
        total_secs += 1;
        sec += 1;
        
        if (sec == 60) {
            min += 1;
            sec = 0;
        }

        if (min == 60) {
            hr += 1;
            min = 0;
        }
        header = document.getElementById("header");
        header.innerText = `${String(hr).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
        document.getElementById("duration").value = total_secs;
    }, 1000);
}