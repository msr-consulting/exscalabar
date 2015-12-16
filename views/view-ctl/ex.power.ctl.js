(function () {
    angular.module('main').controller('ExPowerCtl', ['$scope', 'cvt',
    function ($scope, cvt) {

            $scope.power = cvt.power;

            $scope.order = ["Pump", "O3Gen", "Denuder", "Laser", "TEC"];

            cvt.first_call = 1;

            $scope.toggle = function (id) {
                // Flip the bit
                $scope.power[id] = !$scope.power[id];

                //Sketch out space for the values used below
                var num = 0;
                var val = 0;

                /* Convert the array of booleans for the power to
                 * a decimal integer.  We will send this decimal
                 * integer back for the power.
                 */

                for (var i = 0; i < $scope.order.length; i++) {
                    if ($scope.power.hasOwnProperty($scope.order[i])) {
                        val = $scope.power[$scope.order[i]] ? 1 : 0;
                        num += Math.pow(2, i) * val;
                    }

                }
                cvt.updatePS(num);

            };
    }
  ]);
})();