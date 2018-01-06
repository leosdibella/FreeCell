/*global window*/
(function () {
    'use strict';
    
    function CardInPlay(card,
                        cascadeIndex,
                        cascadeChildIndex) {
        var cardInPlay = this;
        
        cardInPlay.cascadeIndex = window.freeCell.utilities.isNonNegativeInteger(cascadeIndex) ? cascadeIndex : -1;
        cardInPlay.cascadeChildIndex = window.freeCell.utilities.isNonNegativeInteger(cascadeChildIndex) ? cascadeChildIndex : -1;
        cardInPlay.freeCellIndex = -1;
        cardInPlay.foundationIndex = -1;
        cardInPlay.isSelected = false;
    }
    
    window.freeCell.CardInPlay = CardInPlay;
}());