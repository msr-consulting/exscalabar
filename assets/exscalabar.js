/* Start with an IIFE */
(function(){
	angular.module('main',['ngRoute', 'ui.bootstrap',
	'ui.bootstrap.contextMenu', 'nvd3']);
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
  angular.module('main').factory('cvt', ['$http', 'net',
    function($http, net) {

      // TODO: Add broadcast to let everyone know when the cvt has been updated by the server.
      var cvt = {
        "save": true,
        "ozone": false,
        "filter_pos": true,
        "fctl": []
      };
      cvt.humidifier = {
        high: new humidifier(0.75, 1, 0, 90, false),
        med: new humidifier(0.75, 1, 0, 80, false)
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
      };

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

  /** Object that provides a humidifier interface.
    * @param {float} p - proportional control input
    * @param {float} i - integral control input
    * @param {float} p - derivative control input
    * @param {float} sp - setpoint
    * @param {boolean} en - enable byte
    */
  function humidifier(p,i,d,sp,en){
    this.p = p;
    this.i = i;
    this.d = d;
    this.sp = sp;
    this.en = en;
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
		.when('/#', {templateUrl:'views/main.html'})
		.when('/Flows', {templateUrl:'views/flows.html'})
		.when('/Temperature', {templateUrl:'views/temperature.html'})
		.when('/Humidifier', {templateUrl:'views/humidifier.html'})
		.when('/Common', {templateUrl:'views/common.html'});
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
			//cvt.checkCvt();
			//deviceCfg.checkCfg();
		}, 1000);

	}]);
})();

(function() {
	angular.module('main').directive('chart', function() {
		return {
			restrict : 'E',
			link : function(scope, elem, attrs) {

				var chart = null,
				    opts = {
					xaxis : {
						mode : "time"
					}
				};

				scope.$watch(attrs.ngModel, function(v) {
					if (!chart) {
						chart = $.plot(elem, v, opts);
						elem.show();
					} else {
						chart.setData(v);
						chart.setupGrid();
						chart.draw();
					}
				});
			}
		};
	});
})();

/** This is the main service for retrieving data at regular intervals.
 *
 */

