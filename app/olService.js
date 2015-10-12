(function() {
'use strict';

/**
 * Map Service
 */
angular
  .module('app')
  .factory('mapService', service);

function service($http, $q) {
  // check openlayers is available on service instantiation
  // this can be handled with Require later on
  if (!ol) return {};

  // convenience reference
  var map = {},
    defaults = {
      zoom: 12,
      startLocation: [7.3442457442483,47.2553496968727]
    },
    zIndex = 9999,
    selectedFeature,
    searchFeatures = [];

  var buildings_loaded = $q.defer();
  console.log(buildings_loaded);

  init();

  return {map: map, loadBuildings: loadBuildings, centerOnFeature: centerOnFeature};

  function init() {

    // map initialisation
    map = new ol.Map({
      target: 'map',
      layers: [],
      view: new ol.View({
        center: ol.proj.transform(defaults.startLocation, 'EPSG:4326', 'EPSG:3857'),
        projection: 'EPSG:3857',
        zoom: defaults.zoom
      }),
      controls:
        ol.control.defaults().extend(
          [
            new ol.control.ZoomToExtent()
          ])
    });

    GeoJsonLoad();

    map.on('locationfound', onLocationEvent);
  }


  function GeoJsonLoad() {
    var data = [
      './data/ambulance_np6_01.json',
      './data/ambulance_nomlocal.json',
      './data/ambulance_lieudit.json',
      './data/ambulance_lieucommunes.json',
      './data/ambulance_rueplace.json',
      './data/ambulance_batiments.json',
    ];

    data.forEach(function(dataUrl){

      var vectorLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
          url: dataUrl,
          format: new ol.format.GeoJSON(),
        }),
        style: styleFunction
      });

      // Add vectory layer to map
      map.addLayer(vectorLayer);

      vectorLayer.getSource().on('change', function(evt) {
        var source = evt.target;
        // important for async.
        if (source.getState() === 'ready') {

          if (dataUrl == './data/ambulance_batiments.json'){
            $http.get(dataUrl).success (function (jsondata) {
              buildings_loaded.resolve(jsondata);
            });
            vectorLayer.setVisible(false);
             map.on('postrender',function(){
              if (map.getView().getZoom() >= 18 ){
                vectorLayer.setVisible(true);
              }else{
                vectorLayer.setVisible(false);
              }
//               console.log("postrender ",map.getView().getZoom());
             });
          }

          source.getFeatures().forEach(function(feature){
            var searchText = [];
            var properties = feature.getProperties();
            for (name in properties ){
              if (properties.hasOwnProperty(name) && name !== 'geometry'){
                searchText.push(properties[name].toString());
              }
            }
            searchFeatures.push({
              feature: feature,
              searchText: searchText.join(', ')
            })
          });

        }

      });
    });
  }

  function styleFunction (feature, resolution) {

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
              fill: new ol.style.Fill({color: 'black'})
            })
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
            color: 'blue',
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

  function loadBuildings() {
    return buildings_loaded.promise;
  }

  function onLocationEvent(e) {
    console.log(e)
  }

  function centerOnFeature(feature){
    var coord = turf.centroid(feature.geometry).geometry.coordinates;
    console.log(coord);
    console.log(ol.proj.transform(coord, 'EPSG:4326', 'EPSG:3857'));
    map.getView().setCenter(ol.proj.transform(coord, 'EPSG:4326', 'EPSG:3857'));
    map.getView().setZoom(19);
  }
}

})();
