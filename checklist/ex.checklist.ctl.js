(function () {
    angular.module('main').controller("ExChecklistCtl", checklist_ctl);

    checklist_ctl.$inject = ['$scope', "ExChecklistSvc"];


    /**
     * @ngdoc controller
     * @name main.controller:ExChecklistCtl
     * @requires $scope
     * @requires main.service:Data
     * @requires main.service:cvt
     * @requires main.service:ExFlowSvc
     *
     * @description
     * Controller for the flow control and visualization page.
     */
    function checklist_ctl($scope, ExChecklistSvc) {

        $scope.ListObj = ExChecklistSvc;

        /**
         * @ngdoc method
         * @methodOf main.controller:ExChecklistCtl
         * @name main.controller:ExChecklistCtl#setChecked
         *
         * @description
         * Function to respond to clicking in checklist.  Should:
         *
         * 1. Update the object in the service
         * 2. Broadcast the task to the server for logging...
         */
        $scope.setChecked = function () {
            ExChecklistSvc.update($scope.ListObj)
        };

        $scope.$on('CheckListUpdated', function () {

            $scope.ListObj = ExChecklistSvc;

        });
    }
})();