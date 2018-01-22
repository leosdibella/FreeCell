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
            canMoveCardInPlayToFoundation = function Game_canMoveSelectedCardToFoundation(foundationIndex, cardInPlay) {
                var foundation = game.move.foundationCardsInPlay[foundationIndex];

                return cardInPlay
                        && game.configuration.deck.suitOrder[foundationIndex] === cardInPlay.card.suit
                        && ((foundation.length === 0 && cardInPlay.card.value === 1)
                                || (foundation.length > 0 && foundation[foundation.length - 1].card.value + 1 ===  cardInPlay.card.value));
            },
            getAutoMoveCardInPlay = function Game_getAutoMoveCardInPlay() {
                var i,
                    j,
                    cardInPlay;

                for (i = 0; i < game.configuration.deck.numberOfSuits; ++i) {
                    for (j = 0; j < game.configuration.numberOfCascades; ++j) {
                        cardInPlay = game.move.cascadeCardsInPlay[j][game.move.cascadeCardsInPlay[j].length - 1];

                        if (canMoveCardInPlayToFoundation(i, cardInPlay)) {
                            return cardInPlay;
                        }
                    }

                    for (j = 0; j < game.configuration.numberOfFreeCells; ++j) {
                        cardInPlay = game.move.freeCellCardsInPlay[j];

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
                    numberOfOpenSpaces = 1; // Note that the player can always move at least one card even if all FreeCells and Cascades are occupied

                for (i = 0; i < game.configuration.numberOfFreeCells; ++i) {
                    if (!game.move.freeCellCardsInPlay[i]) {
                        ++numberOfOpenSpaces;
                    }
                }

                for (i = 0; i < game.configuration.numberOfCascades; ++i) {
                    if (game.move.cascadeCardsInPlay[i].length === 0) {
                        ++numberOfOpenSpaces;
                    }
                }

                return numberOfOpenSpaces;
            },
            updatePlayingFieldSelectedCard = function Game_updatePlayingFieldSelectedCard(isSelected) {
                if (game.selectedCardInPlay) {
                    window.freeCell.dom.toggleSelectedCardElement(game.selectedCardInPlay, isSelected);
                }
            },
            updatePlayingFieldFreeCells = function Game_updatePlayingFieldFreeCells(move) {
                var i,
                    currentCardInPlay,
                    previousCardInPlay;

                for (i = 0; i < game.configuration.numberOfFreeCells; ++i) {
                    currentCardInPlay = game.move.freeCellCardsInPlay[i];
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
                    if (move.foundationCardsInPlay[i].length !== game.move.foundationCardsInPlay[i].length) {
                        currentCardInPlay = game.move.foundationCardsInPlay[i].length > 0 ? game.move.foundationCardsInPlay[i][game.move.foundationCardsInPlay[i].length - 1] : null;
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
                    lengthDifferences.push(game.move.cascadeCardsInPlay[i].length - startingIndex);

                    if (lengthDifferences[i] > 0) {
                        for (j = 0; j < lengthDifferences[i]; ++j) {
                            cascadeChildIndex = startingIndex + j;
                            game.move.cascadeCardsInPlay[i][cascadeChildIndex].cascadeIndex = i;
                            game.move.cascadeCardsInPlay[i][cascadeChildIndex].cascadeChildIndex = cascadeChildIndex;
                        }

                        window.freeCell.dom.addCardsInPlayToCascadeElement(i, game.move.cascadeCardsInPlay[i].slice(startingIndex, startingIndex + lengthDifferences[i]));
                    } else if (lengthDifferences[i] < 0) {
                        window.freeCell.dom.removeCardsInPlayFromCascadeElement(i, -lengthDifferences[i]);
                    }
                }
            },
            unselectSelectedCard = function Game_unselectSelectedCard() {
                updatePlayingFieldSelectedCard(false);

                if (game.selectedCardInPlay) {
                    game.selectedCardInPlay = null;
                }
            },
            updatePlayingField = function Game_updatePlayingField() {
                var move = game.moves[game.moveIndex];

                unselectSelectedCard();
                updatePlayingFieldFreeCells(move);
                updatePlayingFieldFoundations(move);
                updatePlayingFieldCascades(move);
            },
            returnToFreeCellGameMove = function Game_returnToFreeCellGameMove(moveIndex) {
                game.move = game.moves[moveIndex].copy();

                updatePlayingField();
                game.moveIndex = moveIndex;
                window.freeCell.dom.setMoveCounter(game.moveIndex);
                setAutoMoveCardInPlay();
                toggleButtonsDisabled();
            },
            commitFreeCellGameMove = function Game_commitFreeCellGameMove() {
                if (game.moveIndex > -1) {
                    game.moves.splice(game.moveIndex + 1, game.moves.length - 1 - game.moveIndex);
                }

                game.moves.push(new window.freeCell.Move(game.move.freeCellCardsInPlay, game.move.foundationCardsInPlay, game.move.cascadeCardsInPlay));
                updatePlayingField();
                game.moveIndex = game.moves.length - 1;
                window.freeCell.dom.setMoveCounter(game.moveIndex);
                setAutoMoveCardInPlay();
                toggleButtonsDisabled();
            },
            isSelectedCardLastInCascade = function Game_isSelectedCardLastInCascade() {
                return game.selectedCardInPlay
                    && game.selectedCardInPlay.cascadeIndex > -1
                    && game.move.cascadeCardsInPlay[game.selectedCardInPlay.cascadeIndex].length - 1 === game.selectedCardInPlay.cascadeChildIndex;
            },
            isValidCascadeChain = function Game_isValidCascadeChain(bottomCard, topCard) {
                return bottomCard.suit.rgbColor !== topCard.suit.rgbColor && bottomCard.value === topCard.value + 1;
            },
            tryToGetValidCascade = function Game_tryToGetValidCascade(fromCascadeIndex, toCascadeIndex, startingIndex) {
                var toCascadeLastInCascadeCard,
                    numberOfOpenSpaces = getNumberOfOpenSpaces(),
                    fromCascade = game.move.cascadeCardsInPlay[fromCascadeIndex],
                    toCascade = game.move.cascadeCardsInPlay[toCascadeIndex],
                    fromCascadeStaringCascadeCard = fromCascade[startingIndex].card;

                if (fromCascade.length - 1 - startingIndex > numberOfOpenSpaces) {
                    return null;
                }

                if (toCascade.length > 0) {
                    toCascadeLastInCascadeCard = toCascade[toCascade.length - 1].card;

                    if (!isValidCascadeChain(toCascadeLastInCascadeCard, fromCascadeStaringCascadeCard)) {
                        return null;
                    }
                }

                return new window.freeCell.Cascade(fromCascade, toCascade, startingIndex);
            },
            changeSelectedCardInPlay = function Game_changeSelectedCardInPlay(cardInPlay) {
                updatePlayingFieldSelectedCard(false);
                game.selectedCardInPlay = cardInPlay;
                updatePlayingFieldSelectedCard(true);
            },
            getBottomMostValidCascadeCardInPlay = function Game_getBottomMostValidCascadeCardInPlay(cascadeCardInPlay) {
                var i,
                    chainLength = 1,
                    numberOfOpenSpaces = getNumberOfOpenSpaces(),
                    cascade = game.move.cascadeCardsInPlay[cascadeCardInPlay.cascadeIndex],
                    bottomMostValidCascadeCardInPlay = cascade[cascade.length - 1];

                for (i = cascade.length - 2; i >= cascadeCardInPlay.cascadeChildIndex; --i) {
                    if (chainLength <= numberOfOpenSpaces
                            && isValidCascadeChain(cascade[i].card, bottomMostValidCascadeCardInPlay.card)) {
                        bottomMostValidCascadeCardInPlay = cascade[i];
                        ++chainLength;
                    } else {
                        break;
                    }
                }

                return bottomMostValidCascadeCardInPlay;
            },
            tryToGetOpenFreeCellIndex = function Game_tryToGetOpenFreeCellIndex() {
                var i;

                for (i = 0; i < game.configuration.numberOfFreeCells; ++i) {
                    if (!game.move.freeCellCardsInPlay[i]) {
                        return i;
                    }
                }

                return -1;
            },
            attemptToCascadeSelectedCardChain = function Game_attemptToCascadeSelectedCardChain(cascadeIndex) {
                var bottomMostValidCascadeCardInPlay,
                    cascade = game.selectedCardInPlay.freeCellIndex === -1 ? tryToGetValidCascade(game.selectedCardInPlay.cascadeIndex, cascadeIndex, game.selectedCardInPlay.cascadeChildIndex) : -1;

                if (game.selectedCardInPlay.freeCellIndex > -1 || cascade) {
                    if (game.selectedCardInPlay.freeCellIndex > -1) {
                        game.move.cascadeCardsInPlay[cascadeIndex].push(game.selectedCardInPlay);
                        game.move.freeCellCardsInPlay[game.selectedCardInPlay.freeCellIndex] = null;
                    } else {
                        cascade.action();
                    }

                    commitFreeCellGameMove();
                } else {
                    bottomMostValidCascadeCardInPlay = game.move.cascadeCardsInPlay[cascadeIndex].length > 0 ? getBottomMostValidCascadeCardInPlay(game.move.cascadeCardsInPlay[cascadeIndex][game.move.cascadeCardsInPlay[cascadeIndex].length - 1]) : null;

                    if (bottomMostValidCascadeCardInPlay) {
                        changeSelectedCardInPlay(bottomMostValidCascadeCardInPlay);
                    } else {
                        unselectSelectedCard();
                    }
                }
            },
            deal = function Game_deal(dontShuffle) {
                var i,
                    j,
                    cascadeCardsInPlay = [],
                    counter = 0;

                if (!dontShuffle) {
                    game.configuration.deck.shuffle();
                }

                for (i = 0; i < game.configuration.numberOfCascades; ++i) {
                    cascadeCardsInPlay.push([]);

                    for (j = 0; j < game.configuration.cascadeDistribution[i]; ++j) {
                        cascadeCardsInPlay[i].push(new window.freeCell.CardInPlay(game.configuration.deck.cards[counter], i, j));
                        ++counter;
                    }
                }

                return cascadeCardsInPlay;
            },
            initialize = function Game_initialize(dontShuffle) {
                game.configuration = window.freeCell.current.configuration || window.freeCell.defaults.configuration;
                unselectSelectedCard();
                game.autoMoveCardInPlay = null;
                game.moves = [];
                game.moveIndex = 0;

                game.move = new window.freeCell.Move(window.freeCell.utilities.fillArray(game.configuration.numberOfFreeCells, null),
                                                     window.freeCell.utilities.fillArray(game.configuration.deck.numberOfSuits),
                                                     deal(dontShuffle));

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
            unselectSelectedCard();

            if (!timeout) {
                var commitMove = false,
                    openFreeCellIndex = tryToGetOpenFreeCellIndex(),
                    cascadeCardIndices = window.freeCell.dom.getCascadeChildElementIndicesFromEvent(event),
                    cascadeCardInPlay = game.move.cascadeCardsInPlay[cascadeCardIndices[0]][cascadeCardIndices[1]],
                    foundationIndex = game.configuration.deck.tryToGetSuitOrderIndexFromSuit(cascadeCardInPlay.card.suit);

                if (game.move.cascadeCardsInPlay[cascadeCardIndices[0]].length - 1 === cascadeCardIndices[1]) {
                    if (game.move.cascadeCardsInPlay[cascadeCardIndices[0]].length - 1 === cascadeCardIndices[1]
                            && foundationIndex > -1
                            && canMoveCardInPlayToFoundation(foundationIndex, cascadeCardInPlay)) {
                        game.move.foundationCardsInPlay[foundationIndex].push(cascadeCardInPlay);
                        commitMove = true;
                    } else if (openFreeCellIndex > -1) {
                        game.move.freeCellCardsInPlay[openFreeCellIndex] = cascadeCardInPlay;
                        commitMove = true;
                    }
                }

                if (commitMove) {
                    game.move.cascadeCardsInPlay[cascadeCardInPlay.cascadeIndex].pop();
                    commitFreeCellGameMove();
                }
            }
        };

        game.cascadeElementClick = function Game_cascadeClick(event) {
            event.stopPropagation();
            timer.resume();

            if (!timeout) {
                if (game.selectedCardInPlay) {
                    attemptToCascadeSelectedCardChain(window.freeCell.dom.getPlayingFieldElementChildIdFromEvent(event));
                }
            }
        };

        game.cascadeCardElementClick = function Game_cascadeCardClick(event) {
            event.stopPropagation();
            timer.resume();

            if (!timeout) {
                var cascadeCardIndices = window.freeCell.dom.getCascadeChildElementIndicesFromEvent(event),
                    cascadeCardInPlay = game.move.cascadeCardsInPlay[cascadeCardIndices[0]][cascadeCardIndices[1]];

                if (!game.selectedCardInPlay) {
                    cascadeCardInPlay = getBottomMostValidCascadeCardInPlay(cascadeCardInPlay);
                    game.selectedCardInPlay = cascadeCardInPlay;
                    updatePlayingFieldSelectedCard(true);
                } else if (game.selectedCardInPlay === cascadeCardInPlay) {
                    unselectSelectedCard();
                } else {
                    attemptToCascadeSelectedCardChain(cascadeCardInPlay.cascadeIndex);
                }
            }
        };

        game.freeCellElementClick = function Game_freeCellCardClick(event) {
            event.stopPropagation();
            timer.resume();

            if (!timeout) {
                var freeCellIndex = window.freeCell.dom.getPlayingFieldElementChildIdFromEvent(event),
                    lastInCascade;

                if (game.move.freeCellCardsInPlay[freeCellIndex]) {
                    if (game.move.freeCellCardsInPlay[freeCellIndex] !== game.selectedCardInPlay) {
                        changeSelectedCardInPlay(game.move.freeCellCardsInPlay[freeCellIndex]);
                    } else {
                        unselectSelectedCard();
                    }
                } else if (game.selectedCardInPlay) {
                    lastInCascade = isSelectedCardLastInCascade();

                    if (game.selectedCardInPlay.freeCellIndex > -1 || lastInCascade) {
                        game.move.freeCellCardsInPlay[freeCellIndex] = game.selectedCardInPlay;

                        if (lastInCascade) {
                            game.move.cascadeCardsInPlay[game.selectedCardInPlay.cascadeIndex].pop();
                        } else {
                            game.move.freeCellCardsInPlay[game.selectedCardInPlay.freeCellIndex] = null;
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
                    freeCellCardInPlay = game.move.freeCellCardsInPlay[freeCellIndex],
                    foundationIndex;

                if (freeCellCardInPlay) {
                    foundationIndex = game.configuration.deck.tryToGetSuitOrderIndexFromSuit(freeCellCardInPlay.card.suit);

                    if (foundationIndex > -1 && canMoveCardInPlayToFoundation(foundationIndex, freeCellCardInPlay)) {
                        game.move.foundationCardsInPlay[foundationIndex].push(freeCellCardInPlay);
                        game.move.freeCellCardsInPlay[freeCellIndex] = null;
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
                    game.move.foundationCardsInPlay[foundationIndex].push(game.selectedCardInPlay);

                    if (lastInCascade) {
                        game.move.cascadeCardsInPlay[game.selectedCardInPlay.cascadeIndex].pop();
                    } else {
                        game.move.freeCellCardsInPlay[game.selectedCardInPlay.freeCellIndex] = null;
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
                game.move.foundationCardsInPlay[foundationIndex].push(game.autoMoveCardInPlay);

                if (game.autoMoveCardInPlay.freeCellIndex > -1) {
                    game.move.freeCellCardsInPlay[game.autoMoveCardInPlay.freeCellIndex] = null;
                } else {
                    game.move.cascadeCardsInPlay[game.autoMoveCardInPlay.cascadeIndex].pop();
                }

                commitFreeCellGameMove();
                timeout = game.autoMoveCardInPlay ? setTimeout(game.autoMove, 200) : null;
            }
        };

        initialize();
    }

    window.freeCell.Game = Game;
}());
