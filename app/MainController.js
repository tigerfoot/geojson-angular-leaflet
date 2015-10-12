(function() {
'use strict';

/**
 * Main Controller
 */
angular
  .module('app')
  .controller('mainController', Controller);

//Controller.$inject = [];

function Controller(mapService, searchService) {
  var vm = this;

  vm.search = '';
  vm.searchResults = [];

  vm.find = function (){
      vm.searchResults = searchService.search(vm.search);
  };

  vm.cancel = function (){
      vm.search = '';
      vm.searchResults = [];
  };

  vm.selectFeature = function (feature){
      mapService.centerOnFeature(feature);
  };

}

})();
