//Genetic Algorithms Library

//Mutating Weights of a Brain
function mutate(parent, mutationRate, mutationStrength) {
    var mutated = copyBrain(parent.brain);
    var hWeights = mutated.hiddenWeights;
    var oWeights = mutated.outputWeights;
    var hBias = mutated.hiddenBias;
    var oBias = mutated.outputBias;

    for (var i = 0; i < hWeights.length; i++) {
        for (var j = 0; j < hWeights[0].length; j++) {
            if (random() < mutationRate) {
                // hWeights[i][j] += (round(random()) * 2 - 1) * hWeights[i][j] * mutationStrength;
                hWeights[i][j] += randomGaussian(0, mutationStrength);
            }
        }
    }
    for (var i = 0; i < oWeights.length; i++) {
        for (var j = 0; j < oWeights[0].length; j++) {
            if (random() < mutationRate) {
                // oWeights[i][j] += (round(random()) * 2 - 1) * oWeights[i][j] * mutationStrength;
                oWeights[i][j] += randomGaussian(0, mutationStrength);
            }
        }
    }
    for (var i = 0; i < hBias.length; i++) {
        hBias[i] += randomGaussian(0, mutationStrength);
    }
    for (var i = 0; i < oBias.length; i++) {
        oBias[i] += randomGaussian(0, mutationStrength);
    }
    return mutated;
}

//Copying a brain
function copyBrain(brain) {
    var copy = JSON.parse(JSON.stringify(brain));
    var newBrain = new NeuralNetwork(copy.inNodes, copy.hNodes, copy.outNodes, copy.hiddenWeights, copy.outputWeights, copy.hiddenBias, copy.outputBias);
    return newBrain;
}