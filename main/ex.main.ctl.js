(function () {
    angular.module('main').controller('ExMainCtl', ['Data', '$scope', '$rootScope','$interval', 'cvt', 'ExReadCfgSvc','ExChecklistSvc','ExDevStatusSvc',
        function (Data, $scope, $rootScope, $interval, cvt, ExReadCfgSvc, ExChecklistSvc, ExDevStatusSvc) {
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
             var i = 0;
            $interval(function () {
                Data.getData();
                cvt.checkCvt();
                if (!ExDevStatusSvc.ini_complete)
                {
                    ExDevStatusSvc.get_ini();}
                    //deviceCfg.checkCfg();
                    if (i >10){
                        i = 0;
                        ExDevStatusSvc.listenForComm();
                }
                else {i +=1;}
            }, 100);

            // Load checklist data at startup
            ExChecklistSvc.load();

            $scope.$on('CfgUpdated', function () {
                $scope.name = ExReadCfgSvc.name;
                $scope.ver = ExReadCfgSvc.version;

            });
        }]);
})();
