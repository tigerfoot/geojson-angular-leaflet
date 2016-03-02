(function () {
    angular.module('app').service('geolocationService', geolocationService);

    function geolocationService($rootScope) {
        var geolocation;
        var map;

        // check openlayers is available on service instantiation
        // this can be handled with Require later on
        if (!ol) {
            return {};
        }

        function init(olMap) {

            map = olMap;
            geolocation = new ol.Geolocation({
                projection: map.getView().getProjection(),
                trackingOptions: {
                    maximumAge: 10000,
                    enableHighAccuracy: true,
                    timeout: 600000
                }
            });

            // Listen to position changes
            geolocation.on('change', function (evt) {
                var infos = [
                    {title: 'position', value: geolocation.getPosition()}
                    , {title: 'accuracy', value: geolocation.getAccuracy()}
                    , {title: 'heading', value: geolocation.getHeading() || 0}
                    , {title: 'speed', value: geolocation.getSpeed() || 0}
                ];
                $rootScope.$broadcast('updateGeoLocationInfos', infos);
                var view = map.getView();
                view.setCenter(geolocation.getPosition());
                if (view.getZoom() < 15) {
                    view.setZoom(18);
                }
            });

            geolocation.on('error', function () {
                console.error('geolocationService encountered a problem');
                $rootScope.$broadcast('updateGeoLocationInfos', []);
            });
        }

        function setTracking() {
            var onoff = geolocation.getTracking();
            geolocation.setTracking(!onoff);
            if (!onoff) {
                $rootScope.$broadcast('updateGeoLocationInfos', []);
            }
        }

        return {
            setTracking: setTracking,
            init: init
        };
    }
})();
