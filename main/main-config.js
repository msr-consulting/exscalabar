/**
 * This file configures the routing for the main page.  These are the views which
 * Will be displayed when the user clicks a heading in the navigation menu.
 *
 * Routing requires the inclusion of 'angular-route.js' file and the module ngRoute.
 */

(function () {
    angular.module('main')
        .config(['$routeProvider',
            function ($routeProvider) {
                $routeProvider
                    .when('/CRDS', {templateUrl: 'html/crds.html'})
                    .when('/PAS', {templateUrl: 'html/pas.html'})
                    .when('/O3', {templateUrl: 'html/ozone.html'})
                    .when('/', {templateUrl: 'html/main.html'})
                    .when('/Flows', {templateUrl: 'html/flows.html'})
                    .when('/Temperature', {templateUrl: 'html/temperature.html'})
                    .when('/Humidifier', {templateUrl: 'html/humidifier.html'})
                    .when('/Common', {templateUrl: 'html/common.html'})
                    .when('/Config', {templateUrl: 'html/config.html'})
                    .when('/msg', {templateUrl: 'html/msg.html'})
                    .when('/Checklist', {templateUrl: 'html/checklist.html'})
                    .when('/Housekeeping', {templateUrl: 'html/housekeeping.html'});
            }]);
})();
