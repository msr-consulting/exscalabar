function buildPlotController(controllerName, fieldName, ylabel) {
	angular.module('main')
	.controller(controllerName, ['$scope', 'Data', function($scope, Data) {

	$scope.options = {
		chart : {
			type : 'lineChart',
			height : 180,
			margin : {
				top : 20,
				right : 20,
				bottom : 40,
				left : 75
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
				showMaxMin: false,
				axisLabel: ylabel,
				tickFormat : function(d) {
					return d3.format('.02f')(d);
				}
			},
			xAxis : {
				axisLabel: 'Time',
				tickFormat : function(d) {
					return d3.time.format('%X')(new Date(d));
				}
			}
		},
		title: {
			enable: true,
			text: fieldName + ' vs Time'
		},
	};

	$scope.data = [ 
		{ values : [], key : 'Cell 1 ' + fieldName},
		{ values : [], key : 'Cell 2 ' + fieldName},
		{ values : [], key : 'Cell 3 ' + fieldName},
		{ values : [], key : 'Cell 4 ' + fieldName},
		{ values : [], key : 'Cell 5 ' + fieldName},
	];

	$scope.run = true;

	$scope.$on('dataAvailable', function() {
		for (var i = 0; i < 5; i++) {
			$scope.data[i].values = Data.pas.cell[i][fieldName];
		}
		//$scope.$apply();
		});

	}]);
}

(function() {
	buildPlotController('plotPASQ', 'Q', 'Q');
	buildPlotController('plotPASf0', 'f0', 'f0 (Hz)');
	buildPlotController('plotPASIA', 'IA', 'IA (???)');
	buildPlotController('plotPASp', 'p', 'p (???)');
	buildPlotController('plotPASabs', 'abs', 'abs (???)');
})();
