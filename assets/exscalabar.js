/* Start with an IIFE */
(function(){
	angular.module('main',['ngRoute', 'ui.bootstrap', 'ui.bootstrap.contextMenu']);
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

		if (!localStorage.ip) {
			localStorage.ip = "192.168.0.73";
		}

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
			setNetworkParams : function(ip, port) {
				this._ip = ip;
				this.port = port;
				localStorage.ip = ip;
				localStorage.port = port;
			},
			setIP : function(ip) {
				this.ip = ip;
				localStorage.ip = ip;
			},
			setPort : function(port) {
				this.port = port;
				localStorage.port = port;
			},
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
			"save" : true,
			"ozone" : false,
			"fctl" : []
		};

		/* All controls that must be updated for the PAS
		 * operation.
		 */
		var pas = {
			"spk" : {
				"vrange" : 5,
				"voffset" : 0,
				"f0" : 1350,
				"df" : 100,
				"pos" : true,
				"auto" : false,
				"period" : 360,
				"length" : 30
			},
			"las" : {
				"f" : [],
				"mod" : [],
				"vrange" : [],
				"voffset" : []
			}
		};

		cvt.crd = {
			"fred" : 1000,
			"dcred" : 50,
			"fblue" : 2000,
			"dcblue" : 50,
			"kred" : 1,
			"kblue" : 1,
			"kpmt" : [],
			"eblue" : true,
			"ered" : true
		};

		var filter = {
			"pos" : true,
			"auto" : false,
			"period" : 360,
			"length" : 30
		};

		cvt.getPasSpkCtl = function() {
			return pas.spk;
		};
		cvt.setPasSpkCtl = function(spk) {
			pas.spk = spk;
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

	}]);
})();

/** This file conigures the routing for the main page.  These are the views which 
 * Will be displayed when the user clicks a heading in the navigation menu. 
 * 
 * Routing requires the inclusion of 'angular-route.js' file and the module ngRoute.
 */

(function(){
	angular.module('main')
	.config(['$routeProvider', function($routeProvider){
		$routeProvider
		.when('/CRDS',{templateUrl:'views/crds.html'})
		.when('/PAS',{templateUrl:'views/pas.html'})
		.when('/O3',{templateUrl:'views/cals/ozone.html'})
		.when('/', {templateUrl:'views/main.html'})
		.when('/#', {templateUrl:'views/main.html'})
		.when('/Flows', {templateUrl:'views/flows.html'})
		.when('/Temperature', {templateUrl:'views/temperature.html'})
		.when('/Humidifier', {templateUrl:'views/humidifier.html'});
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

		function updateTime(t) {
			/* The reference for LabVIEW time is 1 Jan 1904.  JS days
			 * are zero based so set the value to the correct date for
			 * reference.
			 */
			var lvDate = new Date(1904, 0, 1);
			lvDate.setSeconds(t);
			return lvDate;
		}

		/* Contains data specific to the PAS */
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

		/* The full data object contains arrays of data as defined in the objects above.
		 * This object is INTENDED to be static...
		 */
		var dataObj = {
			"cTime" : null,
			"tObj": new Date(),
			"filter" : true,
			"save" : true,
			"o3cal" : false,
			"time" : []
		};

		// Defines array lengths - 100 == 100 seconds of data
		var maxLength = 300;

		/* This is the structure for the flow device data */
		function fdevice(){
			this.ID = "";
			this.Q = 0;	// Volumetric flow rate
			this.Q0 = 0;	// Mass flow rate
			this.P = 0;	// Pressure in mb
			this.T = 0;	// Temperature in degrees C
			this.Qsp = 0;	// Flow setpoint
		};

		/* Variable that indicates everyone needs to shift... */
		var shiftData = false;

		dataObj.pas = {};
		dataObj.pas.cell = [new pasData()];
		dataObj.pas.drive = true;
		
		dataObj.flowData = [new fdevice()];

		dataObj.crd = {};
		dataObj.crd.cell = [new crdObject()];

		/* Call this to poll the server for data */
		dataObj.getData = function() {
			promise = $http.get(net.address() + 'General/Data').success(function(data, status, headers, config) {

				if (dataObj.time.length - 1 >= maxLength) {
					dataObj.time.pop();
					shiftData = true;
				}
				
				
				dataObj.tObj = updateTime(data.Time);
				var t = dataObj.tObj.getTime();
				dataObj.time.unshift(t);

				// TODO: Fix this hideousness!!!  Has to be a better way...
				for (var index in data.PAS.CellData) {

					/* Make sure we have all of the cells accounted for */
					if ((dataObj.pas.cell.length - 1) < index) {
						dataObj.pas.cell.push(new pasData());
					}

					/* Pop all of the ordered arrays if the arrays are of the set length... */
					if (shiftData) {
						dataObj.pas.cell[index].f0.pop();
						dataObj.pas.cell[index].IA.pop();
						dataObj.pas.cell[index].Q.pop();
						dataObj.pas.cell[index].p.pop();
						dataObj.pas.cell[index].abs.pop();
					}

					dataObj.pas.cell[index].f0.unshift( [t, data.PAS.CellData[index].derived.f0] );
					dataObj.pas.cell[index].IA.unshift( [t, data.PAS.CellData[index].derived.IA] );
					dataObj.pas.cell[index].Q.unshift( [t, data.PAS.CellData[index].derived.Q] );
					dataObj.pas.cell[index].p.unshift( [t, data.PAS.CellData[index].derived.noiseLim] );
					dataObj.pas.cell[index].abs.unshift( [t, data.PAS.CellData[index].derived.ext] );


					/* This is one off data and is not a function of time... */
					dataObj.pas.cell[index].micf = data.PAS.CellData[index].MicFreq.Y;
					dataObj.pas.cell[index].mict = data.PAS.CellData[index].MicTime.Y;
					dataObj.pas.cell[index].pd = data.PAS.CellData[index].PhotoDiode.Y;

				}
				dataObj.pas.drive = data.PAS.Drive;
				
				$rootScope.$broadcast('dataAvailable');
			}).error(function(){
				$rootScope.$broadcast('dataNotAvailable');
				$log.debug(status);
			});
		};

		return dataObj;

	}]);
})();


