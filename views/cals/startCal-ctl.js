(function() {
	angular.module('main').controller('startCal', ['$scope', '$http', 'net', 'cvt', 
	function($scope, $http, net, cvt) {

		$scope.cal = cvt.ozone;

		/* This is the primary function of this controller.  When the button is hit,
		 * flip the switch on the calibration button so that it indicates the user can 
		 * Start a cal or that a cal is currently running.  We will also send the current cal
		 * state for storage in the cvt AND send the request to the server.
		 */
		// TODO: Test this on the server side.
		$scope.startCalibration = function() {
			$scope.cal = !$scope.cal;
			var calState = $scope.cal ? 1 : 0;
			cvt.ozone = $scope.cal;
			$http.get(net.address() + 'General/ozone?start=' + calState.toString());
		};
	}]);

})();
