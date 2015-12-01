/** This is the main service for retrieving data at regular intervals.
 *
 */

(function () {
    angular.module('main').factory('Data', ['$rootScope', '$http', '$log', 'net',
    'cvt',
    function ($rootScope, $http, $log, net, cvt) {

            // Arrays of Devices
            // TODO: Make sure this is not hardcoded...
            var alicats = ["TestAlicat"];
            var ppts = ["pDryBlue"];
            var vaisalas = ["vDryRed", "vDryBlue"];
            /* The full data object contains arrays of data as defined in the objects above.
             * This object is INTENDED to be static...
             */
            var dataObj = {
                "cTime": null,
                "tObj": new Date(),
                "save": true,
                "o3cal": false,
                "Cabin": false,
                "time": [],
                "msg": []
            };

            // Defines array lengths - 100 == 100 seconds of data
            var maxLength = 300;

            /* Variable that indicates everyone needs to shift... */
            var shiftData = false;

            dataObj.pas = {};
            dataObj.pas.cell = [new pasData()];
            dataObj.pas.drive = true;

            dataObj.filter = {
                "state": true,
                "tremain": 0
            };

            /** Clear out the message queue by first copying the msg arrays
             * to a new variable x and then setting the msg array to an
             * empty array.
             * @return {String array} - by value copy of msg queue.
             */
            dataObj.popMsgQueue = function () {

                // Retrieve a copy of the array
                var x = dataObj.msg.slice();

                // Clean out the message array in the dataObj
                dataObj.msg = [];
                return x;

            };

            dataObj.flowData = [new fdevice()];

            // Currently, the CRD data strictly consists of cell data.
            dataObj.crd = {};

            // Add a single cell to allocate space for the cell array.
            dataObj.crd.cell = new crdObject();

            var f0 = [];
            var busy = false;


            /* Call this to poll the server for data */
            dataObj.getData = function () {
                if (busy) {
                    return;
                }
                busy = true;
                promise = $http.get(net.address() + 'General/Data')
                    .then(function (response) {


                        // Object creation for devices
                        for (i = 0; i < alicats.length; i++) {
                            if (alicats[i] in response.data) {
                                dataObj[alicats[i]] = response.data[alicats[i]];
                            }

                        }

                        // Handle filter infomration
                        dataObj.filter.state = response.data.Filter;
                        // Time remaining in cycle is the total time minus the elapsed time
                        var tremain = response.data.fcycle.tt - response.data.fcycle.te;
                        // Don't let this time fall below 0
                        dataObj.filter.tremain = tremain > 0 ? tremain : 0;

                        // Object creation for devices
                        for (i = 0; i < ppts.length; i++) {
                            if (ppts[i] in response.data) {
                                dataObj[ppts[i]] = response.data[ppts[i]];
                            }

                        }
                        // Object creation for devices
                        for (i = 0; i < vaisalas.length; i++) {
                            if (vaisalas[i] in response.data) {
                                dataObj[vaisalas[i]] = response.data[vaisalas[i]];
                            }

                        }

                        /* The maximum length of the array is defined by the variable maxLength.
                         * If the array is greater or equal than this, pop the array and then
                         * place a new value at the front of the array using unshift().  Also,
                         * set the flag shiftData to true to indicate to others that they neeed
                         * to do likewise.
                         */
                        // TODO: Get rid of this array - it is not used!
                        if (dataObj.time.length - 1 >= maxLength) {
                            dataObj.time.pop();
                            shiftData = true;
                        }


                        dataObj.tObj = updateTime(Number(response.data.Time));

                        var t = dataObj.tObj.getTime();
                        dataObj.time.unshift(t);


                        dataObj = handlePAS(response.data, dataObj, shiftData);
                        dataObj = handleCRD(response.data, dataObj, shiftData);
                        dataObj.Cabin = response.data.Cabin;

                        $rootScope.$broadcast('dataAvailable');


                        if (response.data.Msg.length > 0) {

                            if (dataObj.msg.length > 0) {
                                dataObj.msg.concat(response.data.Msg);
                            } else {
                                dataObj.msg = response.data.Msg.slice();
                            }

                            $rootScope.$broadcast('msgAvailable');
                            busy = false;
                        }
                    }, function (response) {
                        $rootScope.$broadcast('dataNotAvailable');
                    }).finally(function () {
                        busy = false;
                    });
            };

            return dataObj;

    }
  ]);

    /** Function to return current time.
     * @param {Double} t - time in seconds since January 1, 1904.
     * @return {Date} - date object with date from server.
     */
    function updateTime(t) {
        /* The reference for LabVIEW time is 1 Jan 1904.  JS days
         * are zero based so set the value to the correct date for
         * reference.
         */
        var lvDate = new Date(1904, 0, 1);
        lvDate.setSeconds(t);
        return lvDate;
    }

    /** This is the structure for the flow device data */
    function fdevice() {
        this.ID = "";
        this.Q = 0; // Volumetric flow rate
        this.Q0 = 0; // Mass flow rate
        this.P = 0; // Pressure in mb
        this.T = 0; // Temperature in degrees C
        this.Qsp = 0; // Flow setpoint
    }

    /** Contains data specific to the PAS */
    function pasData() {
        this.f0 = [];
        this.IA = [];
        this.Q = [];
        this.p = [];
        this.abs = [];
        this.micf = [];
        this.mict = [];
        this.pd = [];
    }

    /**
     * This object is used to store {x,y} pairs of data for plotting of the CRD
     * data.  The x value is time and the y is the value indicated by the property.
     */
    function crdObject() {
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
     * This function handles allocation of the PAS data.  All data may be plotted
     * and as such the data is divided up into arrays of {x,y} pairs for use by
     * plotting libraries.  The length of the arrays is defined by the service
     * and the length is indicated by the input shift.
     * @param {Object} d - this is the JSON data object returned by the server.
     * @param {Object} Data - data object that will be broadcasted to controllers.
     * @param {boolean} shift - indicates whether we have the correct number of
     * points in the array and need to start shifting the data.
     * @return {Object} - returns the Data object defined in the inputs.
     */
    function handlePAS(d, Data, shift) {
        var t = Data.time[0];
        // Handle the PAS data
        // TODO: Fix this hideousness!!!  Has to be a better way...
        for (var index in d.PAS.CellData) {

            /* Make sure we have all of the cells accounted for */
            if ((Data.pas.cell.length - 1) < index) {
                Data.pas.cell.push(new pasData());
            }

            /* Pop all of the ordered arrays if the arrays are of the set length... */
            if (shift) {
                Data.pas.cell[index].f0.pop();
                Data.pas.cell[index].IA.pop();
                Data.pas.cell[index].Q.pop();
                Data.pas.cell[index].p.pop();
                Data.pas.cell[index].abs.pop();
            }

            // TODO: This doesn't look right - the points should be an object, right?
            Data.pas.cell[index].f0.unshift({
                x: t,
                y: d.PAS.CellData[index].derived.f0
            });
            Data.pas.cell[index].IA.unshift({
                x: t,
                y: d.PAS.CellData[index].derived.IA
            });
            Data.pas.cell[index].Q.unshift({
                x: t,
                y: d.PAS.CellData[index].derived.Q
            });
            Data.pas.cell[index].p.unshift({
                x: t,
                y: d.PAS.CellData[index].derived.noiseLim
            });
            Data.pas.cell[index].abs.unshift({
                x: t,
                y: d.PAS.CellData[index].derived.ext
            });


            /* This is one off data and is not a function of time... */
            Data.pas.cell[index].micf = d.PAS.CellData[index].MicFreq.Y;
            Data.pas.cell[index].mict = d.PAS.CellData[index].MicTime.Y;
            Data.pas.cell[index].pd = d.PAS.CellData[index].PhotoDiode.Y;

        }
        Data.pas.drive = d.PAS.Drive;

        return Data;
    }

    /**
     * This function handles allocation of the CRD data.  All data may be plotted
     * and as such the data is divided up into arrays of {x,y} pairs for use by
     * plotting libraries.  The length of the arrays is defined by the service
     * and the length is indicated by the input shift.
     * @param {Object} d - this is the JSON data object returned by the server.
     * @param {Object} Data - data object that will be broadcasted to controllers.
     * @param {boolean} shift - indicates whether we have the correct number of
     * points in the array and need to start shifting the data.
     * @return {Object} - returns the Data object defined in the inputs.
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