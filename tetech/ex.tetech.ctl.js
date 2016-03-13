(function () {
    angular.module('main').controller('ExTetechCtl', tetech_ctl);

    tetech_ctl.$inject = ['$scope', 'ExTetechSvc'];


    function tetech_ctl($scope, ExTetechSvc) {

        /**
         * @ngdoc controller
         * @name main.controller:ExExTetechCtl
         * @description
         * Controller for TE Tech control functionality.
         */

        $scope.ctl = {"P":1, "I":0.75, "D":0};
        $scope.Tsp = 18;
        $scope.ch_mult = {"htx":0, "clx":1};

        $scope.$on('tetechCVTUpdated', update_ctl);

        function update_ctl(){
            //$scope.data = ExPasSvc;
            console.log('Update TE Tech CVT.');
        }

        $scope.set_pid = function(){
            console.log('New PID control set.');
        };

        $scope.set_mult = function(){
          console.log('Set multipliers.');
        };

        $scope.update_sp = function(){
          console.log('Update set point.');
        };

        //cvt.first_call = 1;

    }

})();