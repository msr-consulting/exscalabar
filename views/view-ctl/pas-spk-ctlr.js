(function() {
  angular.module('main').controller('pasSpk', ['$scope', 'cvt', 'Data',
    function($scope, cvt, Data) {

      var maxVrange = 10;
      var maxVoffset = 5;

      $scope.speaker = cvt.pas.spk;

      var flim = {
        "high": 3000,
        "low": 500
      };

      $scope.cycle = {
        "period": cvt.pas.spk.period,
        "length": cvt.pas.spk.length,
        "auto": cvt.pas.spk.auto
      };
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
        cvt.pas.spk.updateCtl($scope.speaker);
      };

      $scope.updateSpkF = function() {
        if ($scope.speaker.f0 > flim.high) {
          $scope.speaker.f0 = flim.high;
        } else {
          if ($scope.speaker.f0 < flim.low) {
            $scope.speaker.f0 = flim.low;
          }
        }
        cvt.pas.spk.updateCtl($scope.speaker);
      };

      $scope.updateCycle = function() {
        cvt.pas.updateSpkCycle($scope.cycle.auto,
          $scope.cycle.period, $scope.cycle.length);
      };

      $scope.updateAuto = function() {
        $scope.cycle.auto = !$scope.cycle.auto;
        $scope.updateCycle();
      };
    }
  ]);
})();
