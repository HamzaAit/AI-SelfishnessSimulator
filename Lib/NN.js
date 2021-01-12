function NeuralNetwork(i, h, o, hw, ow, hb, ob) {
    this.inNodes = i;
    this.hNodes = h;
    this.outNodes = o;
    this.hiddenWeights = hw || []
    this.outputWeights = ow || []
    this.hiddenBias = hb || []
    this.outputBias = ob || []
    this.hiddenNeurons = []
    this.outputNeurons = []

    // Generating random bias for hidden layer
    this.generateHiddenBias = function () {
        for (var i = 0; i < this.hNodes; i++) {
            this.hiddenBias[i] = random(-0.1, 0.1);
        }
    }

    // Generating random bias for output layer
    this.generateOutputBias = function () {
        for (var i = 0; i < this.outNodes; i++) {
            this.outputBias[i] = random(-0.1, 0.1);
        }
    }

    // Generating random weights for hidden layer
    this.generateHiddenWeights = function () {
        for (var i = 0; i < this.hNodes; i++) {
            this.hiddenWeights[i] = []
            for (var j = 0; j < this.inNodes; j++) {
                this.hiddenWeights[i][j] = random(-1, 1);
            }
        }
    }

    // Generating random weights for output layer
    this.generateOutputWeights = function () {
        for (var i = 0; i < this.outNodes; i++) {
            this.outputWeights[i] = []
            for (var j = 0; j < this.hNodes; j++) {
                this.outputWeights[i][j] = random(-1, 1);
            }
        }
    }

    // Neural Network Forward Propagation
    this.think = function (inputs) {
        this.hiddenNeurons = this.add( this.sigmoid(this.matmul(this.hiddenWeights, inputs)), this.hiddenBias);
        this.outputNeurons = this.add( this.sigmoid(this.matmul(this.outputWeights, this.hiddenNeurons)), this.outputBias);
        return this.outputNeurons;
    }

    // Multiplying 2 matrices
    this.matmul = function (A, B) {
        var h = A.length;
        var w = B[0].length;

        var matrix = [];
        for (var i = 0; i < h; i++) {
            matrix[i] = [];
            for (var j = 0; j < w; j++) {
                matrix[i][j] = 0
                for (var k = 0; k < A[0].length; k++) {
                    matrix[i][j] += A[i][k] * B[k][j];
                }
            }
        }
        return matrix;
    }

    // Adding two vectors
    this.add = function (v1, v2){
        var l = v1.length;
        var vec = []
        for(var i = 0; i < l; i++){
            vec[i] = [];
            vec[i][0] = v1[i][0] + v2[i];
        }
        return vec;
    }

    // Logistic activation function (scaling numbers between 0 and 1 non-linearly)
    this.sigmoid = function (vec) {
        var activated = []
        for (var i = 0; i < vec.length; i++) {
            var curr = vec[i];
            activated[i] = [1 / (1 + exp(-curr))];
        }
        return activated;
    }


    if(!hw){
        this.generateHiddenBias();
        this.generateOutputBias();
        this.generateHiddenWeights();
        this.generateOutputWeights();
    }
}   