(function() {
	angular.module('main')
	.controller('Sidebar', ['$scope','$http', 'Data', 'net','cvt', function($scope, $http, Data, net, cvt) {

		$scope.save = 1;
		$scope.filter = Data.filter.state;
		$scope.time = "Not connected";
		$scope.connected = false;
		$scope.o3On = false;
		$scope.cabin = false;
		$scope.pumpBlocked = false;
		$scope.impBlocked = false;
		$scope.interlock = false;


		// Initially time is not available
		$scope.time = "Not Connected";

		$scope.connected= false;


		$scope.$on('dataAvailable', function(){

			$scope.filter = Data.filter.state;
			$scope.cabin = Data.Cabin;

			/* TODO: Have an issue with saving data - doesn't appear to be returning properly.
			 * The save variable should be in the CVT rather than in the data object.
			 *
			 */
			//$scope.save = Data.save;
			$scope.connected = true;
		});
        
        $scope.$on('cvtUpdated', function(){
            //$scope.filter = cvt.filter_pos;
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

			$scope.filter = !$scope.filter;
			var x = $scope.filter?1:0;
			$http.get(net.address() + 'General/UpdateFilter?State='+x);

		};

		/** Flip the switch cabin switch.
		  */
		$scope.setCabin = function(){
			$scope.cabin = !$scope.cabin;
			var x = $scope.cabin?1:0;
			$http.get(net.address() + 'General/Cabin?Cabin='+x);
		};

		$scope.stop = function(){
			$http.get(net.address() + 'General/Stop');
		};

	}]);
})();
