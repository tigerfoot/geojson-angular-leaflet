(function () {
    angular.module('app').service('geolocationService', geolocationService);

    function geolocationService(inGlobalOptions, ol3GeolocationService, leafletGeolocationService) {
        if (inGlobalOptions.type === 'ol3') {
            angular.extend(geolocationService.prototype, ol3GeolocationService);
        } else if (inGlobalOptions.type === 'leaflet') {
            angular.extend(geolocationService.prototype, leafletGeolocationService);
        }
    }
})();
