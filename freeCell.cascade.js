/*global window*/
(function () {
    'use strict';
    
    function Cascade(fromCascade,
                     toCascade,
                     startingIndex) {
        var cascade = this;
        
        cascade.fromCascade = fromCascade;
        cascade.toCascade = toCascade;
        cascade.startingIndex = startingIndex;
        
        cascade.action = function Cascade_action() {
            var i;
            
            for (i = cascade.startingIndex; i < cascade.fromCascade.length - 1; ++i) {
                cascade.toCascade.push(cascade.fromCascade[i]);
                cascade.fromCascade.splice(i, 1);
            }
        };
    }
    
    window.freeCell.Cascade = Cascade;
}());