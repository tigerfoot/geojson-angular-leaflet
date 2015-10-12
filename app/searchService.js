(function() {
'use strict';

/**
 * Search Service
 */
angular
  .module('app')
  .factory('searchService', service);

  function service (mapService) {
    var searchFeatures = [];

    mapService.loadBuildings().then(function (buildings) {

      buildings.features.forEach(function(feature){
        var key;
        var searchText = [];
        var properties = feature.properties;
        for (key in properties ){
            searchText.push(properties[key].toString());
        }
        searchFeatures.push({
          feature: feature,
          searchText: searchText.join(', ')
        });
      });

    });

    return {search: search};

    function search(text) {
      var searchResults = [];

      if ( searchFeatures.length > 0 && text.length > 0 ){
        searchFeatures.forEach(function(feature){
          if (feature.searchText.toLowerCase().indexOf(text.toLowerCase()) > -1){
            searchResults.push(feature);
          }
        });
      }

      return searchResults;
    }
  }
})();
