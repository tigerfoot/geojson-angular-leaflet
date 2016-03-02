/* global ol, turf */

(function () {
    'use strict';

    /**
     * Map Service
     */
    angular.module('app')
            .factory('mapService', mapService);

    function mapService($q, styleService, inGlobalOptions) {
        // check openlayers is available on service instantiation
        // this can be handled with Require later on
        if (!ol) {
            return {};
        }

        // convenience reference
        var map = {};
        var defaults = {
            zoom: 12,
            startLocation: ol.proj.transform([7.3442457442483, 47.2553496968727], 'EPSG:4326', 'EPSG:3857')
        };

        var buildings_loaded = $q.defer();
        var building_highlight;

        init();

        return {map: map, loadBuildings: loadBuildings, centerOnFeature: centerOnFeature};

        function init() {

            function RotateNorthControl(opt_options) {
                var options = opt_options || {};

                var button = document.createElement('button');
                button.innerHTML = 'N';

                var this_ = this;
                var handleRotateNorth = function (e) {
                    this_.getMap().getView().setRotation(0);
                };

                button.addEventListener('click', handleRotateNorth, false);
                button.addEventListener('touchstart', handleRotateNorth, false);

                var element = document.createElement('div');
                element.className = 'rotate-north ol-unselectable ol-control';
                element.appendChild(button);

                ol.control.Control.call(this, {
                    element: element,
                    target: options.target
                });
            }
            ol.inherits(RotateNorthControl, ol.control.Control);

            // map initialisation
            map = new ol.Map({
                target: 'map',
                layers: [
                    new ol.layer.Tile({
                        source: new ol.source.MapQuest({layer: 'osm'})
                    })
                ],
                view: new ol.View({
                    center: defaults.startLocation,
                    projection: 'EPSG:3857',
                    zoom: defaults.zoom
                }),
                controls:
                        ol.control.defaults().extend(
                        [
                            new ol.control.ZoomToExtent(),
                            new RotateNorthControl(),
                        ])
            });

            loadData();

            map.on('locationfound', onLocationEvent);
        }


        function loadData() {
            inGlobalOptions.data.all.forEach(_addVectorLayerFromDataToMap);

            Object.keys(inGlobalOptions.data).filter(function (zoomLevel) {
                return zoomLevel !== 'all';
            }).forEach(function (zoomLevel) {
                inGlobalOptions.data[zoomLevel].forEach(function (fileName) {
                    var vectorLayer = _addVectorLayerFromDataToMap(fileName);
                    vectorLayer.getSource().on('change', function (evt) {
                        var source = evt.target;
                        // Required due to async operations
                        if (source.getState() === 'ready') {
                            vectorLayer.setVisible(false);
                            map.on('postrender', function () {
                                if (map.getView().getZoom() >= zoomLevel) {
                                    vectorLayer.setVisible(true);
                                } else {
                                    vectorLayer.setVisible(false);
                                }
                            });
                        }
                    });
                });
            });
        }

        function _addVectorLayerFromDataToMap(fileName) {
            var vectorLayer = new ol.layer.Vector({
                source: new ol.source.Vector({
                    url: inGlobalOptions.dataFolder + fileName,
                    format: new ol.format.GeoJSON(),
                }),
                style: styleService.styleFunction
            });
            map.addLayer(vectorLayer);

            return vectorLayer;
        }

        function loadBuildings() {
            return buildings_loaded.promise;
        }

        function onLocationEvent(e) {
            console.log(e)
        }

        function centerOnFeature(feature) {
            var coord = turf.centroid(feature.geometry).geometry.coordinates;

            var geojsonObject = {
                'type': 'FeatureCollection',
                'crs': {
                    'type': 'name',
                    'properties': {
                        'name': 'EPSG:3857'
                    }
                },
                'features': [feature]
            };

            var vectorSource = new ol.source.Vector({
                features: (new ol.format.GeoJSON()).readFeatures(geojsonObject, {dataProjection: 'EPSG:3857'})
            });

            if (building_highlight) {
                map.removeLayer(building_highlight);
            }

            var vectorLayer = new ol.layer.Vector({
                source: vectorSource,
                style: [new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: 'red',
                            lineDash: [2],
                            width: 4
                        }),
                        fill: new ol.style.Fill({
                            color: 'rgba(255, 0, 0, 0.1)'
                        })
                    })]

            });

            map.addLayer(vectorLayer);
            map.getView().setCenter(coord);
            map.getView().setZoom(19);
        }
    }

})();
