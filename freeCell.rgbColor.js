/*global window*/
(function () {
    'use strict';
    
    var defaultBackgroundColor,
        hexBase = 16,
        maximalColorConstituentValue = hexBase * hexBase;
        
    function RgbColor(red,
                      green,
                      blue) {
        var rgbColor = this;
        
        rgbColor.red = window.freeCell.utilities.isNonNegativeInteger(red) ? red : 0;
        rgbColor.green = window.freeCell.utilities.isNonNegativeInteger(green) ? green : 0;
        rgbColor.blue = window.freeCell.utilities.isNonNegativeInteger(blue) ? blue : 0;
        
        rgbColor.isEqual = function RgbColor_isEqual(otherRgbColor) {
            return rgbColor === otherRgbColor
                || (rgbColor.red === otherRgbColor.red
                        && rgbColor.blue === otherRgbColor.blue
                        && rgbColor.green === otherRgbColor.green);
        };
        
        rgbColor.invert = function RgbColor_invert() {
            return new RgbColor(maximalColorConstituentValue - rgbColor.red, maximalColorConstituentValue - rgbColor.green, maximalColorConstituentValue - rgbColor.blue);
        };
        
        rgbColor.toHexColorString = function RgbColor_toHexColorString() {
            var hexString = '#';
            
            hexString += Number.parseInt(rgbColor.red.toString(hexBase), hexBase);
            hexString += Number.parseInt(rgbColor.green.toString(hexBase), hexBase);
            hexString += Number.parseInt(rgbColor.blue.toString(hexBase), hexBase);
            
            return hexString;
        };
        
        rgbColor.toString = function dom_toString(alpha) {
            var alphaValue = alpha ? Math.max(Math.abs(alpha), 1) : 0;
                
            return 'rgb' + (alphaValue > 0 ? 'a' : '') + '(' + rgbColor.red + ', ' + rgbColor.green + ', ' + rgbColor.blue + (alphaValue > 0 ? ', ' + alphaValue : '') + ')';
        };
    }
    
    RgbColor.prototype.parseFromHexColorString = function RgbColor_parseFromHexColorString(hex) {
        var string = window.freeCell.utilities.isString(hex) && hex.length > 5 ? (hex.length > 6 ? hex.substring(1, 8) : hex) : '000000';

        return new RgbColor(Number.parseInt(string.substring(0, 2), hexBase),
                            Number.parseInt(string.substring(2, 4), hexBase),
                            Number.parseInt(string.substring(4, 6), hexBase));
    };
    
    defaultBackgroundColor = new RgbColor(20, 190, 200);
    
    window.freeCell.RgbColor = RgbColor;
    
    window.freeCell.defaults.rgbColors = {
        black: new RgbColor(0, 0, 0),
        red: new RgbColor(200, 0, 0)
    };
    
    window.freeCell.defaults.colorScheme =  {
        background: defaultBackgroundColor,
        selectedBackground: defaultBackgroundColor.invert()
    };
}());