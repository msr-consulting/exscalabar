/**
 * Created by Exscalabar on 22/02/2016.
 */
(function () {
    angular.module('main').controller("ExVaisalaCtl", VaisalaCtl);

    VaisalaCtl.$inject = ['$scope', "cvt", "ExVaisalaSvc"];


    /**
     * @ngdoc controller
     * @name main.controller:ExFlowCtl
     * @requires $scope
     * @requires main.service:Data
     * @requires main.service:cvt
     * @requires main.service:ExFlowSvc
     *
     * @description
     * Controller for the flow control and visualization page.
     */
    function VaisalaCtl($scope, cvt, ExVaisalaSvc) {
        
        
        cvt.changeWvfmState(false, false);

        $scope.Devices = {};

        /* Update the CVT - the CVT should call the server... */
        $scope.updateSP = function () {
            var d = arguments[0];
            cvt.flows.updateSP(d.ID, d.sp);
        };

        $scope.$on('VaisalaDataAvailable', function () {
            $scope.Devices = ExVaisalaSvc.data;

        });
    }
})();