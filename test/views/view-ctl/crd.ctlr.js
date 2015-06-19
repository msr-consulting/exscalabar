(function() {
	angular.module('main').controller('crd', ['$scope', 'net', '$http', 'cvt', 'Data',
	function($scope, net, $http, cvt, Data) {

		// Lasers have three inputs
		var laserInput = function(_rate, _DC, _k) {
			this.rate = _rate;
			this.DC = _DC;
			this.k = _k;
		};
		$scope.blue = new laserInput(cvt.crd.fblue, cvt.crd.dcblue, cvt.crd.kblue);
		$scope.red = new laserInput(cvt.crd.fred, cvt.crd.dcred, cvt.crd.kred);
		$scope.pmt = cvt.crd.kpmt;
		$scope.benabled = cvt.crd.eblue;
		$scope.renabled = cvt.crd.ered;

		$scope.setbEnable = function() {
			$scope.benabled = !$scope.benabled;
			cvt.crd.eblue = $scope.benabled;
			//$http.get(net.address() + 'PAS_CMD/SpkSw?SpkSw=' + val);
		};

		$scope.setrEnable = function() {
			$scope.renabled = !$scope.renabled;
			cvt.crd.ered = $scope.renabled;
			//$http.get(net.address() + 'PAS_CMD/SpkSw?SpkSw=' + val);

		};
	}]);
})();
