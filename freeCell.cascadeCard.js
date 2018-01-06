/*global window*/
(function () {
    'use strict';
    
    function CascadeCard(card,
                         cascadeIndex,
                         cascadeChildIndex) {
        var cascadeCard = this;
        
        cascadeCard.cascadeIndex = window.freeCell.utilities.isNonNegativeInteger(cascadeIndex) ? cascadeIndex : 0;
        cascadeCard.cascadeChildIndex = cascadeChildIndex;
        cascadeCard.freeCellIndex = -1;
        cascadeCard.foundationIndex = -1;
    }
    
    window.freeCell.CascadeCard = CascadeCard;
}());