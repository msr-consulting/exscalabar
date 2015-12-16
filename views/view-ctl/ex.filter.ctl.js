(function () {
    angular.module('main').controller('ExFilterCtl', ['$scope', 'net', '$http', 'cvt',
  'Data',
        function ($scope, net, $http, cvt, Data) {

            /* Filter cycle consists of a period that defines the time in seconds
             * between which the filter is cycled to true, length of time in seconds
             * that the filter is on and a boolean indicating whether the syste is set
             * to cycle.
             */

            cvt.first_call = 1;
            
            $scope.filter = {
                cycle: cvt.filter.cycle,
                position: cvt.filter.position,
                updateCycle: function() {
                    
                    cvt.filter.updateCycle(this.cycle);

                },
                updateAuto: function(){
                    this.cycle.auto = !this.cycle.auto;
                    this.updateCycle();
                },
                updatePos: function(){
                    cvt.filter.updatePos(this.position);
                }

            };


            $scope.tremain = Data.filter.tremain;
            $scope.state = Data.filter.state;

            $scope.updateAuto = function () {
                $scope.cycle.auto = !$scope.cycle.auto;
                $scope.updateCycle();
            };

            $scope.$on('dataAvailable', function () {
                $scope.tremain = Data.filter.tremain;
                $scope.state = Data.filter.state;
            });

            $scope.$on('cvtUpdated', function () {
                $scope.filter.cycle = cvt.filter.cycle;
            });
}]);
})();