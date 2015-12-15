(function () {
    angular.module('main').controller('ExMsgCtl', ['$scope', 'ExMsgSvc',
	function ($scope, ExMsgSvc) {
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
            $scope.msgs = "";
            $scope.$on('msgAvailable', function () {

                var x = ExMsgSvc.clearMsgArray();

                // Color the error based on the message information
                var m = "<span>";
                for (i = 0; i < x.length; i++) {
                    if (x[i].search('ERROR') > 0) {
                        m = '<span class="cui-msg-error">';
                    } else if (x[i].search('WARNING') > 0) {
                        m = '<span class="cui-msg-info">';
                    } else {
                        m = '<span class="cui-msg-info">';
                    }
                    $scope.msgs.concat(m + x[i] + "</span><br>");
                }
            });


            $scope.clrMsgs = function () {
                $scope.msgs = "";
            };


	}]);
})();