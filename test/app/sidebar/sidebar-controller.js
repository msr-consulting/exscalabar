(function() {
	angular.module('main').controller('sidebarCtrl', function($scope, $http) {

		$scope.save = true;
		$scope.filter = true;

		$scope.saveData = function(val) {

			if ($scope.save) {
				$scope.save = false;
			} else {
				$scope.save = true;
			}

			//$http.get('http://192.168.24.75:8001/Save?save='+val.toString());
			alert("The button has been set to " + $scope.save.toString());
		};

		$scope.setFilter = function(val) {
			alert("The button has been set to " + val.toString());

		};

	});
})();
