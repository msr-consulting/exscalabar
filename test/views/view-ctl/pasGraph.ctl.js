(function() {
	angular.module('main')
	.controller('pPlot', ['$scope', 'Data', function($scope, Data) {

		$scope.options = {
			chart : {
				type : 'lineChart',
				height : 180,
				margin : {
					top : 10,
					right : 10,
					bottom : 20,
					left : 10
				},
				x : function(d) {
					return d.x;
				},
				y : function(d) {
					return d.y;
				},
				useInteractiveGuideline : true,
				transitionDuration : 500,
				yAxis : {
					tickFormat : function(d) {
						return d3.format('.01f')(d);
					}
				},
				xAxis : {
					tickFormat : function(d) {
						return d3.time.format('%X')(new Date(d));
					}
				}
			}
		};

		$scope.data = [{
			values : [],
			key : 'Cell 1 IA'
		}];

		$scope.run = true;

		//var x = 0;
		$scope.$on('dataAvailable', function() {
			$scope.data[0].values = {x: Data.time, y: Data.pas.cell[0].Q};
			//$scope.$apply();
			});

	}]);
})();
