/*global window*/
(function () {
    'use strict';
    
    function Game(configuration,
                  deck,
                  cascadeCardsInPlay) {
        var Game = this,
            configuration = configuration || window.freeCell.current.configuration,
            deck = deck || window.freeCell.defaults.deck,
            timer,
            getNumberOfOpenSpaces = function FreeCellGame_getNumberOfOpenSpaces() {
                var i,
                    numberOfOpenSpaces = 0;
                
                for (i = 0; i < numberOfFreeCells; ++i) {
                    if (!freeCellGame.freeCellCards[i]) {
                        ++numberOfOpenSpaces;
                    }
                }
                
                for (i = 0; i < numberOfCascades; ++i) {
                    if (freeCellGame.cascadeCards[i].length === 0) {
                        ++numberOfOpenSpaces;
                    }
                }
                
                return numberOfOpenSpaces;
            },
            updatePlayingFieldFreeCells = function FreeCellGame_updatePlayingFieldFreeCells() {
                var i,
                    freeCellGameMove = freeCellGame.freeCellGameMoves[freeCellGame.freeCellGameMoveIndex];
                
                for (i = 0; i < numberOfFreeCells; ++i) {
                    if (freeCellGameMove.freeCellCards[i] !== freeCellGame.freeCellCards[i]) {
                        if (freeCellGame.freeCellCards[i]) {
                            freeCellGame.freeCellCards[i].freeCellIndex = i;
                        }
                        
                        if (freeCellGameMove.freeCellCards[i]) {
                            freeCellGameMove.freeCellCards[i].freeCellIndex = -1;
                        }
                        
                        updateFreeCellElement(i, freeCellGame.freeCellCards[i]);
                    }
                }
            },
            updatePlayingFieldFoundations = function FreeCellGame_updatePlayingFieldFoundations() {
                var i,
                    currentCard,
                    previousCard,
                    freeCellGameMove = freeCellGame.freeCellGameMoves[freeCellGame.freeCellGameMoveIndex];
                
                updatePlayingFieldFreeCells();
                
                for (i = 0; i < numberOfSuits; ++i) {
                    if (freeCellGameMove.foundationCards[i].length !== freeCellGame.foundationCards[i].length) {
                        currentCard = freeCellGame.foundationCards[i].length > 0 ? freeCellGame.foundationCards[i][freeCellGame.foundationCards[i].length - 1] : null;
                        previousCard = freeCellGameMove.foundationCards[i].length > 0 ? freeCellGameMove.foundationCards[i][freeCellGameMove.foundationCards[i].length - 1] : null;
                        
                        if (currentCard) {
                            currentCard.foundationIndex = i;
                        }
                        
                        if (previousCard) {
                            previousCard.foundationIndex = -1;
                        }
                        
                        updateFoundationElement(i, currentCard);
                    }
                }
            },
            updatePlayingFieldCascades = function FreeCellGame_updatePlayingFieldCascades() {
                var i,
                    j,
                    currentCard,
                    previousCard,
                    freeCellGameMove = freeCellGame.freeCellGameMoves[freeCellGame.freeCellGameMoveIndex];

                for (i = 0; i < numberOfCascades; ++i) {
                    if (freeCellGameMove.cascadeCards[i].length !== freeCellGame.cascadeCards[i].length) {
                        for (j = 0; j < cascadeDistribution[i]; ++j) {
                            if (freeCellGameMove.cascadeCards[i][j] !== freeCellGame.cascadeCards[i][j]) {
                                updateCascadeElement(i, j, freeCellGame.cascadeCards[i]);
                                break;
                            }
                        }
                    }
                }
            },
            updatePlayingField = function FreeCellGame_updatePlayingField() {
                updatePlayingFieldFreeCells();
                updatePlayingFieldFoundations();
                updatePlayingFieldCascades();
                freeCellGame.selectedCard = null;
            },
            returnToFreeCellGameMove = function FreeCellGame_returnToFreeCellGameMove(freeCellGameMoveIndex) {
                var freeCellGameMove = freeCellGame.freeCellGameMoves[freeCellGameMoveIndex];
                
                freeCellGame.freeCellCards = freeCellGameMove.freeCellCards;
                freeCellGame.foundationCards = freeCellGameMove.foundationCards;
                freeCellGame.cascadeCards = freeCellGameMove.cascadeCards;
                
                updatePlayingField();
                freeCellGame.freeCellGameMoveIndex = freeCellGameMoveIndex;
                toggleButtonsDisabled();
            },
            redoFreeCellGameMove = function FreeCellGame_redoFreeCellGameMove() {
                if (freeCellGame.freeCellGameMoveIndex < freeCellGame.freeCellGameMoves.length - 1) {
                    returnToFreeCellGameMove(freeCellGame.freeCellGameMoveIndex + 1);
                }
            },
            undoFreeCellGameMove = function FreeCellGame_undoFreeCellGameMove() {
                if (freeCellGame.freeCellGameMoveIndex > 0) {
                    returnToFreeCellGameMove(freeCellGame.freeCellGameMoveIndex - 1);
                }
            },
            commitFreeCellGameMove = function FreeCellGame_commitFreeCellGameMove() {
                if (freeCellGame.freeCellGameMoveIndex > -1) {
                    freeCellGame.freeCellGameMoves.splice(freeCellGame.freeCellGameMoveIndex + 1, freeCellGame.freeCellGameMoves.length - 1 - freeCellGame.freeCellGameMoveIndex);
                }
                
                freeCellGame.freeCellGameMoves.push(new FreeCellGameMove(freeCellGame));
                updatePlayingField();
                freeCellGame.freeCellGameMoveIndex = freeCellGame.freeCellGameMoves.length - 1;
                toggleButtonsDisabled();
            },
            isSelectedCardLastInCascade = function FreeCellGame_isSelectedCardLastInCascade() {
                return freeCellGame.cascadeCards[freeCellGame.selectedCard.cascadeIndex].length - 1 === freeCellGame.selectedCard.cascadeChildIndex;
            },
            freeCellElementClick = function FreeCellGame_freeCellCardClick(event) {
                var freeCellIndex = getPersistentDomChildElementIdFromEvent(event),
                    lastInCascade;
                
                if (freeCellGame.freeCellCards[freeCellIndex]) {
                    if (freeCellGame.selectedCard) {
                        freeCellGame.selectedCard.isSelected = false;
                    }
                    
                    freeCellGame.selectedCard = freeCellGame.freeCellCards[freeCellIndex];
                    freeCellGame.selectedCard.isSelected = true;
                } else if (freeCellGame.selectedCard) {
                    lastInCascade = isSelectedCardLastInCascade();
                    
                    if (freeCellGame.selectedCard.freeCellIndex > -1 || lastInCascade) {
                        freeCellGame.selectedCard.isSelected = false;
                        freeCellGame.freeCellCards[freeCellIndex] = freeCellGame.selectedCard;
                        
                        if (lastInCascade) {
                            freeCellGame.cascadeCards[freeCellGame.selectedCard.cascadeIndex].pop();
                        } else {
                            freeCellGame.freeCellCards[freeCellGame.selectedCard.freeCellIndex] = null;
                        }
                        
                        commitFreeCellGameMove();
                    } else {
                        freeCellGame.selectedCard.isSelected = false;
                        freeCellGame.selectedCard = null;
                    }
                }
            },
            canMoveSelectedCardToFoundation = function FreeCellGame_canMoveSelectedCardToFoundation(foundationIndex) {
                var foundation = freeCellGame.foundationCards[foundationIndex];
                
                return suitOrder[foundationIndex] === freeCellGame.selectedCard.suit
                        && ((foundation.length === 0 && freeCellGame.selectedCard.value === 1)
                                || foundation[foundation.length - 1].value + 1 ===  freeCellGame.selectedCard.value);
            },
            freeCellElementDoubleClick = function FreeCellGame_freeCellElementDoubleClick(event) {
                var freeCellIndex = getPersistentDomChildElementIdFromEvent(event),
                    freeCellCard = freeCellGame.freeCellCards[freeCellIndex],
                    foundationIndex;
                
                freeCellGame.selectedCard.isSelected = false;
                freeCellGame.selectedCard = null;
                
                if (freeCellCard) {
                    foundationIndex = tryToGetSuitOrderFromSuit(freeCellCard.suit);
                    
                    if (foundationIndex > -1 && canMoveSelectedCardToFoundation(foundationIndex)) {
                        freeCellGame.foundationCards[foundationIndex].push(freeCellCard);
                        freeCellGame.freeCellCards[freeCellIndex] = null;
                        commitFreeCellGameMove();
                    }
                }
            },
            foundationElementClick = function FreeCellGame_foundationCardClick(event) {
                var foundationIndex = getPersistentDomChildElementIdFromEvent(event),
                    lastInCascade = isSelectedCardLastInCascade();
                
                if (freeCellGame.selectedCard
                        && canMoveSelectedCardToFoundation(foundationIndex)
                        && (freeCellGame.selectedCard.freeCellIndex > -1 || lastInCascade)) {
                    freeCellGame.selectedCard.isSelected = false;
                    freeCellGame.foundationCards[foundationIndex].push(freeCellGame.selectedCard);
                    
                    if (lastInCascade) {
                        freeCellGame.cascadeCards[freeCellGame.selectedCard.cascadeIndex].pop();
                    } else {
                        freeCellGame.freeCellCards[freeCellGame.selectedCard.freeCellIndex] = null;
                    }
                    
                    commitFreeCellGameMove();
                } else {
                    freeCellGame.selectedCard.isSelected = false;
                    freeCellGame.selectedCard = null;
                }
            },
            cascadeElementClick = function FreeCellGame_cascadeClick(event) {
                var cascadeIndex = getPersistentDomChildElementIdFromEvent(event);
            },
            cascadeCardElementClick = function FreeCellGame_cascadeCardClick(event) {
                var cascadeCardIndices = getCascadeChildElementIndicesFromEvent(event);
                
                if (!freeCellGame.selectedCard) {
                    freeCellGame.selectedCard = freeCellGame.cascadeCards[cascadeCardIndices[0]][cascadeCardIndices[1]];
                    freeCellGame.selectedCard.isSelected = true;
                }
            },
            cascadeCardElementDoubleClick = function FreeCellGame_cascadeCardDoubleClick(event) {
                var cascadeCardIndices = getCascadeChildElementIndicesFromEvent(event),
                    cascadeCard = freeCellGame.cascadeCards[cascadeCardIndices[0]][cascadeCardIndices[1]],
                    foundationIndex = tryToGetSuitOrderFromSuit(cascadeCard.suit);
                
                freeCellGame.selectedCard.isSelected = false;
                freeCellGame.selectedCard = null;
                
                if (freeCellGame.cascadeCards[cascadeCardIndices[0]].length - 1 === cascadeCardIndices[1]
                        && foundationIndex > -1
                        && canMoveSelectedCardToFoundation(foundationIndex)) {
                    freeCellGame.foundationCards[foundationIndex].push(cascadeCard);
                    freeCellGame.cascadeCards[cascadeCardIndices[0]].pop();
                    commitFreeCellGameMove();
                }
            },
            linkElementEvents = function FreeCellGame_linkElementEvents() {
                var i;
                
                menuDomEelements.redoButton.onclick = redoFreeCellGameMove;
                menuDomEelements.undoButton.onclick = undoFreeCellGameMove;
                menuDomEelements.replayGameButton.onclick = replayFreeCellGame;
                
                menuDomEelements.newGameButton.onclick = function () {
                    gameTimer.stopGameTimer();
                    startNewFreeCellGame();
                };
                
                for (i = 0; i < numberOfFreeCells; ++i) {
                    persistentDomElements.freeCells.children[i].onclick = freeCellElementClick;
                    persistentDomElements.freeCells.children[i].ondblclick = freeCellElementDoubleClick;
                }
                
                for (i = 0; i < numberOfSuits; ++i) {
                    persistentDomElements.foundations.children[i].onclick = foundationElementClick;
                }
                
                for (i = 0; i < numberOfCascades; ++i) {
                    persistentDomElements.cascades.children[i].onclick = cascadeElementClick;
                }
            },
            toggleButtonsDisabled = function FreeCellGame_toggleButtonsDisabled() {
                toggleButtonDisabled(menuDomEelements.redoButton, freeCellGame.freeCellGameMoveIndex === freeCellGame.freeCellGameMoves.length - 1);
                toggleButtonDisabled(menuDomEelements.undoButton, freeCellGame.freeCellGameMoveIndex === 0);
            },
            fillCascadeElements = function FreeCellGame_fillCascadeElements() {
                var i,
                    j,
                    cascade,
                    cardElement;
            
                for (i = 0; i < numberOfCascades; ++i) {
                    cascade = persistentDomElements.cascades.children[i];
                
                    for (j = 0; j < cascadeDistribution[i]; ++j) {
                        cardElement = generateCascadeChildElement(freeCellGame.cascadeCards[i][j]);
                        cardElement.id = i + attributeSplitter + j;
                        cardElement.onclick = cascadeCardElementClick;
                        cardElement.ondblclick = cascadeCardElementDoubleClick;
                    
                        if (j > 0) {
                            cardElement.style.marginTop = -cascadeCardSpacingPixels + 'px';
                        }
                    
                        cascade.appendChild(cardElement);
                    }
                }
            },
            initialize = function FreeCellGame_initialize() {
                var i;
                
                gameTimer = new GameTimer();
                freeCellGame.freeCellCards = [];
                freeCellGame.foundationCards = [];
                freeCellGame.cascadeCards = cascadeCards || generateNewCascadeCards();
                freeCellGame.selectedCard = null;
                freeCellGame.freeCellGameMoves = [];
                freeCellGame.freeCellGameMoveIndex = 0;
                
                for (i = 0; i < numberOfFreeCells; ++i) {
                    freeCellGame.freeCellCards.push(null);
                }
                
                for (i = 0; i < numberOfSuits; ++i) {
                    freeCellGame.foundationCards.push([]);
                }
                
                cleanPersistentDomElements();
                fillCascadeElements();
                commitFreeCellGameMove();
                linkElementEvents();
                toggleButtonsDisabled();
            },
            replayFreeCellGame = function FreeCellGame_replayFreeCellGame() {
                gameTimer.stopGameTimer();
                initialize(freeCellGame.freeCellGameMoves[0].cascadeCards);
            };
        
        initialize();
    }
    
    window.freeCell.Game = Game;
}());