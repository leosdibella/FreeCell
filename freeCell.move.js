/*global window*/
(function () {
    'use strict';
    
    function Move(freeCellCardsInPlay,
                  foundationCardsInPlay,
                  cascadeCardsInPlay) {
        var move = this,
            i,
            j;
        
        move.freeCellCardsInPlay = [];
        move.foundationCardsInPlay = [];
        move.cascadeCardsInPlay = [];
        
        for (i = 0; i < freeCellCardsInPlay.length; ++i) {
            move.freeCellCardsInPlay.push(freeCellCardsInPlay[i]);
        }
        
        for (i = 0; i < foundationCardsInPlay.length; ++i) {
            move.foundationCardsInPlay.push([]);
            
            for (j = 0; j < foundationCardsInPlay[i].length; ++j) {
                move.foundationCardsInPlay[i].push(foundationCardsInPlay[i][j]);
            }
        }
        
        for (i = 0; i < cascadeCardsInPlay.length; ++i) {
            move.cascadeCardsInPlay.push([]);
            
            for (j = 0; j < cascadeCardsInPlay[i].length; ++j) {
                move.cascadeCardsInPlay[i].push(cascadeCardsInPlay[i][j]);
            }
        }
    }
    
    window.freeCell.Move = Move;
}());