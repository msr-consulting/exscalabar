(function () {

    angular.module('main').factory('ExFlowSvc', flowSvc);

    /**
     * @ngdoc service
     * @name main.service:ExFlowSvc
     * @requires $rootScope
     * @requires main.service:Data
     *
     * @description
     * Service handling the ordering of the data returned by flow controllers
     * and meters.
     */

    flowSvc.$inject = ['$rootScope', 'Data', 'cvt'];

    function flowSvc($rootScope, Data, cvt) {

        /**
         * @ngdoc property
         * @name main.service:ExFlowSvc#flow
         * @propertyOf main.service:ExFlowSvc
         *
         * @description
         * This is the object that will be returned by the service.  This object contains
         *
         * * IDs - string array containg the IDs of the devices
         * * Q - Array of arrays of volumetric flow values for plotting
         * * P - Array of arrays of pressure values for plotting
         * * T - Array of arrays of temperature values for plotting
         * * Q0 - Array of arrays of mass flow values for plotting
         * * data - object containing single point flow data
         * * ``Qsp`` - an associative array that contains a key and value for each
         * element.  The key is the device ID while the value is the setpoint.
         */

        function FlowObj() {
            this.IDs = [];
            this.Q = [];
            this.P = [];
            this.T = [];
            this.Q0 = [];
            this.data = {};
            this.Qsp = [];

            this.clear_data = function(){

                this.Q = [];
                this.P = [];
                this.T = [];
                this.Q0 = [];
                shift = false;

            };
        }

        var flow = new FlowObj();


        var maxi = 300;

        var shift = false;
        var index = 0;

        function fData() {
            this.Q = 0;
            this.P = 0;
            this.T = 0;
            this.Q0 = 0;
            this.isController = false;
            this.Qsp = 0;
            this.label = "";
        }


        // Temporary variables for storing array data.
        var P, T, Q, Q0;

        var alicats = cvt.alicat;

        /**
         * @ngdoc method
         * @name main.service:ExFlowSvc#populate_arrays
         * @methodOf main.service:ExFlowSvc
         * @param {object} e Element in array
         * @param {number} i Index in array
         *
         * @description
         * Populate the arrays for the plots.
         */
        function populate_arrays(e, i) {

            var id = e.id;
            if (!i) {
                P = [Data.tObj, flow.data[id].P];
                T = [Data.tObj, flow.data[id].T];
                Q = [Data.tObj, flow.data[id].Q];
                Q0 = [Data.tObj, flow.data[id].Q0];
            } else {
                P.push(flow.data[id].P);
                T.push(flow.data[id].T);
                Q.push(flow.data[id].Q);
                Q0.push(flow.data[id].Q0);
            }
        }

        $rootScope.$on('dataAvailable', getData);

        $rootScope.$on('deviceListRefresh', function(){
            alicats = cvt.alicat;
        });

        /**
         * @ngdoc method
         * @name main.service:ExFlowSvc#getData
         * @methodOf main.service:ExFlowSvc
         *
         * @description
         * Get the data concerning the Alicats via the Data object returned
         * from the Data service.  Stuff teh data into the flow property of this
         * service.  The first time data is returned, we will check for the
         * presence of the actual object.  If it is not there, check to see if
         *
         * 1. it is a controller, and
         * 2. it is a mass flow device
         */
        function getData() {

            // Store the ID as key
            var key = "";

            for ( var i = 0; i < alicats.length; i++) {
                // Check to see if the current ID is in the Data Object
                if (alicats[i].id in Data.data) {

                    key = alicats[i].id;

                    if (!(key in flow.data)) {
                        flow.data[key] = new fData();
                        if (flow.IDs.length === 0) {
                            flow.IDs = [key];
                        } else {
                            flow.IDs.push(key);
                        }

                        // Check to see if this is a controller
                        if (Data.data[key].Type.search("C") >= 0) {
                            flow.data[key].isController = true;
                            flow.data[key].Qsp = Data.data[key].Qsp;
                        }
                    }

                    flow.data[key].P = Data.data[key].P;
                    flow.data[key].T = Data.data[key].T;
                    flow.data[key].Q = Data.data[key].Q;

                    flow.data[key].label = alicats[i].label;

                }
            }

            alicats.forEach(populate_arrays);

            if (shift) {
                flow.P.shift();
                flow.T.shift();
                flow.Q.shift();
                flow.Q0.shift();
            }
            else {
                index += 1;
            }
            flow.P.push(P);
            flow.T.push(T);
            flow.Q.push(Q);
            flow.Q0.push(Q0);

            shift = index >= maxi;

            /**
             * @ngdoc event
             * @name main.service:ExFlowSvc#FlowDataAvailable
             * @eventType broadcast
             * @eventOf main.service:ExFlowSvc
             *
             * @description
             * Announce to observers that flow data is available.
             */
            $rootScope.$broadcast('FlowDataAvailable');
        }

        return flow;
    }
})();