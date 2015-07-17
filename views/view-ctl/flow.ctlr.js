(function() {
	angular.module('main').controller("flowCtlr", ['$scope',
	function($scope) {

		function flowDevice(id, t, isCtl){
			this.ID = id;
			this.type = t;
			this.isController = isCtl;
		}
		
		$scope.Devices = [new flowDevice("test1", "mflow", false), 
							new flowDevice("test2", "mflow", false), 
							new flowDevice("test3", "mflow", false)
						 ];
	}]);
})();
