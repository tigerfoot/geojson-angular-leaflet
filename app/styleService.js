(function () {
    angular.module('app')
            .factory('styleService', styleService);

    function styleService() {
        return {
            styleFunction: styleFunction
        };

        function styleFunction(feature, resolution) {
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

            var image;
            if ( feature.getProperties().code_valide === 0 ) {
              image = new ol.style.Circle({
                radius: 5,
                fill: new ol.style.Fill({color: 'orange'}),
                                              stroke: new ol.style.Stroke({color: 'red', width: 1})
              });
            } else {
              image = new ol.style.RegularShape({
                points: 4,
                radius: 5,
                fill: new ol.style.Fill({color: 'orange'}),
                                                 stroke: new ol.style.Stroke({color: 'red', width: 1})
              });
            }

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
    }
})();
