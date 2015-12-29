(function () {
    angular.module('main').factory('Data', ['$rootScope', '$http', 'net',
    'cvt',
    function ($rootScope, $http, net, cvt) {
            /** 
             * @ngdoc service 
             * @name main.service:Data
             * @requires $rootscope
             * @requires $http
             * @requires main.service:net
             * @requires main.service:cvt
             * @description 
             * This is the main service for retrieving data at regular intervals.
             *
             */

            // Arrays of Devices
            // TODO: Make sure this is not hardcoded...

            /** 
             * @ngdoc property
             * @name main.Data.alicats
             * @propertyOf main.service:Data
             * @description
             * Defines a list of alicat names to ID data related to a specific alicat device.
             */
            var alicats = ["TestAlicat"];

            /** 
             * @ngdoc property
             * @name main.Data.ppts
             * @propertyOf main.service:Data
             * @description
             * Defines a list of ppt names to ID data related to a specific ppt device.
             */
            var ppts = ["pDryBlue"];

            /** 
             * @ngdoc property
             * @name main.Data.vaisalas
             * @propertyOf main.service:Data
             * @description
             * Defines a list of vaisala names to ID data related to a specific vaisala device.
             */
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
                "msg": [],
                "date": {}
            };


            /** 
             * @ngdoc property
             * @name main.Data.maxLength
             * @propertyOf main.service:Data
             * @description
             * Defines the max array length in seconds for displaying data. 
             */
            var maxLength = 300;

            /** 
             * @ngdoc property
             * @name main.Data.shiftData
             * @propertyOf main.service:Data
             * @description
             * Determines how to shuffle array data (used in conjunction with ``maxLength``).  If the 
             * value is true, the number of elements in the arrays is ``>= maxLength``. 
             */
            var shiftData = false;

            dataObj.pas = {};
            dataObj.pas.cell = new pasData();
            dataObj.pas.drive = true;

            dataObj.filter = {
                "state": true,
                "tremain": 0
            };

            dataObj.flowData = [new fdevice()];
            var busy = false;

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
                        dataObj.Cabin = response.data.Cabin;
                        dataObj.msg = response.data.Msg;


                        // TODO: We actually just want to pass on the data so that 
                        // others can grab it.  For now, putting it in this key (data)
                        dataObj.data = response.data;

                        $rootScope.$broadcast('dataAvailable');

                        busy = false;
                    }, function (response) {
                        $rootScope.$broadcast('dataNotAvailable');
                    }).finally(function () {
                        busy = false;
                    });
            };

            return dataObj;

    }
  ]);

    /** 
     * @ngdoc method
     * @name main.Data.updateTime
     * @methodOf main.service:Data
     * @description
     * Takes the time returned by the server (a LabVIEW time) and converts it to 
     * a Javascript Date.
     * 
     * @param {number} t Time in seconds since January 1, 1904.
     * @return {Date} Date object with date from server.
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
     * @ngdoc method
     * @name main.Data.handlePAS
     * @methodOf main.service:Data
     * @description
     * This function handles allocation of the PAS data.  All data may be plotted
     * and as such the data is divided up into arrays of {x,y} pairs for use by
     * plotting libraries.  The length of the arrays is defined by the service
     * and the length is indicated by the input shift.
     * @param {Object} d The JSON data object returned by the server.
     * @param {Object} Data Data object that will be broadcasted to controllers.
     * @param {boolean} shift Indicates whether we have the correct number of
     * points in the array and need to start shifting the data.
     * @return {Object} Data object defined in the inputs.
     */
    function handlePAS(d, Data, shift) {
        var t = Data.time[0];

        var f0 = [Data.tObj],
            IA = [Data.tObj],
            Q = [Data.tObj],
            p = [Data.tObj],
            abs = [Data.tObjj];

        /* Pop all of the ordered arrays if the arrays are of the set length... */
        if (shift) {
            Data.pas.cell.f0.pop();
            Data.pas.cell.IA.pop();
            Data.pas.cell.Q.pop();
            Data.pas.cell.p.pop();
            Data.pas.cell.abs.pop();
        }

        for (var index in d.PAS.CellData) {
            f0.push(d.PAS.CellData[index].derived.f0);
            IA.push(d.PAS.CellData[index].derived.IA);
            Q.push(d.PAS.CellData[index].derived.Q);
            p.push(d.PAS.CellData[index].derived.noiseLim);
            abs.push(d.PAS.CellData[index].derived.ext);
        }

        Data.pas.cell.f0.push(f0);
        Data.pas.cell.IA.push(IA);
        Data.pas.cell.Q.push(Q);
        Data.pas.cell.p.push(p);
        Data.pas.cell.abs.push(abs);


        Data.pas.drive = d.PAS.Drive;
        Data.pas.cell.micf = [];
        Data.pas.cell.mict = [];
        Data.pas.cell.pd = [];

        // Alot space for the waveform data...
        var pd = [],
            micf = [],
            mict = [];

        // point by point
        for (k = 0; k < d.PAS.CellData[0].MicFreq.Y.length; k++) {
            micf = [k];
            mict = [k];
            pd = [k];
            for (j = 0; j < d.pas.CellData.length; j++) {
                micf.push(d.PAS.CellData[j].MicFreq.Y[j]);
                mict.push(d.PAS.CellData[j].MicTime.Y[j]);
                pd.push(d.PAS.CellData[index].PhotoDiode.Y[j]);


            }

            // Push the data in cell-wise
            Data.pas.cell.micf.push(micf);
            Data.pas.cell.mict.push(mict);
            Data.pas.cell.pd.push(pd);
        }

        return Data;

    }
})();