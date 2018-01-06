/*global document, setTimeout, clearTimeout*/
(function () {
    'use strict';
    
    var attributeSplitter = '-',
        numberOfCardsPerSuit = 13,
        numberOfSuits = 4,
        numberOfCascades = 8,
        numberOfFreeCells = 4,
        numberOfCardsPerDeck = numberOfCardsPerSuit * numberOfSuits,
        currentFreeCellGame,
        cascadeCardSpacingPixels = 215,
        faceCards = {
            1: 'A',
            11: 'J',
            12: 'Q',
            13: 'K'
        },
        alignClasses = {
            left: 'align-left',
            right: 'align-right'
        },
        rgbColors = {
            black: [
                0,
                0,
                0
            ],
            red: [
                200,
                0,
                0
            ]
        },
        suits = {
            club: {
                unicodeSymbol: '&clubs;',
                rgbColor: rgbColors.black
            },
            diamond: {
                unicodeSymbol: '&diams;',
                rgbColor: rgbColors.red
            },
            heart: {
                unicodeSymbol: '&hearts;',
                rgbColor: rgbColors.red
            },
            spade: {
                unicodeSymbol: '&spades;',
                rgbColor: rgbColors.black
            }
        },
        cardElementChildIndices = {
            topLeftCorner: 0,
            middle: 1,
            bottomRightCorner: 2
        },
        suitOrder = [
            suits.diamond,
            suits.club,
            suits.heart,
            suits.spade
        ],
        tryToGetSuitOrderFromSuit = function freeCell_tryToGetSuitOrderFromSuit(suit) {
            var i;
            
            for (i = 0; i < numberOfSuits; ++i) {
                if (suit === suitOrder[i]) {
                    return i;
                }
            }
            
            return -1;
        },
        generateColorStyleString = function freeCell_generateColorStyleString(rgbColor, alpha) {
            var alphaValue = alpha ? Math.max(Math.abs(alpha), 1) : 0;
                
            return 'rgb' + (alphaValue > 0 ? 'a' : '') + '(' + rgbColor[0] + ',' + rgbColor[1] + ',' + rgbColor[2] + (alphaValue > 0 ? ',' + alphaValue : '') + ')';
        },
        generateBorderStyleString = function freeCell_generateBorderStyleString(rgbColor) {
            return '1px solid ' + generateColorStyleString(rgbColor);
        },
        generateBoxShadowStyleString = function freeCell_generateBoxShadowStyleString(rgbColor) {
            return '0px 0px 10px 1px ' + generateColorStyleString(rgbColor, 1);
        },
        generateCascadeDistribution = function freeCell_generateCascadeDistribution() {
            var i,
                distribution = [],
                minimalNumberOfCardsPerCascade = Math.floor(numberOfCardsPerDeck / numberOfCascades),
                remainingCards = numberOfCardsPerDeck - (minimalNumberOfCardsPerCascade * numberOfCascades);
            
            for (i = 0; i < numberOfCascades; ++i) {
                if (remainingCards > 0) {
                    distribution.push(minimalNumberOfCardsPerCascade + 1);
                    --remainingCards;
                } else {
                    distribution.push(minimalNumberOfCardsPerCascade);
                }
            }
            
            return distribution;
        },
        cascadeDistribution = generateCascadeDistribution(),
        generateRandomizedCardNumbers = function freeCell_generateRandomizedCardNumbers() {
            var i,
                randomNumber,
                orderedCards = [],
                cards = [];

            for (i = 0; i < numberOfCardsPerDeck; ++i) {
                orderedCards.push(i);
            }
            
            while (orderedCards.length) {
                randomNumber = Math.ceil(Math.random() * orderedCards.length) - 1;
                cards.push(orderedCards[randomNumber]);
                orderedCards.splice(randomNumber, 1);
            }
            
            return cards;
        },
        mapNumberToCardValue = function freeCell_mapNumberToCardValue(number, cascadeIndex, cascadeChildIndex) {
            var suitIndex = Math.floor(number / numberOfCardsPerSuit),
                value = (number % numberOfCardsPerSuit) + 1;
            
            return new Card(suitIndex, value, cascadeIndex, cascadeChildIndex);
        },
        generateNewCascadeCards = function freeCell_generateNewCascadeCards() {
            var i,
                j,
                runningTotal = 0,
                cascadeCards = [],
                cards = generateRandomizedCardNumbers();
            
            for (i = 0; i < numberOfCascades; ++i) {
                cascadeCards.push([]);
                
                for (j = 0; j < cascadeDistribution[i]; ++j) {
                    cascadeCards[i].push(mapNumberToCardValue(cards[runningTotal], i, j));
                    ++runningTotal;
                }
            }
            
            return cascadeCards;
        },
        menuDomEelements = {
            newGameButton: document.getElementById('new-game-button'),
            pauseButton: document.getElementById('pause-game-button'),
            redoButton: document.getElementById('redo-move-button'),
            replayGameButton: document.getElementById('replay-game-button'),
            undoButton: document.getElementById('undo-move-button'),
            gameTimer: document.getElementById('game-timer')
        },
        persistentDomElements = {
            freeCells: {
                root: document.getElementById('free-cells'),
                children: [],
                childIdPrefix: 'freeCell',
                childClass: 'free-cell',
                numberOfChildren: numberOfFreeCells
            },
            foundations: {
                root: document.getElementById('foundations'),
                children: [],
                childIdPrefix: 'foundation',
                childClass: 'foundation',
                numberOfChildren: numberOfSuits
            },
            cascades: {
                root: document.getElementById('cascades'),
                children: [],
                childIdPrefix: 'cascade',
                childClass: 'cascade',
                numberOfChildren: numberOfCascades
            }
        },
        getPersistentDomChildElementIdFromEvent = function freeCell_getPersistentDomChildElementIdFromEvent(event) {
            return parseInt(event.currentTarget.id.split(attributeSplitter)[1], 10);
        },
        getCascadeChildElementIndicesFromEvent = function freeCell_getCascadeChildElementIndicesFromEvent(event) {
            var idParts = event.currentTarget.id.split(attributeSplitter);
            
            return [
                parseInt(idParts[0], 10),
                parseInt(idParts[1], 10)
            ];
        },
        clearElementChildren = function freeCell_clearElementChildren(element) {
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }
        },
        adjustCardChildElementStyles = function freeCell_adjustCardChildElementStyles(element, card) {
            element.style.color = generateColorStyleString(card.suit.rgbColor);
        },
        adjustCardElementStyles = function freeCell_adjustCardElementStyles(element, card) {
            element.style.border = generateBorderStyleString(card.suit.rgbColor);
            
            if (card.foundationIndex === -1 && card.freeCellIndex === -1) {
                element.style.boxShadow = generateBoxShadowStyleString(card.suit.rgbColor);
            }
        },
        generateCardChildElement = function freeCell_generateCardChildElement(card, cardElementChildIndex) {
            var element = document.createElement('div');
            
            element.classList.add('suit');
            adjustCardChildElementStyles(element, card);
            
            switch (cardElementChildIndex) {
                case cardElementChildIndices.topLeftCorner:
                    element.classList.add('small-card-suit');
                    element.classList.add(alignClasses.left);
                    element.innerHTML = card.value + card.suit.unicodeSymbol;
                    break;
                case cardElementChildIndices.middle:
                    element.classList.add('middle-card-suit');
                    element.innerHTML = card.suit.unicodeSymbol;
                    break;
                case cardElementChildIndices.bottomRightCorner:
                    element.classList.add('small-card-suit');
                    element.classList.add(alignClasses.right);
                    element.innerHTML = card.suit.unicodeSymbol + card.value;
                    break;
            }
            
            return element;
        },
        generateCascadeChildElement = function freeCell_generateCascadeChildElement(card) {
            var element = document.createElement('div');
            
            adjustCardElementStyles(element, card);
            element.classList.add('card');
            
            element.appendChild(generateCardChildElement(card, cardElementChildIndices.topLeftCorner));
            element.appendChild(generateCardChildElement(card, cardElementChildIndices.middle));
            element.appendChild(generateCardChildElement(card, cardElementChildIndices.bottomRightCorner));
            
            return element;
        },
        updateCardChildElement = function freeCell_updateCardChildElement(card, element, cardElementChildIndex) {
            adjustCardChildElementStyles(element, card);
            
            switch (cardElementChildIndex) {
                case cardElementChildIndices.topLeftCorner:
                    element.innerHTML = card.value + card.suit.unicodeSymbol;
                    break;
                case cardElementChildIndices.middle:
                    element.innerHTML = card.suit.unicodeSymbol;
                    break;
                case cardElementChildIndices.bottomRightCorner:
                    element.innerHTML = card.suit.unicodeSymbol + card.value;
                    break;
            }
        },
        updateCardElement = function freeCell_updateCardElement(card, element) {
            if (card.isSelected) {
                element.classList.add('selected-card');
            } else {
                element.classList.remove('selected-card');
                adjustCardElementStyles(element, card);
            }
            
            updateCardChildElement(card, element.children[cardElementChildIndices.topLeftCorner], cardElementChildIndices.topLeftCorner);
            updateCardChildElement(card, element.children[cardElementChildIndices.middle], cardElementChildIndices.middle);
            updateCardChildElement(card, element.children[cardElementChildIndices.bottomRightCorner], cardElementChildIndices.bottomRightCorner);
        },
        updateCascadeElement = function freeCell_updateCascadeElement(index, startingCardIndex, cascadeCards) {
            
        },
        updateFreeCellElement = function freeCell_updateFreeCellElement(index, freeCellCard) {
            var freeCellElement = persistentDomElements.freeCells.children[index];
            
            if (freeCellCard) {
                updateCardElement(freeCellCard, freeCellElement);
            } else {
                clearElementChildren(freeCellElement);
            }
        },
        updateFoundationElement = function freeCell_updateFoundationElement(index, foundationCard) {
            var foundationElement = persistentDomElements.foundations.children[index],
                foundationChild;

            if (foundationCard) {
                updateCardElement(foundationCard, foundationElement);
            } else {
                clearElementChildren(foundationElement);
                
                foundationChild = document.createElement('div');
                foundationChild.classList.add('suit');
                foundationChild.classList.add('foundation-suit');
                foundationChild.style.color = generateColorStyleString(suitOrder[index].rgbColor);
                foundationChild.innerHTML = suitOrder[index].unicodeSymbol;
                
                foundationElement.appendChild(foundationChild);
            }
        },
        buildChild = function freeCell_buildChild(index, persistentDomElement) {
            var element = document.createElement('div');
            
            element.classList.add(persistentDomElement.childClass);
            element.id = persistentDomElement.childIdPrefix + attributeSplitter + index;
            persistentDomElement.root.appendChild(element);
            persistentDomElement.children.push(element);
        },
        buildChildren = function freeCell_buildChildren(persistentDomElement) {
            var i;
            
            for (i = 0; i < persistentDomElement.numberOfChildren; ++i) {
                buildChild(i, persistentDomElement);
            }
        },
        buildPersistentDomElements = function freeCell_buildPersistentDomElements() {
            var persistentDomElement;
            
            for (persistentDomElement in persistentDomElements) {
                buildChildren(persistentDomElements[persistentDomElement]);
            }
        },
        cleanPersistentDomElements = function freeCell_cleanPersistentDomElements() {
            var i,
                key,
                persistentDomElement;
            
            for (key in persistentDomElements) {
                persistentDomElement = persistentDomElements[key];
                
                for (i = persistentDomElement.children.length - 1; i >= 0; --i) {
                    clearElementChildren(persistentDomElement.children[i]);
                }
            }
            
            for (i = 0; i < numberOfSuits; ++i) {
                updateFoundationElement(i);
            }
        },
        toggleButtonDisabled = function freeCell_toggleButtonDisabled(buttonElement, isDisabled) {
            if (buttonElement) {
                buttonElement.disabled = !!isDisabled;
            }
        },
        startNewFreeCellGame = function freeCell_startNewFreeCellGame() {
            currentFreeCellGame = new FreeCellGame();
        },
        initialize = function freeCell_initialize() {
            buildPersistentDomElements();
            startNewFreeCellGame();
        };
    
    function Card(suitIndex, value, cascadeIndex, cascadeChildIndex) {
        this.suit = suitOrder[suitIndex];
        this.displayValue = faceCards[value] || (String(value));
        this.value = value;
        this.freeCellIndex = -1;
        this.foundationIndex = -1;
        this.isSelected = false;
        this.cascadeIndex = cascadeIndex;
        this.cascadeChildIndex = cascadeChildIndex;
    }
    
    function FreeCellGameMove(freeCellGame) {
        var i,
            j,
            freeCellGameMove = this;
        
        freeCellGameMove.freeCellCards = [];
        freeCellGameMove.foundationCards = [];
        freeCellGameMove.cascadeCards = [];
        
        for (i = 0; i < freeCellGame.freeCellCards.length; ++i) {
            freeCellGameMove.freeCellCards.push(freeCellGame.freeCellCards[i]);
        }
        
        for (i = 0; i < freeCellGame.foundationCards.length; ++i) {
            freeCellGameMove.foundationCards.push(freeCellGame.foundationCards[i]);
        }
        
        for (i = 0; i < freeCellGame.cascadeCards.length; ++i) {
            freeCellGameMove.cascadeCards.push([]);
            
            for (j = 0; j < freeCellGame.cascadeCards[i].length; ++j) {
                freeCellGameMove.cascadeCards[i].push(freeCellGame.cascadeCards[i][j]);
            }
        }
    }
    
    function GameTimer() {
        var gameTime = this,
            isPaused = false,
            hours = 0,
            minutes = 0,
            seconds = 0,
            timeout,
            getStringComponentFromNumber = function GameTimer_getStringComponentFromNumber(number) {
                return number < 10 ? '0' + number : number;
            },
            incrementGameTime = function GameTimer_incrementGameTime() {
                ++seconds;
            
                if (seconds > 59) {
                    seconds = 0;
                    ++minutes;
                
                    if (minutes > 59) {
                        minutes = 0;
                        ++hours;
                    }
                }
            },
            getGameTimeString = function  GameTimer_getGameTimeString() {
                return getStringComponentFromNumber(hours) + ':' + getStringComponentFromNumber(minutes) + ':' + getStringComponentFromNumber(seconds);
            },
            countTime = function GameTimer_countTime() {
                timeout = setTimeout(function () {
                    if (!isPaused) {
                        incrementGameTime();
                        menuDomEelements.gameTimer.innerHTML = getGameTimeString();
                    }
                    
                    countTime();
                }, 1000);
            },
            pauseGameTime = function GameTimer_pauseGameTime() {
                isPaused = true;
            };
        
        gameTime.stopGameTimer = function GameTimer_stopGameTimer(maintainTime) {
            clearTimeout(timeout);
            
            if (!maintainTime) {
                menuDomEelements.gameTimer.innerHTML = '00:00:00';
            }
        };
        
        menuDomEelements.pauseButton.onclick = pauseGameTime;
        countTime();
    }
    
    function FreeCellGame(cascadeCards) {
        var freeCellGame = this,
            gameTimer,
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
    
    initialize();
    

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