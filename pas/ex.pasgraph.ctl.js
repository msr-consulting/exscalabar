function buildPlotController(controllerName, fieldName, ylabel) {
	angular.module('main')
	.controller(controllerName, ['$scope', 'Data', function($scope, Data) {
		
		/* This will serve as teh context menu for the plots so that we can switch
		 * plots.  The index will serve to tell what plot we want.
		 */
		var index = 0;
		$scope.menuOptions =[['Q', function($itemScope){index = 0;}],
		['IA', function(){index = 1;}],
		['f0', function(){index = 2;}],
		['abs', function(){index = 3;}]];

	/* Removed axis title as it is redundant... */
	$("#chartContainer" + fieldName).CanvasJSChart({ //Pass chart options
		//title : {text: fieldName + " vs Time"},
		axisX: {title: "Time", valueFormatString: "HH:mm:ss"},
		axisY: {title: ylabel},
		legend: {
			verticalAlign: "top",
			cursor: "pointer",
            itemclick: function (e) {
                if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                    e.dataSeries.visible = false;
                } else {
                    e.dataSeries.visible = true;
                }
 
                e.chart.render();
            }
        },
		data: [
			{
				showInLegend: true,
				name: "Cell 0",
				type: "line",
				xValueType: "dateTime",
				dataPoints: [ ]
			},
			{
				showInLegend: true,
				name: "Cell 1",
				type: "line",
				xValueType: "dateTime",
				dataPoints: [ ]
			},
			{
				showInLegend: true,
				name: "Cell 2",
				type: "line",
				xValueType: "dateTime",
				dataPoints: [ ]
			},
			{
				showInLegend: true,
				name: "Cell 3",
				type: "line",
				xValueType: "dateTime",
				dataPoints: [ ]
			},
			{
				showInLegend: true,
				name: "Cell 4",
				type: "line",
				xValueType: "dateTime",
				dataPoints: [ ]
			},

	]});
           	// { x: 1435336292000, y :71},
            	// { x: 1435336293000, y : 55 },
           		// { x: 1435336294000, y:  50 },
            	// { x: 1435336300000, y : 65 },
            	// { x: 1435336303000, y : 95 },
             	// { x: 1435336304000, y : 68 },
            	// { x: 1435336308000, y : 28 },


	
	$scope.chart = $("#chartContainer" + fieldName).CanvasJSChart();
	
	$scope.chart.render();
	
	$scope.$on('dataAvailable', function() {
		for (var i = 0; i < 5; i++) {
			$scope.chart.options.data[i].dataPoints = Data.pas.cell[i][fieldName];
			$scope.chart.render();
		}
		
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
