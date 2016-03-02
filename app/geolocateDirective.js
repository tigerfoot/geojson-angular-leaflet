(function () {
    'use strict';

    /**
     * Directive
     */
    angular
            .module('app')
            .directive('geolocate', directive);

    function directive() {

        return {
            restrict: 'A',
            replace: true,
            templateUrl: 'app/partials/geolocation.html',
        };
    }


})();
