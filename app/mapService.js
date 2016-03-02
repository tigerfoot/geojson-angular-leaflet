(function () {
    angular.module('app').service('mapService', mapService);

    function mapService(inGlobalOptions, ol3Service, leafletService) {
        if (inGlobalOptions.type === 'ol3') {
            angular.extend(mapService.prototype, ol3Service);
        } else if (inGlobalOptions.type === 'leaflet') {
            angular.extend(mapService.prototype, leafletService);
        }
    }
})();
