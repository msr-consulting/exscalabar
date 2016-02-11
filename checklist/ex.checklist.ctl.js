
(function () {
    angular.module('main').controller("ExChecklistCtl", checklist_ctl);

    checklist_ctl.$inject = ['$scope', "ExChecklistSvc"];


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
    function checklist_ctl($scope, ExChecklistSvc) {

        $scope.ListObj = ExChecklistSvc;

        $scope.setChecked = function(){};

        $scope.$on('CheckListUpdated', function () {

            $scope.ListObj = ExChecklistSvc;

        });
    }
})();