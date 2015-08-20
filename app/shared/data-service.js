/** This is the main service for retrieving data at regular intervals.
 *
 */

(function() {
  angular.module('main').factory('Data', ['$rootScope', '$http', '$log', 'net',
    function($rootScope, $http, $log, net) {

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
        "filter": true,
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

      /** Clear out the message queue by first copying the msg arrays
       * to a new variable x and then setting the msg array to an
       * empty array.
       * @return {String array} - by value copy of msg queue.
       */
      dataObj.popMsgQueue = function() {

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
      dataObj.crd.cell = [new crdObject()];

      /* Call this to poll the server for data */
      dataObj.getData = function() {
        promise = $http.get(net.address() + 'General/Data')
          .success(function(data, status, headers, config) {

            // Object creation for devices
            for (i = 0; i < alicats.length; i++) {
              if (alicats[i] in data) {
                dataObj[alicats[i]] = data[alicats[i]];
              }

            }

            // Object creation for devices
            for (i = 0; i < ppts.length; i++) {
              if (ppts[i] in data) {
                dataObj[ppts[i]] = data[ppts[i]];
              }

            }
            // Object creation for devices
            for (i = 0; i < vaisalas.length; i++) {
              if (vaisalas[i] in data) {
                dataObj[vaisalas[i]] = data[vaisalas[i]];
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


            dataObj.tObj = updateTime(Number(data.Time));

            var t = dataObj.tObj.getTime();
            dataObj.time.unshift(t);

            dataObj = handlePAS(data, dataObj, shiftData);
            dataObj = handleCRD(data, dataObj, shiftData);
            dataObj.Cabin = data.Cabin;

            $rootScope.$broadcast('dataAvailable');


            if (data.Msg.length > 0) {

              if (dataObj.msg.length > 0) {
                dataObj.msg.concat(data.Msg);
              } else {
                dataObj.msg = data.Msg.slice();
              }

              $rootScope.$broadcast('msgAvailable');
            }
          }).error(function() {
            $rootScope.$broadcast('dataNotAvailable');
            $log.debug(status);
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
    this.stdvTau = [];
    this.etau = [];
    this.max = [];
    this.rd = [];
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

    var t = Data.time[0];

    // Handle the CRD data
    for (var index in d.CellData) {
      if ((Data.crd.cell.length - 1) < index) {
        Data.crd.cell.push(new crdObject());
      }
      if (shift) {
        Data.crd.cell[index].tau.pop();
        Data.crd.cell[index].tau0.pop();
        Data.crd.cell[index].taucorr.pop();
        Data.crd.cell[index].tau0corr.pop();
        Data.crd.cell[index].ext.pop();
        Data.crd.cell[index].extcorr.pop();
        Data.crd.cell[index].stdvTau.pop();
        Data.crd.cell[index].etau.pop();
        Data.crd.cell[index].max.pop();

      }
      Data.crd.cell[index].tau.unshift({
        x: t,
        y: d.CellData[index].extParam.Tau
      });
      Data.crd.cell[index].tau0corr.unshift({
        x: t,
        y: d.CellData[index].extParam.Tau0cor
      });
      Data.crd.cell[index].taucorr.unshift({
        x: t,
        y: d.CellData[index].extParam.taucorr
      });
      Data.crd.cell[index].tau0.unshift({
        x: t,
        y: d.CellData[index].extParam.Tau0
      });
      Data.crd.cell[index].ext.unshift({
        x: t,
        y: d.CellData[index].extParam.ext
      });
      Data.crd.cell[index].extcorr.unshift({
        x: t,
        y: d.CellData[index].extParam.extCorr
      });
      Data.crd.cell[index].stdvTau.unshift({
        x: t,
        y: d.CellData[index].extParam.stdevTau
      });
      Data.crd.cell[index].etau.unshift({
        x: t,
        y: d.CellData[index].extParam.eTau
      });
      Data.crd.cell[index].max.unshift({
        x: t,
        y: d.CellData[index].extParam.max
      });
    }


    return Data;
  }
})();
