/*global document, window*/

(function () {
    'use strict';
    
    var cascadeCardSpacingPixels = 215,
        attributeSplitter = '-',
        htmlElementTags = {
            div: 'div'
        },
        cssClasses = {
            alignLeft: 'align-left',
            alignRight: 'align-right',
            cascadeEmpty: 'cascade-empty',
            freeCellEmpty: 'free-cell-empty',
            selectedCard: 'selected-card',
            smallCardSuit: 'small-card-suit',
            middleCardSuit: 'middle-card-suit',
            suit: 'suit',
            card: 'card',
            foundationSuit: 'foundation-suit',
            foundationEmpty: 'foundation-empty'
        },
        cssColors = {
            transparent: 'transparent',
            white: '#ffffff',
            red: '#dd0000'
        },
        cardElementChildren = {
            topLeftCorner: {
                childIndex: 0,
                build: function dom_cardElementChildren_topLeftCorner_build(element, card) {
                    element.classList.add(cssClasses.smallCardSuit);
                    element.classList.add(cssClasses.alignLeft);
                    element.innerHTML = card.valueAsString + card.suit.unicodeSymbol;
                },
                update: function dom_cardElementChildren_topLeftCorner_update(element, card) {
                    element.innerHTML = card.valueAsString + card.suit.unicodeSymbol;
                }
            },
            middle: {
                childIndex: 1,
                build: function dom_cardElementChildren_middle_build(element, card) {
                    element.classList.add(cssClasses.middleCardSuit);
                    element.innerHTML = card.suit.unicodeSymbol;
                },
                update: function dom_cardElementChildren_middle_update(element, card) {
                    element.innerHTML = card.suit.unicodeSymbol;
                }
            },
            bottomRightCorner: {
                childIndex: 2,
                build: function dom_cardElementChildrenbottomRightCorner_build(element, card) {
                    element.classList.add(cssClasses.smallCardSuit);
                    element.classList.add(cssClasses.alignRight);
                    element.innerHTML = card.suit.unicodeSymbol + card.valueAsString;
                },
                update: function dom_cardElementChildrenbottomRightCorner_update(element, card) {
                    element.innerHTML = card.suit.unicodeSymbol + card.valueAsString;
                }
            }
        },
        menuElements = {
            newGameButton: document.getElementById('new-game-button'),
            pauseButton: document.getElementById('pause-game-button'),
            redoButton: document.getElementById('redo-move-button'),
            replayGameButton: document.getElementById('replay-game-button'),
            undoButton: document.getElementById('undo-move-button'),
            gameTimer: document.getElementById('game-timer'),
            configureButton: document.getElementById('configure-button'),
            autoMoveButton: document.getElementById('auto-move-button')
        },
        playingFieldElements = {
            freeCells: {
                root: document.getElementById('free-cells'),
                children: [],
                childIdPrefix: 'freeCell',
                childClass: 'free-cell',
                numberOfChildren: 0
            },
            foundations: {
                root: document.getElementById('foundations'),
                children: [],
                childIdPrefix: 'foundation',
                childClass: 'foundation',
                numberOfChildren: 0
            },
            cascades: {
                root: document.getElementById('cascades'),
                children: [],
                childIdPrefix: 'cascade',
                childClass: 'cascade',
                numberOfChildren: 0
            }
        },
        generateColorStyleString = function dom_generateColorStyleString(rgbColor, alpha) {
            var alphaValue = alpha ? Math.max(Math.abs(alpha), 1) : 0;
                
            return 'rgb' + (alphaValue > 0 ? 'a' : '') + '(' + rgbColor.red + ',' + rgbColor.green + ',' + rgbColor.blue + (alphaValue > 0 ? ',' + alphaValue : '') + ')';
        },
        generateBorderStyleString = function dom_generateBorderStyleString(rgbColor) {
            return '1px solid ' + generateColorStyleString(rgbColor);
        },
        generateBoxShadowStyleString = function dom_generateBoxShadowStyleString(rgbColor) {
            return '0px 0px 10px 1px ' + generateColorStyleString(rgbColor, 1);
        },
        clearElementChildren = function dom_clearElementChildren(element) {
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }
        },
        adjustCardChildElementStyles = function dom_adjustCardChildElementStyles(element, rgbColor) {
            element.style.color = generateColorStyleString(rgbColor);
        },
        adjustCardElementStyles = function dom_adjustCardElementStyles(element, rgbColor) {
            element.style.border = generateBorderStyleString(rgbColor);
            element.style.boxShadow = generateBoxShadowStyleString(rgbColor);
        },
        generateCardChildElement = function dom_generateCardChildElement(card, cardElementChild) {
            var element = document.createElement(htmlElementTags.div);
            
            element.classList.add(cssClasses.suit);
            adjustCardChildElementStyles(element, card.suit.rgbColor);
            cardElementChild.build(element, card);
            
            return element;
        },
        generateCascadeChildElement = function dom_generateCascadeChildElement(cardInPlay) {
            var element = document.createElement(htmlElementTags.div);
            
            adjustCardElementStyles(element, cardInPlay.card.suit.rgbColor);
            element.classList.add(cssClasses.card);
            
            element.appendChild(generateCardChildElement(cardInPlay.card, cardElementChildren.topLeftCorner));
            element.appendChild(generateCardChildElement(cardInPlay.card, cardElementChildren.middle));
            element.appendChild(generateCardChildElement(cardInPlay.card, cardElementChildren.bottomRightCorner));
            
            return element;
        },
        updateCardChildElement = function dom_updateCardChildElement(card, element, cardElementChild) {
            if (element) {
                adjustCardChildElementStyles(element, card.suit.rgbColor);
                cardElementChild.update(element, card);
                
                return null;
            } else {
                return generateCardChildElement(card, cardElementChild);
            }
        },
        updateCardElement = function dom_updateCardElement(cardInPlay, element) {
            var key,
                generatedElement;
            
            element.style.backgroundColor = cssColors.white;
            adjustCardElementStyles(element, cardInPlay.card.suit.rgbColor);
            
            for (key in cardElementChildren) {
                if (cardElementChildren.hasOwnProperty(key)) {
                    generatedElement = updateCardChildElement(cardInPlay.card, element.childNodes[cardElementChildren[key].childIndex], cardElementChildren[key]);
                    
                    if (generatedElement) {
                        element.appendChild(generatedElement);
                    }
                }
            }
        },
        generateAndAppendCardToCascade = function dom_appendCardToCascade(cardInPlay, cascadeIndex, cascadeChildIndex, cascadeElement, game) {
            var currentGame = game || window.freeCell.current.game,
                cardElement = generateCascadeChildElement(cardInPlay);
            
            cardElement.id = cascadeIndex + attributeSplitter + cascadeChildIndex;
            cardElement.onclick = currentGame.cascadeCardElementClick;
            cardElement.ondblclick = currentGame.cascadeCardElementDoubleClick;
                    
            if (cascadeChildIndex > 0) {
                cardElement.style.marginTop = -cascadeCardSpacingPixels + 'px';
            }
            
            cascadeElement.appendChild(cardElement);
        },
        fillCascadeElements = function dom_fillCascadeElements(game) {
            var i,
                j;
            
            for (i = 0; i < game.configuration.numberOfCascades; ++i) {
                for (j = 0; j < game.configuration.cascadeDistribution[i]; ++j) {
                    generateAndAppendCardToCascade(game.cascadeCardsInPlay[i][j], i, j, playingFieldElements.cascades.children[i], game);
                }
            }
        },
        buildChild = function dom_buildChild(index, playingFieldElement) {
            var element = document.createElement(htmlElementTags.div);
            
            element.classList.add(playingFieldElement.childClass);
            element.id = playingFieldElement.childIdPrefix + attributeSplitter + index;
            playingFieldElement.root.appendChild(element);
            playingFieldElement.children.push(element);
        },
        buildChildren = function dom_buildChildren(playingFieldElement) {
            var i;
            
            for (i = 0; i < playingFieldElement.numberOfChildren; ++i) {
                buildChild(i, playingFieldElement);
            }
        },
        updateFoundationElement = function dom_updateFoundationElement(index, cardInPlay, suit) {
            var foundationElement = playingFieldElements.foundations.children[index],
                foundationChild;

            if (cardInPlay) {
                if (foundationElement.childNodes.length === 1) {
                    clearElementChildren(foundationElement);
                }
                
                foundationElement.classList.remove(cssClasses.foundationEmpty);
                updateCardElement(cardInPlay, foundationElement);
            } else {
                foundationChild = document.createElement(htmlElementTags.div);
                foundationChild.classList.add(cssClasses.suit);
                foundationChild.classList.add(cssClasses.foundationSuit);
                foundationChild.innerHTML = suit.unicodeSymbol;
                
                adjustCardChildElementStyles(foundationChild, suit.rgbColor);
                adjustCardElementStyles(foundationElement, suit.rgbColor);
                
                clearElementChildren(foundationElement);
                foundationElement.classList.add(cssClasses.foundationEmpty);
                foundationElement.appendChild(foundationChild);
            }
        },
        redrawPlayingFieldElements = function dom_redrawPlayingFieldElements(game) {
            var i,
                key;
            
            playingFieldElements.freeCells.numberOfChildren = game.configuration.numberOfFreeCells;
            playingFieldElements.foundations.numberOfChildren = game.configuration.deck.numberOfSuits;
            playingFieldElements.cascades.numberOfChildren = game.configuration.numberOfCascades;
            
            for (key in playingFieldElements) {
                if (playingFieldElements.hasOwnProperty(key)) {
                    clearElementChildren(playingFieldElements[key].root);
                    playingFieldElements[key].children = [];
                    buildChildren(playingFieldElements[key]);
                }
            }
            
            for (i = 0; i < game.configuration.deck.numberOfSuits; ++i) {
                updateFoundationElement(i, null, game.configuration.deck.suitOrder[i]);
                playingFieldElements.foundations.children[i].onclick = game.foundationElementClick;
            }
            
            for (i = 0; i < game.configuration.numberOfFreeCells; ++i) {
                playingFieldElements.freeCells.children[i].onclick = game.freeCellElementClick;
                playingFieldElements.freeCells.children[i].ondblclick = game.freeCellElementDoubleClick;
            }
            
            for (i = 0; i < game.configuration.numberOfCascades; ++i) {
                playingFieldElements.cascades.children[i].onclick = game.cascadeElementClick;
            }
            
            fillCascadeElements(game);
        },
        toggleButtonDisabled = function dom_toggleButtonDisabled(buttonElement, isDisabled) {
            if (buttonElement) {
                buttonElement.disabled = !!isDisabled;
            }
        },
        openConfigurationOverlay = function dom_openConfigurationOverlay() {
            
        };
    
    menuElements.configureButton.onclick = openConfigurationOverlay;
    
    window.freeCell.dom = {
        getCascadeChildElementIndicesFromEvent: function dom_getCascadeChildElementIndicesFromEvent(event) {
            var idParts = event.currentTarget.id.split(attributeSplitter);
            
            return [
                window.freeCell.utilities.parseInt(idParts[0]),
                window.freeCell.utilities.parseInt(idParts[1])
            ];
        },
        getPlayingFieldElementChildIdFromEvent: function dom_getPlayingFieldElementChildIdFromEvent(event) {
            return window.freeCell.utilities.parseInt(event.currentTarget.id.split(attributeSplitter)[1]);
        },
        linkGameToDom: function dom_linkGameToDom(game) {
            if (game) {
                redrawPlayingFieldElements(game);
                menuElements.pauseButton.onclick = game.pause;
                menuElements.redoButton.onclick = game.redoMove;
                menuElements.autoMoveButton.onclick = game.autoMove;
                menuElements.undoButton.onclick = game.undoMove;
                menuElements.newGameButton.onclick = window.freeCell.main.startNewGame;
                menuElements.replayGameButton.onclick = game.replay;
            }
        },
        setGameTimer: function dom_setGameTimer(time) {
            menuElements.gameTimer.innerHTML = time;
        },
        toggleSelectedCardElement: function dom_toggleSelectedCardElement(cascadeIndex, cascadeChildIndex, isSelected) {
            var cascadeElement = playingFieldElements.cascades.children[cascadeIndex],
                cascadeCardElement = cascadeElement ? cascadeElement.childNodes[cascadeChildIndex] : null;

            if (cascadeCardElement) {
                if (isSelected) {
                    cascadeCardElement.classList.add(cssClasses.selectedCard);
                } else {
                    cascadeCardElement.classList.remove(cssClasses.selectedCard);
                }
            }
        },
        togglePauseButtonDisabled: function dom_togglePauseButtonDisabled(isDisabled) {
            toggleButtonDisabled(menuElements.pauseButton, isDisabled);
        },
        togglePauseButtonText: function dom_togglePauseButtonText(isPaused) {
            menuElements.pauseButton.innerHTML = isPaused ? 'Resume' : 'Pause';
            menuElements.gameTimer.style.color = isPaused ? cssColors.red : cssColors.white;
        },
        toggleRedoButtonDisabled: function dom_toggleRedoButtonDisabled(isDisabled) {
            toggleButtonDisabled(menuElements.redoButton, isDisabled);
        },
        toggleUndoButtonDisabled: function dom_toggleRedoButtonDisabled(isDisabled) {
            toggleButtonDisabled(menuElements.undoButton, isDisabled);
        },
        toggleAutoMoveButtonDisabled: function dom_toggleAutoMoveButtonDisabled(isDisabled) {
            toggleButtonDisabled(menuElements.autoMoveButton, isDisabled);
        },
        updateCascadeElement: function dom_updateCascadeElement(index, startingIndex, cascadeCardsInPlay) {
            var i,
                cascadeElement = playingFieldElements.cascades.children[index],
                startingCardInPlay = cascadeCardsInPlay[startingIndex],
                endingCardInPlay = cascadeCardsInPlay[cascadeCardsInPlay.length - 1];
            
            if (startingCardInPlay.cascadeChildIndex > cascadeElement.childNodes.length - 1) {
                for (i = startingCardInPlay.cascadeChildIndex; i <= endingCardInPlay.cascadeChildIndex; ++i) {
                    generateAndAppendCardToCascade(cascadeCardsInPlay[i], index, i, cascadeElement);
                }
            } else {
                for (i = endingCardInPlay.cascadeChildIndex; i >= startingCardInPlay.cascadeChildIndex; --i) {
                    cascadeElement.removeChild(cascadeElement.lastChild);
                }
            }
            
            if (cascadeElement.childNodes.length === 0) {
                cascadeElement.classList.add(cssClasses.cascadeEmpty);
            } else {
                cascadeElement.classList.remove(cssClasses.cascadeEmpty);
            }
        },
        updateFoundationElement: updateFoundationElement,
        updateFreeCellElement: function dom_updateFreeCellElement(index, cardInPlay) {
            var freeCellElement = playingFieldElements.freeCells.children[index];
            
            if (cardInPlay) {
                freeCellElement.classList.remove(cssClasses.freeCellEmpty);
                updateCardElement(cardInPlay, freeCellElement);
            } else {
                clearElementChildren(freeCellElement);
                freeCellElement.classList.add(cssClasses.freeCellEmpty);
            }
        }
    };
}());