(function () {
    angular.module('main').controller('ExPasSpkCtl', ['$scope', 'cvt', 'Data',
    function ($scope, cvt) {

            var maxVrange = 10;
            var maxVoffset = 5;


            $scope.speaker = cvt.pas.spk;

            var flim = {
                "high": 3000,
                "low": 500
            };

            $scope.$on('cvtUpdated', function () {

                $scope.speaker = cvt.pas.spk;



            });

            $scope.connectFilterSpeaker = function () {
                $scope.speaker.connected = !$scope.speaker.connected;
                cvt.pas.spk.connectToFilter($scope.speaker.connected);

            };

            /** Set the speaker position and update the CVT. */
            $scope.setPos = function () {
                $scope.speaker.pos = !$scope.speaker.pos;
                cvt.pas.spk.updateCtl($scope.speaker);
            };


            $scope.updateSpkV = function () {

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

            $scope.updateSpkF = function () {

                $scope.speaker.f0 = $scope.speaker.f0 > flim.high ? flim.high : $scope.speaker.f0;
                $scope.speaker.f0 = $scope.speaker.f0 < flim.low ? flim.low : $scope.speaker.f0;

                cvt.pas.spk.updateCtl($scope.speaker);
            };

            $scope.updateCycle = function () {
                cvt.pas.spk.updateCycle($scope.speaker.auto,
                    $scope.speaker.period, $scope.speaker.length);
            };

            $scope.updateAuto = function () {
                $scope.speaker.auto = !$scope.speaker.auto;
                $scope.updateCycle();
            };
    }
  ]);
})();