(function() {
	angular.module('main')
	.controller('Sidebar', ['$scope','$http', 'Data', 'net', function($scope, $http, Data, net) {

		$scope.save = 1;
		$scope.filter = 1;
		$scope.ip = net.ip;
		$scope.port = net.port;
		$scope.time = "Not connected";
		$scope.connected = false;
		
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
			if ($scope.filter !== 0) {
				$scope.filter = 0;
			} else {
				$scope.filter = 1;
			}
			$http.get(net.address() + 'General/Save?save='+$scope.filter.toString());

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
			"descr" : "Boolean that sets the filter state (<code>TRUE</code> or<code>FALSE</code>)"
		}, 
		{
			"id": "Speaker",
			"step" : "Speaker",
			"descr" : "Boolean that sets the speaker state (<code>TRUE</code> or<code>FALSE</code>)"
		}, 
		{
			"id": "O2 Valve",
			"step" : "O2 Valve",
			"descr" : "Boolean that sets the O2 valve position (<code>TRUE</code> or<code>FALSE</code>)"
		}, 
		{
			"id": "O3 Valve",
			"step" : "O3 Valve",
			"descr" : "Boolean that sets the O3 valve state (<code>TRUE</code> or<code>FALSE</code>)"
		}, 
		{
			"id": "O3 Generator",
			"step" : "O3 Generator",
			"descr" : "Boolean that sets the O3 generator state (<code>TRUE</code> or<code>FALSE</code>)"
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

		$scope.save = function() {
			var xml = '<?xml version="1.0" encoding="utf-8"?>\r\n<OZONE>\r\n';
			SaveData.getData().forEach(function(entry) {
				xml += "\t<" + entry.id + ">" + entry.val + '<\\' + entry.id + '>\r\n';
			});

			xml += "<\\OZONE>";

			/* Send the calibration profile as XML data. */
			$http({
				method : 'POST',
				url : 'http://' + net.address() + '/xService/Calibration/saveCalFile?file_name=test_ang',
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

(function() {
	angular.module('main').controller('crd', ['$scope', 'net', '$http', 'cvt', 'Data',
	function($scope, net, $http, cvt, Data) {

		// Lasers have three inputs
		var laserInput = function(_rate, _DC, _k) {
			this.rate = _rate;
			this.DC = _DC;
			this.k = _k;
		};
		$scope.blue = new laserInput(cvt.crd.fblue, cvt.crd.dcblue, cvt.crd.kblue);
		$scope.red = new laserInput(cvt.crd.fred, cvt.crd.dcred, cvt.crd.kred);
		$scope.pmt = cvt.crd.kpmt;
		$scope.benabled = cvt.crd.eblue;
		$scope.renabled = cvt.crd.ered;

		$scope.setbEnable = function() {
			$scope.benabled = !$scope.benabled;
			cvt.crd.eblue = $scope.benabled;
			//$http.get(net.address() + 'PAS_CMD/SpkSw?SpkSw=' + val);
		};

		$scope.setrEnable = function() {
			$scope.renabled = !$scope.renabled;
			cvt.crd.ered = $scope.renabled;
			//$http.get(net.address() + 'PAS_CMD/SpkSw?SpkSw=' + val);

		};
	}]);
})();

/** This is the controller which is used to handle the PAS graph on the main page.
 *  The graph uses a right click menu to change the data stream which is being plotted.
 * 
 */

(function() {
	angular.module('main').controller('mainPasCtlr', ['$scope', 'Data', 
	function($scope, Data) {
		
		// Index the plot to visualize
		var index = 0;
		var labels = ['Q','IA','f0', 'abs'];
		
		$scope.menuOptions =	[['Q', function(){
									index = 0;
									$scope.options.chart.yAxis.axisLabel = labels[index];
									}],
								['IA', function(){	
									index = 1;
									$scope.options.chart.yAxis.axisLabel = labels[index];
												}],
								['f0', function(){	
									index = 2;
									$scope.options.chart.yAxis.axisLabel = labels[index];
												}
								],
								['abs', function(){	index = 3;
													$scope.options.chart.yAxis.axisLabel = labels[index];
												}
								]];

		$scope.options = {
			chart : {
				type : 'lineChart',
				height : 180,
				margin : {
					top : 20,
					right : 20,
					bottom : 40,
					left : 75
				},
				x : function(d) {
					return d.x;
				},
				y : function(d) {
					return d.y;
				},
				useInteractiveGuideline : true,
				
				transitionDuration : 0,
				yAxis : {
					showMaxMin: false,
					axisLabel: labels[index],
					tickFormat : function(d) {
						return d3.format('.02f')(d);
					}
				},
				xAxis : {
					axisLabel: 'Time',
					tickFormat : function(d) {
						return d3.time.format('%X')(new Date(d));
					}
				}
			},
			title: {
				enable: false,
				text: labels[index] + ' vs Time'
			}
		};

		$scope.data = [ 
			{ values : [], key : 'Cell 1 '},
			{ values : [], key : 'Cell 2 '},
			{ values : [], key : 'Cell 3 '},
			{ values : [], key : 'Cell 4 '},
			{ values : [], key : 'Cell 5 '},
		];
	
		$scope.run = true;

		$scope.$on('dataAvailable', function() {
			for (var i = 0; i < 5; i++) {
				$scope.data[i].values = Data.pas.cell[i][labels[index]];
			}
		
		});

	}]);
})();

(function() {
	angular.module('main').controller('pas', ['$scope', 'net', '$http', 'cvt', 'Data', '$log',
	function($scope, net, $http, cvt, Data, $log) {

		$scope.speaker = cvt.getPasSpkCtl();

		$scope.cycle = {
			"period" : 360,
			"length" : 20,
			"auto" : false
		};

		var maxVrange = 10;
		var maxVoffset = 5;

		var flim = {
			"high" : 3000,
			"low" : 500
		};
		$scope.data = Data.pas;

		// Listen for data
		$scope.$on('dataAvailable', function() {

			$scope.data = Data.pas;

			$scope.dataf0 = [Data.pas.cell[0].f0, Data.pas.cell[1].f0, Data.pas.cell[2].f0, Data.pas.cell[3].f0, Data.pas.cell[4].f0];
			$scope.dataIA = [Data.pas.cell[0].IA, Data.pas.cell[1].IA, Data.pas.cell[2].IA, Data.pas.cell[3].IA, Data.pas.cell[4].IA];
			$scope.datap = [Data.pas.cell[0].p, Data.pas.cell[1].p, Data.pas.cell[2].p, Data.pas.cell[3].p, Data.pas.cell[4].p];
			$scope.dataQ = [Data.pas.cell[0].Q, Data.pas.cell[1].Q, Data.pas.cell[2].Q, Data.pas.cell[3].Q, Data.pas.cell[4].Q];
			$scope.dataabs = [Data.pas.cell[0].abs, Data.pas.cell[1].abs, Data.pas.cell[2].abs, Data.pas.cell[3].abs, Data.pas.cell[4].abs];

		});

		/* Use functions and the ng-change or ng-click directive to handle DOM events rather than
		 * $watch to prevent updates at init that could hose things up */

		$scope.setPos = function() {

			$scope.speaker.pos = !$scope.speaker.pos;
			var val = $scope.speaker.pos ? 1 : 0;
			cvt.setPasSpkCtl($scope.speaker);
			$http.get(net.address() + 'PAS_CMD/SpkSw?SpkSw=' + val);
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

			cvt.setPasSpkCtl($scope.speaker);
			$http.get(net.address() + 'PAS_CMD/UpdateSpkVparams?Vrange=' + $scope.speaker.vrange + '&Voffset=' + $scope.speaker.voffset);
		};

		$scope.updateSpkF = function() {
			if ($scope.speaker.f0 > flim.high) {
				$scope.speaker.f0 = flim.high;
			} else {
				if ($scope.speaker.f0 < flim.low) {
					$scope.speaker.f0 = flim.low;
				}
			}
			cvt.setPasSpkCtl($scope.speaker);
			$http.get(net.address() + 'PAS_CMD/Spk?df=' + $scope.speaker.df + '&f0=' + $scope.speaker.fc);
		};

		$scope.updateCycle = function() {
			var val = $scope.cycle.auto ? 1 : 0;
			$http.get(net.address() + 'PAS_CMD/UpdateSpkCycle?Length=' + $scope.cycle.length + '&Period=' + $scope.cycle.period + '&Cycle=' + val);
		};

		$scope.updateAuto = function() {
			$scope.cycle.auto = !$scope.cycle.auto;
			$scope.updateCycle();
		};

	}]);
})();

function buildPlotController(controllerName, fieldName, ylabel) {
	angular.module('main')
	.controller(controllerName, ['$scope', 'Data', function($scope, Data) {
		
		/* This will serve as teh context menu for the plots so that we can switch
		 * plots.  The index will serve to tell what plot we want.
		 */
		var index = 0;
		$scope.menuOptions =[['Q', function($itemScope){index = 0;}],
		['IA', function(){index = 1;}],
		['f0', function(){index = 2;}],
		['abs', function(){index = 3;}]];

	/* Removed axis title as it is redundant... */
	$("#chartContainer" + fieldName).CanvasJSChart({ //Pass chart options
		//title : {text: fieldName + " vs Time"},
		axisX: {title: "Time", valueFormatString: "HH:mm:ss"},
		axisY: {title: ylabel},
		legend: {
			verticalAlign: "top",
			cursor: "pointer",
            itemclick: function (e) {
                if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                    e.dataSeries.visible = false;
                } else {
                    e.dataSeries.visible = true;
                }
 
                e.chart.render();
            }
        },
		data: [
			{
				showInLegend: true,
				name: "Cell 0",
				type: "line",
				xValueType: "dateTime",
				dataPoints: [ ]
			},
			{
				showInLegend: true,
				name: "Cell 1",
				type: "line",
				xValueType: "dateTime",
				dataPoints: [ ]
			},
			{
				showInLegend: true,
				name: "Cell 2",
				type: "line",
				xValueType: "dateTime",
				dataPoints: [ ]
			},
			{
				showInLegend: true,
				name: "Cell 3",
				type: "line",
				xValueType: "dateTime",
				dataPoints: [ ]
			},
			{
				showInLegend: true,
				name: "Cell 4",
				type: "line",
				xValueType: "dateTime",
				dataPoints: [ ]
			},

	]});
           	// { x: 1435336292000, y :71},
            	// { x: 1435336293000, y : 55 },
           		// { x: 1435336294000, y:  50 },
            	// { x: 1435336300000, y : 65 },
            	// { x: 1435336303000, y : 95 },
             	// { x: 1435336304000, y : 68 },
            	// { x: 1435336308000, y : 28 },


	
	$scope.chart = $("#chartContainer" + fieldName).CanvasJSChart();
	
	$scope.chart.render();
	
	$scope.$on('dataAvailable', function() {
		for (var i = 0; i < 5; i++) {
			$scope.chart.options.data[i].dataPoints = Data.pas.cell[i][fieldName];
			$scope.chart.render();
		}
		
		});

	}]);
}

(function() {
	buildPlotController('plotPASQ', 'Q', 'Q');
	buildPlotController('plotPASf0', 'f0', 'f0 (Hz)');
	buildPlotController('plotPASIA', 'IA', 'IA (???)');
	buildPlotController('plotPASp', 'p', 'p (???)');
	buildPlotController('plotPASabs', 'abs', 'abs (???)');
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