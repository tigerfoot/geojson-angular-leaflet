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
            });

            geolocation.on('error', function () {
                console.error('geolocationService encountered a problem');
                $rootScope.$broadcast('updateGeoLocationInfos', []);
            });

            // change center and rotation before render
            map.beforeRender(function (map, frameState) {
                if (frameState !== null) {
                    var gp = geolocation.getPosition();
                    var view = frameState.viewState;
                    if (gp && geolocation.getTracking()) {
                        view.center = gp;
                    }
                }
                return true; // Force animation to continue
            });

        }

        function setTracking() {
            var onoff = geolocation.getTracking();
            geolocation.setTracking(!onoff);
            if (!onoff) {
                $rootScope.$broadcast('updateGeoLocationInfos', []);
            }
            map.on('postcompose', function () {
                map.render();
            });
            map.render();
        }

        return {
            setTracking: setTracking,
            init: init
        };
    }
})();
