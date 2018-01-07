/*global window*/
(function () {
    'use strict';
    
    function Game() {
        var game = this,
            timer = new window.freeCell.Timer(),
            toggleButtonsDisabled = function Game_toggleButtonsDisabled() {
                window.freeCell.dom.toggleRedoButtonDisabled(game.moveIndex === game.moves.length - 1);
                window.freeCell.dom.toggleUndoButtonDisabled(game.moveIndex === 0);
            },
            getNumberOfOpenSpaces = function Game_getNumberOfOpenSpaces() {
                var i,
                    numberOfOpenSpaces = 0;
                
                for (i = 0; i < game.configuration.numberOfFreeCells; ++i) {
                    if (!game.freeCellCardsInPlay[i]) {
                        ++numberOfOpenSpaces;
                    }
                }
                
                for (i = 0; i < game.configuration.numberOfCascades; ++i) {
                    if (game.cascadeCardsInPlay[i].length === 0) {
                        ++numberOfOpenSpaces;
                    }
                }
                
                return numberOfOpenSpaces;
            },
            updatePlayingFieldFreeCells = function Game_updatePlayingFieldFreeCells() {
                var i,
                    move = game.moves[game.moveIndex];
                
                for (i = 0; i < game.configuration.numberOfFreeCells; ++i) {
                    if (move.freeCellCardsInPlay[i] !== game.freeCellCardsInPlay[i]) {
                        if (game.freeCellCardsInPlay[i]) {
                            game.freeCellCardsInPlay[i].freeCellIndex = i;
                        }
                        
                        if (move.freeCellCardsInPlay[i]) {
                            move.freeCellCardsInPlay[i].freeCellIndex = -1;
                        }
                        
                        window.freeCell.dom.updateFreeCellElement(i, game.freeCellCardsInPlay[i]);
                    }
                }
            },
            updatePlayingFieldFoundations = function Game_updatePlayingFieldFoundations() {
                var i,
                    currentCard,
                    previousCard,
                    move = game.moves[game.moveIndex];
                
                updatePlayingFieldFreeCells();
                
                for (i = 0; i < game.configuration.deck.numberOfSuits; ++i) {
                    if (move.foundationCardsInPlay[i].length !== game.foundationCardsInPlay[i].length) {
                        currentCard = game.foundationCardsInPlay[i].length > 0 ? game.foundationCardsInPlay[i][game.foundationCardsInPlay[i].length - 1] : null;
                        previousCard = move.foundationCardsInPlay[i].length > 0 ? move.foundationCardsInPlay[i][move.foundationCardsInPlay[i].length - 1] : null;
                        
                        if (currentCard) {
                            currentCard.foundationIndex = i;
                        }
                        
                        if (previousCard) {
                            previousCard.foundationIndex = -1;
                        }
                        
                        window.freeCell.dom.updateFoundationElement(i, currentCard);
                    }
                }
            },
            updatePlayingFieldCascades = function Game_updatePlayingFieldCascades() {
                var i,
                    j,
                    currentCard,
                    previousCard,
                    move = game.moves[game.moveIndex];

                for (i = 0; i < game.configuration.numberOfCascades; ++i) {
                    if (move.cascadeCardsInPlay[i].length !== game.cascadeCardsInPlay[i].length) {
                        for (j = 0; j < game.configuration.cascadeDistribution[i]; ++j) {
                            if (move.cascadeCardsInPlay[i][j] !== game.cascadeCardsInPlay[i][j]) {
                                window.freeCell.dom.updateCascadeElement(i, j, game.cascadeCardsInPlay[i]);
                                break;
                            }
                        }
                    }
                }
            },
            updatePlayingField = function Game_updatePlayingField() {
                updatePlayingFieldFreeCells();
                updatePlayingFieldFoundations();
                updatePlayingFieldCascades();
                game.selectedCard = null;
            },
            returnToFreeCellGameMove = function Game_returnToFreeCellGameMove(moveIndex) {
                var move = game.moves[moveIndex];
                
                game.freeCellCardsInPlay = move.freeCellCardsInPlay;
                game.foundationCardsInPlay = move.foundationCardsInPlay;
                game.cascadeCardsInPlay = move.cascadeCardsInPlay;
                
                updatePlayingField();
                game.moveIndex = moveIndex;
                toggleButtonsDisabled();
            },
            commitFreeCellGameMove = function Game_commitFreeCellGameMove() {
                if (game.moveIndex > -1) {
                    game.moves.splice(game.moveIndex + 1, game.moves.length - 1 - game.moveIndex);
                }
                
                game.moves.push(new window.freeCell.Move(game.freeCellCardsInPlay, game.foundationCardsInPlay, game.cascadeCardsInPlay));
                updatePlayingField();
                game.moveIndex = game.moves.length - 1;
                toggleButtonsDisabled();
            },
            isSelectedCardLastInCascade = function Game_isSelectedCardLastInCascade() {
                return game.cascadeCardsInPlay[game.selectedCard.cascadeIndex].length - 1 === game.selectedCard.cascadeChildIndex;
            },
            canMoveSelectedCardToFoundation = function Game_canMoveSelectedCardToFoundation(foundationIndex) {
                var foundation = game.foundationCardsInPlay[foundationIndex];
                
                return game.configuration.deck.suitOrder[foundationIndex] === game.selectedCard.suit
                        && ((foundation.length === 0 && game.selectedCard.value === 1)
                                || foundation[foundation.length - 1].value + 1 ===  game.selectedCard.value);
            },
            deal = function Game_deal(dontShuffle) {
                var i,
                    j,
                    cascadeCardsInPlay = [];
                
                if (!dontShuffle) {
                    game.configuration.deck.shuffle();
                }
                
                for (i = 0; i < game.configuration.numberOfCascades; ++i) {
                    cascadeCardsInPlay.push([]);
                    
                    for (j = 0; j < game.configuration.cascadeDistribution[i]; ++j) {
                        cascadeCardsInPlay[i].push(new window.freeCell.CardInPlay(game.configuration.deck.cards[(i * game.configuration.cascadeDistribution[i]) + j], i, j));
                    }
                }
                
                return cascadeCardsInPlay;
            },
            initialize = function Game_initialize(dontShuffle) {
                var i;
                
                game.configuration = window.freeCell.current.configuration || window.freeCell.defaults.configuration;
                game.freeCellCardsInPlay = [];
                game.foundationCardsInPlay = [];
                game.cascadeCardsInPlay = deal(dontShuffle);
                game.selectedCard = null;
                game.moves = [];
                game.moveIndex = 0;
                
                for (i = 0; i < game.configuration.numberOfFreeCells; ++i) {
                    game.freeCellCardsInPlay.push(null);
                }
                
                for (i = 0; i < game.configuration.deck.numberOfSuits; ++i) {
                    game.foundationCardsInPlay.push([]);
                }
                
                commitFreeCellGameMove();
                toggleButtonsDisabled();
                window.freeCell.dom.linkGameToDom(game);
            };
        
        game.pause = function Game_pause() {
            timer.pause();
        };
        
        game.replay = function Game_replay() {
            timer.stopTimer();
            timer = new window.freeCell.Timer();
            initialize(true);
        };
        
        game.redoMove = function Game_redoMove() {
            if (game.moveIndex < game.moves.length - 1) {
                returnToFreeCellGameMove(game.moveIndex + 1);
            }
        };
        
        game.destroy = function Game_stopTimer() {
            timer.stopTimer();
        };
        
        game.undoMove = function Game_undoMove() {
            if (game.moveIndex > 0) {
                returnToFreeCellGameMove(game.moveIndex - 1);
            }
        };
        
        game.cascadeCardElementDoubleClick = function Game_cascadeCardDoubleClick(event) {
            var cascadeCardIndices = window.freeCell.dom.getCascadeChildElementIndicesFromEvent(event),
                cascadeCard = game.cascadeCardsInPlay[cascadeCardIndices[0]][cascadeCardIndices[1]],
                foundationIndex = game.configuration.deck.tryToGetSuitOrderFromSuit(cascadeCard.suit);
                
            game.selectedCard.isSelected = false;
            game.selectedCard = null;
                
            if (game.cascadeCardsInPlay[cascadeCardIndices[0]].length - 1 === cascadeCardIndices[1]
                    && foundationIndex > -1
                    && canMoveSelectedCardToFoundation(foundationIndex)) {
                game.foundationCardsInPlay[foundationIndex].push(cascadeCard);
                game.cascadeCardsInPlay[cascadeCardIndices[0]].pop();
                commitFreeCellGameMove();
            }
        };
        
        game.cascadeElementClick = function Game_cascadeClick(event) {
            var cascadeIndex = window.freeCell.dom.getPersistentDomChildElementIdFromEvent(event);
        };
        
        game.cascadeCardElementClick = function Game_cascadeCardClick(event) {
            var cascadeCardIndices = window.freeCell.dom.getCascadeChildElementIndicesFromEvent(event);
                
            if (!game.selectedCard) {
                game.selectedCard = game.cascadeCardsInPlay[cascadeCardIndices[0]][cascadeCardIndices[1]];
                game.selectedCard.isSelected = true;
            }
        };
        
        game.freeCellElementClick = function Game_freeCellCardClick(event) {
            var freeCellIndex = window.freeCell.dom.getPersistentDomChildElementIdFromEvent(event),
                lastInCascade;
                
            if (game.freeCellCardsInPlay[freeCellIndex]) {
                if (game.selectedCard) {
                    game.selectedCard.isSelected = false;
                }
                    
                game.selectedCard = game.freeCellCardsInPlay[freeCellIndex];
                game.selectedCard.isSelected = true;
            } else if (game.selectedCard) {
                lastInCascade = isSelectedCardLastInCascade();
                    
                if (game.selectedCard.freeCellIndex > -1 || lastInCascade) {
                    game.selectedCard.isSelected = false;
                    game.freeCellCardsInPlay[freeCellIndex] = game.selectedCard;
                        
                    if (lastInCascade) {
                        game.cascadeCardsInPlay[game.selectedCard.cascadeIndex].pop();
                    } else {
                        game.freeCellCardsInPlay[game.selectedCard.freeCellIndex] = null;
                    }
                        
                    commitFreeCellGameMove();
                } else {
                    game.selectedCard.isSelected = false;
                    game.selectedCard = null;
                }
            }
        };
        
        game.freeCellElementDoubleClick = function Game_freeCellElementDoubleClick(event) {
            var freeCellIndex = window.freeCell.dom.getPersistentDomChildElementIdFromEvent(event),
                freeCellCard = game.freeCellCardsInPlay[freeCellIndex],
                foundationIndex;
                
            game.selectedCard.isSelected = false;
            game.selectedCard = null;
                
            if (freeCellCard) {
                foundationIndex = game.configuration.deck.tryToGetSuitOrderFromSuit(freeCellCard.suit);
                    
                if (foundationIndex > -1 && canMoveSelectedCardToFoundation(foundationIndex)) {
                    game.foundationCardsInPlay[foundationIndex].push(freeCellCard);
                    game.freeCellCardsInPlay[freeCellIndex] = null;
                    commitFreeCellGameMove();
                }
            }
        };
        
        game.foundationElementClick = function Game_foundationCardClick(event) {
            var foundationIndex = window.freeCell.dom.getPersistentDomChildElementIdFromEvent(event),
                lastInCascade = isSelectedCardLastInCascade();
                
            if (game.selectedCard
                    && canMoveSelectedCardToFoundation(foundationIndex)
                    && (game.selectedCard.freeCellIndex > -1 || lastInCascade)) {
                game.selectedCard.isSelected = false;
                game.foundationCardsInPlay[foundationIndex].push(game.selectedCard);
                    
                if (lastInCascade) {
                    game.cascadeCardsInPlay[game.selectedCard.cascadeIndex].pop();
                } else {
                    game.freeCellCardsInPlay[game.selectedCard.freeCellIndex] = null;
                }
                    
                commitFreeCellGameMove();
            } else {
                game.selectedCard.isSelected = false;
                game.selectedCard = null;
            }
        };
        
        initialize();
    }
    
    window.freeCell.Game = Game;
}());