(function () {
    angular.module('main').controller('ExTetechCtl', tetech_ctl);

    tetech_ctl.$inject = ['$scope', 'ExTetechSvc', 'cvt'];


    function tetech_ctl($scope, ExTetechSvc, cvt) {

        /**
         * @ngdoc controller
         * @name main.controller:ExExTetechCtl
         * @description
         * Controller for TE Tech control functionality.
         */



        $scope.ctl = cvt.tec.pid;
        $scope.Tsp = cvt.tec.sp; //cvt.te_tec.sp;
        $scope.ch_mult = {
            "htx": cvt.tec.htx,
            "clx": cvt.tec.clx
        };

        $scope.$on('tetechCVTUpdated', update_ctl);

        function update_ctl() {
            //$scope.data = ExPasSvc;
            $scope.ctl = cvt.tec.pid;
            $scope.Tsp = cvt.tec.sp; //cvt.te_tec.sp;
            $scope.ch_mult = {
                "htx": cvt.tec.htx,
                "clx": cvt.tec.clx
            };
            console.log('Update TE Tech CVT.');
        }

        $scope.set_pid = function (index) {
            cvt.te_tec.updateCtlParams(index, $scope.ctl[index]);
            console.log('New PID control set.');
        };

        $scope.setHtx = function(){
            cvt.tec.updateHtx($scope.ch_mult.htx);
        };
        $scope.setClx = function(){
            cvt.tec.updateClx($scope.ch_mult.clx);
        };
        $scope.set_mult = function () {

            cvt.tec.updateMult([$scope.ch_mult.htx, $scope.ch_mult.clx]);
            console.log('Set multipliers.');
        };

        $scope.update_sp = function () {

            cvt.tec.updateSP($scope.Tsp);
        };

        cvt.first_call = 1;

    }

})();
