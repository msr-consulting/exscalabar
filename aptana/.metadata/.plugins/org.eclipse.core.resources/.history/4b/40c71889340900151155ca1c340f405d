(function() {
	angular.module('main')
	.controller('Sidebar', ['$scope','$http', 'Data', function($scope, $http, Data) {

		$scope.save = 1;
		$scope.filter = 1;
		
		// Initially time is not available
		$scope.time = "NA";
		
		
		$scope.$on('dataAvailable', function(){
			$scope.time = Data.getTime();
		});

		$scope.saveData = function() {

			if ($scope.save != 0) {
				$scope.save = 0;
			} else {
				$scope.save = 1;
			}

			$http.get('http://192.168.0.73:8001/xService/General/Save?save='+$scope.save.toString());
		};

		$scope.setFilter = function() {
			if ($scope.filter != 0) {
				$scope.filter = 0;
			} else {
				$scope.filter = 1;
			}
			$http.get('http://192.168.0.73:8001/xService/General/Save?save='+$scope.filter.toString());

		};
		
		$scope.stop = function(){
			$http.get('http://192.168.0.73:8001/xService/General/Stop');
		};

	}]);
})();
