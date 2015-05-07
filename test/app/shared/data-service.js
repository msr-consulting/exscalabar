(function() {
	angular.module('main')
	.factory('Data', ['$rootScope', '$http',function($rootScope, $http) {

		var pasObject = {
			"f0": [],
			"IA": [],
			"Q":  [],
			"p": [],
			"abs":[]
		};
		var crdObject = {
			"tau":[],
			"tau0": [],
			"taucorr": [],
			"tau0corr": [],
			"ext": [],
			"extcorr": [],
			"stdvTau":[],
			"etau": [],
			"max":[]
		};
		
		var pasWFDataObj = {
			"micf": [],
			"mict": [],
			"pd": []
		};
		
		var dataService = {
			"time": null,
			"pas": [],
			"crd": [],
			"rd": [],
			"pasWFData": []
		};
		
		$http.get('http://192.168.24.73:8001/xService/General/Data')
		.success(function(data, status, headers, config) {
			
			$rootScope.broadcast('dataAvailable');
			
		});
	}]);

})();
