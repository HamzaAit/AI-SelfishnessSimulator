function Agent(id, x, y, brain, selfishness) {

    // [Properties]

    // Characteristics
    this.id = id;
    this.birthDate = frameCount;
    this.selfish = selfishness || random() < 0.4 ? 1 : 0;
    this.speed = 1;
    this.size = 30;
    this.color = this.selfish ? color(200, 100, 100) : color(100, 200, 100);
    this.brain = brain || new NeuralNetwork(9, 15, 2);
    this.visionPerimeter = 90;
    this.eating = false;
    this.seen = false;
    this.startedEating;
    this.home = createVector(x, y);


    // Needs
    this.survivalRequirements = 1;
    this.reproductionRequirement1 = 2;
    this.reproductionRequirement2 = 3;
    this.reproductionRequirement3 = 4;
    this.plenty = 2 * this.reproductionRequirement1;

    // Other Parameters
    this.food = 0;
    this.velocity = createVector(0, 0);
    this.pos = createVector(x, y);
    this.closestFood = null;


    // [Behaviour]

    // Move the agent randomly
    this.randMove = function () {
        var velocityChangeFreq = random(0.005, 0.01);
        if (random() < velocityChangeFreq)
            this.velocity = this.newVelocity();
        this.pos.add(this.velocity);
    }

    // Move the agent intelligently
    this.move = function () {
        if (this.satisfied()) {
            this.goTo(this.home);
            this.pos.add(this.velocity);
            return;
        }
        if (this.seen) {
            this.goTo();
            this.pos.add(this.velocity);
            return;
        }
        this.eating = this.startedEating ? frameCount - this.startedEating < 50 : false;
        if (this.eating)
            return;


        var velocityChangeFreq = 0.05;
        if (random() < velocityChangeFreq) {
            var decision = this.think();
            var velX = decision[0] < 0.5 ? -this.speed : this.speed;
            var velY = decision[1] < 0.5 ? -this.speed : this.speed;
            this.velocity = createVector(velX, velY);
        }

        this.pos.add(this.velocity);
    }

    // Show the agent
    this.show = function () {
        noStroke();
        if (this.hungry()) {
            stroke(255, 255, 0); // Yellow
            strokeWeight(2);
        } 
        else if (this.food < this.reproductionRequirement1) {
            stroke(0); // Black
            strokeWeight(2);
        }
        else {
            stroke(0, 30, 245); // Blue
            strokeWeight(2);
        }
        fill(this.color);
        circle(this.pos.x, this.pos.y, this.size);
        noStroke();
        strokeWeight(1);
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(20);
        text(this.id, this.pos.x, this.pos.y);
    }

    // Update agent (move + show + collision detection)
    this.update = function () {
        this.see();
        this.move();
        this.hitsBorders();
    }


    // Decide on which direction to move
    this.think = function () {
        // [TODO] Add food eaten so far to input
        var normalizedInput = this.environment();

        // Use Neural Network's forward propagation to make decision
        var _decision = this.brain.think(normalizedInput);
        var decision = [];
        for (d of _decision) {
            decision.push(d[0]); // NN returns array of one element arrays, we extract the number to have a 1D array
        }
        return decision;
    }

    // Environment of agent
    this.environment = function () {
        return [
            [this.pos.x / WIDTH],
            [this.pos.y / HEIGHT],
            [this.home.x / WIDTH],
            [this.home.y / HEIGHT],
            [1 - this.pos.x / WIDTH],
            [1 - this.pos.y / HEIGHT],
            [(this.pos.x - this.home.x) / WIDTH],
            [(this.pos.y - this.home.y) / HEIGHT],
            [this.distanceSquared(this.home) / pow(WIDTH, 2)]
        ]
    }

    // Perception of the environment
    this.see = function () {
        // var seen = false;
        for (var f of food) {
            // Ignore consumed food
            if (f.consumed)
                continue;
            // If agent reached food
            if (this.foundFood(f)) {
                // If agent hungry
                this.eatFood(f);
                this.seen = false;
                break;
            }
            // If agent sees food
            if (this.insidePerimeter(f)) {
                this.closestFood = f;
                this.seen = true;
                this.link();
                return;
            }
        }
        this.closestFood = null;
        this.seen = false;
    }


    // Checking if agent found food
    this.foundFood = function (f) {
        return this.distanceSquared(f) < pow(f.size, 2) / 2;
    }

    // Eat food
    this.eatFood = function (f) {
        var amount;
        if (this.selfish) {
            if (f.amount >= this.reproductionRequirement3) amount = this.reproductionRequirement3;
            else amount = f.amount;
        }
        else {
            if (f.amount >= this.plenty) amount = this.reproductionRequirement1;
            else amount = this.survivalRequirements;
        }
        this.food += amount;
        f.getConsumed(amount);
        // this.closestFood = null;
        this.eating = true;
        this.startedEating = frameCount;
    }

    // Checking if hungry
    this.hungry = function () {
        return this.food < this.survivalRequirements;
    }

    // Checking if agent is done looking for food
    this.satisfied = function () {
        if (this.selfish) return this.food >= this.reproductionRequirement2;
        return (!this.hungry());
    }

    // Checking if agent can reproduce
    this.canReproduce = function () {
        if (this.food < this.reproductionRequirement1) {
            return false;
        }
        var freq;
        if (this.food <= this.reproductionRequirement2) {
            freq = 0.3;
        }
        else if (this.food <= this.reproductionRequirement3) {
            freq = 0.5;
        }
        else freq = 0.7;
        if (random() < freq) return true;
        return false;
    }


    this.goTo = function (pos) {
        var dirX, dirY;
        if (pos) {
            dirX = pos.x - this.pos.x;
            dirY = pos.y - this.pos.y;
        }
        else {
            dirX = this.closestFood.x - this.pos.x;
            dirY = this.closestFood.y - this.pos.y;
        }
        var hyp = sqrt((dirX * dirX) + (dirY * dirY));
        var velX = (dirX / hyp) * this.speed;
        var velY = (dirY / hyp) * this.speed;
        this.velocity = createVector(velX, velY);
    }

    // [Helper functions]

    // Draw line between self and closest food
    this.link = function () {
        stroke(255, 0, 0);
        line(this.pos.x, this.pos.y, this.closestFood.x, this.closestFood.y);
        noStroke();
    }

    // Create new velocity vector
    this.newVelocity = function () {
        //speed^2 = speedx^2 + speedy^2
        //speedy = sqrt(speed^2  - speedx^2)

        var speedX = random(-this.speed, this.speed);
        var sign = random() < 0.5 ? -1 : 1;
        var speedY = sign * sqrt((this.speed * this.speed) - (speedX * speedX));
        return createVector(speedX, speedY);
    }

    // Handle Border Collision
    this.hitsBorders = function () {
        var x = this.pos.x;
        var y = this.pos.y;
        var speedx = this.velocity.x;
        var speedy = this.velocity.y;
        //left 
        if (x - (this.size / 2) <= 5) {
            this.velocity.x = Math.abs(speedx);
            return true;
        }
        //right
        if (x + (this.size / 2) >= WIDTH - 5) {
            this.velocity.x = -Math.abs(speedx);
            return true;
        }
        //top 
        if (y - (this.size / 2) <= 5) {
            this.velocity.y = Math.abs(speedy);
            return true;
        }
        //bottom
        if (y + (this.size / 2) >= HEIGHT - 5) {
            this.velocity.y = -Math.abs(speedy);
            return true;
        }
        return false;
    }

    this.distanceSquared = function (other) {
        var deltaX = this.pos.x - other.x;
        var deltaY = this.pos.y - other.y;
        return (deltaX * deltaX) + (deltaY * deltaY);
    }

    this.insidePerimeter = function (other) {
        if (other.consumed) return false;
        return this.distanceSquared(other) <= pow(this.visionPerimeter, 2);
    }
}
