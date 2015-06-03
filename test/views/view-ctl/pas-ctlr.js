(function() {
	angular.module('main')
	.controller('pas', ['$scope', 'net', '$http','cvt', function($scope, net, $http, cvt) {
		$scope.speaker = cvt.getPasSpkCtl();
							
							
		$scope.cycle = {"period": 360,
						"length": 20,
						"auto": false};
						
		/* Use functions and the ng-change or ng-click directive to handle DOM events rather than 
		 * $watch to prevent updates at init that could hose things up */
		$scope.setPos =  function(){
			$scope.speaker.pos = !$scope.speaker.pos;
			var val = $scope.speaker.pos ? 1: 0;
			$http.get('http://' + net.address() + '/xService/PAS_CMD/SpkSw?SpkSw='+ val);
			cvt.setPasSpkCtl($scope.speaker);
		};
		
		$scope.updateSpkV = function(){
			$http.get('http://' + net.address() + '/xService/PAS_CMD/UpdateSpkVparams?Vrange=' + $scope.speaker.vrange +'&Voffset=' + $scope.speaker.voffset);
			cvt.setPasSpkCtl($scope.speaker);
		};
		
		
		$scope.updateSpkF = function(){
			$http.get('http://' + net.address() + '/xService/PAS_CMD/Spk?df=' + $scope.speaker.df +'&f0=' + $scope.speaker.fc);
			cvt.setPasSpkCtl($scope.speaker);
		};
		
		$scope.updateCycle = function(){
			var val = $scope.cycle.auto ? 1: 0;
			$http.get('http://' + net.address() + '/xService/PAS_CMD/UpdateSpkCycle?Length=' + $scope.cycle.length +'&Period=' + $scope.cycle.period + '&Cycle=' + val);
		};
		
		$scope.updateAuto = function(){
			$scope.cycle.auto = !$scope.cycle.auto;
			$scope.updateCycle();
		};
		
	}]);
})();
