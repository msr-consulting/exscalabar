(function () {

    angular.module('main').factory('ExTetechSvc', tetechSvc);

    /**
     * @ngdoc service
     * @name main.service:ExTetechSvc
     * @requires $rootScope
     * @requires main.service:Data
     * @requires main.service:cvt
     *
     * @description
     * Service handling the ordering of the data returned by flow controllers
     * and meters.
     */

    tetechSvc.$inject = ['$rootScope', 'Data', 'cvt'];

    function tetechSvc($rootScope, Data, cvt) {

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

        function teObj() {
            this.t1 = [];
            this.t2 = [];
            this.pow = [];
            this.data = {"t1": 0, "t2": 0, "power": 0};

            this.label = "";

            this.clear_data = function () {

                this.t1 = [];
                this.t2 = [];
                this.pow = [];
                index = 0;
                shift = false;

            };
        }

        var tec = new teObj();

        var maxi = 300;

        var shift = false;
        var index = 0;

        var TeTech = cvt.tec;


        $rootScope.$on('dataAvailable', getData);

        $rootScope.$on('deviceListRefresh', function () {
            TeTech = cvt.tec;
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

            var techData = Data.data.tetech;

            tec.data.t1 = techData.Input1;
            tec.data.t2 = techData.Input2;
            tec.data.pow = techData.Power;

            tec.label = TeTech.label;

            if (shift) {
                tec.t1.shift();
                tec.t2.shift();
                tec.pow.shift();
            }
            else if(index === 0){
                tec.t1 = [Data.tObj];
                tec.t2 = [Data.tObj];
                tec.pow = [Data.tObj];
            }
            else {
                index += 1;
            }
            tec.t1.push(tec.data.t1);
            tec.t2.push(tec.data.t2);
            tec.pow.push(tec.data.pow);

            shift = index >= maxi;

            /**
             * @ngdoc event
             * @name main.service:ExTetechSvc#TeTechDataAvailable
             * @eventType broadcast
             * @eventOf main.service:ExTetechSvc
             *
             * @description
             * Announce to observers that TEC data is available.
             */
            $rootScope.$broadcast('TeTechDataAvailable');
        }

        return tec;
    }
})();