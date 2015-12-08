/* Start with an IIFE */
(function(){
	angular.module('main',['ngRoute', 'ui.bootstrap', 
                           'ui.bootstrap.contextMenu', 'dygraph', 
                           'cirrus.ui.ibutton', 'cirrus.ui.inumeric', 
                           'cirrus.ui.string']);
})();

/** This service handles network settings that can be set in the sidebar.
 *  This communicates the settings in the sidebar to the other portions of
 *  the application that require the ip address and port.
 *
 *  This application stores the settings in local storage so that they are
 *  restored on refresh.
 */

(function() {
	angular.module('main').factory('net', function() {

		/* On power up, check for the key 'ip' in the local cache.  If it does not
		 * exist, add the key and set it to the value below.
		 */
		if (!localStorage.ip) {
			localStorage.ip = "192.168.0.73";
		}

		/* On power up, check for the key 'port' in the local cache.  If it does not
		 * exist, add the key and set it to the value 8001 (the debug port).
		 */
		if (!localStorage.port) {
			localStorage.port = "8001";
		}

		return {
			ip : localStorage.ip,
			port : localStorage.port,
			getNetworkParams : function() {
				return {
					"ip" : this.ip,
					"port" : this._port
				};
			},

			/** Setter for the IP Address and port of the server.  This function
			  * will cache the data using an HTML5 localStorage call.
				*/
			setNetworkParams : function(ip, port) {
				this._ip = ip;
				this.port = port;
				localStorage.ip = ip;
				localStorage.port = port;
			},

			/** Set the IP address of the local server.  Cache the address using
			  * HTML5 localStorage.
				* @param {string} - IP address in xxx.xxx.xxx.xxx form.
				*/
			setIP : function(ip) {
				this.ip = ip;
				localStorage.ip = ip;
			},

			/** Set the port on which we are talking to the server.  Cache the port
			  * using HTML5 localStorage.
				* @param {integer} - Value for port.
				*/
			setPort : function(port) {
				this.port = port;
				localStorage.port = port;
			},

			/** Use this function to return the address of the web service.
			  * @return {string} - address in format 'http://[IP]:[Port]/xService/'
				*/
			address : function() {
				return 'http://' + this.ip + ':' + this.port  + '/xService/';
			}
		};
	});

})();

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
        "fctl": [],
        "power":{
          "TEC": false,
          "Laser": false,
          "Pump": false,
          "O3Gen": false,
          "Denuder":false
        }
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

            cvt.filter_cycle.period = response.data.filter.period;
            cvt.filter_cycle.length = response.data.filter.length;
            cvt.filter_cycle.auto = response.data.filter.auto;

            var power = Number(response.data.general.power).toString(2);

            while (power.length < 5){
              power = "0" + power;

            }

            cvt.power.Pump = power[0]=='1'?true:false;
            cvt.power.O3Gen = power[1]=='1'?true:false;
            cvt.power.Denuder = power[2]=='1'?true:false;
            cvt.power.Laser = power[3]=='1'?true:false;
            cvt.power.TEC = power[4]=='1'?true:false;

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

      cvt.updatePS = function(val){
        $http.get(net.address() + 'General/PowerSupply?val=' + val);
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

/** This file conigures the routing for the main page.  These are the views which
 * Will be displayed when the user clicks a heading in the navigation menu.
 *
 * Routing requires the inclusion of 'angular-route.js' file and the module ngRoute.
 */

(function(){
	angular.module('main')
	.config(['$routeProvider',
	function($routeProvider){
		$routeProvider
		.when('/CRDS',{templateUrl:'views/crds.html'})
		.when('/PAS',{templateUrl:'views/pas.html'})
		.when('/O3',{templateUrl:'views/cals/ozone.html'})
		.when('/', {templateUrl:'views/main.html'})
		.when('/Flows', {templateUrl:'views/flows.html'})
		.when('/Temperature', {templateUrl:'views/temperature.html'})
		.when('/Humidifier', {templateUrl:'views/humidifier.html'})
		.when('/Common', {templateUrl:'views/common.html'})
		.when('/Config', {templateUrl:'views/config.html'});
	}]);
})();

/** This is the main controller that is sucked into the entire program (this is placed
 * 	in the body tag).  The main thing that it will do is call the data service at regular
 * 	intervals which will broadcast the data when called.
 */

(function() {
	angular.module('main').controller('MainCtlr', ['Data', '$scope', '$interval', 'cvt',
	function(Data, $scope, $interval, cvt) {

		/* Call the data service at regular intervals; this will force a regular update of the
		 * data object.
		 */
		$interval(function() {
			Data.getData();
			cvt.checkCvt();
			//deviceCfg.checkCfg();
		}, 1000);

	}]);
})();

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
            dataObj.pas.cell = new pasData();
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
(function() {
	angular.module('main').directive('msg', msg_);

	function msg_() {
		return {
			restrict : 'E',
			scope : {},
			templateUrl : 'app/Messages/msg.html'
		};
	}

})(); 

(function() {
	angular.module('main').controller('msgCtlr', ['Data', '$scope',
	function(Data, $scope) {

    $scope.msgs = [];
		$scope.error_code = [];

		$scope.num_codes = [0,0,0];

    $scope.$on('msgAvailable', function(){

			var x = Data.popMsgQueue();

			for (i =0; i < x.length; i++){
				$scope.msgs.push(x[i]);

				if (x[i].search('ERROR') > 0){
					$scope.error_code.push(2);
					$scope.num_codes[2] += 1;
				}
				else if (x[i].search('WARNING') > 0) {
					$scope.error_code.push(1);
					$scope.num_codes[1] += 1;
				}
				else{
					$scope.error_code.push(0);
					$scope.num_codes[0] += 1;
				}
			}

			$scope.clrMsgs = function(){
				$scope.num_codes = [0,0,0];
				$scope.msgs = [];
			};



    });


	}]);
})();

(function() {
	angular.module('main')
	.controller('Sidebar', ['$scope','$http', 'Data', 'net', function($scope, $http, Data, net) {

		$scope.save = 1;
		$scope.filter = true;
		$scope.time = "Not connected";
		$scope.connected = false;
		$scope.o3On = false;
		$scope.cabin = false;
		$scope.pumpBlocked = false;
		$scope.impBlocked = false;
		$scope.interlock = false;


		// Initially time is not available
		$scope.time = "Not Connected";

		$scope.connected= false;


		$scope.$on('dataAvailable', function(){

			$scope.filter = Data.filter;
			$scope.cabin = Data.Cabin;

			/* TODO: Have an issue with saving data - doesn't appear to be returning properly.
			 * The save variable should be in the CVT rather than in the data object.
			 *
			 */
			//$scope.save = Data.save;
			$scope.connected = true;
		});

		$scope.$on('dataNotAvailable', function(){
			$scope.connected = false;
		});

		$scope.saveData = function() {

			$scope.save = !$scope.save;

			// TODO: Check to see if this is correct.
			var s = $scope.save ? 1:0;

			$http.get(net.address() + 'General/Save?save='+s.toString());
		};

		$scope.setFilter = function() {

			$scope.filter = !$scope.filter;
			var x = $scope.filter?1:0;
			$http.get(net.address() + 'General/UpdateFilter?State='+x);

		};

		/** Flip the switch cabin switch.
		  */
		$scope.setCabin = function(){
			$scope.cabin = !$scope.cabin;
			var x = $scope.cabin?1:0;
			$http.get(net.address() + 'General/Cabin?Cabin='+x);
		};

		$scope.stop = function(){
			$http.get(net.address() + 'General/Stop');
		};

	}]);
})();

(function() {
    angular.module('main')
      .controller('mrAlicatConfigCtlr', ['$scope', function($scope) {
          
          
          /* This will contain the template for the list of Alicat
           * devices.
           */
          function ListEntry(addr, id){
              this.address = addr;
              this.id = id;
          }
          
          $scope.entry = new ListEntry("A","default");
          
          /* Store devices here */
          $scope.devices = [];
          
          $scope.addDevice = function(){
              $scope.devices.push(new ListEntry($scope.entry.address, $scope.entry.id));
              
          };
          
          $scope.rmDevice = function(){
              // Not implemented
          };
          
      }]);
})();
(function() {
    angular.module('main')
      .controller('footerCtlr', ['$scope', 'Data', function($scope, Data) {

          $scope.filter = true;
          $scope.time = "Not connected";
          $scope.connected = false;
          $scope.o3On = false;
          $scope.cabin = false;
          $scope.pumpBlocked = false;
          $scope.impBlocked = false;
          $scope.interlock = false;

          $scope.num_codes = [0, 0, 0];


          // Initially time is not available
          $scope.time = "Not Connected";


          $scope.$on('dataAvailable', function() {

            /* Populate the variables pertinent to the sidebar */
            $scope.time = Data.tObj.toLocaleTimeString('en-US', {
              hour12: false
            });
            $scope.filter = Data.filter;
            $scope.cabin = Data.Cabin;

            /* TODO: Have an issue with saving data - doesn't appear to be returning properly.
             * The save variable should be in the CVT rather than in the data object.
             *
             */
            //$scope.save = Data.save;
            $scope.connected = true;
          });

          /* This is a broadcast from the data service.  If there is a new message,
           * we will pop the message queue and log the fact that there was a
           * message.
           * TODO: Need place to put messages.
           */
          $scope.$on('msgAvailable', function() {

              var x = Data.popMsgQueue();

              for (i = 0; i < x.length; i++) {

                if (x[i].search('ERROR') > 0) {
                  $scope.num_codes[2] += 1;
                } else if (x[i].search('WARNING') > 0) {
                  $scope.num_codes[1] += 1;
                } else {
                  $scope.num_codes[0] += 1;
                }
              }
            });


            $scope.$on('dataNotAvailable', function() {
              $scope.connected = false;
            });


          }]);
      })();

(function() {
  angular.module('main').controller('power', ['$scope', 'cvt',
    function($scope, cvt) {
      $scope.power = cvt.power;



      $scope.toggle = function(id) {
        // Flip the bit
        $scope.power[id] = !$scope.power[id];

        //Sketch out space for the values used below
        var index = 0;
        var num = 0;
        var val = 0;

        /* Convert the array of booleans for the power to
         * a decimal integer.  We will send this decimal
         * integer back for the power.
         */
        for (var property in $scope.power) {
          if ($scope.power.hasOwnProperty(property)) {
            val = $scope.power[property] ? 1 : 0;
            num += Math.pow(2, index) * val;
            index += 1;
          }

        }
        cvt.updatePS(num);

      };
    }
  ]);
})();

(function () {
    angular.module('main')
        .controller('mrConfigCtlr', ['$scope', '$http', 'Data', 'net', function ($scope, $http, Data, net) {

            $scope.network = {"ip": net.ip,
                         "port":net.port};

            $scope.changeIP = function () {
                net.setIP($scope.network.ip);
            };
            $scope.changePort = function () {
                net.setPort($scope.network.port);
            };
            
            $scope.filter = {
                pos:true,
                auto:true,
                len: 30,
                per: 360,
                updatePos: function(){
                    this.pos = !this.pos;
                    console.log("updating filter position");
                },
                updateAuto: function(){
                    auto = !auto;
                    console.log("update filter auto");
                }
            };
            
            $scope.file = {
                folder: "exscalabar\\data",
                main: "u:\\",
                mirror: "v:\\",
                prefix: "ex_",
                ext: ".txt",
                max:10,
                save:true
            }



	}]);
})();

(function(){
  angular.module('main').controller('filter', ['$scope', 'net', '$http', 'cvt',
  'Data', function($scope, net, $http, cvt, Data){

    /* Filter cycle consists of a period that defines the time in seconds
     * between which the filter is cycled to true, length of time in seconds
     * that the filter is on and a boolean indicating whether the syste is set
     * to cycle.
     */

    $scope.cycle = {
      "auto": cvt.filter_cycle.auto,
      "period":cvt.filter_cycle.period,
      "length":cvt.filter_cycle.length
    };

    $scope.position = cvt.filter_pos;


    $scope.tremain = Data.filter.tremain;
    $scope.state = Data.filter.state;

    $scope.updateCycle = function(){
      var val = $scope.cycle.auto ? 1 : 0;
      $http.get(net.address() + 'General/FilterCycle?Length=' +
      $scope.cycle.length + '&Period=' + $scope.cycle.period + '&auto=' + val);
      cvt.filter_cycle = {"period": $scope.cycle.period,
                          "length":$scope.cycle.length,
                          "auto": $scope.cycle.auto};

    };

    $scope.updateFilter = function(){
      var val = $scope.position ? 1:0;
      $http.get(net.address() + 'General/UpdateFilter?State=' + val);
      cvt.pos = $scope.position;

    };

    $scope.updateAuto = function() {
			$scope.cycle.auto = !$scope.cycle.auto;
			$scope.updateCycle();
		};

    $scope.$on('dataAvailable', function(){
      $scope.tremain = Data.filter.tremain;
      $scope.state = Data.filter.state;
    });

    $scope.$on('cvtUpdated', function(){
      $scope.cycle = {
        "auto": cvt.filter_cycle.auto,
        "period":cvt.filter_cycle.period,
        "length":cvt.filter_cycle.length
      };
    });
}]);
})();

(function () {
    angular.module('main').controller('crd', ['$scope', 'cvt', 'Data',
    function ($scope, cvt, Data) {

            //$scope.rd = {};
            $scope.someText = "hello";
            $scope.testnum = 2.55673e-12;

            // Lasers have three inputs
            var laserInput = function (_rate, _DC, _k, enabled, ID) {
                this.rate = _rate;
                this.DC = _DC;
                this.k = _k;
                this.en = enabled;
                this.id = ID;
            };

            $scope.setRate = function (i, f) {
                cvt.crd.setLaserRate(i, f);

            };

            /* Variable for laser control binding; first element is related to blue,
             * second to red.
             */
            $scope.laser_ctl = [
        new laserInput(cvt.crd.fblue, cvt.crd.dcblue, cvt.crd.kblue, cvt.crd.eblue, "Blue Laser"),
        new laserInput(cvt.crd.fred, cvt.crd.dcred, cvt.crd.kred, cvt.crd.ered, "Red Laser")
      ];

            $scope.pmt = cvt.crd.kpmt;

            $scope.resize = function () {
                //$(window).trigger('resize');
                window.dispatchEvent(new Event('resize'));
            };

            $scope.purge = {
                pos: false,
                flow: 0.16,
                setValve: function () {
                    $scope.purge.pos = !$scope.purge.pos;

                },
                setFlow: function () {

                }
            };

            $scope.data = Data.crd;

            // TODO: Implement enabled functionality
            $scope.setEnable = function (index) {

                $scope.laser_ctl[index].en = !$scope.laser_ctl[index].en;
                var enabled = $scope.laser_ctl[index].en;
                switch (index) {
                case 0:
                    cvt.crd.eblue = enabled;
                    break;
                case 1:
                    cvt.crd.ered = enabled;
                    break;
                default:

                }

            };

            // Space data - allows us to display the dygraph plot with no data if not connected
            $scope.ringdownAvg = [[0, NaN, NaN, NaN, NaN, NaN]];
            $scope.pData = [[0, NaN, NaN, NaN, NaN, NaN]];
            // $scope.ringdownFit = [];

            // dygraph options object
            $scope.options = {
                title: 'Ringdown Data',
                ylabel: 'Ringdown Magnitude (au)',
                labels: ["t", "Cell 1", "Cell 2", "Cell 3", "Cell 4", "Cell 5"],
                legend: 'always'

            };

            $scope.optPData = {
                title: "CRD Data",
                ylabel: "data",
                labels: ["t", "Cell 1", "Cell 2", "Cell 3", "Cell 4", "Cell 5"],
                legend: 'always'
            };

            $scope.pDataCMOptions = [
                ['tau', function () {
                    $scope.optPData.ylabel = "tau (us)";
            }],
                ["tau'",
                 function () {
                        $scope.optPData.ylabel = "tau' (us)";
            }],
                ['stdev', function () {}]
            ];

            /* Listen for broadcasts from the DATA SERVICE */
            $scope.$on('dataAvailable', function () {

                $scope.data = Data.crd;

                var data = updateCRD(Data.crd);

                $scope.ringdownAvg = data.rdAvg;
                $scope.pData = Data.crd.cell.max;

            });
                    }
                    ]);

    function updateCRD(d) {
        var dataOut = {
            "tauData": [],
            "rdFit": [],
            "rdAvg": []
        };

        for (i = 1; i < d.cell.tau[0].length; i++) {
            dataOut.tauData.push([d.cell.tau[0][i], d.cell.tau0[0][i], d.cell.taucorr[0][i], d.cell.tau0corr[0][i], d.cell.ext[0][i]]);
        }
        dataOut.rdAvg = d.cell.avg_rd;

        return dataOut;

    }
})();
(function () {
    angular.module('main').controller('pas', ['$scope', 'net', '$http', 'cvt', 'Data', '$log',
    function ($scope, net, $http, cvt, Data, $log) {

            $scope.data = Data.pas;

            var selPlot = 0;

            $scope.pData = [[0, NaN, NaN, NaN, NaN, NaN]];

            $scope.options = {
                title:'PAS Data',
                ylabel: "IA",
                labels: ["t", "Cell 1", "Cell 2", "Cell 3", "Cell 4", "Cell 5"],
                legend: 'always'
            };

            $scope.pDataCMOptions = [
                ['IA', function () {
                    $scope.options.ylabel = "IA";
                    selPlot = 0;

            }],
                ["f0",
                 function () {
                        $scope.options.ylabel = "f0 (Hz)";
                        selPlot = 1;
            }],
                ['Q', function () {
                    $scope.options.ylabel = "Q";
                    selPlot = 2;
                }]
            ];

            // Listen for data
            $scope.$on('dataAvailable', function () {

                $scope.data = Data.pas;

                switch (selPlot) {
                case 0:
                    $scope.pData = $scope.data.cell.IA;
                    break;
                case 1:
                    $scope.pData = $scope.data.cell.f0;
                    break;
                case 2:
                    $scope.pData = $scope.data.cell.Q;
                    break;
                case 3:
                    $scope.pData = $scope.data.cell.p;
                    break;
                case 4:
                    $scope.pData = $scope.data.cell.abs;
                    break;
                }
            });




    }
  ]);
})();
(function() {
  angular.module('main').controller('pasSpk', ['$scope', 'cvt', 'Data',
    function($scope, cvt, Data) {

      var maxVrange = 10;
      var maxVoffset = 5;

      $scope.speaker = cvt.pas.spk;

      var flim = {
        "high": 3000,
        "low": 500
      };

      $scope.$on('cvtUpdated', function(){

        $scope.speaker = cvt.pas.spk;


      });

      /** Set the speaker position and update the CVT. */
      $scope.setPos = function() {
        $scope.speaker.pos = !$scope.speaker.pos;
        cvt.pas.spk.updateCtl($scope.speaker);
      };


      $scope.updateSpkV = function() {

        /* Allow the user to enter data that is outside of the determined range but
         * correct it if it goes beyond the limits above.
         */

        if ($scope.speaker.vrange > maxVrange) {
          $scope.speaker.vrange = maxVrange;
        } else {
          if ($scope.speaker.vrange < 0) {
            $scope.speaker.vrange = 0;
          }
        }

        if ($scope.speaker.voffset > maxVoffset) {
          $scope.speaker.voffset = maxVoffset;
        } else {
          if ($scope.speaker.voffset < 0) {
            $scope.speaker.voffset = 0;
          }
        }
        cvt.pas.spk.updateCtl($scope.speaker);
      };

      $scope.updateSpkF = function() {
        if ($scope.speaker.f0 > flim.high) {
          $scope.speaker.f0 = flim.high;
        } else {
          if ($scope.speaker.f0 < flim.low) {
            $scope.speaker.f0 = flim.low;
          }
        }
        cvt.pas.spk.updateCtl($scope.speaker);
      };

      $scope.updateCycle = function() {
        cvt.pas.spk.updateCycle($scope.speaker.auto,
          $scope.speaker.period, $scope.speaker.length);
      };

      $scope.updateAuto = function() {
        $scope.speaker.auto = !$scope.speaker.auto;
        $scope.updateCycle();
      };
    }
  ]);
})();

(function() {
  angular.module('main').controller('pasLas', ['$scope', 'cvt', 'Data',
    function($scope, cvt, Data) {

      $scope.lasCtl = [];

      /** NOTE: This loop initializes the laser controls based on what is
       * in the CVT.  If the initial speaker setting is TRUE, then
       * the value of f0 will be overrun IMMEDIATELY.
       */
      for (i = 0; i < cvt.pas.las.vr.length; i++) {

        $scope.lasCtl.push(new lasSet(cvt.pas.las.vr[i],
          cvt.pas.las.voffset[i],
          cvt.pas.las.f0[i],
          cvt.pas.las.modulation[i],
          cvt.pas.las.enable[i]));

      }

      // Listen for data
      $scope.$on('dataAvailable', function() {

        /* If the current position of the speaker is TRUE (speaker is on),
         * populate the modulation frequencies in the laser controls with
         * the current resonant frequency measured by the microphone.
         */
        if (Data.pas.drive) {
          for (i = 0; i < Data.pas.cell.length; i++) {
            $scope.lasCtl[i].f0 = $scope.data.cell[i].f0[0].y;
          }
        }
      });

      $scope.$on('cvtUpdated', function(){

        // Update the laser controls if something has set them on the
        // server-side.
        for (i = 0; i < cvt.pas.las.vr.length; i++) {

          $scope.lasCtl[i].vr = cvt.pas.las.vr[i];
          $scope.lasCtl[i].vo = cvt.pas.las.voffset[i];
          $scope.lasCtl[i].f0 =   cvt.pas.las.f0[i];
          $scope.lasCtl[i].mod =   cvt.pas.las.modulation[i];
          $scope.lasCtl[i].en =   cvt.pas.las.enable[i];

        }

      });

      $scope.updateMod = function(i) {
        $scope.lasCtl[i].modulation = !$scope.lasCtl[i].modulation;

        var x = [];
        for (j = 0; j < $scope.lasCtl.length; j++) {
          x.push($scope.lasCtl[j].modulation);
        }
        cvt.pas.las.updateMod(x);
      };

      /* Update the laser voltage range for the lasers in the current value
       * table.
       */
      $scope.updateVr = function() {
        var x = [];
        for (i = 0; i < $scope.lasCtl.length; i++) {
          x.push($scope.lasCtl[i].Vrange);
        }
        cvt.pas.las.setVr(x);
      };

      /* Update the voltage offset in the current value table. */
      $scope.updateVo = function() {
        var x = [];
        for (i = 0; i < $scope.lasCtl.length; i++) {
          x.push($scope.lasCtl[i].Voffset);
        }
        cvt.pas.las.setVo(x);
      };

      $scope.updatef0 = function() {
        var x = [];
        for (i = 0; i < $scope.lasCtl.length; i++) {
          x.push($scope.lasCtl[i].f0);
        }
        cvt.pas.las.setf0(x);
      };

      $scope.updateEnable = function(i) {

        $scope.lasCtl[i].lasEn = !$scope.lasCtl[i].lasEn;
        var x = [];
        for (i = 0; i < $scope.lasCtl.length; i++) {
          x.push($scope.lasCtl[i].lasEn);
        }
        cvt.pas.las.updateEnable(x);

      };

    }
  ]);

  /** PAS Laser settings object.  The settings are
   * * Vrange = voltage range in volts of laser modulation
   * * Voffset = voltage offset in volts for laser modulation.
   * * f0 = modulation frequency in Hz
   * * modulation = boolean representing sine (false) or square (true)
   */
  function lasSet(vr, vo, f0, mod, en) {
    this.Vrange = vr;
    this.Voffset = vo;
    this.f0 = f0;
    this.modulation = mod;
    this.lasEn = false;
  }

})();

(function() {
	angular.module('main').controller("flowCtlr", ['$scope', "Data", "cvt",
	function($scope, Data, cvt) {

		// Stores the position in the controller array
		var i = -1;

		//Array that will hold the setpoints...
		$scope.setpoints = [];

		function mData(){
			this.P = 0;
			this.T = 0;
			this.Q = 0;
			this.Q0 = 0;
			this.Q = 0;
		}

		function flowDevice(label, id, t, isCtl, sp){
			this.label = label;
			this.ID = id;
			this.type = t;
			this.isController = isCtl;
			this.data = new mData();

			// TODO: This should be set by the CVT based on i
			this.sp = sp;

			// If this device is not a controller, the index will be -1...
			this.index = -1;

			/* If this device is a controller, push the new setpoint into the
			 * setpoint array and update the index.
			 * REALLY, THIS SHOULD BE PURELY A FUNCTION OF THE CVT AND SHOULD
			 * NOT BE CONTROLLED BY THIS HERE - THIS IS TEMPORARY....
			 */

			// TESTED AND FUNCTIONAL
			if (isCtl){
				$scope.setpoints.push(sp);
				// Update the global index
				i += 1;

				// Update the instance controller index...
				this.index = i;
			}
		}

		/* TODO: This is hard coded now but should not be.  IDs should correspond to config
		 * file IDs.
		 */

		$scope.Devices = [new flowDevice("Dry Red", "TestAlicat", "mflow", true,0),
							new flowDevice("Dry Blue", "dryBlue","mflow", false,0),
							new flowDevice("Denuded Blue", "deBlue","mflow", false,0),
							new flowDevice("Denuded Red", "deRed","mflow", true,0),
							new flowDevice("PAS Green", "pGreen","mflow", false,0),
							new flowDevice("CRD High Humidified", "crdHighHum","mflow", false,0),
							new flowDevice("CRD Low Humidified", "crdLowHum","mflow", false,0),
							new flowDevice("Mirror Purge Flow", "crdMirror","mflow", false,0),
							new flowDevice("Pressure Controller", "pCtl","pressure", false,0),
							new flowDevice("O3 Bypass", "o3Bypass", "mflow", true,0),
						 ];

		/* Update the CVT - the CVT should call the server... */
		$scope.updateSP = function(d){
			cvt.flows.updateSP(d.ID, d.sp);
		};

		$scope.$on('dataAvailable', function(){
			for (j = 0; j < $scope.Devices.length; j++){
				// If the mass flow controller is present in the data...
				if ($scope.Devices[j].ID in Data){

					$scope.Devices[j].P = Data[$scope.Devices[j].ID].P;
					$scope.Devices[j].T = Data[$scope.Devices[j].ID].T;
					$scope.Devices[j].Q = Data[$scope.Devices[j].ID].Q;
					$scope.Devices[j].Q0 = Data[$scope.Devices[j].ID].Q0;
					$scope.Devices[j].Qsp = Data[$scope.Devices[j].ID].Qsp;

				}
			}
		});
	}]);
})();

(function() {
  angular.module('main').controller('humidifier', ['$scope', 'cvt', 'Data',
    function($scope, cvt, Data) {

      $scope.high = cvt.humidifier.high;
      $scope.med = cvt.humidifier.med;

      $scope.updateMedEn = function(){
        $scope.med.en = !$scope.med.en;
        cvt.humidifier.med = $scope.med.en;
      };
      $scope.updateHighEn = function(){
        $scope.high.en = !$scope.high.en;
        cvt.humidifier.high = $scope.high.en;
      };

    }
  ]);
})();

(function() {
	angular.module('main').controller('startCal', ['$scope', '$http', 'net', 'cvt', 
	function($scope, $http, net, cvt) {

		$scope.cal = cvt.ozone;

		/* This is the primary function of this controller.  When the button is hit,
		 * flip the switch on the calibration button so that it indicates the user can 
		 * Start a cal or that a cal is currently running.  We will also send the current cal
		 * state for storage in the cvt AND send the request to the server.
		 */
		// TODO: Test this on the server side.
		$scope.startCalibration = function() {
			$scope.cal = !$scope.cal;
			var calState = $scope.cal ? 1 : 0;
			cvt.ozone = $scope.cal;
			$http.get(net.address() + 'General/ozone?start=' + calState.toString());
		};
	}]);

})();

/** This controller is placed on the O3 cal page and defines what will happen
 * 	when a user double clicks on a table element.
 *
 * 	When the element containing this controller is first displayed, the values
 * 	in the attribute table_vals will be used to populate the canned table for
 * 	sequence building using the ng-repeat directive.
 *
 * 	When the user double clicks on a row, the controller will call the tableService
 * 	setTab method.  This in turn updates the attributes of that service with the ID
 * 	of the row that was clicked.  That ID is then broadcast and picked up by the
 * 	tableInput-ctlr which populates the table for the sequence with a default value
 * 	for the selected element.
 */

(function() {
	angular.module('main')
	.controller('O3Table', ['$scope', 'tableService', function($scope, tableService) {

		/* Contains the entries that will go into the canned table. */
		$scope.table_vals = [ {
			"id": "Wait",
			"step" : "Wait",
			"descr" : "Set a wait time in the ozone cal in seconds"
		},
		{
			"id": "Filter",
			"step" : "Filter",
			"descr" : "Boolean that sets the filter state."
		},
		{
			"id": "Speaker",
			"step" : "Speaker",
			"descr" : "Boolean that sets the speaker state."
		},
		{
			"id": "O2-Valve",
			"step" : "O2 Valve",
			"descr" : "Boolean that sets the O2 valve position."
		},
		{
			"id": "O3-Valve",
			"step" : "O3 Valve",
			"descr" : "Boolean that sets the O3 valve state."
		},
		{
			"id": "O3-Generator",
			"step" : "O3 Generator",
			"descr" : "Boolean that sets the O3 generator state."
		},
		{
			"id": "QO2",
			"step" : "QO2",
			"descr" : "Numeric to set the oxygen flow rate"
		}];

		/* Handle row double clicks */
		$scope.clickRow = function(row){

			/* tableService will broadcast the the listeners the current ID */
			tableService.setTab(row.id.toString());

		};
	}]);
})();

/* This service returns the current value of a selected portion
 * of the calibration building table.  This service is required 
 * by the O3Table controller.  Load this service first before 
 * loading the O3Table controller.
 */

(function(){
	angular.module('main')
	.factory('tableService', ["$rootScope", function($rootScope){
		var tabService = {
			curTab: '',
			getTab: function(){return this.curTab;},
			setTab: function(tab){
				this.curTab = tab;
				$rootScope.$broadcast('handleBroadcast');
				}
		};
		
		return tabService;
	}]);
	
})();

(function(){
	angular.module('main')
	.factory('SaveData', function(){
		var savedData = {
			data: [],
			setData: function(d){
				this.data = d;
			},
			getData:function(){
				return this.data;
			}
		};
		return savedData;
	});
})();

/* This controller handles saving calibration data */

(function() {
	angular.module('main').controller('Save', ['$scope', 'SaveData', '$http','net',
	function($scope, SaveData, $http, net) {

		$scope.cal_file = "default";
		$scope.save = function() {
			var xml = '<?xml version="1.0" encoding="utf-8"?>\r\n<OZONE>\r\n';
			SaveData.getData().forEach(function(entry) {
				xml += "\t<" + entry.id + ">" + entry.val + '</' + entry.id + '>\r\n';
			});

			xml += "</OZONE>";

			/* Send the calibration profile as XML data. */
			$http({
				method : 'POST',
				url : net.address() + 'Calibration/saveCalFile?file_name=' + $scope.cal_file + ".xml",
				data : xml,
				headers : {
					"Content-Type" : 'application/x-www-form-urlencoded'
				}
			});

		};
	}]);
})();

(function() {
	angular.module('main')
	.controller('InputTable', ['$scope', 'tableService', 'SaveData',
	function($scope, tableService, SaveData) {

		$scope.data = [];

		/* Handle the broadcast from the buildCal-service */
		$scope.$on('handleBroadcast', function() {

			// The ID from the cal table
			var tID = tableService.getTab();
			// Value of the
			var val = "";

			/* The following switch statement defines the default values */
			switch (tID) {
			case "O3-Valve":
			case"O2-Valve":
			case"O3-Generator":
			case "Filter":
				val = 'FALSE';
				break;
			case "Wait":
			case "Speaker":
				val = "20";
				break;

			case "QO2":
				val = "100";
				break;
			default:
			}

			// Push the data into an array
			$scope.data.push({
				"id" : tID,
				"val" :val
			});
			SaveData.setData($scope.data);
		});

	}]);
})();

(function() {
	angular.module('main').directive('sidebar', sidebar);

	function sidebar() {
		return {
			restrict : 'E',
			scope : {},
			templateUrl : 'app/sidebar/side.html'
		};
	}

})();

(function() {
  angular.module('main').factory('navservice', ['$http', 'net', 'cvt',
    function($http, net, cvt) {

      var nav = {};
      nav.stop = function() {
        $http.get(net.address() + 'General/Stop');
      };

      nav.save = function(save){

        var s = save?1:0;
        $http.get(net.address() + 'General/Save?save='+s.toString());
      };

      return nav;
    }
  ]);
})();

(function() {
	angular.module('main').directive('navi', navi);

	function navi() {
		return {
			restrict : 'E',
			scope : {},
			templateUrl : 'app/navigation/navi.html'
		};
	}

})(); 
(function() {
  angular.module('main').controller('navctlr', ['$scope', 'navservice',
    function($scope, navservice) {

      $scope.save = true;

      $scope.updateSave = function() {
        $scope.save = !$scope.save;

        navservice.save($scope.save);
      };

      $scope.stop = function() {
        navservice.stop();
      };

    }
  ]);
})();
