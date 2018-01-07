/*global window*/
(function () {
    'use strict';
    
    var defaultNumberOfCardsPerSuit = 13,
        defaultFaceCardValues = {
            1: 'A',
            11: 'J',
            12: 'Q',
            13: 'K'
        };
    
    function Deck(numberOfCardsPerSuit,
                  suits,
                  faceCardValues) {
        var deck = this,
            areSuitsValid = function Deck_areSuitsValid() {
                var i,
                    j;
                
                if (!Array.isArray(suits) || suits.length === 0) {
                    return false;
                }
                
                for (i = 0; i < suits.length; ++i) {
                    for (j = i + 1; j < suits.length; ++j) {
                        if (suits[i].isEqual(suits[j])) {
                            return false;
                        }
                    }
                }
                
                return true;
            },
            areFaceCardsValid = function Deck_areFaceCardsValid() {
                var i,
                    j,
                    faceCardValue;
                
                if (!window.freeCell.utilities.isObject(faceCardValues)) {
                    return false;
                }
                
                for (i in faceCardValues) {
                    if (faceCardValues.hasOwnProperty(i)) {
                        faceCardValue = faceCardValues[i];
                        
                        if (!window.freeCell.utilities.isNonEmptyString(faceCardValue)) {
                            return false;
                        }
                    
                        for (j in faceCardValues) {
                            if (faceCardValues.hasOwnProperty(j) && i !== j && faceCardValue === faceCardValues[j]) {
                                return false;
                            }
                        }
                    }
                }
                
                return true;
            },
            isValidDeck = function Deck_isValidDeck() {
                return areSuitsValid() && areFaceCardsValid() && window.freeCell.utilities.isNonNegativeInteger(numberOfCardsPerSuit);
            },
            mapCardFromNumber = function freeCell_mapCardFromNumber(number) {
                var suitIndex = Math.floor(number / deck.numberOfCardsPerSuit),
                    value = (number % deck.numberOfCardsPerSuit) + 1;
                
                return new window.freeCell.Card(deck.suitOrder[suitIndex], value, deck.faceCardValues[value]);
            },
            generateCards = function Deck_generateCards() {
                var i,
                    cards = [];
                
                for (i = 0; i < deck.totalNumberOfCards; ++i) {
                    cards.push(mapCardFromNumber(i));
                }
                
                return cards;
            },
            generateSuitOrder = function Deck_generateSuitOrder() {
                var key,
                    suitOrder = [];
                
                for (key in deck.suits) {
                    if (deck.suits.hasOwnProperty(key)) {
                        suitOrder.push(deck.suits[key]);
                    }
                }
                
                return suitOrder;
            },
            getNumberOfSuits = function Deck_getNumberOfSuits() {
                var key,
                    numberOfSuits = 0;
                
                for (key in deck.suits) {
                    if (deck.suits.hasOwnProperty(key)) {
                        ++numberOfSuits;
                    }
                }
                
                return numberOfSuits;
            },
            initialize = function Deck_initialize() {
                var isDeckValid = isValidDeck();
                
                deck.faceCardValues = isDeckValid ? faceCardValues : defaultFaceCardValues;
                deck.suits = isDeckValid ? suits : window.freeCell.defaults.suits;
                deck.numberOfCardsPerSuit = isDeckValid ? numberOfCardsPerSuit : defaultNumberOfCardsPerSuit;
                deck.numberOfSuits = getNumberOfSuits();
                deck.totalNumberOfCards = deck.numberOfCardsPerSuit * deck.numberOfSuits;
                deck.suitOrder = generateSuitOrder();
                deck.cards = generateCards();
            };
        
        deck.shuffle = function Deck_shuffle() {
            var i,
                randomNumber,
                orderedCardIndices = [],
                shuffledCards = [];

            for (i = 0; i < deck.totalNumberOfCards; ++i) {
                orderedCardIndices.push(i);
            }
            
            while (orderedCardIndices.length) {
                randomNumber = Math.ceil(Math.random() * orderedCardIndices.length) - 1;
                shuffledCards.push(deck.cards[orderedCardIndices[randomNumber]]);
                orderedCardIndices.splice(randomNumber, 1);
            }
            
            deck.cards = shuffledCards;
        };
        
        deck.tryToGetSuitOrderIndexFromSuit = function freeCell_tryToGetSuitOrderIndexFromSuit(suit) {
            var i;
            
            for (i = 0; i < deck.numberOfSuits; ++i) {
                if (suit === deck.suitOrder[i]) {
                    return i;
                }
            }
            
            return -1;
        };
        
        initialize();
    }
    
    window.freeCell.Deck = Deck;
    window.freeCell.current.deck = new Deck();
    window.freeCell.defaults.deck = window.freeCell.current.deck;
    window.freeCell.defaults.numberOfCardsPerSuit = defaultNumberOfCardsPerSuit;
    window.freeCell.defaults.faceCardValues = defaultFaceCardValues;
}());