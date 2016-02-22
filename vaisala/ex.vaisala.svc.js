(function () {

    angular.module('main').factory('ExVaisalaSvc', vaisalaSvc);

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

    vaisalaSvc.$inject = ['$rootScope', 'Data', 'cvt'];

    function vaisalaSvc($rootScope, Data, cvt) {

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

        function VaisalaObj() {
            this.IDs = [];
            this.RH = [];
            this.T = [];
            this.Td = [];
            this.data = {};

            this.clear_data = function(){

                this.RH = [];
                this.Td = [];
                this.T = [];

            };
        }

        var vaisala = new VaisalaObj();

        var maxi = 300;

        var shift = false;
        var index = 0;

        function vData() {
            this.RH = 0;
            this.Td = 0;
            this.T = 0;
            this.label = "";
        }


        // Temporary variables for storing array data.
        var RH, T, Td;

        var vaisalas = cvt.vaisala;

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
                RH = [Data.tObj, vaisala.data[id].RH];
                T = [Data.tObj, vaisala.data[id].T];
                Td = [Data.tObj, vaisala.data[id].Td];
            } else {
                RH.push(vaisala.data[id].RH);
                T.push(vaisala.data[id].T);
                Td.push(vaisala.data[id].Td);
            }
        }

        $rootScope.$on('dataAvailable', getData);

        $rootScope.$on('deviceListRefresh', function(){
            vaisalas = cvt.vaisala;
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

            for ( var i = 0; i < vaisalas.length; i++) {
                // Check to see if the current ID is in the Data Object
                if (vaisalas[i].id in Data.data) {

                    key = vaisalas[i].id;

                    if (!(key in vaisala.data)) {
                        vaisala.data[key] = new vData();
                        if (vaisala.IDs.length === 0) {
                            vaisala.IDs = [key];
                        } else {
                            vaisala.IDs.push(key);
                        }
                    }

                    vaisala.data[key].RH = Data.data[key].RH;
                    vaisala.data[key].T = Data.data[key].T;
                    vaisala.data[key].Td = Data.data[key].Td;

                    vaisala.data[key].label = vaisalas[i].label;

                }
            }

            vaisalas.forEach(populate_arrays);

            if (shift) {
                vaisala.RH.shift();
                vaisala.T.shift();
                vaisala.Td.shift();
            }
            else {
                index += 1;
            }
            vaisala.RH.push(RH);
            vaisala.T.push(T);
            vaisala.Td.push(Td);

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
            $rootScope.$broadcast('VaisalaDataAvailable');
        }

        return vaisala;
    }
})();