(function() {
  angular.module('main').controller('pas', ['$scope', 'net', '$http', 'cvt', 'Data', '$log',
    function($scope, net, $http, cvt, Data, $log) {

      $scope.data = Data.pas;



      /** Data that will be used for plotting. */
      $scope.testData = [{
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
            right: 40,
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
              return d3.format('0.03f')(d);
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

        $scope.dataf0 = [Data.pas.cell[0].f0, Data.pas.cell[1].f0, Data.pas.cell[2].f0, Data.pas.cell[3].f0, Data.pas.cell[4].f0];
        $scope.dataIA = [Data.pas.cell[0].IA, Data.pas.cell[1].IA, Data.pas.cell[2].IA, Data.pas.cell[3].IA, Data.pas.cell[4].IA];
        $scope.datap = [Data.pas.cell[0].p, Data.pas.cell[1].p, Data.pas.cell[2].p, Data.pas.cell[3].p, Data.pas.cell[4].p];
        $scope.dataQ = [Data.pas.cell[0].Q, Data.pas.cell[1].Q, Data.pas.cell[2].Q, Data.pas.cell[3].Q, Data.pas.cell[4].Q];
        $scope.dataabs = [Data.pas.cell[0].abs, Data.pas.cell[1].abs, Data.pas.cell[2].abs, Data.pas.cell[3].abs, Data.pas.cell[4].abs];

        for (i = 0; i < 5; i++) {
          $scope.testData[i].values = $scope.data.cell[i].IA;

        }
      });




    }
  ]);
})();
