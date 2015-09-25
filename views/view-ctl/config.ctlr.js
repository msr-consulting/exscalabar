(function() {
	angular.module('main')
	.controller('configCtlr', ['$scope','$http', 'Data', 'net', function($scope, $http, Data, net) {


		$scope.ip = net.ip;
		$scope.port = net.port;


		$scope.changeIP = function(){
			net.setIP($scope.ip);
			};
		$scope.changePort = function(){
			net.setPort($scope.port);
			};



	}]);
})();
