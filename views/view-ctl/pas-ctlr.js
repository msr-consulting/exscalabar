(function() {
  angular.module('main').controller('pas', ['$scope', 'net', '$http', 'cvt', 'Data', '$log',
    function($scope, net, $http, cvt, Data, $log) {

      $scope.data = Data.pas;

      var selPlot = 0;

      $scope.menuOptions = [
        ['IA', function($itemScope) {
          selPlot = 0;
          $scope.options.chart.yAxis.axisLabel = 'IA';
        }],
        ['f0', function($itemScope) {
          selPlot = 1;
          $scope.options.chart.yAxis.axisLabel = 'f0 (Hz)';
        }],
        ['Q', function($itemScope) {
          selPlot = 2;
          $scope.options.chart.yAxis.axisLabel = 'Q';
        }],
        ['p', function($itemScope) {
          selPlot = 3;
          $scope.options.chart.yAxis.axisLabel = 'p';
        }],
        ['abs', function($itemScope) {
          selPlot = 4;
          $scope.options.chart.yAxis.axisLabel = 'Absorption (Mm-1)';
        }]
      ];



      /** Data that will be used for plotting. */
      $scope.plotData = [{
        values: [],
        key: 'Cell 1'
      }, {
        values: [],
        key: 'Cell 2'
      }, {
        values: [],
        key: 'Cell 3'
      }, {
        values: [],
        key: 'Cell 4'
      }, {
        values: [],
        key: 'Cell 5'
      }];

      /** Options used for plotting. */
      $scope.options = {
        chart: {
          type: 'lineChart',
          height: 300,
          margin: {
            top: 20,
            right: 10,
            bottom: 60,
            left: 75
          },
          x: function(d) {
            return d.x;
          },
          y: function(d) {
            return d.y;
          },
          useInteractiveGuideline: true,
          yAxis: {
            tickFormat: function(d) {
              return d3.format('0.01f')(d);
            },
            axisLabel: 'Testing'
          },
          xAxis: {
            tickFormat: function(d) {
              return d3.time.format('%X')(new Date(d));
            },
            rotateLabels: -45
          },
          transitionDuration: 500,
          showXAxis: true,
          showYAxis: true
        }
      };

      // Listen for data
      $scope.$on('dataAvailable', function() {



        $scope.data = Data.pas;

        for (i = 0; i < 5; i++) {
          switch (selPlot) {
            case 0:
              $scope.plotData[i].values = $scope.data.cell[i].IA;
              break;
            case 1:
              $scope.plotData[i].values = $scope.data.cell[i].f0;
              break;
            case 2:
              $scope.plotData[i].values = $scope.data.cell[i].Q;
              break;
            case 3:
              $scope.plotData[i].values = $scope.data.cell[i].p;
              break;
            case 4:
              $scope.plotData[i].values = $scope.data.cell[i].abs;
              break;
          }


        }
      });




    }
  ]);
})();
