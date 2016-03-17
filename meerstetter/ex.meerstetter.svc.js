(function () {
    angular.module('main').factory('ExMeerstetterSvc', mtec_svc);

    /**
     * @ngdoc service
     * @name main.service:ExMeerstetterSvc
     * @requires $rootScope
     * @requires main.service:Data
     * @requires main.service:cvt
     *
     * @description
     * Service handling the ordering of the data returned by flow controllers
     * and meters.
     */

    mtec_svc.$inject = ['$rootScope', 'Data', 'cvt'];

    function mtec_svc($rootScope, Data, cvt) {

        /**
         * @ngdoc property
         * @name main.service:ExMeerstetterSvc#MTecObj
         * @propertyOf main.service:ExMeerstetterSvc
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

        function MTecObj() {
            this.IDs = [];
            this.Tsink = [];
            this.Tobj = [];
            this.Vout = [];
            this.data = {};

            this.clear_data = function(){

                this.Tsink = [];
                this.Tobj = [];
                this.Vout = [];
                shift = false;
                index =0;

            };
        }

        var mtec = new MTecObj();


        var maxi = 300;

        var shift = false;
        var index = 0;

        function tecData() {
            this.Vout = 0;
            this.Tobj = 0;
            this.Tsink = 0;
            this.label = "";
        }


        // Temporary variables for storing array data.
        var Vout, Tobj, Tsink;

        var tecs = cvt.mTEC;

        /**
         * @ngdoc method
         * @name main.service:ExMeerstetterSvc#populate_arrays
         * @methodOf main.service:ExMeerstetterSvc
         * @param {object} e Element in array
         * @param {number} i Index in array
         *
         * @description
         * Populate the arrays for the plots.
         */
        function populate_arrays(e, i) {

            var id = e.id;
            if (!i) {
                Vout = [Data.tObj, mtec.data[id].Vout];
                Tobj = [Data.tObj, mtec.data[id].Tobj];
                Tsink = [Data.tObj, mtec.data[id].Tsink];
            } else {
                Vout.push(mtec.data[id].Vout);
                Tobj.push(mtec.data[id].Tobj);
                Tsink.push(mtec.data[id].Tsink);
            }
        }

        $rootScope.$on('dataAvailable', getData);

        $rootScope.$on('deviceListRefresh', function(){
            tecs = cvt.mTEC;
        });

        /**
         * @ngdoc method
         * @name main.service:ExMeerstetterSvc#getData
         * @methodOf main.service:ExMeerstetterSvc
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

            for ( var i = 0; i < tecs.length; i++) {
                // Check to see if the current ID is in the Data Object
                if (tecs[i].id in Data.data) {

                    key = tecs[i].id;

                    if (!(key in mtec.data)) {
                        mtec.data[key] = new tecData();
                        if (mtec.IDs.length === 0) {
                            mtec.IDs = [key];
                        } else {
                            mtec.IDs.push(key);
                        }
                    }

                    mtec.data[key].Vout = Data.data[key].Vout;
                    mtec.data[key].Tsink = Data.data[key].Tsink;
                    mtec.data[key].Tobj = Data.data[key].Tobj;

                    mtec.data[key].label = tecs[i].label;

                }
            }

            tecs.forEach(populate_arrays);

            if (shift) {
                mtec.Vout.shift();
                mtec.Tsink.shift();
                mtec.Tobj.shift();
            }
            else {
                index += 1;
            }
            mtec.Vout.push(P);
            mtec.Tsink.push(T);
            mtec.Tobj.push(Q);

            shift = index >= maxi;

            /**
             * @ngdoc event
             * @name main.service:ExMeerstetterSvc#MTecDataAvailable
             * @eventType broadcast
             * @eventOf main.service:ExMeerstetterSvc
             *
             * @description
             * Announce to observers that flow data is available.
             */
            $rootScope.$broadcast('MTecDataAvailable');
        }

        return mtec;
    }
})();