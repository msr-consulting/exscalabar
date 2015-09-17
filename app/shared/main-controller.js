/** This is the main controller that is sucked into the entire program (this is placed
 * 	in the body tag).  The main thing that it will do is call the data service at regular
 * 	intervals which will broadcast the data when called.
 */

(function() {
	angular.module('main').controller('MainCtlr', ['Data', '$scope', '$interval', 'cvt',
	function(Data, $scope, $interval, cvt) {

		/* Call the data service at regular intervals; this will force a regular update of the
		 * data object.
		 */
		$interval(function() {
			Data.getData();
			cvt.checkCvt();
			//deviceCfg.checkCfg();
		}, 1000);

	}]);
})();

/*(function() {
	angular.module('main').directive('chart', function() {
		return {
			restrict : 'E',
			link : function(scope, elem, attrs) {

				var chart = null,
				    opts = {
					xaxis : {
						mode : "time"
					}
				};

				scope.$watch(attrs.ngModel, function(v) {
					if (!chart) {
						chart = $.plot(elem, v, opts);
						elem.show();
					} else {
						chart.setData(v);
						chart.setupGrid();
						chart.draw();
					}
				});
			}
		};
	});
})();*/
