(function () {
    angular.module('main')
        .controller('Sidebar', ['$scope', '$http', 'Data', 'net', 'cvt', function ($scope, $http, Data, net, cvt) {

            $scope.save = 1;
            $scope.filter = Data.filter.state;
            $scope.time = "Not connected";
            $scope.o3On = false;
            $scope.cabin = false;
            $scope.pumpBlocked = false;
            $scope.impBlocked = false;

            $scope.denuder_bypass = false;
            $scope.interlock = false;


            // Initially time is not available
            $scope.time = "Not Connected";

            $scope.$on('dataAvailable', function () {

                $scope.filter = Data.filter.state;
                $scope.cabin = Data.Cabin;
            });

            $scope.saveData = function () {

                $scope.save = !$scope.save;

                // TODO: Check to see if this is correct.
                var s = $scope.save ? 1 : 0;

                $http.get(net.address() + 'General/Save?save=' + s.toString());
            };

            $scope.setFilter = function () {

                $scope.filter = !$scope.filter;
                var x = $scope.filter ? 1 : 0;
                $http.get(net.address() + 'General/UpdateFilter?State=' + x);

            };

            $scope.setDenuderBypass = function () {
                $scope.filter = !$scope.denuder_bypass;
                var x = $scope.denuder_bypass ? 1 : 0;
                $http.get(net.address() + 'General/DenudedBypass?val=' + x);
            };

            /** Flip the switch cabin switch.
             */
            $scope.setCabin = function () {
                $scope.cabin = !$scope.cabin;
                var x = $scope.cabin ? 1 : 0;
                $http.get(net.address() + 'General/Cabin?val=' + x);
            };

        }]);
})();
