/** This service is used for defining how device data is displayed.
 *  Several devices can be controlled (mass flow controller and temperature
 * 	controllers), but most are just display purposes.  This service will
 * 	regularly check to see if the configuration has been updated and notify
 *  all users of updates.
 */

(function () {
    angular.module('main').factory('cirrus.crd.svc', crdSvc);

    function crdSvc($rootscope, $scope, Data) {

        var CrdData = new CrdObject();

        $scope.$on('dataAvailable', function () {

            CrdData = handleCRD(Data.data, CrdData, Data.shift);
            
            $rootscope.$broadcast('crdDataAvaliable');

        });

        return CrdData;
    }

    /* Annotate for minification. */
    CRDService.$inject = ['$rootscope', '$scope', 'Data'];


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
    }

    /**
     * @ngdoc method
     * @name main.Data.handleCRD
     * @methodOf main.service:Data
     * @description
     * This function handles allocation of the CRD data.  All data may be plotted
     * and as such the data is divided up into arrays of {x,y} pairs for use by
     * plotting libraries.  The length of the arrays is defined by the service
     * and the length is indicated by the input shift.
     * @param {Object} d The JSON data object returned by the server.
     * @param {Object} Data Data object that will be broadcasted to controllers.
     * @param {boolean} shift Indicates whether we have the correct number of
     * points in the array and need to start shifting the data.
     * @return {Object} Data object defined in the inputs.
     */
    function handleCRD(d, Data, shift) {

        /* Alot space for storing the data that will be plugged into the dygraph plots.
         * The data will look like 
         * 
         *      ``[time, val1, val2, ...]``
         *
         * where ``time`` is a ``Date`` object with the value of ``Data.tObj`` above and ``vali`` represents the value of the data 
         * for cell i.  This data will be plugged into an array that will be used for graphing.
         */
        var tau = [Data.tObj],
            tau0 = [Data.tObj],
            stdevtau = [Data.tObj],
            taucorr = [Data.tObj],
            tau0corr = [Data.tObj],
            ext = [Data.tObj],
            extcorr = [Data.tObj],
            etau = [Data.tObj],
            max = [Data.tObj];

        /* We will collect ``shift`` data points before we actually pop the array.
         * Popping the array allows us to stop remove the oldest point so that we can
         * push more data onto the stack in the newest position using ``unshift()``.
         */
        if (shift) {
            Data.crd.cell.tau.shift();
            Data.crd.cell.tau0.shift();
            Data.crd.cell.taucorr.shift();
            Data.crd.cell.tau0corr.shift();
            Data.crd.cell.ext.shift();
            Data.crd.cell.extcorr.shift();
            Data.crd.cell.stdevtau.shift();
            Data.crd.cell.etau.shift();
            Data.crd.cell.max.shift();

        }

        // Store all of the cell data in the temporary variables defined above.
        // TODO: THERE HAS TO BE A FASTER WAY (ITERATOR?)
        for (var index in d.CellData) {

            // These parameters are discrete points
            tau.push(d.CellData[index].extParam.Tau);
            tau0.push(d.CellData[index].extParam.Tau0);
            tau0corr.push(d.CellData[index].extParam.Tau0cor);
            taucorr.push(d.CellData[index].extParam.taucorr);
            ext.push(d.CellData[index].extParam.ext);
            extcorr.push(d.CellData[index].extParam.extCorr);
            stdevtau.push(d.CellData[index].extParam.stdevTau);
            etau.push(d.CellData[index].extParam.eTau);
            max.push(d.CellData[index].extParam.max);

        }

        Data.crd.cell.avg_rd = [];
        // Handle the ringdown data
        for (k = 0; k < d.CellData[0].Ringdowns[0].length; k++) {
            var aRD = [k];
            for (j = 0; j < d.CellData.length; j++) {
                aRD.push(d.CellData[j].Ringdowns[0][k]);

            }
            Data.crd.cell.avg_rd.push(aRD);
        }

        Data.crd.cell.tau.unshift(tau);
        Data.crd.cell.tau0.unshift(tau0);
        Data.crd.cell.tau0corr.unshift(tau0corr);
        Data.crd.cell.taucorr.unshift(taucorr);
        Data.crd.cell.extcorr.unshift(extcorr);
        Data.crd.cell.ext.unshift(ext);
        Data.crd.cell.stdevtau.unshift(stdevtau);
        Data.crd.cell.etau.unshift(etau);
        Data.crd.cell.max.push(max);


        return Data;
    }
})();