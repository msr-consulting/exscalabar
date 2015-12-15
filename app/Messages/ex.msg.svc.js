(function () {
    angular.module('main').factory('ExMsgSvc', MsgService);

    /**
     * @ngdoc service
     * @name main.service:ExMsgSvc
     * @requires $scope
     * @requires main.service:Data
     * @ description
     * Handles maintaining data for the message related views.
     */
    MsgService.$inject = ['$rootscope', 'Data'];
    function MsgService($rootscope, Data) {

        /** Object returned by the message service. */
        var msg = {
            numType: [0, 0, 0],
            msgs: [],
            clearMsgArray: clearMsgs,
            resetCount: function(){this.numType = [0,0,0];}
        };
        
        $rootscope.$on('dataAvailable', handle_data);

        function handle_data() {

            if (Data.msg.length > 0) {
                msg.msgs.push(Data.msg);
                for (i = 0; i < Data.msg.length; i++) {
                    if (Data.msg[i].search('ERROR') > 0) {
                        msg.numType[2] += 1;
                    } else if (Data.msg[i].search('WARNING') > 0) {
                        msg.numType[1] += 1;
                    } else {
                        msg.numType[0] += 1;
                    }
                }
                $rootScope.$broadcast('msgAvailable');
            }
        }

        function clearMsgs() {
            // Create a shallow copy of the msgs array
            var m = msg.msgs.slice(0);

            // Clear the msgs array
            msg.msgs = [];

            return m;
        }

        return msg;
    }
})();