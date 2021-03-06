/* global ol */

(function () {
    angular.module('app').service('mapService', mapService);

    function mapService(inGlobalOptions, styleService) {
        // check openlayers is available on service instantiation
        // this can be handled with Require later on
        if (!ol) {
            return {};
        }

        // convenience reference
        var map = initMap();

        var buildingLayer;

        loadData();

        return {
            map: map,
            centerOnFeature: centerOnFeature
        };

        function initMap() {
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

            var olMap = new ol.Map({
                target: 'map',
                layers: [],
                view: new ol.View({
                    center: inGlobalOptions.defaults.startLocation,
                    projection: 'EPSG:3857',
                    zoom: inGlobalOptions.defaults.zoom
                }),
                controls: ol.control.defaults().extend([
                    new ol.control.ZoomToExtent({extent: inGlobalOptions.defaults.extent}),
                    new RotateNorthControl(),
                ])
            });

            return olMap;
        }

        function loadData() {
            inGlobalOptions.data.all.forEach(_addVectorLayerFromDataToMap);

            Object.keys(inGlobalOptions.data).filter(function (zoomLevel) {
                return zoomLevel !== 'all';
            }).forEach(function (zoomLevel) {
                inGlobalOptions.data[zoomLevel].forEach(function (fileName) {
                    var vectorLayer = _addVectorLayerFromDataToMap(fileName, false);
                    map.on('postrender', function () {
                        if (map.getView().getZoom() >= zoomLevel) {
                            vectorLayer.setVisible(true);
                        } else {
                            vectorLayer.setVisible(false);
                        }
                    });
                });
            });
        }

        function _addVectorLayerFromDataToMap(fileName, visible) {
            visible = visible === undefined ? true : visible;
            var vectorLayer = new ol.layer.Vector({
                source: new ol.source.Vector({
                    url: inGlobalOptions.dataFolder + fileName,
                    format: new ol.format.GeoJSON(),
                }),
                style: styleService.styleFunction,
                visible: visible,
            });
            map.addLayer(vectorLayer);

            return vectorLayer;
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

            if (buildingLayer) {
                map.removeLayer(buildingLayer);
            }

            buildingLayer = new ol.layer.Vector({
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

            map.addLayer(buildingLayer);
            map.getView().setCenter(coord);
            map.getView().setZoom(19);
        }
    }
})();
