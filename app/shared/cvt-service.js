/* This service maintains a current value table of control values so that all are properly
 * controls will be properly populated.
 */
(function() {
  angular.module('main').factory('cvt', ['$http', 'net', '$rootScope',
    function($http, net, $rootScope) {

      var cvt = {
        "save": true,
        "ozone": false,
        "filter_pos": true,
        "fctl": []
      };

      /* Indicates whether this is the first time this is called.  If it is, the
       * value is non-zero (TRUE).  On the first successful poll of the server,
       * this value will be set to zero.
       */
      var first_Call = 1;

      cvt.humidifier = {
        high: new humidifier(0.75, 1, 0, 90, false),
        med: new humidifier(0.75, 1, 0, 80, false)
      };

      cvt.pas = new pas($http, net);

      cvt.crd = new crd($http, net);

      cvt.filter_cycle = {
        "period": 360,
        "length": 20,
        "auto": false
      };

      /* TODO: Implement server side CVT communication. */
      /* Check the CVT on the server to make sure nothing has changed.  We will have multiple objects
       * to check and will broadcast based on who has changed.
       */
      cvt.checkCvt = function() {

        promise = $http.get(net.address() + 'General/cvt?force=' + first_Call).then(function(response) {

          // After the first successful call, set this value to false (0).
          first_Call = 0;

          // If the CVT has not changed or this is not the first call, then the
          // CVT object should be empty.
          if (!isEmpty(response.data)) {

            var crd = response.data.crd;
            var pas = response.data.pas;

            /*for (var p in crd){
              if (crd.hasOwnProperty(p)){
                if (cvt.crd[p] != crd[p]){
                  cvt.crd[p] = crd[p];
                }
              }
            }*/
            /* Update the CRD controls */
            cvt.crd.fred = crd.fred;
            cvt.crd.fblue = crd.fblue;
            cvt.crd.dcred = crd.dcred;
            cvt.crd.dcblue = crd.dcblue;
            cvt.crd.kpmt = crd.kpmt;

            /* Update PAS laser controls */
            cvt.pas.las.f0 = pas.las.f0;
            cvt.pas.las.vrange = pas.las.vrange;
            cvt.pas.las.voffset = pas.las.voffset;
            cvt.pas.las.enable = pas.las.enabled;

            /* Update PAS speaker controls */
            cvt.pas.spk.f0 = pas.spk.fcenter;
            cvt.pas.spk.df = pas.spk.df;
            cvt.pas.spk.vrange = pas.spk.vrange;
            cvt.pas.spk.voffset = pas.spk.voffset;
            cvt.pas.spk.auto = pas.spk.cycle;
            cvt.pas.spk.length = pas.spk.length;
            cvt.pas.spk.period = pas.spk.period;
            cvt.pas.spk.pos = pas.spk.enabled;

            /* Let interested parties know the CVT has been updated */
            $rootScope.$broadcast('cvtUpdated');
          }

        });

      };

      cvt.flows = {};

      cvt.flows.updateSP = function(id, sp) {
        cvt.flows[id] = sp;
        $http.get(net.address() + 'General/DevSP?SP=' + sp + '&DevID=' + id);

      };

      return cvt;

    }
  ]);

  /** Object that provides a humidifier interface.
   * @param {float} p - proportional control input
   * @param {float} i - integral control input
   * @param {float} p - derivative control input
   * @param {float} sp - setpoint
   * @param {boolean} en - enable byte
   */
  function humidifier(p, i, d, sp, en) {
    this.p = p;
    this.i = i;
    this.d = d;
    this.sp = sp;
    this.en = en;
  }

  /** This object defines the values associated with the
   * the control of the CRD.
   */
  function crd(_http, _net) {
    var http = _http;
    var net = _net;

    this.net = net;
    // Red laser frequency in Hz
    this.fred = 1000;
    // Red laser duty cycle in %
    this.dcred = 50;
    // Blue laser frequencyu in Hz
    this.fblue = 2000;
    // Blue laser duty cycle in %
    this.dcblue = 50;
    // Red laser gain
    this.kred = 1;
    // Blue laser gain
    this.kblue = 1;
    // PMT gains
    this.kpmt = [0, 0, 0, 0, 0];
    // Blue enable state
    this.eblue = true;
    // Red enable state
    this.ered = true;

    this.setLaserRate = function(index, f) {

      var cmd = 'CRDS_CMD/fblue?Rate=' + f;
      if (index) {
        cmd = 'CRDS_CMD/fred?Rate=' + f;
      }

      http.get(net.address() + cmd);

    };
    this.setEnable = function(index, val) {
      //var cmd =
    };
  }

  /** This object defines all of the functionality required for operating
   * the PAS.  This is the current value table information that will be
   * stored and manipulated during operation.
   * @param $http (object) - this is the http service that is produced by
   *                         angular.  This is used for communicating with the
   *                         server.
   * @param net (object) - local service for retrieving IP and port information.
   */
  function pas(_http, _net) {

    var http = _http;

    var net = _net;

    this.spk = {
      "vrange": 5,
      "voffset": 0,
      "f0": 1350,
      "df": 100,
      "pos": true,
      "auto": false,
      "period": 360,
      "length": 30
    };

    this.las = {
      "vr": [5, 5, 5, 5, 5],
      "voffset": [1, 2, 3, 4, 5],
      "f0": [1351, 1352, 1353, 1354, 1355],
      "modulation": [false, false, false, false, false],
      "enable": [false, false, false, false, false],
    };

    this.las.setf0 = function(f0) {
      this.f0 = f0;

      http.get(net.address() +
        'PAS_CMD/UpdateFr?f0=' + f0.join(','));

    };

    /** Set the laser voltage range.
     * @param {array} - array of voltages in Volts.
     */
    this.las.setVr = function(vr) {
      this.las.vr = vr;

      this.http.get(this.net.address() +
        'PAS_CMD/UpdateVrange?Vrange=' + vr.join(','));

    };

    /** Set the laser voltage offset.
     * @param {array} - voltage offset in volts.
     */
    this.las.setVo = function(vo) {
      this.las.vr = vr;

      this.http.get(this.net.address() +
        'PAS_CMD/UpdateVoffset?Voffset=' + vo.join(','));

    };

    // TODO: Update server side to make sure that the modulation is updated.
    this.las.updateMod = function(mod) {
      this.moduldation = mod;

      var val = [];

      for (i = 0; i < mod.length; i++) {
        val.push(mod ? 1 : 0);
      }

      //$http.get(net.address() +
      //  'PAS_CMD/UpdateVoffset?Voffset=' + val.join(','));

    };

    // TODO: Fix service to handle byte array not single number.
    this.las.updateEnable = function(en) {
      this.enable = en;
    };

    /** Store the current speaker control setting and send the settign to
     * the server.
     * @param {boolean} - false = laser; true = speaker.
     */
    this.spk.updateCtl = function(spk) {
      //this = spk;
      var val = spk.pos ? 1 : 0;

      http.get(net.address() + 'PAS_CMD/SpkSw?SpkSw=' + val);
      http.get(net.address() + 'PAS_CMD/Spk?df=' + this.df + '&f0=' + this.f0);
      http.get(net.address() + 'PAS_CMD/UpdateSpkVparams?Voffset=' + this.voffset +
        '&Vrange=' + this.vrange);

    };

    this.spk.updateCycle = function(auto, p, l) {
      this.auto = auto;
      this.length = l;
      this.period = p;
      var val = auto ? 1 : 0;

      http.get(net.address() + 'PAS_CMD/UpdateSpkCycle?Length=' + l + '&Period=' + p + '&Cycle=' + val);

    };
  }

  function isEmpty(obj) {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop))
        return false;
    }

    return true;
  }

  function filter() {
    this.cycle = {
      "period": 360,
      "length": 20,
      "auto": false
    };
    this.position = true;
  }

})();
