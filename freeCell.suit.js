/*global window*/
(function () {
    'use strict';
    
    function Suit(rgbColor,
                  unicodeSymbol) {
        var suit = this;
        
        suit.rgbColor = rgbColor || window.freeCell.defaults.rgbColors.black;
        suit.unicodeSymbol = window.freeCell.utilities.isString(unicodeSymbol) ? unicodeSymbol : '';
        
        suit.isEqual = function Suit_isEqual(otherSuit) {
            return suit === otherSuit
                || (suit.unicodeSymbol === otherSuit.unicodeSymbol
                        && suit.rgbColor.isEqual(otherSuit.rgbColor));
        };
    }
    
    window.freeCell.Suit = Suit;
    
    window.freeCell.defaults.suits = {
        diamonds: new Suit(window.freeCell.defaults.rgbColors.red, '&diams;'),
        clubs: new Suit(window.freeCell.defaults.rgbColors.black, '&clubs;'),
        hearts: new Suit(window.freeCell.defaults.rgbColors.red, '&hearts;'),
        spades: new Suit(window.freeCell.defaults.rgbColors.black, '&spades;')
    };
}());