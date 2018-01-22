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
            var i,
                numberToMove = cascade.fromCascade.length - cascade.startingIndex;

            for (i = cascade.startingIndex; i < cascade.fromCascade.length; ++i) {
                cascade.toCascade.push(cascade.fromCascade[i]);
            }

            cascade.fromCascade.splice(cascade.startingIndex, numberToMove);
        };
    }

    window.freeCell.Cascade = Cascade;
}());
