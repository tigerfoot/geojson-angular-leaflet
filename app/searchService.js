(function () {
    'use strict';

    /**
     * Search Service
     */
    angular
            .module('app')
            .factory('searchService', service);

    function service($http) {
        var searchFeatures = [];

        $http.get('./searches.json').then(function (data) {
            searchFeatures = data.data;
        });

        return {search: search};

        function search(text) {
            var searchResults = [];

            if (searchFeatures.length > 0 && text.length > 0) {
                searchFeatures.forEach(function (feature) {
                    if (feature.searchText.toLowerCase().indexOf(text.toLowerCase()) > -1) {
                        searchResults.push(feature);
                    }
                });
            }

            return searchResults;
        }
    }
})();
