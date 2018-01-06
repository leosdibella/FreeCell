/*global document, window*/

(function () {
    'use strict';
    
    var attributeSplitter = '-',
        menuEelements = {
            newGameButton: document.getElementById('new-game-button'),
            pauseButton: document.getElementById('pause-game-button'),
            redoButton: document.getElementById('redo-move-button'),
            replayGameButton: document.getElementById('replay-game-button'),
            undoButton: document.getElementById('undo-move-button'),
            gameTimer: document.getElementById('game-timer')
        },
        playingFieldElements = {
            freeCells: document.getElementById('free-cells'),
            foundations: document.getElementById('foundations'),
            cascades: document.getElementById('cascades')
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
        };
    
    function Dom(numberOfFreeCells,
                 numberOfSuits,
                 numberOfCascades) {
        this.menuElements = menuEelements;
        
        this.playingFieldElements = {
            freeCells: {
                root: playingFieldElements.freeCells,
                children: [],
                childIdPrefix: 'freeCell',
                childClass: 'free-cell',
                numberOfChildren: numberOfFreeCells || window.freeCell.defaultConfiguration.numberOfFreeCells
            },
            foundations: {
                root: playingFieldElements.foundations,
                children: [],
                childIdPrefix: 'foundation',
                childClass: 'foundation',
                numberOfChildren: numberOfSuits || window.freeCell.defaultConfiguration.numberOfSuits
            },
            cascades: {
                root: playingFieldElements.cascades,
                children: [],
                childIdPrefix: 'cascade',
                childClass: 'cascade',
                numberOfChildren: numberOfCascades || window.freeCell.defaultConfiguration.numberOfCascades
            }
        };
        
        this.getPlayingFieldElementChildIdFromEvent = function freeCell_getPlayingFieldElementChildIdFromEvent(event) {
            return parseInt(event.currentTarget.id.split(attributeSplitter)[1], 10);
        };
        
        this.getCascadeChildElementIndicesFromEvent = function freeCell_getCascadeChildElementIndicesFromEvent(event) {
            var idParts = event.currentTarget.id.split(attributeSplitter);
            
            return [
                parseInt(idParts[0], 10),
                parseInt(idParts[1], 10)
            ];
        };
    }
    
    window.freeCell.Dom = Dom;
    window.freeCell.defaults.dom = new Dom();
}());