(function() {
    angular.module('main').factory('Data', ['$rootScope', '$http', '$log', 'net',
      function($rootScope, $http, $log, net) {

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
          "time": []
        };

        // Defines array lengths - 100 == 100 seconds of data
        var maxLength = 300;

        /* Variable that indicates everyone needs to shift... */
        var shiftData = false;

        dataObj.pas = {};
        dataObj.pas.cell = [new pasData()];
        dataObj.pas.drive = true;

        dataObj.flowData = [new fdevice()];

        // Currently, the CRD data strictly consists of cell data.
        dataObj.crd = {};

        // Add a single cell to allocate space for the cell array.
        dataObj.crd.cell = [new crdObject()];

        /* Call this to poll the server for data */
        dataObj.getData = function() {
          promise = $http.get(net.address() + 'General/Data')
            .success(function(data, status, headers, config) {

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
        Data.pas.cell[index].f0.unshift({x:t, y:d.PAS.CellData[index].derived.f0});
        Data.pas.cell[index].IA.unshift({x:t, y:d.PAS.CellData[index].derived.IA});
        Data.pas.cell[index].Q.unshift({x:t, y:d.PAS.CellData[index].derived.Q});
        Data.pas.cell[index].p.unshift({x:t, y:d.PAS.CellData[index].derived.noiseLim});
        Data.pas.cell[index].abs.unshift({x:t, y:d.PAS.CellData[index].derived.ext});


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
        Data.crd.cell[index].tau.unshift({x:t, y:d.CellData[index].extParam.Tau});
        Data.crd.cell[index].tau0corr.unshift({x:t,y:d.CellData[index].extParam.Tau0cor});
        Data.crd.cell[index].taucorr.unshift({x:t, y:d.CellData[index].extParam.taucorr});
        Data.crd.cell[index].tau0.unshift({x:t, y:d.CellData[index].extParam.Tau0});
        Data.crd.cell[index].ext.unshift({x:t, y:d.CellData[index].extParam.ext});
        Data.crd.cell[index].extcorr.unshift({x:t, y:d.CellData[index].extParam.extCorr});
        Data.crd.cell[index].stdvTau.unshift({x:t, y:d.CellData[index].extParam.stdevTau});
        Data.crd.cell[index].etau.unshift({x:t, y:d.CellData[index].extParam.eTau});
        Data.crd.cell[index].max.unshift({x:t, y:d.CellData[index].extParam.max});
      }


    return Data;
  }
})();

(function() {
	angular.module('main')
	.controller('Sidebar', ['$scope','$http', 'Data', 'net', function($scope, $http, Data, net) {

		$scope.save = 1;
		$scope.filter = true;
		$scope.ip = net.ip;
		$scope.port = net.port;
		$scope.time = "Not connected";
		$scope.connected = false;
		$scope.o3On = false;
		$scope.cabin = false;

		$scope.changeIP = function(){
			net.setIP($scope.ip);
			};
		$scope.changePort = function(){
			net.setPort($scope.port);
			};

		// Initially time is not available
		$scope.time = "Not Connected";

		$scope.connected= false;


		$scope.$on('dataAvailable', function(){

			/* Populate the variables pertinent to the sidebar */
			$scope.time = Data.tObj.toLocaleTimeString('en-US', { hour12: false });
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

		$scope.stop = function(){
			$http.get(net.address() + 'General/Stop');
		};

	}]);
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
			"id": "O2 Valve",
			"step" : "O2 Valve",
			"descr" : "Boolean that sets the O2 valve position."
		},
		{
			"id": "O3 Valve",
			"step" : "O3 Valve",
			"descr" : "Boolean that sets the O3 valve state."
		},
		{
			"id": "O3 Generator",
			"step" : "O3 Generator",
			"descr" : "Boolean that sets the O3 generator state."
		},
		{
			"id": "QO2",
			"step" : "O2 Flow Rate",
			"descr" : "Numeric to set the oxygen flow rate"
		}];

		/* Handle row double clicks */
		$scope.clickRow = function(row){

			/* tableService will broadcast the the listeners the current ID */
			tableService.setTab(row.id.toString());

		};
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
				xml += "\t<" + entry.id + ">" + entry.val + '<\\' + entry.id + '>\r\n';
			});

			xml += "<\\OZONE>";

			/* Send the calibration profile as XML data. */
			$http({
				method : 'POST',
				url : net.address() + '/xService/Calibration/saveCalFile?file_name=' + $scope.cal_file + ".xml",
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
			case "O3 Valve":
			case"O2 Valve":
			case"O3 Generator":
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

(function(){
  angular.module('main').controller('filter', ['$scope', 'net', '$http', 'cvt',
  function($scope, net, $http, cvt){

    /* Filter cycle consists of a period that defines the time in seconds
     * between which the filter is cycled to true, length of time in seconds
     * that the filter is on and a boolean indicating whether the syste is set
     * to cycle.
     */
    $scope.cycle = cvt.filter_cycle;
    $scope.position = cvt.filter_pos;

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
}]);
})();

(function() {
  angular.module('main').controller('crd', ['$scope', 'cvt', 'Data',
    function($scope, cvt, Data) {

      // Lasers have three inputs
      var laserInput = function(_rate, _DC, _k, enabled, ID) {
        this.rate = _rate;
        this.DC = _DC;
        this.k = _k;
        this.en = enabled;
        this.id = ID;
      };
      /* Variable for laser control binding; first element is related to blue,
       * second to red.
       */
      $scope.laser_ctl = [
        new laserInput(cvt.crd.fblue, cvt.crd.dcblue, cvt.crd.kblue, cvt.crd.eblue, "Blue Laser"),
        new laserInput(cvt.crd.fred, cvt.crd.dcred, cvt.crd.kred, cvt.crd.ered, "Red Laser")
      ];

      $scope.pmt = cvt.crd.kpmt;

      $scope.data = Data.crd;

      // TODO: Implement enabled functionality
      $scope.setEnable = function(index) {

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

      $scope.tauData = [{
        values: [],
        key: '&tau;'
      }, {
        values: [],
        key: '&tau<sub>0</sub>'
      }, {
          values: [],
        key: '&tau<sub>0</sub>'
      }, {
        values: [],
        key: '&sigma;<sub>&tau;</sub>'
      }];

      $scope.options = {
        chart: {
          type: 'lineChart',
          height: 300,
          margin: {
            top: 20,
            right: 40,
            bottom: 60,
            left: 75
          },
          x: function(d) {
            return d.x;
          },
          y: function(d) {
            return d.y;
          },
          useInteractiveGuideline: true,
          yAxis: {
            tickFormat: function(d) {
              return d3.format('0.01f')(d);
            },
            axisLabel: 'Testing'
          },
          xAxis: {
            tickFormat: function(d) {
              return d3.time.format('%X')(new Date(d));
            },
            rotateLabels: -45
          },
          transitionDuration: 500,
          showXAxis: true,
          showYAxis: true
        }
      };

      $scope.$on('dataAvailable', function() {

        $scope.data = Data.crd;

        $scope.tauData[0].values = $scope.data.cell[0].max;
        $scope.tauData[1].values = $scope.data.cell[0].tau0;
        $scope.tauData[2].values = $scope.data.cell[0].stdvTau;


      });




    }
  ]);
})();

(function() {
  angular.module('main').controller('pas', ['$scope', 'net', '$http', 'cvt', 'Data', '$log',
    function($scope, net, $http, cvt, Data, $log) {

      $scope.data = Data.pas;

      var selPlot = 0;

      $scope.menuOptions = [
        ['IA', function($itemScope) {
          selPlot = 0;
          $scope.options.chart.yAxis.axisLabel = 'IA';
        }],
        ['f0', function($itemScope) {
          selPlot = 1;
          $scope.options.chart.yAxis.axisLabel = 'f0 (Hz)';
        }],
        ['Q', function($itemScope) {
          selPlot = 2;
          $scope.options.chart.yAxis.axisLabel = 'Q';
        }],
        ['p', function($itemScope) {
          selPlot = 3;
          $scope.options.chart.yAxis.axisLabel = 'p';
        }],
        ['abs', function($itemScope) {
          selPlot = 4;
          $scope.options.chart.yAxis.axisLabel = 'Absorption (Mm-1)';
        }]
      ];



      /** Data that will be used for plotting. */
      $scope.plotData = [{
        values: [],
        key: 'Cell 1'
      }, {
        values: [],
        key: 'Cell 2'
      }, {
        values: [],
        key: 'Cell 3'
      }, {
        values: [],
        key: 'Cell 4'
      }, {
        values: [],
        key: 'Cell 5'
      }];

      /** Options used for plotting. */
      $scope.options = {
        chart: {
          type: 'lineChart',
          height: 300,
          margin: {
            top: 20,
            right: 10,
            bottom: 60,
            left: 75
          },
          x: function(d) {
            return d.x;
          },
          y: function(d) {
            return d.y;
          },
          useInteractiveGuideline: true,
          yAxis: {
            tickFormat: function(d) {
              return d3.format('0.01f')(d);
            },
            axisLabel: 'Testing'
          },
          xAxis: {
            tickFormat: function(d) {
              return d3.time.format('%X')(new Date(d));
            },
            rotateLabels: -45
          },
          transitionDuration: 500,
          showXAxis: true,
          showYAxis: true
        }
      };

      // Listen for data
      $scope.$on('dataAvailable', function() {



        $scope.data = Data.pas;

        for (i = 0; i < 5; i++) {
          switch (selPlot) {
            case 0:
              $scope.plotData[i].values = $scope.data.cell[i].IA;
              break;
            case 1:
              $scope.plotData[i].values = $scope.data.cell[i].f0;
              break;
            case 2:
              $scope.plotData[i].values = $scope.data.cell[i].Q;
              break;
            case 3:
              $scope.plotData[i].values = $scope.data.cell[i].p;
              break;
            case 4:
              $scope.plotData[i].values = $scope.data.cell[i].abs;
              break;
          }


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

      $scope.cycle = {
        "period": cvt.pas.spk.period,
        "length": cvt.pas.spk.length,
        "auto": cvt.pas.spk.auto
      };
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
        cvt.pas.spk.updateCycle($scope.cycle.auto,
          $scope.cycle.period, $scope.cycle.length);
      };

      $scope.updateAuto = function() {
        $scope.cycle.auto = !$scope.cycle.auto;
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

		function flowDevice(id, t, isCtl, sp){
			this.ID = id;
			this.type = t;
			this.isController = isCtl;

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
		$scope.Devices = [new flowDevice("Dry Red", "mflow", true,0),
							new flowDevice("Dry Blue", "mflow", false,0),
							new flowDevice("Denuded Blue", "mflow", false,0),
							new flowDevice("Denuded Red", "mflow", true,0),
							new flowDevice("PAS Green", "mflow", false,0),
							new flowDevice("CRD High Humidified", "mflow", false,0),
							new flowDevice("CRD Low Humidified", "mflow", false,0),
							new flowDevice("Mirror Purge Flow", "mflow", false,0),
							new flowDevice("Pressure Controller", "pressure", false,0),
							new flowDevice("O3 Bypass", "mflow", true,0),
						 ];

		/* Update the CVT - the CVT should call the server... */
		$scope.updateSP = function(){

		};
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
	angular.module('main').directive('msg', msgFunc);

	function msgFunc() {
		return {
			restrict : 'E',
			scope : {},
			templateUrl : 'app/msg/msg.html'
		};
	}

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
	angular.module('main').directive('navi', navi);

	function navi() {
		return {
			restrict : 'E',
			scope : {},
			templateUrl : 'app/navigation/navi.html'
		};
	}

})(); 
angular.module('ui.bootstrap.contextMenu', [])

.directive('contextMenu', ["$parse", function ($parse) {
    var renderContextMenu = function ($scope, event, options, model) {
        if (!$) { var $ = angular.element; }
        $(event.currentTarget).addClass('context');
        var $contextMenu = $('<div>');
        $contextMenu.addClass('dropdown clearfix');
        var $ul = $('<ul>');
        $ul.addClass('dropdown-menu');
        $ul.attr({ 'role': 'menu' });
        $ul.css({
            display: 'block',
            position: 'absolute',
            left: event.pageX + 'px',
            top: event.pageY + 'px'
        });
        angular.forEach(options, function (item, i) {
            var $li = $('<li>');
            if (item === null) {
                $li.addClass('divider');
            } else {
                var $a = $('<a>');
                $a.attr({ tabindex: '-1', href: '#' });
                var text = typeof item[0] == 'string' ? item[0] : item[0].call($scope, $scope, event, model);
                $a.text(text);
                $li.append($a);
                var enabled = angular.isDefined(item[2]) ? item[2].call($scope, $scope, event, text, model) : true;
                if (enabled) {
                    $li.on('click', function ($event) {
                        $event.preventDefault();
                        $scope.$apply(function () {
                            $(event.currentTarget).removeClass('context');
                            $contextMenu.remove();
                            item[1].call($scope, $scope, event, model);
                        });
                    });
                } else {
                    $li.on('click', function ($event) {
                        $event.preventDefault();
                    });
                    $li.addClass('disabled');
                }
            }
            $ul.append($li);
        });
        $contextMenu.append($ul);
        var height = Math.max(
            document.body.scrollHeight, document.documentElement.scrollHeight,
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.body.clientHeight, document.documentElement.clientHeight
        );
        $contextMenu.css({
            width: '100%',
            height: height + 'px',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 9999
        });
        $(document).find('body').append($contextMenu);
        $contextMenu.on("mousedown", function (e) {
            if ($(e.target).hasClass('dropdown')) {
                $(event.currentTarget).removeClass('context');
                $contextMenu.remove();
            }
        }).on('contextmenu', function (event) {
            $(event.currentTarget).removeClass('context');
            event.preventDefault();
            $contextMenu.remove();
        });
    };
    return function ($scope, element, attrs) {
        element.on('contextmenu', function (event) {
            event.stopPropagation();
            $scope.$apply(function () {
                event.preventDefault();
                var options = $scope.$eval(attrs.contextMenu);
                var model = $scope.$eval(attrs.model);
                if (options instanceof Array) {
                    if (options.length === 0) { return; }
                    renderContextMenu($scope, event, options, model);
                } else {
                    throw '"' + attrs.contextMenu + '" not an array';
                }
            });
        });
    };
}]);