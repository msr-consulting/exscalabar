(function(){
	angular.module('main')
	.config(['$routeProvider', function($routeProvider){
		$routeProvider
		.when('/CRDS',{templateUrl:'views/crds.html'})
		.when('/PAS',{templateUrl:'views/pas.html'});
	}]);
})();