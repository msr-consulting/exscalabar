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
			
			$scope.dataf0 = [ Data.pas.cell[0].f0, Data.pas.cell[1].f0, Data.pas.cell[2].f0, Data.pas.cell[3].f0, Data.pas.cell[4].f0 ];
			$scope.dataIA = [ Data.pas.cell[0].IA, Data.pas.cell[1].IA, Data.pas.cell[2].IA, Data.pas.cell[3].IA, Data.pas.cell[4].IA ];
			$scope.datap = [ Data.pas.cell[0].p, Data.pas.cell[1].p, Data.pas.cell[2].p, Data.pas.cell[3].p, Data.pas.cell[4].p ];
			$scope.dataQ = [ Data.pas.cell[0].Q, Data.pas.cell[1].Q, Data.pas.cell[2].Q, Data.pas.cell[3].Q, Data.pas.cell[4].Q ];
			$scope.dataabs = [ Data.pas.cell[0].abs, Data.pas.cell[1].abs, Data.pas.cell[2].abs, Data.pas.cell[3].abs, Data.pas.cell[4].abs ];

		});

		/* Use functions and the ng-change or ng-click directive to handle DOM events rather than
		 * $watch to prevent updates at init that could hose things up */

		$scope.setPos = function() {

			$scope.speaker.pos = !$scope.speaker.pos;
			var val = $scope.speaker.pos ? 1 : 0;
			cvt.setPasSpkCtl($scope.speaker);
			$http.get('http://' + net.address() + '/xService/PAS_CMD/SpkSw?SpkSw=' + val);
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
			$http.get('http://' + net.address() + '/xService/PAS_CMD/UpdateSpkVparams?Vrange=' + $scope.speaker.vrange + '&Voffset=' + $scope.speaker.voffset);
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
			$http.get('http://' + net.address() + '/xService/PAS_CMD/Spk?df=' + $scope.speaker.df + '&f0=' + $scope.speaker.fc);
		};

		$scope.updateCycle = function() {
			var val = $scope.cycle.auto ? 1 : 0;
			$http.get('http://' + net.address() + '/xService/PAS_CMD/UpdateSpkCycle?Length=' + $scope.cycle.length + '&Period=' + $scope.cycle.period + '&Cycle=' + val);
		};

		$scope.updateAuto = function() {
			$scope.cycle.auto = !$scope.cycle.auto;
			$scope.updateCycle();
		};

	}]);
})();
