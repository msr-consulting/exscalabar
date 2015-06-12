/* This service maintains a current value table of control values so that all are properly 
 * controls will be properly populated.
 */

(function() {
	angular.module('main')
	.factory('cvt', function() {
		
		var cvt = {};
		
		var _speaker = {"vrange": 5,
						"voffset": 0,
						"f0": 1350,
						"df": 100,
						"pos": true};
						
		cvt.getPasSpkCtl = function(){return _speaker;};
		cvt.setPasSpkCtl = function(spk){
			_speaker = spk;
			};
		
		return cvt;

	});
	})();