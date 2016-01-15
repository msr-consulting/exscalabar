(function () {
    angular.module('main').controller('ExMainCtl', ['Data', '$scope', '$rootScope','$interval', 'cvt', 'ExReadCfgSvc',
        function (Data, $scope, $rootScope, $interval, cvt, ExReadCfgSvc) {
            /**
             * @ngdoc controller
             * @name main.controller:MainCtlr
             * @requires Data
             * @requires $scope
             * @requires $interval
             * @requires cvt
             * This is the main controller that is sucked into the entire program (this is placed
             *    in the body tag).  The primary function is to make regular server calls using the
             * ``$interval``.
             */

            $scope.name = ExReadCfgSvc.name;
            $scope.ver = ExReadCfgSvc.version;
            /* Call the data service at regular intervals; this will force a regular update of the
             * data object.
             */
            $interval(function () {
                Data.getData();
                cvt.checkCvt();
                //deviceCfg.checkCfg();
            }, 1000);

            $scope.$on('CfgUpdated', function () {
                $scope.name = ExReadCfgSvc.name;
                $scope.ver = ExReadCfgSvc.version;

            });
        }]);
})();