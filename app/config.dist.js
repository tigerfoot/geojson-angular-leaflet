(function () {
    var app = angular.module('app');

    app.constant('inGlobalOptions', {
        data: {
            all: [
                'lieudenomme.json',
                'lieudit.json',
                'npa6.json',
                'route_chemin.json',
            ],
            '18': [
                'numerobatiment.json',
                'batiment.json',
                'rueplace.json',
                'nomdelieu.json',
                'nomlocal.json',
            ]
        },
        // Keep trailaing slash!
        dataFolder: './data/',
        defaults: {
            zoom: 11,
            startLocation: [805493.4040691875, 5971642.834779395],
            extent: [
                732113.8569154183,
                5929143.847052837,
                878872.9512229566,
                6014141.822505953
            ]
        },
        // ol3 or leaflet
        type: 'ol3',
    });
})();
