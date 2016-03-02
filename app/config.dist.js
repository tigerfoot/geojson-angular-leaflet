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
    });
})();
