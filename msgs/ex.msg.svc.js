(function () {
    angular.module('main').factory('ExMsgSvc', MsgService);

    /**
     * @ngdoc service
     * @name main.service:ExMsgSvc
     * @requires $scope
     * @requires main.service:Data
     * @description
     * Handles maintaining data for the message related views.
     */
    MsgService.$inject = ['$rootScope', 'Data'];

    function MsgService($rootScope, Data) {

        /** Object returned by the message service. */
        var msg = {
            numType: [0, 0, 0],
            msgs: "",
            clearMsgArray: function () {
                this.msgs = "";
                this.numType = [0, 0, 0];
                /**
                 * @ngdoc event
                 * @name countCleared
                 * @eventOf main.service:ExMsgSvc
                 * @eventType broadcast
                 *
                 * @description
                 * This message is fired when we call the ``clearMsgArray`` function.
                 * Let's listeners know that the property ``numType`` has changed.
                 */
                $rootScope.$broadcast('countCleared');
            },
            resetCount: function () {
                this.numType = [0, 0, 0];
            }
        };

        $rootScope.$on('dataAvailable', handle_data);

        function handle_data() {

            /* Concatenate only if there is already messages in the queue.
             * Otherwise, set the incoming messages to the current message object.
             */
            if (Data.msg.length > 0) {
                var m = "<span>";
                for (i = 0; i < Data.msg.length; i++) {
                    if (Data.msg[i].indexOf('ERROR') > 0) {
                        m = '<span class="cui-msg-error">';
                    } else if (Data.msg[i].indexOf('WARNING') > 0) {
                        m = '<span class="cui-msg-info">';
                    } else if (Data.msg[i].indexOf('[cal]') > 0) {
                        m = '<span class="cui-cal-info">';
                    } else {
                        m = '<span class="cui-msg-info">';
                    }
                    msg.msgs += m + Data.msg[i] + "</span><br>";
                }
                for (i = 0; i < Data.msg.length; i++) {
                    if (Data.msg[i].search('ERROR') > 0) {
                        msg.numType[2] += 1;
                    } else if (Data.msg[i].search('WARNING') > 0) {
                        msg.numType[1] += 1;
                    } else {
                        msg.numType[0] += 1;
                    }
                }

                /**
                 * @ngdoc event
                 * @name msgAvailable
                 * @eventOf main.service:ExMsgSvc
                 * @eventType broadcast
                 *
                 * @description
                 * Event to let observers know that message data is available.
                 * Fires only if there are messages in the stream.
                 */
                $rootScope.$broadcast('msgAvailable');
            }
        }

        return msg;
    }
})();
