/** This service is used for defining how device data is displayed.
 *  Several devices can be controlled (mass flow controller and temperature
 *    controllers), but most are just display purposes.  This service will
 *    regularly check to see if the configuration has been updated and notify
 *  all users of updates.
 */

(function () {
    angular.module('main').factory('ExCrdSvc', crdSvc);

    var shift = false;
    var history = 300;

    /* Annotate for minification. */
    crdSvc.$inject = ['$rootScope', 'Data'];

    /**
     * @ngdoc service
     * @name main.service:crdSvc
     * @requires $rootScope
     * @requires main.service:Data
     *
     * @description
     * Service that handles the CRD Data returned by the main Data service.
     *
     */
    function crdSvc($rootScope, Data) {

        var CrdData = new CrdObject();

        $rootScope.$on('dataAvailable', get_data);

        /**
         * @ngdoc method
         * @ngdoc main.service:ExCrdSvc#get_data
         * @methodof main.service:ExCrdSvc
         * @description
         * Sort data for graphing.
         */
        function get_data() {

            CrdData = handleCRD(Data, CrdData);

            /**
             * @ngdoc event
             * @name crdDataAvailable
             * @eventType broadcast
             *
             * @description
             * Event that broadcasts the CRD Data has been processed
             * and is available.
             */
            $rootScope.$broadcast('crdDataAvaliable');
        }

        return CrdData;
    }


    /**
     * This object is used to store {x,y} pairs of data for plotting of the CRD
     * data.  The x value is time and the y is the value indicated by the property.
     */
    function CrdObject() {
        this.tau = [];
        this.tau0 = [];
        this.taucorr = [];
        this.tau0corr = [];
        this.ext = [];
        this.extcorr = [];
        this.stdevtau = [];
        this.etau = [];
        this.max = [];
        this.avg_rd = [];
        this.fit_rd = [];

        this.set_history = function (n) {

            if (this.tau.length > n) {

                // Remove the difference
                var x = this.tau.length - n;

                this.tau.splice(0, x);
                this.tau.splice(0, x);
                this.tau0.splice(0, x);
                this.taucorr.splice(0, x);
                this.tau0corr.splice(0, x);
                this.ext.splice(0, x);
                this.extcorr.splice(0, x);
                this.stdevtau.splice(0, x);
                this.etau.splice(0, x);
                this.max.splice(0, x);
                shift = true;
            }
            else{
                shift = false;
            }

            // Reset the length of the history
            history = n;
        }

        this.clear_history = function () {

            // Reset the boolean that tells us to shift the data
            shift = false;

            // Clear all of the arrays
            this.tau = [];
            this.tau0 = [];
            this.taucorr = [];
            this.tau0corr = [];
            this.ext = [];
            this.extcorr = [];
            this.stdevtau = [];
            this.etau = [];
            this.max = [];
        }
    }

    /**
     * @ngdoc method
     * @name main.service:ExCrdSvc#handleCRD
     * @methodOf main.service:ExCrdSvc
     * @description
     * This function handles allocation of the CRD data.  All data may be plotted
     * and as such the data is divided up into arrays of {x,y} pairs for use by
     * plotting libraries.  The length of the arrays is defined by the service
     * and the length is indicated by the input shift.
     * @param {Object} d The JSON data object returned by the server.
     * @param {Object} crd Data object that will be broadcasted to controllers.
     * @return {Object} Data object defined in the inputs.
     */
    function handleCRD(d, crd) {

        /* Alot space for storing the data that will be plugged into the dygraph plots.
         * The data will look like 
         * 
         *      ``[time, val1, val2, ...]``
         *
         * where ``time`` is a ``Date`` object with the value of ``Data.tObj`` above and ``vali`` represents the value of the data 
         * for cell i.  This data will be plugged into an array that will be used for graphing.
         */
        var tau = [d.tObj],
            tau0 = [d.tObj],
            stdevtau = [d.tObj],
            taucorr = [d.tObj],
            tau0corr = [d.tObj],
            ext = [d.tObj],
            extcorr = [d.tObj],
            etau = [d.tObj],
            max = [d.tObj];

        /* We will collect ``shift`` data points before we actually pop the array.
         * Popping the array allows us to stop remove the oldest point so that we can
         * push more data onto the stack in the newest position using ``unshift()``.
         */
        if (shift) {
            crd.tau.shift();
            crd.tau0.shift();
            crd.taucorr.shift();
            crd.tau0corr.shift();
            crd.ext.shift();
            crd.extcorr.shift();
            crd.stdevtau.shift();
            crd.etau.shift();
            crd.max.shift();
        }
        else {

            // Check to make sure we haven't gone past the length of data
            // requested by the user.
            shift = crd.tau.length >= history ? true : false;
        }

        // Store all of the cell data in the temporary variables defined above.
        // TODO: THERE HAS TO BE A FASTER WAY (ITERATOR?)
        for (var index in d.data.CellData) {

            // These parameters are discrete points
            tau.push(d.data.CellData[index].extParam.Tau);
            tau0.push(d.data.CellData[index].extParam.Tau0);
            tau0corr.push(d.data.CellData[index].extParam.Tau0cor);
            taucorr.push(d.data.CellData[index].extParam.taucorr);
            ext.push(d.data.CellData[index].extParam.ext);
            extcorr.push(d.data.CellData[index].extParam.extCorr);
            stdevtau.push(d.data.CellData[index].extParam.stdevTau);
            etau.push(d.data.CellData[index].extParam.eTau);
            max.push(d.data.CellData[index].extParam.max);

        }

        crd.avg_rd = [];
        // Handle the ringdown data
        for (var k = 0; k < d.data.CellData[0].Ringdowns[0].length; k++) {
            var aRD = [k];
            for (var j = 0; j < d.data.CellData.length; j++) {
                aRD.push(d.data.CellData[j].Ringdowns[0][k]);

            }
            crd.avg_rd.push(aRD);
        }

        crd.tau.push(tau);
        crd.tau0.push(tau0);
        crd.tau0corr.push(tau0corr);
        crd.taucorr.push(taucorr);
        crd.extcorr.push(extcorr);
        crd.ext.push(ext);
        crd.stdevtau.push(stdevtau);
        crd.etau.push(etau);
        crd.max.push(max);


        return crd;
    }
})();