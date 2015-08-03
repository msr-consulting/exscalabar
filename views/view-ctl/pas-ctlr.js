(function() {
  angular.module('main').controller('pas', ['$scope', 'net', '$http', 'cvt', 'Data', '$log',
    function($scope, net, $http, cvt, Data, $log) {

      $scope.speaker = cvt.pas.spk;

      $scope.cycle = {
        "period": 360,
        "length": 20,
        "auto": false
      };

      var maxVrange = 10;
      var maxVoffset = 5;

      var flim = {
        "high": 3000,
        "low": 500
      };
      $scope.data = Data.pas;

      /** PAS Laser settings object.  The settings are
       * * Vrange = voltage range in volts of laser modulation
       * * Voffset = voltage offset in volts for laser modulation.
       * * f0 = modulation frequency in Hz
       * * modulation = boolean representing sine (false) or square (true)
       */
      function lasSet(vr, vo, f0, mod, en) {
        this.Vrange = vr;
        this.Voffset = vo;
        this.f0 = f0;
        this.modulation = mod;
        this.lasEn = false;
      }

      $scope.lasCtl = [];

      /** NOTE: This loop initializes the laser controls based on what is
       * in the CVT.  If the initial speaker setting is TRUE, then
       * the value of f0 will be overrun IMMEDIATELY.
       */
      for (i = 0; i < cvt.pas.las.vr.length; i++) {

        $scope.lasCtl.push(new lasSet(cvt.pas.las.vr[i],
          cvt.pas.las.voffset[i],
          cvt.pas.las.f0[i],
          cvt.pas.las.modulation[i],
          cvt.pas.las.enable[i]));

      }

      $scope.updateMod = function(i) {
        $scope.lasCtl[i].modulation = !$scope.lasCtl[i].modulation;
      };

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
        if ($scope.data.drive) {
          for (i = 0; i < $scope.data.cell.length; i++) {
            $scope.lasCtl[i].f0 = $scope.data.cell[i].f0[0].y;
          }
        }
      });

      /** Set the speaker position and update the CVT. */
      $scope.setPos = function() {
        $scope.speaker.pos = !$scope.speaker.pos;
        cvt.setPasSpkCtl($scope.speaker);
      };


      $scope.updateSpkV = function() {

        /* Allow the user to enter data that is outside of the determined range but
         * correct it if it goes beyond the limits above.
         */

        if ($scope.speaker.vrange > maxVrange) {
          $scope.speaker.vrange = maxVrange;
        } else {
          if ($scope.speaker.vrange < 0) {
            $scope.speaker.vrange = 0;
          }
        }

        if ($scope.speaker.voffset > maxVoffset) {
          $scope.speaker.voffset = maxVoffset;
        } else {
          if ($scope.speaker.voffset < 0) {
            $scope.speaker.voffset = 0;
          }
        }

        cvt.setPasSpkCtl($scope.speaker);

      };

      //TODO: Get rid of $http requests here!!!

      $scope.updateSpkF = function() {
        if ($scope.speaker.f0 > flim.high) {
          $scope.speaker.f0 = flim.high;
        } else {
          if ($scope.speaker.f0 < flim.low) {
            $scope.speaker.f0 = flim.low;
          }
        }
        cvt.setPasSpkCtl($scope.speaker);
        $http.get(net.address() + 'PAS_CMD/Spk?df=' + $scope.speaker.df + '&f0=' + $scope.speaker.fc);
      };

      $scope.updateCycle = function() {
        var val = $scope.cycle.auto ? 1 : 0;
        $http.get(net.address() + 'PAS_CMD/UpdateSpkCycle?Length=' + $scope.cycle.length + '&Period=' + $scope.cycle.period + '&Cycle=' + val);
      };

      $scope.updateAuto = function() {
        $scope.cycle.auto = !$scope.cycle.auto;
        $scope.updateCycle();
      };

      $scope.updateVr = function() {
        var x = [];
        for (i = 0; i < $scope.lasCtl.length; i++) {
          x.push($scope.lasCtl[i].Vrange);
        }
        cvt.pas.las.setVr(x);
      };
      $scope.updateVo = function() {
        var x = [];
        for (i = 0; i < $scope.lasCtl.length; i++) {
          x.push($scope.lasCtl[i].Voffset);
        }
        cvt.pas.las.setVo(x);
      };

      $scope.updatef0 = function() {
        var x = [];
        for (i = 0; i < $scope.lasCtl.length; i++) {
          x.push($scope.lasCtl[i].f0);
        }
        cvt.pas.las.setf0(x);
      };
    }
  ]);
})();
