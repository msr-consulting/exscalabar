(function() {
  angular.module('main').controller('crd', ['$scope', 'cvt', 'Data',
    function($scope, cvt, Data) {

      // Lasers have three inputs
      var laserInput = function(_rate, _DC, _k, enabled, ID) {
        this.rate = _rate;
        this.DC = _DC;
        this.k = _k;
        this.en = enabled;
        this.id = ID;
      };

      $scope.setRate = function(i, f){
        cvt.crd.setLaserRate(i, f);

      };
      
      /* Variable for laser control binding; first element is related to blue,
       * second to red.
       */
      $scope.laser_ctl = [
        new laserInput(cvt.crd.fblue, cvt.crd.dcblue, cvt.crd.kblue, cvt.crd.eblue, "Blue Laser"),
        new laserInput(cvt.crd.fred, cvt.crd.dcred, cvt.crd.kred, cvt.crd.ered, "Red Laser")
      ];

      $scope.pmt = cvt.crd.kpmt;

      $scope.data = Data.crd;

      // TODO: Implement enabled functionality
      $scope.setEnable = function(index) {

        $scope.laser_ctl[index].en = !$scope.laser_ctl[index].en;
        var enabled = $scope.laser_ctl[index].en;
        switch (index) {
          case 0:
            cvt.crd.eblue = enabled;
            break;
          case 1:
            cvt.crd.ered = enabled;
            break;
          default:

        }

      };

      $scope.tauData = [{
        values: [],
        key: '&tau;'
      }, {
        values: [],
        key: '&tau<sub>0</sub>'
      }, {
          values: [],
        key: '&tau<sub>0</sub>'
      }, {
        values: [],
        key: '&sigma;<sub>&tau;</sub>'
      }];

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

      $scope.$on('dataAvailable', function() {

        $scope.data = Data.crd;

        $scope.tauData[0].values = $scope.data.cell[0].max;
        $scope.tauData[1].values = $scope.data.cell[0].tau0;
        $scope.tauData[2].values = $scope.data.cell[0].stdvTau;


      });




    }
  ]);
})();
