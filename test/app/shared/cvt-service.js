/* This service maintains a current value table of control values so that all are properly
 * controls will be properly populated.
 */

(function() {
	angular.module('main').factory('cvt', function() {

		var cvt = {
			"save" : true
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
				"auto": false,
				"period": 360,
				"length":30
			},
			"las" : {
				"f" : [],
				"mod" : [],
				"vrange" : [],
				"voffset" : []
			}
		};

		var crd = {	
			"fred" : 1000,
			"fblue" : 2000,
			"pmt_gain" : []
		};

		var filter = {
			"pos" : true,
			"auto" : false,
			"period" : 360,
			"length" : 30
		};

		cvt.getPasSpkCtl = function() {
			return pas.spk;
		};
		cvt.setPasSpkCtl = function(spk) {
			pas.spk = spk;
		};

		return cvt;

	});
})();
