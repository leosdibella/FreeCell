/*global document, window*/

(function () {
    'use strict';

    var cascadeCardSpacingPixels = 215,
        selectedOverlayTabIndex = 0,
        attributeSplitter = '-',
        htmlElementTags = {
            div: 'div'
        },
        cssClasses = {
            alignLeft: 'align-left',
            alignRight: 'align-right',
            cascadeEmpty: 'cascade-empty',
            selectedCard: 'selected-card',
            smallCardSuit: 'small-card-suit',
            middleCardSuit: 'middle-card-suit',
            suit: 'suit',
            card: 'card',
            foundationSuit: 'foundation-suit',
            selectedOverlayContentHeaderTabButton: 'selected-overlay-content-header-tab-button'
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
        applicationElements = {
            application: document.getElementById('application'),
            overlay: document.getElementById('overlay'),
            overlayContentBody: document.getElementById('overlay-content-body'),
            overlayContentHeaderCloseButton: document.getElementById('overlay-content-header-close-button'),
            overlayTabs: [
                document.getElementById('overlay-game-settings-button'),
                document.getElementById('overlay-deck-settings-button'),
                document.getElementById('overlay-color-settings-button')
            ]
        },
        menuElements = {
            newGameButton: document.getElementById('new-game-button'),
            pauseButton: document.getElementById('pause-game-button'),
            redoButton: document.getElementById('redo-move-button'),
            replayGameButton: document.getElementById('replay-game-button'),
            undoButton: document.getElementById('undo-move-button'),
            gameTimer: document.getElementById('game-timer'),
            configureButton: document.getElementById('configure-button'),
            autoMoveButton: document.getElementById('auto-move-button'),
            moveCounter: document.getElementById('move-counter')
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
        generateBackgroundStyleString = function dom_generateBackgroundStyleString(primaryRgbColor, secondaryRgbColor) {
            var primaryHexColorString = primaryRgbColor ? primaryRgbColor.toHexColorString() : window.freeCell.defaults.colorScheme.selectedBackground.toHexColorString(),
                secondaryHexColorString = secondaryRgbColor ? secondaryRgbColor.toHexColorString() : cssColors.white;

            return 'repeating-linear-gradient( 125deg, '
                + secondaryHexColorString + ', ' +  secondaryHexColorString
                + ' 10px, ' + primaryHexColorString + ' 10px, ' + primaryHexColorString
                + ' 20px ) !important';
        },
        generateBorderStyleString = function dom_generateBorderStyleString(rgbColor) {
            return '1px solid ' + rgbColor.toString();
        },
        generateBoxShadowStyleString = function dom_generateBoxShadowStyleString(rgbColor) {
            return '0px 0px 10px 1px ' + rgbColor.toString(1);
        },
        clearElementChildren = function dom_clearElementChildren(element) {
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }
        },
        removeElementStyles = function dom_removeElementStyles(element, keepBorderStyles) {
            element.style.backgroundColor = cssColors.transparent;

            if (!keepBorderStyles) {
                element.style.border = '';
                element.style.boxShadow = '';
            }
        },
        adjustCardChildElementStyles = function dom_adjustCardChildElementStyles(element, rgbColor) {
            element.style.color = rgbColor.toString();
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
                    generateAndAppendCardToCascade(game.move.cascadeCardsInPlay[i][j], i, j, playingFieldElements.cascades.children[i], game);
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

                updateCardElement(cardInPlay, foundationElement);
            } else {
                foundationChild = document.createElement(htmlElementTags.div);
                foundationChild.classList.add(cssClasses.suit);
                foundationChild.classList.add(cssClasses.foundationSuit);
                foundationChild.innerHTML = suit.unicodeSymbol;

                adjustCardChildElementStyles(foundationChild, suit.rgbColor);
                adjustCardElementStyles(foundationElement, suit.rgbColor);

                clearElementChildren(foundationElement);
                removeElementStyles(foundationElement, true);
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
            if (window.freeCell.current.game) {
                window.freeCell.current.game.pause();
            }

            applicationElements.application.scrollTop = '0px';
            applicationElements.application.style.overflow = 'hidden';
            applicationElements.overlay.style.display = 'flex';
        },
        closeConfigurationOverlay = function dom_closeConfigurationOverlay() {
            applicationElements.application.style.overflow = '';
            applicationElements.overlay.style.display = '';
        },
        toggleSelectedElement = function dom_toggleSelectedElement(element, isSelected) {
            if (element) {
                if (isSelected) {
                    element.classList.add(cssClasses.selectedCard);
                } else {
                    element.classList.remove(cssClasses.selectedCard);
                }
            }
        };

    menuElements.configureButton.onclick = openConfigurationOverlay;
    applicationElements.overlayContentHeaderCloseButton.onclick = closeConfigurationOverlay;

    window.freeCell.dom = {
        getCascadeChildElementIndicesFromEvent: function dom_getCascadeChildElementIndicesFromEvent(event) {
            var idParts = event.currentTarget.id.split(attributeSplitter);

            return [
                Number.parseInt(idParts[0], 10),
                Number.parseInt(idParts[1], 10)
            ];
        },
        getPlayingFieldElementChildIdFromEvent: function dom_getPlayingFieldElementChildIdFromEvent(event) {
            return Number.parseInt(event.currentTarget.id.split(attributeSplitter)[1], 10);
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
        setMoveCounter: function dom_setMoveCounter(value) {
            menuElements.moveCounter.innerHTML = window.freeCell.utilities.isNonNegativeInteger(value) ? value : '--';
        },
        toggleSelectedCardElement: function dom_toggleSelectedCardElement(cardInPlay, isSelected) {
            var element,
                childElement;

            if (cardInPlay.freeCellIndex > -1) {
                element = playingFieldElements.freeCells.children[cardInPlay.freeCellIndex];
            } else {
                element = playingFieldElements.cascades.children[cardInPlay.cascadeIndex];
                childElement = element ? element.childNodes[cardInPlay.cascadeChildIndex] : null;
            }

            toggleSelectedElement(childElement || element, isSelected);
        },
        togglePauseButtonDisabled: function dom_togglePauseButtonDisabled(isDisabled) {
            toggleButtonDisabled(menuElements.pauseButton, isDisabled);
        },
        togglePauseButtonText: function dom_togglePauseButtonText(isPaused) {
            menuElements.pauseButton.innerHTML = isPaused ? 'Resume' : 'Pause';
            menuElements.gameTimer.style.color = isPaused ? window.freeCell.defaults.colorScheme.selectedBackground : cssColors.white;
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
        addCardsInPlayToCascadeElement: function dom_addCardsInPlayToCascadeElement(index, cascadeCardsInPlay) {
            var i,
                cascadeElement = playingFieldElements.cascades.children[index];

            for (i = 0; i < cascadeCardsInPlay.length; ++i) {
                generateAndAppendCardToCascade(cascadeCardsInPlay[i], index, cascadeCardsInPlay[i].cascadeChildIndex, cascadeElement);
            }

            cascadeElement.classList.remove(cssClasses.cascadeEmpty);
        },
        removeCardsInPlayFromCascadeElement: function dom_removeCardsInPlayFromCascadeElement(index, numberToRemove) {
            var i,
                cascadeElement = playingFieldElements.cascades.children[index];

            for (i = numberToRemove; i > 0; --i) {
                cascadeElement.removeChild(cascadeElement.lastChild);
            }

            if (cascadeElement.childNodes.length === 0) {
                cascadeElement.classList.add(cssClasses.cascadeEmpty);
            }
        },
        updateFoundationElement: updateFoundationElement,
        updateFreeCellElement: function dom_updateFreeCellElement(index, cardInPlay) {
            var freeCellElement = playingFieldElements.freeCells.children[index];

            if (cardInPlay) {
                updateCardElement(cardInPlay, freeCellElement);
            } else {
                clearElementChildren(freeCellElement);
                removeElementStyles(freeCellElement);
            }
        }
    };
}());
