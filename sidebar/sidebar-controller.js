(function () {
    angular.module('main')
        .controller('Sidebar', ['$scope', 'Data', 'cvt', function ($scope, Data, cvt) {

            $scope.save = 1;
            $scope.filter = cvt.filter.position;
            $scope.time = "Not connected";
            $scope.o3On = false;
            $scope.cabin = false;
            $scope.pumpBlocked = false;
            $scope.impBlocked = false;

            $scope.denuder_bypass = false;
            $scope.laserStatus = checkLaserStatus();


            // Initially time is not available
            $scope.time = "Not Connected";

            $scope.$on('cvtUpdated', function () {
                $scope.filter = cvt.filter.position;
                $scope.cabin = cvt.inlet;
                $scope.laserStatus = checkLaserStatus();
            });
            $scope.$on('dataAvailable', function () {
                $scope.laserStatus = checkLaserStatus();
            });


            $scope.saveData = function () {

                $scope.save = !$scope.save;
                cvt.setSaveData($scope.save);
            };

            $scope.setFilter = function () {

                $scope.filter = !$scope.filter;
                cvt.setFilterValve($scope.filter);

            };

            $scope.setDenuderBypass = function () {
                $scope.denuder_bypass = !$scope.denuder_bypass;
                cvt.setDenuderBypassValve($scope.denuder_bypass);
            };

            /** Flip the switch cabin switch.
             */
            $scope.setCabin = function () {
                $scope.cabin = !$scope.cabin;
                cvt.setCabinValve($scope.cabin);
            };

            function checkLaserStatus() {
                try {
                    if ((cvt.crd.enable.indexOf(true) >= 0
                        || cvt.pas.las.enabled.indexOf(true) >= 0)
                        && Data.data.interlock) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                catch(e){// This will be thrown if any of those above are undefined
                    return false;
                }
            }

        }]);
})();
