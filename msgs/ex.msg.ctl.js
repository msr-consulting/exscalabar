(function () {
    angular.module('main').controller('ExMsgCtl', ['$scope', 'ExMsgSvc', 'cvt',
	function ($scope, ExMsgSvc, cvt) {
            /**
             * @ngdoc controller
             * @name main.msgCtlr
             * @requires main.service:Data
             * @requires $scope
             * @description
             * Controller for displaying messages from the server. 
             */

            /** 
             * @ngdoc property
             * @name main.msgCtlr#msgs
             * @propertyOf main.controller:msgCtlr
             * @scope
             * @description
             * Scope variable that holds the html based text stream.
             */
            $scope.msgs = ExMsgSvc.msgs;
        
            cvt.changeWvfmState(false, false);
        
            $scope.$on('msgAvailable', function () {

                $scope.msgs = ExMsgSvc.msgs;
            });


            $scope.clrMsgs = function () {
                $scope.msgs = "";
                ExMsgSvc.clearMsgArray();
            };


	}]);
})();