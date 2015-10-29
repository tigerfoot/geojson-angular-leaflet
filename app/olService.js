(function() {
'use strict';

/**
 * Map Service
 */
angular
  .module('app')
  .factory('mapService', service);

function service($http, $q, geolocationService) {
  // check openlayers is available on service instantiation
  // this can be handled with Require later on
  if (!ol) return {};

  // convenience reference
  var map = {},
    defaults = {
      zoom: 12,
      startLocation: ol.proj.transform([7.3442457442483,47.2553496968727], 'EPSG:4326', 'EPSG:3857')
    },
    zIndex = 9999,
    selectedFeature,
    searchFeatures = [];

  var buildings_loaded = $q.defer();
  var building_highlight;

  init();

  return {map: map, loadBuildings: loadBuildings, centerOnFeature: centerOnFeature};

  function init() {

    var RotateNorthControl = function(opt_options) {
      var options = opt_options || {};

      var button = document.createElement('button');
      button.innerHTML = 'N';

      var this_ = this;
      var handleRotateNorth = function(e) {
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

    };
    ol.inherits(RotateNorthControl, ol.control.Control);

//     var LocateMeControl = function(opt_options) {
//       var options = opt_options || {};
//
//       var button = document.createElement('button');
//       button.innerHTML = 'L';
//
//       var this_ = this;
//       var handleLocateMe = function(e) {
//           geolocationService.setTracking();
//       };
//
//       button.addEventListener('click', handleLocateMe, false);
//       button.addEventListener('touchstart', handleLocateMe, false);
//
//       var element = document.createElement('div');
//       element.className = 'locate-me ol-unselectable ol-control';
//       element.appendChild(button);
//
//       ol.control.Control.call(this, {
//         element: element,
//         target: options.target
//       });
//
//     };
//     ol.inherits(LocateMeControl, ol.control.Control);


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

    GeoJsonLoad();

    map.on('locationfound', onLocationEvent);
  }


  function GeoJsonLoad() {
    var data = [
            './data/ambulance_route_chemin.json',
            './data/ambulance_npa6.json',
            './data/ambulance_nomlocal.json',
            './data/ambulance_nomdelieu.json',
            './data/ambulance_lieudit.json',
            './data/ambulance_lieudenomme.json',
            './data/ambulance_batiment.json'

//       './data/ambulance_np6_01.json',
//       './data/ambulance_nomlocal.json',
//       './data/ambulance_lieudit.json',
//       './data/ambulance_lieucommunes.json',
//       './data/ambulance_rueplace.json',
//       './data/ambulance_batiments.json',
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

          if (dataUrl == './data/ambulance_batiment.json'){
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
              fill: new ol.style.Fill({color: 'black'}),
              textAlign: 'center',
              textBaseline: 'ideographic'
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

  function loadBuildings() {
    return buildings_loaded.promise;
  }

  function onLocationEvent(e) {
    console.log(e)
  }

  function centerOnFeature(feature){
    var coord = turf.centroid(feature.geometry).geometry.coordinates;
    console.log(feature);


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

  //  vectorSource.addFeature(new ol.Feature(new ol.geom.Circle(coord, 1)));
  //    console.log(ol.proj.transform(coord, 'EPSG:4326', 'EPSG:3857'));

      if (building_highlight){
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

      // Add vectory layer to map
      map.addLayer(vectorLayer);

      map.getView().setCenter(coord);
  //    map.getView().setCenter(ol.proj.transform(coord, 'EPSG:4326', 'EPSG:3857'));
      map.getView().setZoom(19);
  }
}

})();
