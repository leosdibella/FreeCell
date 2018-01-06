/*global window*/
(function () {
    'use strict';

    var defaultNumberOfFreeCells = 4,
        defaultNumberOfCascades = 8;
    
    function Configuration(numberOfFreeCells,
                           numberOfCascades,
                           deck) {
        var configuration = this,
            generateCascadeDistribution = function Configuration_generateCascadeDistribution() {
                var i,
                    distribution = [],
                    minimalNumberOfCardsPerCascade = Math.floor(configuration.deck.totalNumberOfCards / configuration.numberOfCascades),
                    remainingCards = configuration.deck.totalNumberOfCards - (minimalNumberOfCardsPerCascade * configuration.numberOfCascades);
            
                for (i = 0; i < configuration.numberOfCascades; ++i) {
                    if (remainingCards > 0) {
                        distribution.push(minimalNumberOfCardsPerCascade + 1);
                        --remainingCards;
                    } else {
                        distribution.push(minimalNumberOfCardsPerCascade);
                    }
                }
            
                return distribution;
            };
        
        configuration.deck = deck || window.freeCell.defaults.deck;
        configuration.numberOfCascades = window.freeCell.utilities.isPositiveInteger(numberOfCascades) ? numberOfCascades : defaultNumberOfCascades;
        configuration.numberOfFreeCells = window.freeCell.utilities.isNonNegativeInteger(numberOfFreeCells) ? numberOfFreeCells : defaultNumberOfFreeCells;
        configuration.cascadeDistribution = generateCascadeDistribution();
    }
    
    window.freeCell.Configuration = Configuration;
    window.freeCell.current.configuration = new Configuration();
    window.freeCell.defaults.configuration = window.freeCell.current.configuration;
    window.freeCell.defaults.numberOfFreeCells = defaultNumberOfFreeCells;
    window.freeCell.defaults.numberOfCascades = defaultNumberOfCascades;
}());