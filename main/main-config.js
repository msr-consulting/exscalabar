/**
 * This file conigures the routing for the main page.  These are the views which
 * Will be displayed when the user clicks a heading in the navigation menu.
 *
 * Routing requires the inclusion of 'angular-route.js' file and the module ngRoute.
 */

(function () {
    angular.module('main')
        .config(['$routeProvider',
            function ($routeProvider) {
                $routeProvider
                    .when('/CRDS', {templateUrl: 'crd/crds.html'})
                    .when('/PAS', {templateUrl: 'pas/pas.html'})
                    .when('/O3', {templateUrl: 'o3/ozone.html'})
                    .when('/', {templateUrl: 'main/main.html'})
                    .when('/Flows', {templateUrl: 'alicat/flows.html'})
                    .when('/Temperature', {templateUrl: 'views/temperature.html'})
                    .when('/Humidifier', {templateUrl: 'humidity/humidifier.html'})
                    .when('/Common', {templateUrl: 'views/common.html'})
                    .when('/Config', {templateUrl: 'config/config.html'})
                    .when('/msg', {templateUrl: 'msgs/msg.html'});
            }]);
})();
