(function () {
    'use strict';

    /**
     * Map Service
     */
    angular
            .module('app')
            .factory('geolocationService', service);

    function service($rootScope) {
        var geolocation;
        var map;

        // check openlayers is available on service instantiation
        // this can be handled with Require later on
        if (!ol)
            return {};

        function init(vmap) {

            map = vmap;
            // Geolocation Control
            geolocation = new ol.Geolocation(/** @type {olx.GeolocationOptions} */
                    ({
                        projection: map.getView().getProjection(),
                        trackingOptions: {
                            maximumAge: 10000,
                            enableHighAccuracy: true,
                            timeout: 600000
                        }
                    }));

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
                alert('geolocation error');
                // FIXME we should remove the coordinates in positions
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

        // postcompose callback
        function render() {
            map.render();
        }


        function setTracking() {
            var onoff = geolocation.getTracking();
            geolocation.setTracking(!onoff); // Start position tracking
            if (!onoff) {
                $rootScope.$broadcast('updateGeoLocationInfos', []);
            }
            map.on('postcompose', render);
            map.render();
        }

        return {setTracking: setTracking, init: init};

    }

})();
