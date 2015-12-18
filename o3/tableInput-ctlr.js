(function() {
	angular.module('main')
	.controller('InputTable', ['$scope', 'tableService', 'SaveData',
	function($scope, tableService, SaveData) {

		$scope.data = [];

		/* Handle the broadcast from the buildCal-service */
		$scope.$on('handleBroadcast', function() {

			// The ID from the cal table
			var tID = tableService.getTab();
			// Value of the
			var val = "";

			/* The following switch statement defines the default values */
			switch (tID) {
			case "O3-Valve":
			case"O2-Valve":
			case"O3-Generator":
			case "Filter":
				val = 'FALSE';
				break;
			case "Wait":
			case "Speaker":
				val = "20";
				break;

			case "QO2":
				val = "100";
				break;
			default:
			}

			// Push the data into an array
			$scope.data.push({
				"id" : tID,
				"val" :val
			});
			SaveData.setData($scope.data);
		});

	}]);
})();
