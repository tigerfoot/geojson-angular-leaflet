(function() {
'use strict';

/**
 * Main Controller
 */
angular
  .module('app')
  .controller('mainController', Controller);

//Controller.$inject = [];

function Controller($scope, $timeout, mapService, geolocationService, searchService) {
  var vm = this;
  $scope.map = mapService.map;

  vm.search = '';
  vm.searchResults = [];
  vm.status = {showResults: false};

  vm.locationInfos = [];
  vm.tracking = false;

  geolocationService.init($scope.map);
  $scope.$on('updateGeoLocationInfos', function(evt,locationInfos){
    vm.locationInfos = locationInfos;
    $timeout();
  });


  vm.find = function (){
      vm.searchResults = searchService.search(vm.search);
      vm.status.showResults = (vm.searchResults.length > 0) ? true : false;
      console.log ( 'show result is ' + vm.status.showResults );
  };

  vm.cancel = function (){
      vm.search = '';
      vm.searchResults = [];
  };

  vm.selectFeature = function (feature){
      mapService.centerOnFeature(feature);
  };

  vm.geolocate = function (){
    geolocationService.setTracking();
    vm.tracking = ! vm.tracking;
  };

}

})();
