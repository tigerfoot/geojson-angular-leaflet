(function () {
    angular.module('app')
            .factory('styleService', styleService);

    function styleService(inGlobalOptions) {
        var styleFunction;
        if (inGlobalOptions.type === 'ol3') {
            styleFunction = ol3StyleFunction;
        } else if (inGlobalOptions.type === 'leaflet') {
            styleFunction = leafletStyleFunction;
        }

        return {
            styleFunction: styleFunction
        };

        function ol3StyleFunction(feature, resolution) {
            function getTextStyle() {
                if (feature.getProperties()) {
                    var properties = feature.getProperties();
                    if (properties.numero) {
                        return new ol.style.Text({
                            text: feature.getProperties().numero,
                            fill: new ol.style.Fill({color: 'black'})
                        })
                    } else if (properties.texte) {
                        return new ol.style.Text({
                            text: feature.getProperties().texte,
                            fill: new ol.style.Fill({color: 'black'}),
                            textAlign: 'center',
                            textBaseline: 'ideographic'
                        });
                    }
                }
            }

            var image = new ol.style.Circle({
                radius: 5,
                fill: null,
                stroke: new ol.style.Stroke({color: 'red', width: 1})
            });
            var Geostyles = {
                'Point': [new ol.style.Style({
                        image: image
                    })],
                'LineString': [new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: 'red',
                            width: 1
                        }),
                        text: getTextStyle()
                    })
                ],
                'MultiLineString': [new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: 'red',
                            width: 1
                        })
                    })],
                'MultiPoint': [new ol.style.Style({
                        image: image
                    })],
                'MultiPolygon': [new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: 'yellow',
                            width: 1
                        }),
                        fill: new ol.style.Fill({
                            color: 'rgba(255, 255, 0, 0.1)'
                        })
                    })],
                'Polygon': [new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: 'rgba(0, 0, 255, 0.1)',
                            lineDash: [4],
                            width: 3
                        }),
                        fill: new ol.style.Fill({
                            color: 'rgba(0, 0, 255, 0.1)'
                        }),
                        text: getTextStyle()
                    })],
                'GeometryCollection': [new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: 'magenta',
                            width: 2
                        }),
                        fill: new ol.style.Fill({
                            color: 'magenta'
                        }),
                        image: new ol.style.Circle({
                            radius: 10,
                            fill: null,
                            stroke: new ol.style.Stroke({
                                color: 'magenta'
                            })
                        })
                    })],
                'Circle': [new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: 'red',
                            width: 2
                        }),
                        fill: new ol.style.Fill({
                            color: 'rgba(255,0,0,0.2)'
                        })
                    })]
            };
            return Geostyles[feature.getGeometry().getType()];
        }


        function leafletStyleFunction(feature) {
            switch (feature.geometry.type) {
                case 'MultiLineString':
                case 'LineString':
                    console.log('line')
                    return {
                        color: '#FF0000',
                        width: 1
                    };
                case 'MultiPolygon':
                case 'Polygon':
                    console.log('polygon')
                    return {
                        color: '#0000FF',
                        fillColor: '#0000AA',
                        fillOpacity: 0.1,
                        width: 3,
                    };
            }
        }
    }
})();
