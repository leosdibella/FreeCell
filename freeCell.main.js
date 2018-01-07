/*global window*/
(function () {
    'use strict';
    
    window.freeCell.main = {
        startNewGame: function main_startNewGame() {
            if (window.freeCell.current.game) {
                window.freeCell.current.game.destroy();
            }
            
            window.freeCell.current.game = new window.freeCell.Game();
        }
    };
    
    window.freeCell.main.startNewGame();
}());