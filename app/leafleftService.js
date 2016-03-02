(function () {
    'use strict';

    /**
     * Map Service
     */
    angular
            .module('app')
            .factory('mapService', service);

    function service($http, $q) {
        // check leaflet is available on service instantiation
        // this can be handled with Require later on
        if (!L)
            return {};
        // todo use epsg
        var map = L.map('map', {center: [47.27762, 7.37096], zoom: 18, maxZoom: 50,
            maxBounds: null});
        L.control.locate({
            follow: false,
            strings: {
                title: "Locate"
            }
        }).addTo(map);

        var buildings_loaded = $q.defer();

        init();
        return {map: map, loadBuildings: loadBuildings, centerOnFeature: centerOnFeature};

        function init() {
            //background();
            GeoJsonLoad();
            map.on('locationfound', onLocationEvent);
            //map.locate({setView: true, maxZoom: 13});
        }

        function background() {
            L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IjZjNmRjNzk3ZmE2MTcwOTEwMGY0MzU3YjUzOWFmNWZhIn0.Y8bhBaUMqFiPrDRW9hieoQ', {
                maxZoom: 18,
                attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
                id: 'mapbox.light'
            }).addTo(map);
        }


        function GeoJsonLoad() {
            //Define display options for each geoJSON marker
            var geojsonMarkerOptions = {
                radius: 8,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 0.01,
                fillOpacity: 0.08
            };
            var data = [
                './data/ambulance_np6_01.json',
                './data/ambulance_nomlocal.json',
                './data/ambulance_lieudit.json',
                './data/ambulance_lieucommunes.json',
                './data/ambulance_rueplace.json',
                './data/ambulance_batiments.json',
            ];

            data.forEach(function (dataUrl) {
                $http.get(dataUrl).success(function (jsondata) {
                    L.geoJson(jsondata,
                            {
                                style: function (feature) {
                                    return {color: feature.properties.color};
                                },
                                onEachFeature: function (feature, layer) {
                                    if (feature.properties.hasOwnProperty('genre')) {
// Domage mais ça marche pas.
//                     return L.circleMarker(
//                       turf.centroid(feature.geometry).geometry.coordinates
//                       , geojsonMarkerOptions).bindLabel(
//                       feature.properties.texte, {
//                     noHide: true
//                     }).addTo(map);

                                        //                   layer.setText(feature.properties.numero);
//                  }else{
//                    layer.setText(feature.properties.texte);
                                    }
                                }
                            }
                    ).addTo(map);
                    if (dataUrl == './data/ambulance_batiments.json') {
                        buildings_loaded.resolve(jsondata);
                    }
                });
            });
        }


        function loadBuildings() {
            return buildings_loaded.promise;
        }

        function onLocationEvent(e) {
            console.log(e)
        }

        function centerOnFeature(feature) {
            console.log(feature);
            var latLng = [feature.geometry.coordinates[0][0][1], feature.geometry.coordinates[0][0][0]];
            map.setView(latLng, 20);
        }
    }



})();
