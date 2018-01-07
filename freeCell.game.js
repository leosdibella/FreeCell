/*global window, setTimeout, clearTimeout*/
(function () {
    'use strict';
    
    function Game() {
        var game = this,
            timeout,
            timer = new window.freeCell.Timer(),
            toggleButtonsDisabled = function Game_toggleButtonsDisabled() {
                var inTimeout = !!timeout && game.autoMoveCardInPlay;
                
                window.freeCell.dom.toggleRedoButtonDisabled(inTimeout || game.moveIndex === game.moves.length - 1);
                window.freeCell.dom.toggleUndoButtonDisabled(inTimeout || game.moveIndex === 0);
                window.freeCell.dom.toggleAutoMoveButtonDisabled(inTimeout || !game.autoMoveCardInPlay);
                timer.disablePausing(inTimeout);
            },
            unselectSelectedCard = function Game_unselectSelectedCard() {
                if (game.selectedCardInPlay) {
                    game.selectedCardInPlay.isSelected = false;
                    game.selectedCardInPlay = null;
                }
            },
            canMoveCardInPlayToFoundation = function Game_canMoveSelectedCardToFoundation(foundationIndex, cardInPlay) {
                var foundation = game.foundationCardsInPlay[foundationIndex];
                
                return cardInPlay
                        && game.configuration.deck.suitOrder[foundationIndex] === cardInPlay.card.suit
                        && ((foundation.length === 0 && cardInPlay.card.value === 1)
                                || (foundation.length > 0 && foundation[foundation.length - 1].value + 1 ===  cardInPlay.card.value));
            },
            getAutoMoveCardInPlay = function Game_getAutoMoveCardInPlay() {
                var i,
                    j,
                    cardInPlay;
            
                for (i = 0; i < game.configuration.deck.numberOfSuits; ++i) {
                    for (j = 0; j < game.configuration.numberOfCascades; ++j) {
                        cardInPlay = game.cascadeCardsInPlay[j][game.cascadeCardsInPlay[j].length - 1];
                        
                        if (canMoveCardInPlayToFoundation(i, cardInPlay)) {
                            return cardInPlay;
                        }
                    }
                    
                    for (j = 0; j < game.configuration.numberOfFreeCells; ++j) {
                        cardInPlay = game.freeCellCardsInPlay[j];
                        
                        if (canMoveCardInPlayToFoundation(i, cardInPlay)) {
                            return cardInPlay;
                        }
                    }
                }
                
                return null;
            },
            setAutoMoveCardInPlay = function Game_setAutoMoveCardInPlay() {
                game.autoMoveCardInPlay = getAutoMoveCardInPlay();
            },
            getNumberOfOpenSpaces = function Game_getNumberOfOpenSpaces() {
                var i,
                    numberOfOpenSpaces = 1;
                
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
            updatePlayingFieldFreeCells = function Game_updatePlayingFieldFreeCells(move) {
                var i,
                    currentCardInPlay,
                    previousCardInPlay;
                
                for (i = 0; i < game.configuration.numberOfFreeCells; ++i) {
                    currentCardInPlay = game.freeCellCardsInPlay[i];
                    previousCardInPlay = move.freeCellCardsInPlay[i];
                    
                    if (currentCardInPlay !== previousCardInPlay) {
                        if (currentCardInPlay) {
                            currentCardInPlay.freeCellIndex = i;
                            currentCardInPlay.cascadeIndex = -1;
                            currentCardInPlay.cascadeChildIndex = -1;
                        }
                        
                        if (previousCardInPlay) {
                            previousCardInPlay.freeCellIndex = -1;
                        }
                        
                        window.freeCell.dom.updateFreeCellElement(i, currentCardInPlay);
                    }
                }
            },
            updatePlayingFieldFoundations = function Game_updatePlayingFieldFoundations(move) {
                var i,
                    currentCardInPlay,
                    previousCardInPlay;
                
                for (i = 0; i < game.configuration.deck.numberOfSuits; ++i) {
                    if (move.foundationCardsInPlay[i].length !== game.foundationCardsInPlay[i].length) {
                        currentCardInPlay = game.foundationCardsInPlay[i].length > 0 ? game.foundationCardsInPlay[i][game.foundationCardsInPlay[i].length - 1] : null;
                        previousCardInPlay = move.foundationCardsInPlay[i].length > 0 ? move.foundationCardsInPlay[i][move.foundationCardsInPlay[i].length - 1] : null;
                        
                        if (currentCardInPlay) {
                            currentCardInPlay.foundationIndex = i;
                            currentCardInPlay.cascadeIndex = -1;
                            currentCardInPlay.cascadeChildIndex = -1;
                        }
                        
                        if (previousCardInPlay) {
                            previousCardInPlay.foundationIndex = -1;
                        }
                        
                        window.freeCell.dom.updateFoundationElement(i, currentCardInPlay, game.configuration.deck.suitOrder[i]);
                    }
                }
            },
            updatePlayingFieldCascades = function Game_updatePlayingFieldCascades(move) {
                var i,
                    j,
                    startingIndex,
                    cascadeChildIndex,
                    lengthDifferences = [];
                
                for (i = 0; i < game.configuration.numberOfCascades; ++i) {
                    startingIndex = move.cascadeCardsInPlay[i].length;
                    lengthDifferences.push(game.cascadeCardsInPlay[i].length - startingIndex);
                    
                    if (lengthDifferences[i] > 0) {
                        for (j = 0; j < lengthDifferences[i]; ++i) {
                            cascadeChildIndex = startingIndex + j;
                            
                            game.cascadeCardsInPlay[i][cascadeChildIndex].cascadeIndex = i;
                            game.cascadeCardsInPlay[i][cascadeChildIndex].cascadeChildIndex = cascadeChildIndex;
                        }
                    }
                }

                for (i = 0; i < game.configuration.numberOfCascades; ++i) {
                    if (lengthDifferences[i] < 0) {
                        window.freeCell.dom.updateCascadeElement(i, game.cascadeCardsInPlay[i].length, move.cascadeCardsInPlay[i]);
                    } else if (lengthDifferences[i] > 0) {
                        window.freeCell.dom.updateCascadeElement(i, move.cascadeCardsInPlay[i].length, game.cascadeCardsInPlay[i]);
                    }
                }
            },
            updatePlayingField = function Game_updatePlayingField() {
                var currentMove = game.moves[game.moveIndex],
                    move = game.moves[game.moveIndex - (currentMove.cascadeCardsInPlay === game.cascadeCardsInPlay ? 1 : 0)] || currentMove;
                
                updatePlayingFieldFreeCells(move);
                updatePlayingFieldFoundations(move);
                updatePlayingFieldCascades(move);
                unselectSelectedCard();
            },
            returnToFreeCellGameMove = function Game_returnToFreeCellGameMove(moveIndex) {
                var move = game.moves[moveIndex];
                
                game.freeCellCardsInPlay = move.freeCellCardsInPlay;
                game.foundationCardsInPlay = move.foundationCardsInPlay;
                game.cascadeCardsInPlay = move.cascadeCardsInPlay;
                
                updatePlayingField();
                game.moveIndex = moveIndex;
                setAutoMoveCardInPlay();
                toggleButtonsDisabled();
            },
            commitFreeCellGameMove = function Game_commitFreeCellGameMove() {
                if (game.moveIndex > -1) {
                    game.moves.splice(game.moveIndex + 1, game.moves.length - 1 - game.moveIndex);
                }
                
                game.moves.push(new window.freeCell.Move(game.freeCellCardsInPlay, game.foundationCardsInPlay, game.cascadeCardsInPlay));
                updatePlayingField();
                game.moveIndex = game.moves.length - 1;
                setAutoMoveCardInPlay();
                toggleButtonsDisabled();
            },
            isSelectedCardLastInCascade = function Game_isSelectedCardLastInCascade() {
                return game.selectedCardInPlay && game.cascadeCardsInPlay[game.selectedCardInPlay.cascadeIndex].length - 1 === game.selectedCardInPlay.cascadeChildIndex;
            },
            tryToGetValidCascade = function Game_tryToGetValidCascade(fromCascadeIndex, toCascadeIndex, startingIndex) {
                var toCascadeLastInCascadeCard,
                    numberOfOpenSpaces = getNumberOfOpenSpaces(),
                    fromCascade = game.cascadeCardsInPlay[fromCascadeIndex],
                    toCascade = game.cascadeCardsInPlay[toCascadeIndex],
                    fromCascadeStaringCascadeCard = fromCascade[startingIndex];
                
                if (fromCascade.length - 1 - startingIndex > numberOfOpenSpaces) {
                    return null;
                }
                
                if (toCascade.length > 0) {
                    toCascadeLastInCascadeCard = toCascade[toCascade.length - 1].card;
                    
                    if (toCascadeLastInCascadeCard.suit.rgbColor === fromCascadeStaringCascadeCard.suit.rgbColor
                            || toCascadeLastInCascadeCard.value !== fromCascadeStaringCascadeCard.value + 1) {
                        return null;
                    }
                }
                
                return new window.freeCell.CardInPlay(fromCascade, toCascade, startingIndex);
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
                unselectSelectedCard();
                game.autoMoveCardInPlay = null;
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
            game.destroy();
            timer = new window.freeCell.Timer();
            initialize(true);
        };
        
        game.redoMove = function Game_redoMove() {
            timer.resume();
            returnToFreeCellGameMove(game.moveIndex + 1);
        };
        
        game.destroy = function Game_stopTimer() {
            if (timeout) {
                clearTimeout(timeout);
            }
            
            timer.stopTimer();
        };
        
        game.undoMove = function Game_undoMove() {
            timer.resume();
            returnToFreeCellGameMove(game.moveIndex - 1);
        };
        
        game.cascadeCardElementDoubleClick = function Game_cascadeCardDoubleClick(event) {
            event.stopPropagation();
            timer.resume();
            
            if (!timeout) {
                var cascadeCardIndices = window.freeCell.dom.getCascadeChildElementIndicesFromEvent(event),
                    cascadeCard = game.cascadeCardsInPlay[cascadeCardIndices[0]][cascadeCardIndices[1]],
                    foundationIndex = game.configuration.deck.tryToGetSuitOrderFromSuit(cascadeCard.suit);
                
                game.selectedCardInPlay.isSelected = false;
                game.selectedCardInPlay = null;
                
                if (game.cascadeCardsInPlay[cascadeCardIndices[0]].length - 1 === cascadeCardIndices[1]
                        && foundationIndex > -1
                        && canMoveCardInPlayToFoundation(foundationIndex, game.selectedCardInPlay)) {
                    game.foundationCardsInPlay[foundationIndex].push(cascadeCard);
                    game.cascadeCardsInPlay[cascadeCardIndices[0]].pop();
                    commitFreeCellGameMove();
                }
            }
        };
        
        game.cascadeElementClick = function Game_cascadeClick(event) {
            event.stopPropagation();
            timer.resume();
            
            if (!timeout) {
                var cascade,
                    cascadeIndex = window.freeCell.dom.getPlayingFieldElementChildIdFromEvent(event);
                
                if (game.selectedCardInPlay) {
                    game.selectedCardInPlay.isSelected = false;
                    cascade = game.selectedCardInPlay.freeCellIndex === -1 ? tryToGetValidCascade(game.selectedCardInPlay.cascadeIndex, cascadeIndex, game.selectedCardInPlay.cascadeChildIndex) : -1;
                    
                    if (game.selectedCardInPlay.freeCellIndex > -1 || cascade) {
                        game.cascadeCardsInPlay[cascadeIndex].push(game.selectedCardInPlay);
                    
                        if (game.selectedCardInPlay.freeCellIndex > -1) {
                            game.freeCellCardsInPlay[game.selectedCardInPlay.freeCellIndex] = null;
                        } else {
                            cascade.action();
                        }
                        
                        commitFreeCellGameMove();
                    } else {
                        unselectSelectedCard();
                    }
                }
            }
        };
        
        game.cascadeCardElementClick = function Game_cascadeCardClick(event) {
            event.stopPropagation();
            timer.resume();
            
            if (!timeout) {
                var cascadeCardIndices = window.freeCell.dom.getCascadeChildElementIndicesFromEvent(event);
                
                if (!game.selectedCardInPlay) {
                    game.selectedCardInPlay = game.cascadeCardsInPlay[cascadeCardIndices[0]][cascadeCardIndices[1]];
                    game.selectedCardInPlay.isSelected = true;
                }
            }
        };
        
        game.freeCellElementClick = function Game_freeCellCardClick(event) {
            event.stopPropagation();
            timer.resume();
            
            if (!timeout) {
                var freeCellIndex = window.freeCell.dom.getPlayingFieldElementChildIdFromEvent(event),
                    lastInCascade;
                
                if (game.freeCellCardsInPlay[freeCellIndex]) {
                    if (game.selectedCardInPlay) {
                        game.selectedCardInPlay.isSelected = false;
                    }
                    
                    game.selectedCardInPlay = game.freeCellCardsInPlay[freeCellIndex];
                    game.selectedCardInPlay.isSelected = true;
                } else if (game.selectedCardInPlay) {
                    lastInCascade = isSelectedCardLastInCascade();
                    
                    if (game.selectedCardInPlay.freeCellIndex > -1 || lastInCascade) {
                        game.selectedCardInPlay.isSelected = false;
                        game.freeCellCardsInPlay[freeCellIndex] = game.selectedCardInPlay;
                        
                        if (lastInCascade) {
                            game.cascadeCardsInPlay[game.selectedCardInPlay.cascadeIndex].pop();
                        } else {
                            game.freeCellCardsInPlay[game.selectedCardInPlay.freeCellIndex] = null;
                        }
                        
                        commitFreeCellGameMove();
                    } else {
                        unselectSelectedCard();
                    }
                }
            }
        };
        
        game.freeCellElementDoubleClick = function Game_freeCellElementDoubleClick(event) {
            event.stopPropagation();
            timer.resume();
            
            if (!timeout) {
                var freeCellIndex = window.freeCell.dom.getPlayingFieldElementChildIdFromEvent(event),
                    freeCellCard = game.freeCellCardsInPlay[freeCellIndex],
                    foundationIndex;
                
                if (freeCellCard) {
                    foundationIndex = game.configuration.deck.tryToGetSuitOrderFromSuit(freeCellCard.suit);
                    
                    if (foundationIndex > -1 && canMoveCardInPlayToFoundation(foundationIndex, game.selectedCardInPlay)) {
                        game.foundationCardsInPlay[foundationIndex].push(freeCellCard);
                        game.freeCellCardsInPlay[freeCellIndex] = null;
                        commitFreeCellGameMove();
                    }
                } else {
                    unselectSelectedCard();
                }
            }
        };
        
        game.foundationElementClick = function Game_foundationCardClick(event) {
            event.stopPropagation();
            timer.resume();
            
            if (!timeout) {
                var foundationIndex = window.freeCell.dom.getPlayingFieldElementChildIdFromEvent(event),
                    lastInCascade = isSelectedCardLastInCascade();
                
                if (game.selectedCardInPlay
                        && canMoveCardInPlayToFoundation(foundationIndex, game.selectedCardInPlay)
                        && (game.selectedCardInPlay.freeCellIndex > -1 || lastInCascade)) {
                    game.selectedCardInPlay.isSelected = false;
                    game.foundationCardsInPlay[foundationIndex].push(game.selectedCardInPlay);
                    
                    if (lastInCascade) {
                        game.cascadeCardsInPlay[game.selectedCardInPlay.cascadeIndex].pop();
                    } else {
                        game.freeCellCardsInPlay[game.selectedCardInPlay.freeCellIndex] = null;
                    }
                    
                    commitFreeCellGameMove();
                } else {
                    unselectSelectedCard();
                }
            }
        };
        
        game.autoMove = function Game_autoMove() {
            if (game.autoMoveCardInPlay) {
                var foundationIndex = game.configuration.deck.tryToGetSuitOrderIndexFromSuit(game.autoMoveCardInPlay.card.suit);
                
                timer.resume();
                unselectSelectedCard();
                game.foundationCardsInPlay[foundationIndex].push(game.autoMoveCardInPlay);
            
                if (game.autoMoveCardInPlay.freeCellIndex > -1) {
                    game.freeCellCardsInPlay[game.autoMoveCardInPlay.freeCellIndex] = null;
                } else {
                    game.cascadeCardsInPlay[game.autoMoveCardInPlay.cascadeIndex].pop();
                }
                
                commitFreeCellGameMove();
                timeout = game.autoMoveCardInPlay ? setTimeout(game.autoMove, 200) : null;
            }
        };
        
        initialize();
    }
    
    window.freeCell.Game = Game;
}());