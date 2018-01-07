/*global window, setTimeout, clearTimeout*/
(function () {
    'use strict';
    
    function Timer() {
        var timer = this,
            isPaused = false,
            hours = 0,
            minutes = 0,
            seconds = 0,
            timeout,
            getStringComponentFromNumber = function Timer_getStringComponentFromNumber(number) {
                return number < 10 ? '0' + number : number;
            },
            incrementGameTime = function Timer_incrementGameTime() {
                ++seconds;
            
                if (seconds > 59) {
                    seconds = 0;
                    ++minutes;
                
                    if (minutes > 59) {
                        minutes = 0;
                        ++hours;
                    }
                }
            },
            getGameTimeString = function Timer_getGameTimeString() {
                return getStringComponentFromNumber(hours) + ':' + getStringComponentFromNumber(minutes) + ':' + getStringComponentFromNumber(seconds);
            },
            countTime = function Timer_countTime() {
                timeout = setTimeout(function () {
                    if (!isPaused) {
                        incrementGameTime();
                        window.freeCell.dom.setGameTimer(getGameTimeString());
                    }
                    
                    countTime();
                }, 1000);
            };
        
        timer.pause = function Timer_pause() {
            isPaused = true;
        };
        
        timer.stopTimer = function Timer_stopTimer(maintainTime) {
            clearTimeout(timeout);
            
            if (!maintainTime) {
                window.freeCell.dom.setGameTimer('00:00:00');
            }
        };
        
        countTime();
    }
    
    window.freeCell.Timer = Timer;
}());