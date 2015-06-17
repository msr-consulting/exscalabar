(function() {
	angular.module('main').controller('pas', ['$scope', 'net', '$http', 'cvt', 'Data', '$log',
	function($scope, net, $http, cvt, Data, $log) {

		//var spk = cvt.getPasSpkCtl();

		$scope.speaker = cvt.getPasSpkCtl();
		/*{"vrange": spk.vrange,
		 "voffset": spk.voffset,
		 "f0":spk.f0,
		 "df": spk.df,
		 "pos": spk.pos};*/

		$scope.cycle = {
			"period" : 360,
			"length" : 20,
			"auto" : false
		};

		var maxVrange = 10;
		var maxVoffset = 5;
		//$scope.pasCell = Data.

		var flim = {
			"high" : 3000,
			"low" : 500
		};
		$scope.data = Data.pas;

		// Listen for data
		$scope.$on('dataAvailable', function() {

			$scope.data = Data.pas;

			//console.log($scope.data.cell[0].f0[0]);

		});

		/* Use functions and the ng-change or ng-click directive to handle DOM events rather than
		 * $watch to prevent updates at init that could hose things up */

		$scope.setPos = function() {

			$scope.speaker.pos = !$scope.speaker.pos;
			var val = $scope.speaker.pos ? 1 : 0;
			cvt.setPasSpkCtl($scope.speaker);
			$http.get(net.address() + 'PAS_CMD/SpkSw?SpkSw=' + val);
		};

		$scope.updateSpkV = function() {

			/* Allow the user to enter data that is outside of the determined range but
			 * correct it if it goes beyond the limits above.
			 */

			if ($scope.speaker.vrange > maxVrange) {
				$scope.speaker.vrange = maxVrange;
			} else {
				if ($scope.speaker.vrange < 0) {
					$scope.speaker.vrange = 0;
				}
			};

			if ($scope.speaker.voffset > maxVoffset) {
				$scope.speaker.voffset = maxVoffset;
			} else {
				if ($scope.speaker.voffset < 0) {
					$scope.speaker.voffset = 0;
				}
			};

			cvt.setPasSpkCtl($scope.speaker);
			$http.get(net.address() + 'PAS_CMD/UpdateSpkVparams?Vrange=' + $scope.speaker.vrange + '&Voffset=' + $scope.speaker.voffset);
		};

		$scope.updateSpkF = function() {
			if ($scope.speaker.f0 > flim.high) {
				$scope.speaker.f0 = flim.high;
			} else {
				if ($scope.speaker.f0 < flim.low) {
					$scope.speaker.f0 = flim.low;
				}
			};
			cvt.setPasSpkCtl($scope.speaker);
			$http.get(net.address() + 'PAS_CMD/Spk?df=' + $scope.speaker.df + '&f0=' + $scope.speaker.fc);
		};

		$scope.updateCycle = function() {
			var val = $scope.cycle.auto ? 1 : 0;
			$http.get(net.address() + 'PAS_CMD/UpdateSpkCycle?Length=' + $scope.cycle.length + '&Period=' + $scope.cycle.period + '&Cycle=' + val);
		};

		$scope.updateAuto = function() {
			$scope.cycle.auto = !$scope.cycle.auto;
			$scope.updateCycle();
		};

	}]);
})();
