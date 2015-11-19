/** This is the controller which is used to handle the PAS graph on the main page.
 *  The graph uses a right click menu to change the data stream which is being plotted.
 * 
 */

(function() {
	angular.module('main').controller('Ctlr', ['$scope', 'Data', 
	function($scope, Data) {
		
		// Index the plot to visualize
		var index = 0;
		var labels = ['Q','IA','f0', 'abs'];
		
		$scope.menuOptions =	[['Q', function(){
									index = 0;
									$scope.options.chart.yAxis.axisLabel = labels[index];
									}],
								['IA', function(){	
									index = 1;
									$scope.options.chart.yAxis.axisLabel = labels[index];
												}],
								['f0', function(){	
									index = 2;
									$scope.options.chart.yAxis.axisLabel = labels[index];
												}
								],
								['abs', function(){	index = 3;
													$scope.options.chart.yAxis.axisLabel = labels[index];
												}
								]];

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
				
				transitionDuration : 0,
				yAxis : {
					showMaxMin: false,
					axisLabel: labels[index],
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
				enable: false,
				text: labels[index] + ' vs Time'
			}
		};

		$scope.data = [ 
			{ values : [], key : 'Cell 1 '},
			{ values : [], key : 'Cell 2 '},
			{ values : [], key : 'Cell 3 '},
			{ values : [], key : 'Cell 4 '},
			{ values : [], key : 'Cell 5 '},
		];
	
		$scope.run = true;

		$scope.$on('dataAvailable', function() {
			for (var i = 0; i < 5; i++) {
				$scope.data[i].values = Data.pas.cell[i][labels[index]];
			}
		
		});

	}]);
})();
