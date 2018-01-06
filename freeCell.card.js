/*global window*/
(function () {
    'use strict';
    
    function Card(suit,
                  value,
                  faceCardValue) {
        var card = this;
        
        card.suit = suit;
        card.value = value;
        card.valueAsString = window.freeCell.utilities.isNonEmptyString(faceCardValue) ? faceCardValue : String(value);
    }
    
    window.freeCell.Card = Card;
}());