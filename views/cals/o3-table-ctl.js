/** This controller is placed on the O3 cal page and defines what will happen
 * 	when a user double clicks on a table element.
 *
 * 	When the element containing this controller is first displayed, the values
 * 	in the attribute table_vals will be used to populate the canned table for
 * 	sequence building using the ng-repeat directive.
 *
 * 	When the user double clicks on a row, the controller will call the tableService
 * 	setTab method.  This in turn updates the attributes of that service with the ID
 * 	of the row that was clicked.  That ID is then broadcast and picked up by the
 * 	tableInput-ctlr which populates the table for the sequence with a default value
 * 	for the selected element.
 */

(function() {
	angular.module('main')
	.controller('O3Table', ['$scope', 'tableService', function($scope, tableService) {

		/* Contains the entries that will go into the canned table. */
		$scope.table_vals = [ {
			"id": "Wait",
			"step" : "Wait",
			"descr" : "Set a wait time in the ozone cal in seconds"
		},
		{
			"id": "Filter",
			"step" : "Filter",
			"descr" : "Boolean that sets the filter state."
		},
		{
			"id": "Speaker",
			"step" : "Speaker",
			"descr" : "Boolean that sets the speaker state."
		},
		{
			"id": "O2 Valve",
			"step" : "O2 Valve",
			"descr" : "Boolean that sets the O2 valve position."
		},
		{
			"id": "O3 Valve",
			"step" : "O3 Valve",
			"descr" : "Boolean that sets the O3 valve state."
		},
		{
			"id": "O3 Generator",
			"step" : "O3 Generator",
			"descr" : "Boolean that sets the O3 generator state."
		},
		{
			"id": "QO2",
			"step" : "O2 Flow Rate",
			"descr" : "Numeric to set the oxygen flow rate"
		}];

		/* Handle row double clicks */
		$scope.clickRow = function(row){

			/* tableService will broadcast the the listeners the current ID */
			tableService.setTab(row.id.toString());

		};
	}]);
})();
