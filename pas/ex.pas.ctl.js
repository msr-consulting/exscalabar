(function () {
    angular.module('main').controller('ExPasCtl', pas_ctl);

    pas_ctl.$inject = ['$scope', 'cvt', 'ExPasSvc'];


    function pas_ctl($scope, cvt,ExPasSvc) {

        /**
         * @ngdoc controller
         * @name main.controller:ExPasCtl
         * @description
         * Controller for PAS functionality.
         */

        $scope.data = ExPasSvc;

        $scope.$on('pasDataAvailable', display_data);

        function display_data(){
            $scope.data = ExPasSvc;
        }

        cvt.first_call = 1;

    }

})();