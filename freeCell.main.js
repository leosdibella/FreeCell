/*global window*/
(function () {
    'use strict';
    
    window.freeCell.main = {
        startNewGame: function main_startNewGame() {
            if (window.freeCell.current.game) {
                window.freeCell.current.game.destroy();
            }
            
            window.freeCell.current.game = new window.freeCell.Game();
        }
    };
    
    window.freeCell.main.startNewGame();

       /*var  isValidChainContinuation = function isValidChainContinuation(baseCard, additionCard) {
            return additionCard.value === baseCard.value + 1 && additionCard.suit.colorClass !== baseCard.suit.colorClass;
        },
        tryToGetValidCascadeChain = function tryToGetValidCascadeChain(cascadeColumn, cascadeLevel) {
            var i,
                cascade = cascadeCards[cascadeColumn];
            
            for (i = cascadeLevel + 1; i < cascade.length; ++i) {
                if (!isValidChainContinuation(cascade[i - 1, cascade[i]])) {
                    return null;
                }
            }
            
            return {
                startingCard: cascade[cascadeLevel],
                cardColumn: cascadeColumn,
                cardLevel: cascadeLevel
            };
        },
        tryToMoveCardsOnTopOfSelectedCard = function tryToMoveCardsOnTopOfSelectedCard(element, selectedCardElement) {
            var i,
                indices = element.id.split(attributeSplitter),
                cardChain = tryToGetValidCascadeChain(parseInt(indices[0], 10), parseInt(indices[1], 10)),
                selectedCardIndices = selectedCardElement.id.split(attributeSplitter),
                selectedCardCascadeColumn = parseInt(selectedCardIndices[0], 10),
                selectedCard = cascadeCards[selectedCardCascadeColumn][cascadeCards[selectedCardCascadeColumn].length - 1];

            if (cardChain && isValidChainContinuation(selectedCard, cardChain.startingCard)) {
                for (i = cardChain.cardLevel; i < cascadeCards[cardChain.cardColumn].length; ++i) {
                    cascadeCards[selectedCardCascadeColumn].push(cascadeCards[cardChain.cardColumn][i]);
                }
                
                cascadeCards[cardChain.cardColumn].splice(cardChain.cardLevel, cascadeCards[cardChain.cardColumn].length - cardChain.cardLevel);
            }
        },
        cardClick = function cascadeCardClick(event) {
            var element = event.currentTarget,
                selectedCardElement = selectedCardId ? document.getElementById(selectedCardId) : null,
                wasAbleToMoveCards = false;
            
            if (selectedCardId !== element.id) {
                wasAbleToMoveCards = selectedCardElement ? tryToMoveCardsOnTopOfSelectedCard(element, selectedCardElement) : false;
                
                if (!wasAbleToMoveCards) {
                    element.classList.add(modifyingClasses.selectedCard);
                    selectedCardId = element.id;
                }
            } else {
                selectedCardId = null;
            }
            
            if (selectedCardElement) {
                selectedCardElement.classList.remove(modifyingClasses.selectedCard);
            }
            
            if (wasAbleToMoveCards) {
                redrawCascades();
            }
        };*/
}());