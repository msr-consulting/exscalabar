/* This service maintains a current value table of control values so that all are properly
 * controls will be properly populated.
 */

(function() {
	angular.module('main').factory('cvt', ['$http', 'net',
	function($http, net) {

		// TODO: Add broadcast to let everyone know when the cvt has been updated by the server.
		var cvt = {
			"save" : true,
			"ozone" : false,
			"filter_pos": true,
			"fctl" : []
		};

		/* All controls that must be updated for the PAS
		 * operation.
		 */
		var pas = {
			"spk" : {
				"vrange" : 5,
				"voffset" : 0,
				"f0" : 1350,
				"df" : 100,
				"pos" : true,
				"auto" : false,
				"period" : 360,
				"length" : 30
			},
			"las" : {
				"f" : [],
				"mod" : [],
				"vrange" : [],
				"voffset" : []
			}
		};

		cvt.crd = {
			"fred" : 1000,
			"dcred" : 50,
			"fblue" : 2000,
			"dcblue" : 50,
			"kred" : 1,
			"kblue" : 1,
			"kpmt" : [0,0,0,0,0],
			"eblue" : true,
			"ered" : true
		};

		cvt.filter_cycle = {
      "period" : 360,
      "length" : 20,
      "auto" : false
		};


		cvt.getPasSpkCtl = function() {
			return pas.spk;
		};
		cvt.setPasSpkCtl = function(spk) {
			pas.spk = spk;
		};

		/* TODO: Implement server side CVT communication. */
		/* Check the CVT on the server to make sure nothing has changed.  We will have multiple objects
		 * to check and will broadcast based on who has changed.
		 */
		cvt.checkCvt = function() {
			promise = $http.get(net.address() + 'General/cvt').success(function(data, status, headers, config) {

			});
		};

		return cvt;

	}]);
})();
