(function () {
    angular.module('main').controller('ExMeerstetterCtl', meerstetter_ctl);

    meerstetter_ctl.$inject = ['$scope', 'cvt'];


    function meerstetter_ctl($scope, cvt) {
        
        cvt.changeWvfmState(false, false);

        $scope.tecs = cvt.mTEC;

        $scope.updatePID = function (dev_i, i) {

            $scope.tecs[dev_i].updateCtlParams(i, $scope.tecs[dev_i].pid[i]);

        };

        $scope.updateCtl = function (i) {
            $scope.tecs[i].updateCtlVal();
        }
        
        $scope.updateSetpoint  =function(i){
            cvt.mTEC[i].updateSetpoint($scope.tecs[i].sp);
        }

        cvt.first_call = 1;
        $scope.$on('cvtUpdated', function () {
            $scope.tecs = cvt.mTEC;
        });

    }



})();