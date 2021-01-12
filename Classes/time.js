function Time(){
    this.framesPerDay = 1000;
    this.framesPerHour = 100;


    this.currentDay = function(){
        return floor(frameCount / framesPerDay) + 1;
    }

    this.dayFinished = function() {
        return (frameCount % this.framesPerDay == 0);
    }
}