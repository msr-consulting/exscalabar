(function () {
    angular.module('main').controller("ExFlowCtl", FlowCtl);

    FlowCtl.$inject = ['$scope', "cvt", "ExFlowSvc"];


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
    function FlowCtl($scope, cvt, ExFlowSvc) {

        //$scope.Devices = {};
        $scope.DeviceData = ExFlowSvc.data;
        $scope.Device = ExFlowSvc;

        /* Update the CVT - the CVT should call the server... */
        $scope.updateSP = function () {
            var d = arguments[0];
            var key = arguments[1];
            cvt.flows.updateSP(key, d.Qsp);
        };

        $scope.$on('dataAvailable', function () {
            $scope.DeviceData = ExFlowSvc.data;
            $scope.Device = ExFlowSvc;

        });
    }
})();