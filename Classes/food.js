function Food(id) {
    
    // [Characteristics]
    // Amount of food stored in the instance
    this.id = id;
    this.amount = round(random(1, 10));
    // this.amount = 1;
    this.consumed = false;

    // Randomize position
    this.x = random(foodBorder, WIDTH - foodBorder);
    this.y = random(foodBorder, HEIGHT - foodBorder);
    this.size = 40 + this.amount;

    // Diplay the object
    this.show = function () {
        imageMode(CENTER);
        image(foodimg, this.x, this.y, this.size, this.size);
        imageMode(CORNER);
        textAlign(CENTER, CENTER);
        textSize(20);
        text(this.amount, this.x, this.y);
    }

    this.updateSize = function(){
        this.size = 40 + this.amount;
    }

    this.update = function(){
        this.updateSize();
    }

    this.getConsumed = function(amount){
        this.amount -= amount;
        if(this.amount <= 0)
            this.consumed = true;
    }
}
