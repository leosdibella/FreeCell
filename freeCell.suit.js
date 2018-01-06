/*global window*/
(function () {
    'use strict';
    
    function Suit(rgbColor,
                  unicodeSymbol) {
        var suit = this;
        
        suit.rgbColor = rgbColor || window.freeCell.defaults.rgbColors.black;
        suit.unicodeSymbol = unicodeSymbol || '';
        
        suit.isEqual = function Suit_isEqual(otherSuit) {
            if (suit.unicodeSymbol === otherSuit.unicodeSymbol
                    && suit.rgbColor.isEqual(otherSuit.rgbColor)) {
                return true;
            }
            
            return false;
        };
    }
    
    window.freeCell.Suit = Suit;
    
    window.freeCell.defaults.suits = {
        clubs: new Suit(window.freeCell.defaults.rgbColors.black, '&clubs;'),
        diamonds: new Suit(window.freeCell.defaults.rgbColors.red, '&diams;'),
        hearts: new Suit(window.freeCell.defaults.rgbColors.red, '&hearts;'),
        spades: new Suit(window.freeCell.defaults.rgbColors.black, '&spades;')
    };
}());