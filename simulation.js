// Population parameters
var population;
var populationSize;
var nSelfish;
var dead;
var mut;

// Food parameters
var food;
var foodAmount;
var foodBorder;
var maxFood;

// Canvas parameters
var WIDTH;
var HEIGHT;
var slider;


// Time tracking
var time;
var generation;
var fastForward;
var done;
var startTime;
var opacity;

// Chart Attributes
var populationHistory;
var selfishHistory;
var unselfishHistory;
var xLabels;

function preload() {
    worldimg = loadImage('./Images/mapfinal.png');
    foodimg = loadImage('./Images/food.png');
}

function setup() {
    // Initializing dimensions
    WIDTH = windowWidth - 20;
    HEIGHT = windowHeight - 50;

    // Initializing parameters
    foodAmount = 20;
    populationSize = 0;
    generation = 1;
    foodBorder = 100;
    opacity = 0;
    nSelfish = 0;
    populationHistory = [];
    selfishHistory = [];
    unselfishHistory = [];
    xLabels = [];

    // Creating Entities
    generateFood();
    generatePopulation();
    world = new Env();
    time = new Time();
    done = true;
    slider = createSlider(1, 15, 2);
    fastForward = slider.value();
    createCanvas(WIDTH, HEIGHT);
}


function draw() {

    if(generation == 31){
        makeChart();
        return;
        // noLoop();
    }

    world.show();
    for (var i = 0; i < fastForward; i++) {
        frameCount = frameCount + 1;
        if (time.dayFinished() || !done) {
            if (!startTime) startTime = frameCount;
            if(frameCount % time.framesPerDay == 0)mut = true;
            nextDay();
        }
        else {
            updateFood();
            updateAgents();
        }
    }
    if (done) {
        showFood();
        showAgents();
        showInfo();
    }
    fastForward = slider.value();

}

// Displaying info:
function showInfo() {
    fill(0);
    textAlign(LEFT, LEFT);
    textSize(23);
    text('Population: ' + populationSize, WIDTH - 170, 20);
    text('Generation: ' + generation, WIDTH - 170, 50);
    fill(255);
}


function makeChart() {
    remove();
    document.getElementById("chart-container").style.width = (WIDTH).toString() + "px";
    document.getElementById("chart-container").style.height = (HEIGHT).toString() + "px";
    var chartCanvas = document.createElement("CANVAS");
    chartCanvas.id = 'myChart';
    document.getElementById("chart-container").appendChild(chartCanvas)
    var ctx = document.getElementById('myChart').getContext('2d');
    var chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: xLabels,
            datasets: [{
                label: "Population size",
                backgroundColor: 'rgba(0,0,0,0.05)',
                borderColor: 'black',
                data: populationHistory,
            }, {
                label: "Selfish",
                backgroundColor: 'rgba(200,100,100, 0.2)',
                borderColor: 'rgba(200,100,100)',
                data: selfishHistory,
            }, {
                label: "Unselfish",
                backgroundColor: 'rgba(100,200,100, 0.2)',
                borderColor: 'rgba(100,200,100)',
                data: unselfishHistory,
            }]
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        fontSize: 14
                    }
                }],
                xAxes: [{
                    ticks: {
                        fontSize: 14
                    }
                }]
            },
            legend: {
                labels: {
                    // This more specific font property overrides the global property
                    fontSize: 14
                }
            }
        }
    });
}

// New day
function nextDay() {
    if(mut){
        mutatePopulation();
        populationHistory.push(populationSize);
        selfishHistory.push(nSelfish);
        unselfishHistory.push(populationSize - nSelfish);
        xLabels.push("Generation: " + generation.toString());
        mut = false;
    }
    done = false;
    updateFood();
    // updateAgents();
    showFood();
    showAgents();
    showInfo();
    background(255, 255, 255, opacity);
    opacity += 2;
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(80);
    text('Day ' + (generation + 1), WIDTH / 2, HEIGHT / 2);
    textSize(30);
    text('Selfish: ' + nSelfish + '\t\t\tNon-selfish: ' + (populationSize - nSelfish), WIDTH / 2, HEIGHT / 1.6);
    fill(255);

    if (frameCount >= startTime + 250) {
        generateFood();
        // mutatePopulation();
        generation++;
        opacity = 0;
        done = true;
        frameCount = startTime;
        startTime = null;
    }
}


// Filling food array with specified amount of food
function generateFood() {
    food = []
    for (var i = 0; i < foodAmount; i++) {
        food.push(new Food(i));
    }
}

// Filling population array with agents
function generatePopulation() {
    population = []
    dead = []
    var distance = 100;
    var offset = 20;
    // Vertical lines
    for (var i = offset; i < HEIGHT; i += distance) {
        var agentA = new Agent(populationSize++, 37.5, i);
        var agentB = new Agent(populationSize++, WIDTH - 37.5, i);
        population.push(agentA);
        population.push(agentB);
        nSelfish += agentA.selfish + agentB.selfish;
    }

    // Horizontal lines
    for (var i = offset + distance; i < WIDTH - offset - distance; i += distance) {
        var agentA = new Agent(populationSize++, i, 20);
        var agentB = new Agent(populationSize++, i, HEIGHT - 20);
        population.push(agentA);
        population.push(agentB);
        nSelfish += agentA.selfish + agentB.selfish;
    }
}

function mutatePopulation() {
    var newpop = []
    nSelfish = 0;
    nNonSelfish = 0;
    for (var agent of population) {
        if (!agent.hungry()) {
            newpop.push(agent);
            nSelfish += agent.selfish;
        }
        else {
            dead.push(agent);
        }
    }
    var index = 0;
    var index2 = 0;
    var l = newpop.length;
    for (var agent of dead) {
        while (index < l) {
            var a = newpop[index++]
            if (a.canReproduce()) {
                newpop.push(new Agent(agent.id, agent.home.x, agent.home.y, mutate(a, 0.3, 0.1), a.selfish));
                nSelfish += a.selfish;
                dead.splice(index2, 1);
                break;
            }

        }
        if (index >= l) {
            break;
        }
        index2++;
    }
    population = newpop;
    for (var a of population) {
        a.food = 0;
    }
    populationSize = newpop.length;
}

function updateFood() {
    for (var f of food) {
        if (!f.consumed)
            f.update();
    }
}

function showFood() {
    for (var f of food) {
        if (!f.consumed)
            f.show();
    }
}

function updateAgents() {
    for (var agent of population) {
        agent.update();
    }
}

function showAgents() {
    for (var agent of population) {
        agent.show();
    }
}

function keyPressed() {
    if (key === 'r') {
        loop();
    }

    if (key === ' ') {
        if (isLooping()) {
            noLoop();
        }
        else {
            loop();
        }
    }
}