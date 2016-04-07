/** This service is used for defining how device data is displayed.
 *  Several devices can be controlled (mass flow controller and temperature
 *    controllers), but most are just display purposes.  This service will
 *    regularly check to see if the configuration has been updated and notify
 *  all users of updates.
 */

(function () {
    angular.module('main').factory('ExPasSvc', pas_svc);

    var shift = false;
    var history = 300;


    /**
     * @ngdoc service
     * @name main.service:ExPasSvc
     * @requires $rootscope
     * @requires main.service:Data
     * @description
     *
     */

        // Annotations for angular minification
    pas_svc.$inject = ['$rootScope', 'Data'];
    function pas_svc($rootScope, Data) {

        $rootScope.$on('dataAvailable', handle_pas);

        var PasData = new PasObject();

        function PasObject() {
            this.f0 = [];
            this.IA = [];
            this.Q = [];
            this.p = [];
            this.abs = [];
            this.wvfm = {
                micf: [],
                mict: [],
                pd: []

            };
            this.drive = false;

            this.data = [];
            this.set_history = function (n) {
            };
            this.clear = function () {
                this.f0 = [];
                this.IA = [];
                this.Q = [];
                this.p = [];
                this.abs = [];

                shift = false;
            };
        }


        function PasCellData(IA, f0, abs, Q, p, i, loc) {
            this.IA = IA;
            this.f0 = f0;
            this.abs = abs;
            this.Q = Q;
            this.p = p;
            this.maxi = i;
            this.maxloc = loc;
        }

        /**
         * @ngdoc method
         * @name main.service:ExPasSvc#handlePAS
         * @methodOf main.service:ExPasSvc
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
        function handle_pas() {

            var f0 = [Data.tObj],
                IA = [Data.tObj],
                Q = [Data.tObj],
                p = [Data.tObj],
                abs = [Data.tObj];

            /* Pop all of the ordered arrays if the arrays are of the set length... */
            if (shift) {
                PasData.f0.shift();
                PasData.IA.shift();
                PasData.Q.shift();
                PasData.p.shift();
                PasData.abs.shift();
            }
            else {
                shift = PasData.f0.length >= history;
            }

            // This is just for clarification
            var celldata = Data.data.PAS.CellData;
            for (var index in Data.data.PAS.CellData) {

                if (PasData.data.length - 1 < (index)) {
                    PasData.data.push(new PasCellData(celldata[index].derived.IA,
                        celldata[index].derived.f0,
                        celldata[index].derived.ext,
                        celldata[index].derived.noiseLim,
                        celldata[index].derived.Q,
                        celldata[index].derived.max[0],
                        celldata[index].derived.max[1]));
                }
                else {
                    PasData.data[index] = {
                        "IA": celldata[index].derived.IA,
                        "f0": celldata[index].derived.f0,
                        "abs": celldata[index].derived.ext,
                        "p": celldata[index].derived.noiseLim,
                        "Q": celldata[index].derived.Q,
                        "maxi": celldata[index].derived.max[0],
                        "maxloc": celldata[index].derived.max[1]
                    };
                }
                f0.push(celldata[index].derived.f0);
                IA.push(celldata[index].derived.IA);
                Q.push(celldata[index].derived.Q);
                p.push(celldata[index].derived.noiseLim);
                abs.push(celldata[index].derived.ext);
            }

            PasData.f0.push(f0);
            PasData.IA.push(IA);
            PasData.Q.push(Q);
            PasData.p.push(p);
            PasData.abs.push(abs);

            PasData.drive = Data.data.PAS.Drive;

            PasData.wvfm.mict = [];
            PasData.wvfm.micf = [];
            PasData.wvfm.pd = [];

            // point by point
            for (var k = 0; k < celldata[0].MicFreq.Y.length; k++) {
                var micf = [k], mict = [k], pd = [k];
                for (var j = 0; j < celldata.length; j++) {
                    micf.push(celldata[j].MicFreq.Y[k]);
                    mict.push(celldata[j].MicTime.Y[k]);
                    pd.push(celldata[index].PhotoDiode.Y[k]);
                }

                // Push the data in cell-wise
                PasData.wvfm.micf.push(micf);
                PasData.wvfm.mict.push(mict);
                PasData.wvfm.pd.push(pd);
            }

            $rootScope.$broadcast('pasDataAvaliable');
            console.log('Display data now!');
        }

        return PasData;
    }


})();