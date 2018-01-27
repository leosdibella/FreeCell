/*global window*/
(function () {
    'use strict';

    var isString = function utilities_isString(value) {
        return typeof value === 'string' || value instanceof String;
    };

    window.freeCell = {
        current: {},
        defaults: {},
        utilities: {
            isNonNegativeInteger: function utilities_isNonNegativeInteger(value) {
                return Number.isInteger(value) && value > -1;
            },
            isPositiveInteger: function utilities_isPositiveInteger(value) {
                return Number.isInteger(value) && value > 0;
            },
            isObject: function utilities_isObject(value) {
                return typeof value === 'object';
            },
            isString: isString,
            isNonEmptyString: function utilities_isNonEmptyString(value) {
                return isString(value) ? value.length > 0 : false;
            },
            fillArray: function utilities_fillArray(length, value) {
                var i,
                    array = [];

                for (i = 0; i < length; ++i) {
                    array.push(value !== undefined ? value : []);
                }

                return array;
            }
        }
    };
}());
