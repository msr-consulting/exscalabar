(function() {
	angular.module('main').controller('crd', ['$scope', 'net', '$http', 'cvt', 'Data',
	function($scope, net, $http, cvt, Data) {

		// Lasers have three inputs
		var laserInput = function(_rate, _DC, _k, enabled, ID) {
			this.rate = _rate;
			this.DC = _DC;
			this.k = _k;
			this.en = enabled
			this.id = ID;
		};
		/* Variable for laser control binding; first element is related to blue,
		 * second to red.
		 */
		$scope.laser_ctl = [
			new laserInput(cvt.crd.fblue, cvt.crd.dcblue, cvt.crd.kblue, cvt.crd.eblue, "Blue Laser"),
			new laserInput(cvt.crd.fred, cvt.crd.dcred, cvt.crd.kred, cvt.crd.ered, "Red Laser")];

		$scope.pmt = cvt.crd.kpmt;

		// TODO: Implement enabled functionality
		$scope.setbEnable = function() {
			$scope.benabled = !$scope.benabled;
			cvt.crd.eblue = $scope.benabled;
			//$http.get(net.address() + 'PAS_CMD/SpkSw?SpkSw=' + val);
		};

		// TODO: Implement enabled functionality
		$scope.setrEnable = function() {
			$scope.renabled = !$scope.renabled;
			cvt.crd.ered = $scope.renabled;
			//$http.get(net.address() + 'PAS_CMD/SpkSw?SpkSw=' + val);

		};
	}]);
})();
