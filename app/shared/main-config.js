/** This file conigures the routing for the main page.  These are the views which
 * Will be displayed when the user clicks a heading in the navigation menu.
 *
 * Routing requires the inclusion of 'angular-route.js' file and the module ngRoute.
 */

(function(){
	angular.module('main')
	.config(['$routeProvider',
	function($routeProvider){
		$routeProvider
		.when('/CRDS',{templateUrl:'views/crds.html'})
		.when('/PAS',{templateUrl:'views/pas.html'})
		.when('/O3',{templateUrl:'views/cals/ozone.html'})
		.when('/', {templateUrl:'views/main.html'})
		.when('/#', {templateUrl:'views/main.html'})
		.when('/Flows', {templateUrl:'views/flows.html'})
		.when('/Temperature', {templateUrl:'views/temperature.html'})
		.when('/Humidifier', {templateUrl:'views/humidifier.html'})
		.when('/Common', {templateUrl:'views/common.html'})
		.when('/Config', {templateUrl:'views/config.html'});
	}]);
})();
