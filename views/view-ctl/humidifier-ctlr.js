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
            $scope.high = cvt.humidifier.high;
            $scope.med = cvt.humidifier.med;

            $scope.h = [cvt.humidifier.med, cvt.humidifier.high];

            $scope.updateMedEn = function () {
                $scope.med.en = !$scope.med.en;
                cvt.humidifier.med = $scope.med.en;
            };

            $scope.updateHighEn = function () {
                $scope.high.en = !$scope.high.en;
                cvt.humidifier.high = $scope.high.en;
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