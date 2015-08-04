/* This service maintains a current value table of control values so that all are properly
 * controls will be properly populated.
 */
(function() {
  angular.module('main').factory('cvt', ['$http', 'net',
    function($http, net) {

      // TODO: Add broadcast to let everyone know when the cvt has been updated by the server.
      var cvt = {
        "save": true,
        "ozone": false,
        "filter_pos": true,
        "fctl": []
      };

      /* All controls that must be updated for the PAS
       * operation.
       */
      // TODO: Get rid of hardcoded portion of this...
      cvt.pas = {
        "spk": {
          "vrange": 5,
          "voffset": 0,
          "f0": 1350,
          "df": 100,
          "pos": true,
          "auto": false,
          "period": 360,
          "length": 30
        },
        "las": {
          "vr": [5, 5, 5, 5, 5],
          "voffset": [1, 2, 3, 4, 5],
          "f0": [1351, 1352, 1353, 1354, 1355],
          "modulation": [false, false, false, false, false],
          "enable": [false, false, false, false, false]
        }
      };

      cvt.crd = {
        "fred": 1000,
        "dcred": 50,
        "fblue": 2000,
        "dcblue": 50,
        "kred": 1,
        "kblue": 1,
        "kpmt": [0, 0, 0, 0, 0],
        "eblue": true,
        "ered": true
      };

      cvt.filter_cycle = {
        "period": 360,
        "length": 20,
        "auto": false
      };

      // TODO: Encapsulate all functionality in individual objects...

      /** Set the laser modulation frequency for each cell.
       * @param {array} - array of frequencies in Hz.
       */
      cvt.pas.las.setf0 = function(f0) {
        cvt.pas.las.f0 = f0;

        $http.get(net.address() +
          'PAS_CMD/UpdateFr?f0=' + f0.join(','));

      };

      /** Set the laser voltage range.
       * @param {array} - array of voltages in Volts.
       */
      cvt.pas.las.setVr = function(vr) {
        cvt.pas.las.vr = vr;

        $http.get(net.address() +
          'PAS_CMD/UpdateVrange?Vrange=' + vr.join(','));

      };

      /** Set the laser voltage offset.
       * @param {array} - voltage offset in volts.
       */
      cvt.pas.las.setVo = function(vo) {
        cvt.pas.las.vr = vr;

        $http.get(net.address() +
          'PAS_CMD/UpdateVoffset?Voffset=' + vo.join(','));

      };

      // TODO: Update server side to make sure that the modulation is updated.
      cvt.pas.las.updateMod = function(mod){
        cvt.pas.las.moduldation = mod;

        var val = [];

        for (i = 0; i < mod.length; i++){
          val.push(mod?1:0);
        }

        //$http.get(net.address() +
        //  'PAS_CMD/UpdateVoffset?Voffset=' + val.join(','));

      };

      // TODO: Fix service to handle byte array not single number.
      cvt.pas.las.updateEnable = function(en){
        cvt.pas.las.enable = en;
      }

      /** Store the current speaker control setting and send the settign to
       * the server.
       * @param {boolean} - false = laser; true = speaker.
       */
      cvt.pas.spk.updateCtl = function(spk) {
        cvt.pas.spk = spk;
        var val = spk.pos ? 1 : 0;

        $http.get(net.address() + 'PAS_CMD/SpkSw?SpkSw=' + val);
        $http.get(net.address() + 'PAS_CMD/Spk?df=' + cvt.pas.spk.df + '&f0=' + cvt.pas.spk.f0);
        $http.get(net.address() + 'PAS_CMD/UpdateSpkVparams?Voffset=' + cvt.pas.spk.voffset +
          '&Vrange=' + cvt.pas.spk.vrange);

      };

      cvt.pas.spk.updateCycle = function(auto, p, l) {
        cvt.pas.spk.auto = auto;
        cvt.pas.spk.length = l;
        cvt.pas.spk.period = p;
        var val = auto ? 1 : 0;

        $http.get(net.address() + 'PAS_CMD/UpdateSpkCycle?Length=' + l + '&Period=' + p + '&Cycle=' + val);

      };

      /* TODO: Implement server side CVT communication. */
      /* Check the CVT on the server to make sure nothing has changed.  We will have multiple objects
       * to check and will broadcast based on who has changed.
       */
      cvt.checkCvt = function() {
        promise = $http.get(net.address() + 'General/cvt').success(function(data, status, headers, config) {

        });
      };

      return cvt;

    }
  ]);
})();
