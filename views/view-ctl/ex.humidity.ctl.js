(function () {
    angular.module('main').controller('humidifier', ['$scope', 'cvt', 'Data',
    function ($scope, cvt, Data) {

            /** 
             * @ngdoc controller
             * @name main.controller:humidifier
             * @requires $scope
             * @requires main.service:cvt
             * @requires main.service:Data
             *
             * @description
             * Provides functionality for the humidifier data page.
             */


            cvt.first_call = 1;

            /**
             * @ngdoc property
             * @name main.humidifier.high
             * @propertyOf main.controller:humidifier
             * @description
             * Object defining the properties of the high value humidifier - 
             * pid values and enable.  These values are initialized with the 
             * appropriate cvt controls.
             */


            $scope.h = cvt.humidifier;

            $scope.setEnable = function (i) {
                $scope.h[i].en = !$scope.h[i].en;
                $scope.updateHum(i);

            }

            $scope.updateHum = function () {
                var i = arguments[0];
                cvt.humidifier[i].updateParams($scope.h);
            };

            $scope.ctlrOutData = [[0, NaN, NaN]];
            $scope.RH = [[0, NaN, NaN]];
            $scope.optCtlOut = {
                ylabel: "Controller Output",
                labels: ["t", "med", "high"],
                legend: "always"
            };
            $scope.optRH = {
                ylabel: "RH (%)",
                labels: ["t", "med", "high"],
                legend: "always"
            };

    }
  ]);
})();