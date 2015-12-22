(function () {
    angular.module('main').controller("ExFlowCtl", FlowCtl);

    FlowCtl.$inject = ['$scope', "Data", "cvt", "ExFlowSvc", ];

    
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
        
        $scope.Devices ={};

        /* Update the CVT - the CVT should call the server... */
        $scope.updateSP = function () {
            var d = arguments[0];
            cvt.flows.updateSP(d.ID, d.sp);
        };

        $scope.$on('dataAvailable', function () {
            $scope.Devices = ExFlowSvc.data;
           
        });
        
        $scope.$on()


    }
})();