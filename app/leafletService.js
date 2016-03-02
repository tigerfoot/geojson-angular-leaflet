/* global L */

(function () {
    angular.module('app').factory('leafletService', leafletService);

    function leafletService($http, inGlobalOptions, styleService) {
        // check leaflet is available on service instantiation
        // this can be handled with Require later on
        if (!L || inGlobalOptions.type !== 'leaflet') {
            return {};
        }

        // todo use epsg
        var map = L.map('map', {
            center: [5971642.834779395, 805493.4040691875],
            zoom: 18,
            maxZoom: 50,
            maxBounds: null,
            crs: L.CRS.EPSG3857,
        });
        L.control.locate({
            follow: false,
            strings: {
                title: "Locate"
            }
        }).addTo(map);

        init();

        return {
            map: map,
            centerOnFeature: centerOnFeature
        };

        function init() {
            loadData();
        }

        function loadData() {
            inGlobalOptions.data.all.forEach(_addVectorLayerFromDataToMap);
        }

        function _addVectorLayerFromDataToMap(fileName, visible) {
            visible = visible === undefined ? true : visible;
            $http.get(inGlobalOptions.dataFolder + fileName).then(function (data) {
                L.geoJson(data.data, {
                    style: styleService.styleFunction
                }).addTo(map);
            });
        }

        function centerOnFeature(feature) {
            var latLng = [feature.geometry.coordinates[0][0][1], feature.geometry.coordinates[0][0][0]];
            map.setView(latLng, 20);
        }
    }
})();
