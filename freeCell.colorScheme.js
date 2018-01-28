/*global window*/
(function () {
    'use strict';

    var defaultPrimaryRgbColor = new window.freeCell.RgbColor(20, 190, 200);

    function ColorScheme(primaryRgbColor,
        secondaryRgbColor) {
        var colorScheme = this;

        colorScheme.primaryRgbColor = window.freeCell.RgbColor.isRgbColor(primaryRgbColor) ? primaryRgbColor : defaultPrimaryRgbColor;
        colorScheme.secondaryRgbColor = window.freeCell.RgbColor.isRgbColor(secondaryRgbColor) ? secondaryRgbColor : defaultPrimaryRgbColor.invert();
    }

    window.freeCell.ColorScheme = ColorScheme;
    window.freeCell.defaults.colorScheme = new ColorScheme();
}());
