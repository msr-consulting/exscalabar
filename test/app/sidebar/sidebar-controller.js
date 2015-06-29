(function() {
	angular.module('main')
	.controller('Sidebar', ['$scope','$http', 'Data', 'net', function($scope, $http, Data, net) {

		$scope.save = 1;
		$scope.filter = 1;
		$scope.ip = net.ip;
		$scope.port = net.port;
		$scope.time = "Not connected";
		$scope.connected = false;
		
		$scope.changeIP = function(){
			net.setIP($scope.ip);
			};
		$scope.changePort = function(){
			net.setPort($scope.port);
			};
		
		// Initially time is not available
		$scope.time = "Not Connected";
		
		$scope.connected= false;
		
		
		$scope.$on('dataAvailable', function(){
			
			/* Populate the variables pertinent to the sidebar */
			$scope.time = Data.tObj.toLocaleTimeString('en-US', { hour12: false });
			$scope.filter = Data.filter;
			
			/* TODO: Have an issue with saving data - doesn't appear to be returning properly.
			 * The save variable should be in the CVT rather than in the data object.
			 *
			 */
			//$scope.save = Data.save;
			$scope.connected = true;
		});
		
		$scope.$on('dataNotAvailable', function(){
			$scope.connected = false;
		});

		$scope.saveData = function() {

			$scope.save = !$scope.save;
			
			// TODO: Check to see if this is correct.
			var s = $scope.save ? 1:0;
			
			$http.get(net.address() + 'General/Save?save='+s.toString());
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
