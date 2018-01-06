/*global window*/
(function () {
    'use strict';
    
    function RgbColor(red,
                      green,
                      blue) {
        var rgbColor = this;
        
        rgbColor.red = window.freeCell.utilities.isNonNegativeInteger(red) ? red : 0;
        rgbColor.green = window.freeCell.utilities.isNonNegativeInteger(green) ? green : 0;
        rgbColor.blue = window.freeCell.utilities.isNonNegativeInteger(blue) ? blue : 0;
        
        rgbColor.isEqual = function RgbColor_isEqual(otherRgbColor) {
            if (rgbColor.red === otherRgbColor.red
                    && rgbColor.blue === otherRgbColor.blue
                    && rgbColor.green === otherRgbColor.green) {
                return true;
            }
            
            return false;
        };
    }
    
    window.freeCell.RgbColor = RgbColor;
    
    window.freeCell.defaults.rgbColors = {
        black: new RgbColor(0, 0, 0),
        red: new RgbColor(200, 0, 0)
    };
}());