(function() {
	angular.module('main')
	.controller('Sidebar', ['$scope','$http', 'Data', 'net', function($scope, $http, Data, net) {

		$scope.save = 1;
		$scope.filter = 1;
		$scope.ip = net.ip;
		$scope.port = net.port;
		$scope.time = "Not connected";
		
		$scope.changeIP = function(){
			net.setIP($scope.ip);
			};
		$scope.changePort = function(){
			net.setPort($scope.port);
			};
		
		// Initially time is not available
		$scope.time = "Not Connected";
		
		
		$scope.$on('dataAvailable', function(){
			
			/* Populate the variables pertinent to the sidebar */
			$scope.time = Data.tObj.toLocaleTimeString('en-US', { hour12: false });
			$scope.filter = Data.filter;
			$scope.save = Data.save;
		});

		$scope.saveData = function() {

			if ($scope.save != 0) {
				$scope.save = 0;
			} else {
				$scope.save = 1;
			}

			$http.get(net.address() + 'General/Save?save='+$scope.save.toString());
		};

		$scope.setFilter = function() {
			if ($scope.filter != 0) {
				$scope.filter = 0;
			} else {
				$scope.filter = 1;
			}
			$http.get(net.address() + 'General/Save?save='+$scope.filter.toString());

		};
		
		$scope.stop = function(){
			$http.get(net.address() + 'General/Stop');
		};

	}]);
})();
