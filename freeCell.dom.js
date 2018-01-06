/*global document, window*/

(function () {
    'use strict';
    
    function Dom() {
        var dom = this,
            cascadeCardSpacingPixels = 215,
            attributeSplitter = '-',
            cardElementChildIndices = {
                topLeftCorner: 0,
                middle: 1,
                bottomRightCorner: 2
            },
            alignClasses = {
                left: 'align-left',
                right: 'align-right'
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
            adjustCardChildElementStyles = function dom_adjustCardChildElementStyles(element, card) {
                element.style.color = generateColorStyleString(card.suit.rgbColor);
            },
            adjustCardElementStyles = function dom_adjustCardElementStyles(element, cardInPlay) {
                element.style.border = generateBorderStyleString(cardInPlay.card.suit.rgbColor);
            
                if (cardInPlay.foundationIndex === -1 && cardInPlay.freeCellIndex === -1) {
                    element.style.boxShadow = generateBoxShadowStyleString(cardInPlay.card.suit.rgbColor);
                }
            },
            generateCardChildElement = function dom_generateCardChildElement(card, cardElementChildIndex) {
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
            generateCascadeChildElement = function dom_generateCascadeChildElement(cardInPlay) {
                var element = document.createElement('div');
            
                adjustCardElementStyles(element, cardInPlay);
                element.classList.add('card');
            
                element.appendChild(generateCardChildElement(cardInPlay.card, cardElementChildIndices.topLeftCorner));
                element.appendChild(generateCardChildElement(cardInPlay.card, cardElementChildIndices.middle));
                element.appendChild(generateCardChildElement(cardInPlay.card, cardElementChildIndices.bottomRightCorner));
            
                return element;
            },
            updateCardChildElement = function dom_updateCardChildElement(card, element, cardElementChildIndex) {
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
            updateCardElement = function dom_updateCardElement(cardInPlay, element) {
                if (cardInPlay.isSelected) {
                    element.classList.add('selected-card');
                } else {
                    element.classList.remove('selected-card');
                    adjustCardElementStyles(element, cardInPlay);
                }
            
                updateCardChildElement(cardInPlay.card, element.children[cardElementChildIndices.topLeftCorner], cardElementChildIndices.topLeftCorner);
                updateCardChildElement(cardInPlay.card, element.children[cardElementChildIndices.middle], cardElementChildIndices.middle);
                updateCardChildElement(cardInPlay.card, element.children[cardElementChildIndices.bottomRightCorner], cardElementChildIndices.bottomRightCorner);
            },
            fillCascadeElements = function dom_fillCascadeElements(game) {
                var i,
                    j,
                    cascade,
                    cardElement;
            
                for (i = 0; i < window.freeCell.current.configuration.numberOfCascades; ++i) {
                    cascade = dom.playingFieldElements.cascades.children[i];
                
                    for (j = 0; j < window.freeCell.current.configuration.cascadeDistribution[i]; ++j) {
                        cardElement = generateCascadeChildElement(game.cascadeCardsInPlay[i][j]);
                        cardElement.id = i + attributeSplitter + j;
                        cardElement.onclick = game.cascadeCardElementClick;
                        cardElement.ondblclick = game.cascadeCardElementDoubleClick;
                    
                        if (j > 0) {
                            cardElement.style.marginTop = -cascadeCardSpacingPixels + 'px';
                        }
                    
                        cascade.appendChild(cardElement);
                    }
                }
            },
            buildChild = function dom_buildChild(index, playingFieldElement) {
                var element = document.createElement('div');
            
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
            };
        
        dom.menuElements = {
            newGameButton: document.getElementById('new-game-button'),
            pauseButton: document.getElementById('pause-game-button'),
            redoButton: document.getElementById('redo-move-button'),
            replayGameButton: document.getElementById('replay-game-button'),
            undoButton: document.getElementById('undo-move-button'),
            gameTimer: document.getElementById('game-timer')
        };
        
        dom.playingFieldElements = {
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
        };
        
        dom.redrawPlayingFieldElements = function Dom_redrawPlayingFieldElements(game) {
            if (game) {
                var i,
                    key;
            
                dom.playingFieldElements.freeCells.numberOfChildren = window.freeCell.current.configuration.numberOfFreeCells;
                dom.playingFieldElements.foundations.numberOfChildren = window.freeCell.current.configuration.deck.numberOfSuits;
                dom.playingFieldElements.cascades.numberOfChildren = window.freeCell.current.configuration.numberOfCascades;
            
                for (key in dom.playingFieldElements) {
                    if (dom.playingFieldElements.hasOwnProperty(key)) {
                        clearElementChildren(dom.playingFieldElements[key]);
                        dom.playingFieldElements[key].children = [];
                        buildChildren(dom.playingFieldElements[key]);
                    }
                }
            
                for (i = 0; i < window.freeCell.current.configuration.deck.numberOfSuits; ++i) {
                    dom.updateFoundationElement(i);
                }
            
                fillCascadeElements(game);
            }
        };
        
        dom.getPlayingFieldElementChildIdFromEvent = function dom_getPlayingFieldElementChildIdFromEvent(event) {
            return parseInt(event.currentTarget.id.split(attributeSplitter)[1], 10);
        };
        
        dom.getCascadeChildElementIndicesFromEvent = function dom_getCascadeChildElementIndicesFromEvent(event) {
            var idParts = event.currentTarget.id.split(attributeSplitter);
            
            return [
                parseInt(idParts[0], 10),
                parseInt(idParts[1], 10)
            ];
        };
        
        dom.updateFreeCellElement = function dom_updateFreeCellElement(index, cardInPlay) {
            var freeCellElement = dom.playingFieldElements.freeCells.children[index];
            
            if (cardInPlay) {
                updateCardElement(cardInPlay, freeCellElement);
            } else {
                clearElementChildren(freeCellElement);
            }
        };
            
        dom.updateFoundationElement = function dom_updateFoundationElement(index, cardInPlay) {
            var foundationElement = dom.playingFieldElements.foundations.children[index],
                foundationChild;

            if (cardInPlay) {
                updateCardElement(cardInPlay, foundationElement);
            } else {
                clearElementChildren(foundationElement);
                
                foundationChild = document.createElement('div');
                foundationChild.classList.add('suit');
                foundationChild.classList.add('foundation-suit');
                foundationChild.style.color = generateColorStyleString(window.freeCell.current.configuration.deck.suitOrder[index].rgbColor);
                foundationChild.innerHTML = window.freeCell.current.configuration.deck.suitOrder[index].unicodeSymbol;
                
                foundationElement.appendChild(foundationChild);
            }
        };
        
        dom.updateCascadeElement = function freeCell_updateCascadeElement(index, startingIndex, cascadeCardsInPlay) {
            var i,
                cascadeElement = dom.playingFieldElements.cascades.children[index],
                startingCardInPlay = cascadeCardsInPlay[startingIndex],
                endingCardInPlay = cascadeCardsInPlay[cascadeCardsInPlay.length - 1];
            
            if (startingCardInPlay.cascadeChildIndex > cascadeElement.childNodes.length - 1) {
                for (i = startingCardInPlay.cascadeChildIndex; i <= endingCardInPlay.cascadeChildIndex; ++i) {
                    cascadeElement.appendChild(generateCascadeChildElement(cascadeCardsInPlay[i]));
                }
            } else {
                for (i = endingCardInPlay.cascadeChildIndex; i >= startingCardInPlay.cascadeChildIndex; --i) {
                    cascadeElement.removeChild(cascadeElement.lastChild);
                }
            }
        };
    }
    
    window.freeCell.dom = new Dom();
}());