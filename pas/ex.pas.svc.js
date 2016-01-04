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
    function pas_svc($rootScope, Data) {

        var PasData = new PasObject();

        $rootScope.$on('dataAvailable', function () {

            PasData = handle_pas(Data, PasData);

            /**
             * @ngdoc event
             * @name pasDataAvailable
             * @eventType broadcast
             * @eventOf main.service:ExPasSvc
             *
             * @description
             * Event that broadcasts the PAS Data has been processed
             * and is available.
             */
            $rootScope.$broadcast('pasDataAvaliable');

        });

        return PasData;
    }

    // Annotations for angular minification
    pas_svc.$inject = ['$rootScope', 'Data'];

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
    function handle_pas(d, pas) {

        var f0 = [d.tObj],
            IA = [d.tObj],
            Q = [d.tObj],
            p = [d.tObj],
            abs = [d.tObj];

        /* Pop all of the ordered arrays if the arrays are of the set length... */
        if (shift) {
            pas.f0.shift();
            pas.IA.shift();
            pas.Q.shift();
            pas.p.shift();
            pas.abs.shift();
        }
        else {
            shift = pas.f0.length >= history ? true : false;
        }

        for (var index in d.data.PAS.CellData) {
            f0.push(d.data.PAS.CellData[index].derived.f0);
            IA.push(d.data.PAS.CellData[index].derived.IA);
            Q.push(d.data.PAS.CellData[index].derived.Q);
            p.push(d.data.PAS.CellData[index].derived.noiseLim);
            abs.push(d.data.PAS.CellData[index].derived.ext);
        }

        pas.f0.push(f0);
        pas.IA.push(IA);
        pas.Q.push(Q);
        pas.p.push(p);
        pas.abs.push(abs);

        pas.drive = d.data.PAS.Drive;

        pas.wvfm.mict = [];
        pas.wvfm.micf = [];
        pas.wvfm.pd = [];

        // point by point
        for (k = 0; k < d.data.PAS.CellData[0].MicFreq.Y.length; k++) {
            var micf = [k], mict = [k], pd = [k];
            for (j = 0; j < d.pas.CellData.length; j++) {
                micf.push(d.data.PAS.CellData[j].MicFreq.Y[j]);
                mict.push(d.data.PAS.CellData[j].MicTime.Y[j]);
                pd.push(d.data.PAS.CellData[index].PhotoDiode.Y[j]);
            }

            // Push the data in cell-wise
            pas.wvfm.micf.push(micf);
            pas.wvfm.mict.push(mict);
            pas.wvfm.pd.push(pd);
        }
        return pas;
    }


})();