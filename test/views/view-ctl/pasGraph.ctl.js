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

		$scope.data = [ 
			{ values : [], key : 'Cell 1 Q'},
			{ values : [], key : 'Cell 2 Q'},
			{ values : [], key : 'Cell 3 Q'},
			{ values : [], key : 'Cell 4 Q'},
			{ values : [], key : 'Cell 5 Q'},
		];

		$scope.run = true;


		$scope.$on('dataAvailable', function() {
			for (var i = 0; i < 5; i++) {
				$scope.data[i].values = Data.pas.cell[i].Q;
			}
			
			//$scope.$apply();
			});

	}]);
})();
