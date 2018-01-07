/*global window*/
(function () {
    'use strict';
    
    var isString = function utilities_isString(value) {
        return typeof value === 'string';
    };
    
    window.freeCell = {
        current: {},
        defaults: {},
        utilities: {
            parseInt: function utilities_parseInt(value) {
                return Number.parseInt(value, 10);
            },
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
            }
        }
    };
}());