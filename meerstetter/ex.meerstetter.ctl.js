(function () {
    angular.module('main').controller('ExMeerstetterCtl', meerstetter_ctl);

    meerstetter_ctl.$inject = ['$scope', 'cvt'];


    function meerstetter_ctl($scope, cvt) {

        $scope.tecs = cvt.mTEC;

        $scope.updatePID = function(dev_i, i){

            $scope.tecs[dev_i].updateCtlParams(i, $scope.tecs[dev_i].pid[i]);

        }

        cvt.first_call = 1;

    }

})();