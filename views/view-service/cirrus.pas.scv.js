/** This service is used for defining how device data is displayed.
 *  Several devices can be controlled (mass flow controller and temperature
 * 	controllers), but most are just display purposes.  This service will
 * 	regularly check to see if the configuration has been updated and notify
 *  all users of updates.
 */

(function () {
    angular.module('main').factory('cirrus.pas.svc', pasSvc);

    function pasSvc($rootscope, $scope, Data) {

        var pasData = new CrdObject();

        $scope.$on('dataAvailable', function () {

            CrdData = handlePAS(Data.data, CrdData, Data.shift);

            $rootscope.$broadcast('crdDataAvaliable');

        });

        return CrdData;
    }

    /* Annotate for minification. */
    pasSvc.$inject = ['$rootscope', '$scope', 'Data'];

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
            Data.pas.cell.f0.shift();
            Data.pas.cell.IA.shift();
            Data.pas.cell.Q.shift();
            Data.pas.cell.p.shift();
            Data.pas.cell.abs.shift();
        }

        for (var index in d.PAS.CellData) {
            f0.push(d.PAS.CellData[index].derived.f0);
            IA.push(d.PAS.CellData[index].derived.IA);
            Q.push(d.PAS.CellData[index].derived.Q);
            p.push(d.PAS.CellData[index].derived.noiseLim);
            abs.push(d.PAS.CellData[index].derived.ext);
        }

        Data.pas.cell.f0.unshift(f0);
        Data.pas.cell.IA.unshift(IA);
        Data.pas.cell.Q.unshift(Q);
        Data.pas.cell.p.unshift(p);
        Data.pas.cell.abs.unshift(abs);


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