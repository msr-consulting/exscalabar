/**
 * @ngdoc overview
 * @name main
 * @requires ngRoute
 * @requires ui.bootstrap
 * @requires ui.bootstrap.contextMenu
 * @requires dygraph
 * @requires cirrus.ui.button
 * @requires cirrus.ui.numeric
 * @requires cirrus.ui.string
 * @description
 * Angular module for the EXSCALABAR UI.
 */
(function () {
    angular.module('main', ['ngRoute', 'ui.bootstrap',
        'ui.bootstrap.contextMenu', 'dygraph',
        'cirrus.ui.ibutton', 'cirrus.ui.inumeric',
        'cirrus.ui.string',
        'ngSanitize', 'ui.bootstrap.dropdownToggle',
        'angular-svg-round-progressbar']);
})();
(function () {
    angular.module('main').factory('net', function () {
        /** 
         * @ngdoc service
         * @name main.service:net
         * @description
         * This service handles network settings that can be set on the configuration page.
         * This communicates the settings to the other portions of the application that require 
         * the ip address and port.
         *
         * This service stores the settings in local storage so that they are
         * restored on refresh.
         */


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
            ip: localStorage.ip,
            port: localStorage.port,
            getNetworkParams: function () {
                /** 
                 * @ngdoc method
                 * @name main.net.getNetworkParams
                 * @methodOf main.service:net
                 * @returns {object} Object containing two keys: ``ip`` and ``port``.  These values
                 * are strings containing the IP address and the port that the server is listening on.
                 */
                return {
                    "ip": this.ip,
                    "port": this._port
                };
            },
            setNetworkParams: function (ip, port) {
                /** 
                 * @ngdoc method
                 * @name main.net.setNetworkParams
                 * @methodOf main.service:net
                 * @param {string} ip IP address of server
                 * @param {string} port Port server is listening on.
                 * @description
                 * Sets the network settings for communicating with the server.  These values 
                 * are cached using html5 ``localstorage``.
                 */
                this._ip = ip;
                this.port = port;
                localStorage.ip = ip;
                localStorage.port = port;
            },

            /** Set the IP address of the local server.  Cache the address using
             * HTML5 localStorage.
             * @param {string} - IP address in xxx.xxx.xxx.xxx form.
             */
            setIP: function (ip) {
                this.ip = ip;
                localStorage.ip = ip;
            },

            /** Set the port on which we are talking to the server.  Cache the port
             * using HTML5 localStorage.
             * @param {integer} - Value for port.
             */
            setPort: function (port) {
                this.port = port;
                localStorage.port = port;
            },

            /** Use this function to return the address of the web service.
             * @return {string} - address in format 'http://[IP]:[Port]/xService/'
             */
            address: function () {
                return 'http://' + this.ip + ':' + this.port + '/xService/';
            }
        };
    });

})();
(function () {

    angular.module('main').factory('cvt', ['$http', 'net', '$rootScope',
        function ($http, net, $rootScope) {

            /**
             * @ngdoc service
             * @name main.service:cvt
             * @requires $http
             * @requires main.service:net
             * @requires $rootScope
             * @description
             * The cvt service maintains a current value table of control values so that all controls will
             * be properly populated.  The cvt is updated at regular intervals using the checkCvt() method.
             * This method is called in the module main.mainCtrl
             *
             * @returns {Object} Returns a cvt object which contains all of the current values of the UI controls
             */

            var cvt = {
                "save": true,
                "ozone": false,
                "filter_pos": true,
                "first_call": 1,
                "fctl": [],
                "power": {
                    Pump: false,
                    O3Gen: false,
                    Denuder: false,
                    Laser: false,
                    TEC: false
                },
                "purge": {
                    setSw: function (val) {
                        //http://192.168.0.73:8001/xService/General/PurgeSwitch?val={value}
                        this.pos = val;

                        var cmd = val ? 1 : 0;
                        $http.get(net.address() + 'General/PurgeSwitch?val=' + cmd);

                    },
                    pos: true
                },
                "alicat": [],
                "vaisala": [],
                "mTEC": [],
                "tec": {},
                "ppt": []
            };

            /**
             * @ngdoc object
             * @name main.humidifier
             * @module main
             * @description
             * Object defining the methods and properties for modifying humidifier behavior.
             */
            function Humidifier(p, i, d, sp, en, name) {
                this.p = p;
                this.i = i;
                this.d = d;
                this.sp = sp;
                this.en = en;
                this.updateEn = function () {


                };
                this.updateParams = function (h) {
                    //http.get(net.address() +
                    //    'Humidity/hCtlParams?hID=' + f0.join(','));
                    // http://192.168.0.73:8001/xService/Humidity/hCtlParams?hID={value}&D={value}&I={value}&P={value}
                    //http://192.168.0.73:8001/xService/Humidity/Enable/:ID?Val={value}
                };
                this.name = name;
            }

            function isEmpty(object) {
                for (var key in object) {
                    if (object.hasOwnProperty(key)) {
                        return false;
                    }
                }
                return true;
            }

            /* Indicates whether this is the first time this is called.  If it is, the
             * value is non-zero (TRUE).  On the first successful poll of the server,
             * this value will be set to zero.
             */

            /**
             * @ngdoc property
             * @name main.cvt.humidifier
             * @propertyOf main.service:cvt
             * @description
             * Defines the parameters for humidifier control.
             */
            cvt.humidifier = [new Humidifier(0.75, 1, 0, 90, false, "Medium"),
                new Humidifier(0.75, 1, 0, 80, false, "High")];

            /**
             * @ngdoc property
             * @name main.cvt.pas
             * @propertyOf main.service:cvt
             * @description
             * Defines settings associated with the photoacoustic spectrometer.  These settings are associated with the speaker and the lasers.
             */
            cvt.pas = new Pas($http, net);


            /**
             * @ngdoc property
             * @name main.cvt.crd
             * @propertyOf main.service:cvt
             * @description
             * Defines settings associated with the photoacoustic spectrometer.  These settings are associated with the speaker and the lasers.
             */
            cvt.crd = new Crd($http, net);

            cvt.filter = {
                cycle: {
                    period: 360,
                    length: 20,
                    auto: false
                },
                position: true,
                updateCycle: function (newCycle) {
                    this.cycle = newCycle;
                    var val = this.cycle.auto ? 1 : 0;
                    $http.get(net.address() + 'General/FilterCycle?Length=' +
                        this.cycle.length + '&Period=' + this.cycle.period + '&auto=' + val);

                },
                updatePos: function (newPos) {

                    this.position = newPos;

                    var val = this.position ? 1 : 0;
                    $http.get(net.address() + 'General/UpdateFilter?State=' + val);

                }

            };

            // TODO: most of the update setpoint commands should be removed from the cvt if there is not direct interaction with the cvt service itself (i.e. we are not storing something in the cvt
            cvt.tec.updateSP = function(sp){
                $http.get(net.address() + 'General/DevSP?SP=' + sp + '&DevID=tetech');
            };

            cvt.tec.updateMult = function(m){
                ///xService/tetech/multipliers?mult={value}
                $http.get(net.address() + 'tetech/multipliers?mult=' + m.toString());
            };

            /* TODO: Implement server side CVT communication. */

            /**
             * @ngdoc method
             * @name main.cvt#checkCVT
             * @methodOf main.service:cvt
             *
             * @description
             * Method provided for making calls to the server for CVT updates.
             *
             * If the call is successful and the object returned byt the server is not
             * empty, then this method will broadcast ``cvtUpdated`` to all callers.
             */
            cvt.checkCvt = function () {

                promise = $http.get(net.address() + 'General/cvt?force=' + cvt.first_call).then(function successCallback(response) {

                    // After the first successful call, set this value to false (0).
                    first_Call = 0;

                    // If the CVT has not changed or this is not the first call, then the
                    // CVT object should be empty.
                    if (!isEmpty(response.data)) {

                        var crd = response.data.crd;
                        var pas = response.data.pas;

                        var dev = response.data.device;

                        /*
                         * Device information comes in through the "device" property in the data array returned
                         * by the CVT check.  Loop through the devices and check to see if anything has changed.
                         * Add devices to each particular device array as they are found.
                         *
                         * This could be offloaded onto the server if this produces an odd load.
                         */
                        for (var d in dev) {
                            var dd = dev[d];
                            switch (dd.type) {
                                case "alicat":
                                    if (cvt.alicat.length > 0 && !findDevID(cvt.alicat, d)) {

                                        cvt.alicat.push(new device(dd.label, d, dd.controller, dd.sn, dd.sp, dd.address));

                                    }
                                    else {
                                        cvt.alicat = [new device(dd.label, d, dd.controller, dd.sn, dd.sp, dd.address)];
                                    }
                                    break;
                                case "mTEC":
                                    if (cvt.mTEC.length > 0 && !findDevID(cvt.mTEC, d)) {
                                        cvt.mTEC.push(new device(dd.label, d, dd.controller, dd.sn, dd.sp, dd.address));
                                    }
                                    else {
                                        cvt.mTEC = [new device(dd.label, d, dd.controller, dd.sn, dd.sp, dd.address)];
                                    }
                                    break;
                                case "vaisala":
                                    if (cvt.vaisala.length > 0 && !findDevID(cvt.vaisala, d)) {
                                        cvt.vaisala.push(new device(dd.label, d, dd.controller, dd.sn, dd.sp, dd.address));
                                    }
                                    else {

                                        cvt.vaisala = [new device(dd.label, d, dd.controller, dd.sn, dd.sp, dd.address)];
                                    }
                                    break;
                                case "ppt":
                                    if (cvt.ppt.length > 0 && !findDevID(cvt.ppt, d)) {
                                        cvt.ppt.push(new device(dd.label, d, dd.controller, dd.sn, dd.sp, dd.address));
                                    }
                                    else {
                                        cvt.ppt = [new device(dd.label, d, dd.controller, dd.sn, dd.sp, dd.address)];
                                    }
                                    break;
                                case "TEC":
                                    if (isEmpty(cvt.tec)) {

                                        cvt.tec = new device(dd.label, d, dd.controller, dd.sn, dd.sp, dd.address);

                                    }
                                    break;
                                default:
                                    console.log("Unexpected device found...");
                            }
                            $rootScope.$broadcast('deviceListRefresh');
                        }

                        var h = response.data.Humidifier;

                        cvt.humidifier[0].p = h.Med.p;
                        cvt.humidifier[0].i = h.Med.i;
                        cvt.humidifier[0].d = h.Med.d;
                        cvt.humidifier[0].en = h.Med.ctl;
                        cvt.humidifier[0].sp = h.Med.rhsp;

                        cvt.humidifier[1].p = h.High.p;
                        cvt.humidifier[1].i = h.High.i;
                        cvt.humidifier[1].d = h.High.d;
                        cvt.humidifier[1].en = h.High.ctl;
                        cvt.humidifier[1].sp = h.High.rhsp;

                        /* Update the CRD controls */
                        cvt.crd.fred = crd.red.f;
                        cvt.crd.fblue = crd.blue.f;
                        cvt.crd.dcred = crd.red.dc;
                        cvt.crd.dcblue = crd.blue.dc;
                        cvt.crd.kpmt = crd.kpmt;

                        /* Update PAS laser controls */
                        cvt.pas.las.f0 = pas.las.f0;
                        cvt.pas.las.vr = pas.las.vrange;
                        cvt.pas.las.voffset = pas.las.voffset;
                        cvt.pas.las.enable = pas.las.enabled;
                        cvt.pas.las.modulation = pas.las.modulation;
                        
                        /* Update PAS speaker controls */
                        cvt.pas.spk.f0 = pas.spk.fcenter;
                        cvt.pas.spk.df = pas.spk.df;
                        cvt.pas.spk.vrange = pas.spk.vrange;
                        cvt.pas.spk.voffset = pas.spk.voffset;
                        cvt.pas.spk.auto = pas.spk.cycle;
                        cvt.pas.spk.length = pas.spk.length;
                        cvt.pas.spk.period = pas.spk.period;
                        cvt.pas.spk.pos = pas.spk.enabled;

                        cvt.filter.cycle.period = response.data.Filter.period;
                        cvt.filter.cycle.length = response.data.Filter.length;
                        cvt.filter.cycle.auto = response.data.Filter.auto;

                        cvt.filter.position = response.data.general.filter_pos;

                        var power = Number(response.data.general.power).toString(2);

                        while (power.length < 5) {
                            power += "0";

                        }

                        cvt.power.Pump = power[4] == '1';
                        cvt.power.O3Gen = power[3] == '1';
                        cvt.power.Denuder = power[2] == '1';
                        cvt.power.Laser = power[1] == '1';
                        cvt.power.TEC = power[0] == '1';


                        /**
                         * @ngdoc event
                         * @name cvtUpdated
                         * @eventOf main.service:cvt
                         * @eventType broadcast
                         * @description
                         * Event to let observers know that the CVT has been refreshed.
                         *
                         */
                        $rootScope.$broadcast('cvtUpdated');
                    }

                }, function errorCallback(response){
                    $rootScope.$broadcast('cvtNotAvailable');
                }).finally(function (){

                    // Reset the first call property to 0 so we just wait for the
                    // most recent values that have changed.
                    cvt.first_call = 0;
                });

            };

            /** @ngdoc o
             *  @name main.cvt.flows
             *  @module main
             *  @description
             *  Object containing the flow setpoint information.
             */
            cvt.flows = {};

            cvt.flows.updateSP = function (id, sp) {
                cvt.flows[id] = sp;
                $http.get(net.address() + 'General/DevSP?SP=' + sp + '&DevID=' + id);

            };

            cvt.updatePS = function (val) {
                $http.get(net.address() + 'General/PowerSupply?val=' + val);
            };

            return cvt;

        }
    ]);


    function findDevID(dev_array, id) {

        for (var i in dev_array) {
            if (dev_array[i].id === id) {
                return true;
            }
        }
        return false;

    }

    /**
     * This is a prototype for devices.
     */
    function device(l, id, ctlr, sn, sp, addr) {
        this.label = l;
        this.id = id;
        this.ctlr = ctlr;
        this.sn = sn;
        this.sp = sp;
        this.address = addr;
    }

    /**
     * @ngdoc object
     * @name main.crd
     * @module main
     * @description
     * Object defines the CRD related control inputs.
     */
    function Crd(_http, _net) {
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

        this.setLaserRate = function (index, f) {

            var cmd = 'CRDS_CMD/fblue?Rate=' + f;
            if (index) {
                cmd = 'CRDS_CMD/fred?Rate=' + f;
                this.fred = f;
            } else {
                this.fblue = f;
            }

            http.get(net.address() + cmd);

        };
        this.setEnable = function (vals) {
            this.eblue = vals[0];
            this.ered = vals[1];

            var enr = this.ered ? 1 : 0;
            var enb = this.eblue ? 1 : 0;


            var cmd = 'CRDS_CMD/LaserEnable?Red=' + enr + '&Blue=' + enb;
            http.get(net.address() + cmd);
        };

        this.setGain = function (val) {

            this.kpmt = val;

            http.get(net.address() + 'CRDS_CMD/Vpmt?V=' + val.toString());

        };

        this.setLaserGain = function (val) {

            this.kred = val[1];
            this.kblue = val[0];
            http.get(net.address() + 'CRDS_CMD/LaserGain?B1=0&B0=' + val[0] + '&R=' + val[1]);
        };
    }

    function Pas(_http, _net) { 

        var http = _http;

        var net = _net;
        
        this.write_wvfm_state = false;
        this.send_wvfm_state = true;

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
            "modulation": [0, 0, 0, 0, 0],
            "enable": [false, false, false, false, false]
        };

        this.las.setf0 = function (f0) {
            this.f0 = f0;

            http.get(net.address() +
                'PAS_CMD/UpdateFr?f0=' + f0.join(','));

        };

        /** Set the laser voltage range.
         * @param {array} - array of voltages in Volts.
         */
        this.las.setVr = function (vr) {
            this.vr = vr;

            http.get(net.address() +
                'PAS_CMD/UpdateVrange?Vrange=' + vr.join(','));

        };
        
        this.send_wvfm = function(wvfm){
            var data = wvfm?1:0;
            
            this.send_wvfm_state = wvfm;
            console.log('New value for waveform retrieval is ' + data);
            http.get(net.address() +
                'PAS_CMD/wvfm?write=' + data);
            
        };
        
        
        this.write_wvfm = function(wvfm){
            var data = wvfm?1:0;
            
            this.write_wvfm_state = wvfm;
            console.log('New value for waveform retrieval is ' + data);
            http.get(net.address() +
                'PAS_CMD/WVFM_to_File?Write_Data=' + data);
            
        };

        this.las.setVo = function (vo) {
            this.voffset = vo;

            http.get(net.address() +
                'PAS_CMD/UpdateVoffset?Voffset=' + vo.join(','));

        };

        this.las.updateMod = function (mod) {
            this.moduldation = mod;

            var val = [];

            for (var i = 0; i < mod.length; i++) {
                val.push(mod[i] ? 1 : 0);
            }

            http.get(net.address() +
              'PAS_CMD/modulation?val=' + val.join(','));

        };

        // TODO: Fix service to handle byte array not single number.
        this.las.updateEnable = function (en) {
            this.enable = en;
            var enByte = 0;
            
            for(var i = 0; i < en.length; i++){
                enByte += en[i]?(Math.pow(2,i)):0;
            }
            
            

            http.get(net.address() +
                'PAS_CMD/UpdateLaserEnable?LasEnByte=' + enByte);
        };

        this.spk.updateCtl = function (spk) {
            //this = spk;
            var val = spk.pos ? 1 : 0;

            http.get(net.address() + 'PAS_CMD/SpkSw?SpkSw=' + val);
            http.get(net.address() + 'PAS_CMD/Spk?df=' + this.df + '&f0=' + this.f0);
            http.get(net.address() + 'PAS_CMD/UpdateSpkVparams?Voffset=' + this.voffset +
                '&Vrange=' + this.vrange);

        };

        this.spk.updateCycle = function (auto, p, l) {
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
/**
 * This file configures the routing for the main page.  These are the views which
 * Will be displayed when the user clicks a heading in the navigation menu.
 *
 * Routing requires the inclusion of 'angular-route.js' file and the module ngRoute.
 */

(function () {
    angular.module('main')
        .config(['$routeProvider',
            function ($routeProvider) {
                $routeProvider
                    .when('/CRDS', {templateUrl: 'html/crds.html'})
                    .when('/PAS', {templateUrl: 'html/pas.html'})
                    .when('/O3', {templateUrl: 'html/ozone.html'})
                    .when('/', {templateUrl: 'html/main.html'})
                    .when('/Flows', {templateUrl: 'html/flows.html'})
                    .when('/Temperature', {templateUrl: 'html/temperature.html'})
                    .when('/Humidifier', {templateUrl: 'html/humidifier.html'})
                    .when('/Common', {templateUrl: 'html/common.html'})
                    .when('/Config', {templateUrl: 'html/config.html'})
                    .when('/msg', {templateUrl: 'html/msg.html'})
                    .when('/Checklist', {templateUrl: 'html/checklist.html'})
                    .when('/Housekeeping', {templateUrl: 'html/housekeeping.html'});
            }]);
})();

(function () {
    angular.module('main').factory('ExReadCfgSvc', read_cfg);

    read_cfg.$inject = ['$http', '$location', '$rootScope'];
    function read_cfg($http, $location, $rootScope) {
        /**
         * @ngdoc service
         * @name main.service:ExReadCfgSvc
         * @requires $http
         * @requires $location
         * @requires $rootScope
         *
         * @description
         * Simple service to retrieve configuration information from the
         * json config file ``ui.json`` located in the main directory.
         */

        var cfg = {
            name: "",
            version: "",
            pas: {},
            crd: {},
            flow: {},
            tec: {},
            ppt: {},
            mtec: {},
            main_path: ""
        };

        // Get the UI config path
        var s = $location.$$absUrl;
        var loc = s.search('#/');
        s = s.slice(0, loc);

        // On the first load, for some reason the trailing backslash is not there; correct this
        var c = s.slice(-1) === '/' ? '' : '/';

        cfg.main_path = s + c;
        var cfg_path = cfg.main_path + 'ui.json';

        $http.get(cfg_path)
            .then(function (response) {
                    cfg.name = response.data.name;
                    cfg.version = response.data.version;
                    cfg.pas = response.data.pasplot;
                    cfg.crd = response.data.crdplot;

                    cfg.flow = response.data.flowplot;
                    cfg.tec = response.data.tec;
                    cfg.ppt = response.data.ppt;
                    cfg.vaisala = response.data.vaisala;

                    $rootScope.$broadcast('CfgUpdated');
                },
                function () {
                    console.log('Configuration file not found.');
                    cfg.name = "EXSCALABAR";
                    cfg.version = "0.1.0";

                })
            .finally(function () {
            });

        return cfg;
    }
})();
(function () {
    angular.module('main').controller('ExMainCtl', ['Data', '$scope', '$rootScope','$interval', 'cvt', 'ExReadCfgSvc','ExChecklistSvc',
        function (Data, $scope, $rootScope, $interval, cvt, ExReadCfgSvc, ExChecklistSvc) {
            /**
             * @ngdoc controller
             * @name main.controller:MainCtlr
             * @requires Data
             * @requires $scope
             * @requires $interval
             * @requires cvt
             * This is the main controller that is sucked into the entire program (this is placed
             *    in the body tag).  The primary function is to make regular server calls using the
             * ``$interval``.
             */

            $scope.name = ExReadCfgSvc.name;
            $scope.ver = ExReadCfgSvc.version;
            /* Call the data service at regular intervals; this will force a regular update of the
             * data object.
             */
            $interval(function () {
                Data.getData();
                cvt.checkCvt();
                //deviceCfg.checkCfg();
            }, 1000);

            // Load checklist data at startup
            ExChecklistSvc.load();

            $scope.$on('CfgUpdated', function () {
                $scope.name = ExReadCfgSvc.name;
                $scope.ver = ExReadCfgSvc.version;

            });
        }]);
})();
(function () {
    angular.module('main').factory('Data', ['$rootScope', '$http', 'net',
        'cvt',
        function ($rootScope, $http, net) {
            /**
             * @ngdoc service
             * @name main.service:Data
             * @requires $rootScope
             * @requires $http
             * @requires main.service:net
             * @description
             * This is the main service for retrieving data at regular intervals.
             *
             */

            /**
             * @ngdoc property
             * @name main.service:Data#ppts
             * @propertyOf main.service:Data
             * @description
             * Defines a list of ppt names to ID data related to a specific ppt device.
             */
            var ppts = ["pDryBlue"];

            /**
             * @ngdoc property
             * @name main.service:Data#vaisalas
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
                "pas": {},
                "crd": {},
                "time": [],
                "msg": [],
                "date": {}
            };


            /**
             * @ngdoc property
             * @name main.service:Data#maxLength
             * @propertyOf main.service:Data
             * @description
             * Defines the max array length in seconds for displaying data.
             */
            var maxLength = 300;

            /**
             * @ngdoc property
             * @name main.service:Data#shiftData
             * @propertyOf main.service:Data
             * @description
             * Determines how to shuffle array data (used in conjunction with ``maxLength``).  If the
             * value is true, the number of elements in the arrays is ``>= maxLength``.
             */
            var shiftData = false;

            dataObj.filter = {
                "state": true,
                "tremain": 0
            };

            var busy = false;

            dataObj.getData = function () {
                if (busy) {
                    // Don't just line up endless requests...
                    return;
                }
                busy = true;
                promise = $http.get(net.address() + 'General/Data')
                    .then(function (response) {

                        if (isEmpty(response.data)) {
                            $rootScope.$broadcast('dataNotAvailable');
                        }
                        else {

                            // Handle filter infomration
                            dataObj.filter.state = response.data.Filter;
                            // Time remaining in cycle is the total time minus the elapsed time
                            var tremain = response.data.fcycle.tt - response.data.fcycle.te;
                            // Don't let this time fall below 0
                            dataObj.filter.tremain = tremain > 0 ? tremain : 0;

                            dataObj.pas = response.data.PAS;

                            // Object creation for devices
                            for (i = 0; i < ppts.length; i++) {
                                if (ppts[i] in response.data) {
                                    dataObj[ppts[i]] = response.data[ppts[i]];
                                }

                            }
                            // Object creation for devices
                            for (var i = 0; i < vaisalas.length; i++) {
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
                                shiftData = true;
                            }

                            dataObj.tObj = updateTime(Number(response.data.Time));

                            dataObj.Cabin = response.data.Cabin;
                            dataObj.msg = response.data.Msg;


                            // TODO: We actually just want to pass on the data so that
                            // others can grab it.  For now, putting it in this key (data)
                            dataObj.data = response.data;

                            $rootScope.$broadcast('dataAvailable');
                        }
                    }, function () {
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
     * @name main.service:Data#updateTime
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

    function isEmpty(obj) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop))
                return false;
        }

        return true;
    }
})();
(function () {
    angular.module('main').factory('ExMsgSvc', MsgService);

    /**
     * @ngdoc service
     * @name main.service:ExMsgSvc
     * @requires $scope
     * @requires main.service:Data
     * @description
     * Handles maintaining data for the message related views.
     */
    MsgService.$inject = ['$rootScope', 'Data'];

    function MsgService($rootScope, Data) {

        /** Object returned by the message service. */
        var msg = {
            numType: [0, 0, 0],
            msgs: "",
            clearMsgArray: function () {
                this.msgs = "";
                this.numType = [0, 0, 0];
                /**
                 * @ngdoc event
                 * @name countCleared
                 * @eventOf main.service:ExMsgSvc
                 * @eventType broadcast
                 *
                 * @description
                 * This message is fired when we call the ``clearMsgArray`` function.
                 * Let's listeners know that the property ``numType`` has changed.
                 */
                $rootScope.$broadcast('countCleared');
            },
            resetCount: function () {
                this.numType = [0, 0, 0];
            }
        };

        $rootScope.$on('dataAvailable', handle_data);

        function handle_data() {

            /* Concatenate only if there is already messages in the queue.
             * Otherwise, set the incoming messages to the current message object.
             */
            if (Data.msg.length > 0) {
                var m = "<span>";
                for (i = 0; i < Data.msg.length; i++) {
                    if (Data.msg[i].search('ERROR') > 0) {
                        m = '<span class="cui-msg-error">';
                    } else if (Data.msg[i].search('WARNING') > 0) {
                        m = '<span class="cui-msg-info">';
                    } else {
                        m = '<span class="cui-msg-info">';
                    }
                    msg.msgs += m + Data.msg[i] + "</span><br>";
                }
                for (i = 0; i < Data.msg.length; i++) {
                    if (Data.msg[i].search('ERROR') > 0) {
                        msg.numType[2] += 1;
                    } else if (Data.msg[i].search('WARNING') > 0) {
                        msg.numType[1] += 1;
                    } else {
                        msg.numType[0] += 1;
                    }
                }

                /**
                 * @ngdoc event
                 * @name msgAvailable
                 * @eventOf main.service:ExMsgSvc
                 * @eventType broadcast
                 *
                 * @description
                 * Event to let observers know that message data is available.
                 * Fires only if there are messages in the stream.
                 */
                $rootScope.$broadcast('msgAvailable');
            }
        }

        return msg;
    }
})();
(function() {
	angular.module('main').directive('exMsgDirective', msg_);
    /**
     * @ngdoc directive
     * @name main.directive:msg
     * @restrict E
     * @scope
     * @description
     * Provides a template for displaying messages.
     * @deprecated
     */

	function msg_() {
		return {
			restrict : 'E',
			scope : {},
			templateUrl : 'app/Messages/msg.html'
		};
	}

})(); 

(function () {
    angular.module('main').controller('ExMsgCtl', ['$scope', 'ExMsgSvc',
	function ($scope, ExMsgSvc) {
            /**
             * @ngdoc controller
             * @name main.msgCtlr
             * @requires main.service:Data
             * @requires $scope
             * @description
             * Controller for displaying messages from the server. 
             */

            /** 
             * @ngdoc property
             * @name main.msgCtlr#msgs
             * @propertyOf main.controller:msgCtlr
             * @scope
             * @description
             * Scope variable that holds the html based text stream.
             */
            $scope.msgs = ExMsgSvc.msgs;
            $scope.$on('msgAvailable', function () {

                $scope.msgs = ExMsgSvc.msgs;
            });


            $scope.clrMsgs = function () {
                $scope.msgs = "";
                ExMsgSvc.clearMsgArray();
            };


	}]);
})();
(function () {
    angular.module('main')
        .controller('Sidebar', ['$scope', '$http', 'Data', 'net', 'cvt', function ($scope, $http, Data, net, cvt) {

            $scope.save = 1;
            $scope.filter = Data.filter.state;
            $scope.time = "Not connected";
            $scope.o3On = false;
            $scope.cabin = false;
            $scope.pumpBlocked = false;
            $scope.impBlocked = false;

            $scope.denuder_bypass = false;
            $scope.interlock = false;


            // Initially time is not available
            $scope.time = "Not Connected";

            $scope.$on('dataAvailable', function () {

                $scope.filter = Data.filter.state;
                $scope.cabin = Data.Cabin;
            });

            $scope.saveData = function () {

                $scope.save = !$scope.save;

                // TODO: Check to see if this is correct.
                var s = $scope.save ? 1 : 0;

                $http.get(net.address() + 'General/Save?save=' + s.toString());
            };

            $scope.setFilter = function () {

                $scope.filter = !$scope.filter;
                var x = $scope.filter ? 1 : 0;
                $http.get(net.address() + 'General/UpdateFilter?State=' + x);

            };

            $scope.setDenuderBypass = function () {
                $scope.filter = !$scope.denuder_bypass;
                var x = $scope.denuder_bypass ? 1 : 0;
                $http.get(net.address() + 'General/DenudedBypass?val=' + x);
            };

            /** Flip the switch cabin switch.
             */
            $scope.setCabin = function () {
                $scope.cabin = !$scope.cabin;
                var x = $scope.cabin ? 1 : 0;
                $http.get(net.address() + 'General/Cabin?val=' + x);
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
(function () {

    angular.module('main').factory('ExFlowSvc', flowSvc);

    /**
     * @ngdoc service
     * @name main.service:ExFlowSvc
     * @requires $rootScope
     * @requires main.service:Data
     *
     * @description
     * Service handling the ordering of the data returned by flow controllers
     * and meters.
     */

    flowSvc.$inject = ['$rootScope', 'Data', 'cvt'];

    function flowSvc($rootScope, Data, cvt) {

        /**
         * @ngdoc property
         * @name main.service:ExFlowSvc#flow
         * @propertyOf main.service:ExFlowSvc
         *
         * @description
         * This is the object that will be returned by the service.  This object contains
         *
         * * IDs - string array containg the IDs of the devices
         * * Q - Array of arrays of volumetric flow values for plotting
         * * P - Array of arrays of pressure values for plotting
         * * T - Array of arrays of temperature values for plotting
         * * Q0 - Array of arrays of mass flow values for plotting
         * * data - object containing single point flow data
         * * ``Qsp`` - an associative array that contains a key and value for each
         * element.  The key is the device ID while the value is the setpoint.
         */

        function FlowObj() {
            this.IDs = [];
            this.Q = [];
            this.P = [];
            this.T = [];
            this.Q0 = [];
            this.data = {};
            this.Qsp = [];

            this.clear_data = function(){

                this.Q = [];
                this.P = [];
                this.T = [];
                this.Q0 = [];
                shift = false;
                index =0;

            };
        }

        var flow = new FlowObj();


        var maxi = 300;

        var shift = false;
        var index = 0;

        function fData() {
            this.Q = 0;
            this.P = 0;
            this.T = 0;
            this.Q0 = 0;
            this.isController = false;
            this.Qsp = 0;
            this.label = "";
        }


        // Temporary variables for storing array data.
        var P, T, Q, Q0;

        var alicats = cvt.alicat;

        /**
         * @ngdoc method
         * @name main.service:ExFlowSvc#populate_arrays
         * @methodOf main.service:ExFlowSvc
         * @param {object} e Element in array
         * @param {number} i Index in array
         *
         * @description
         * Populate the arrays for the plots.
         */
        function populate_arrays(e, i) {

            var id = e.id;
            if (!i) {
                P = [Data.tObj, flow.data[id].P];
                T = [Data.tObj, flow.data[id].T];
                Q = [Data.tObj, flow.data[id].Q];
                Q0 = [Data.tObj, flow.data[id].Q0];
            } else {
                P.push(flow.data[id].P);
                T.push(flow.data[id].T);
                Q.push(flow.data[id].Q);
                Q0.push(flow.data[id].Q0);
            }
        }

        $rootScope.$on('dataAvailable', getData);

        $rootScope.$on('deviceListRefresh', function(){
            alicats = cvt.alicat;
        });

        /**
         * @ngdoc method
         * @name main.service:ExFlowSvc#getData
         * @methodOf main.service:ExFlowSvc
         *
         * @description
         * Get the data concerning the Alicats via the Data object returned
         * from the Data service.  Stuff teh data into the flow property of this
         * service.  The first time data is returned, we will check for the
         * presence of the actual object.  If it is not there, check to see if
         *
         * 1. it is a controller, and
         * 2. it is a mass flow device
         */
        function getData() {

            // Store the ID as key
            var key = "";

            for ( var i = 0; i < alicats.length; i++) {
                // Check to see if the current ID is in the Data Object
                if (alicats[i].id in Data.data) {

                    key = alicats[i].id;

                    if (!(key in flow.data)) {
                        flow.data[key] = new fData();
                        if (flow.IDs.length === 0) {
                            flow.IDs = [key];
                        } else {
                            flow.IDs.push(key);
                        }

                        // Check to see if this is a controller
                        if (Data.data[key].Type.search("C") >= 0) {
                            flow.data[key].isController = true;
                            flow.data[key].Qsp = Data.data[key].Qsp;
                        }
                    }

                    flow.data[key].P = Data.data[key].P;
                    flow.data[key].T = Data.data[key].T;
                    flow.data[key].Q = Data.data[key].Q;

                    flow.data[key].label = alicats[i].label;

                }
            }

            alicats.forEach(populate_arrays);

            if (shift) {
                flow.P.shift();
                flow.T.shift();
                flow.Q.shift();
                flow.Q0.shift();
            }
            else {
                index += 1;
            }
            flow.P.push(P);
            flow.T.push(T);
            flow.Q.push(Q);
            flow.Q0.push(Q0);

            shift = index >= maxi;

            /**
             * @ngdoc event
             * @name main.service:ExFlowSvc#FlowDataAvailable
             * @eventType broadcast
             * @eventOf main.service:ExFlowSvc
             *
             * @description
             * Announce to observers that flow data is available.
             */
            $rootScope.$broadcast('FlowDataAvailable');
        }

        return flow;
    }
})();
(function() {
    angular.module('main')
      .controller('ExFooterCtl', ['$scope', 'ExMsgSvc','Data', 'ExCrdSvc', function($scope, ExMsgSvc, Data, ExCrdSvc) {

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
          
          $scope.$on('msgAvailable', function() {
                  $scope.num_codes =ExMsgSvc.numType;
            });
          
          $scope.$on('countCleared', function() {
                  $scope.num_codes =ExMsgSvc.numType;
            });


            $scope.$on('dataNotAvailable', function() {
              $scope.connected = false;
            });


          }]);
      })();

(function () {
    angular.module('main').controller('ExPowerCtl', ['$scope', 'cvt',
    function ($scope, cvt) {

            $scope.power = cvt.power;

            $scope.order = ["Pump", "O3Gen", "Denuder", "Laser", "TEC"];

            cvt.first_call = 1;

            $scope.toggle = function (id) {
                // Flip the bit
                $scope.power[id] = !$scope.power[id];

                //Sketch out space for the values used below
                var num = 0;
                var val = 0;

                /* Convert the array of booleans for the power to
                 * a decimal integer.  We will send this decimal
                 * integer back for the power.
                 */

                for (var i = 0; i < $scope.order.length; i++) {
                    if ($scope.power.hasOwnProperty($scope.order[i])) {
                        val = $scope.power[$scope.order[i]] ? 1 : 0;
                        num += Math.pow(2, i) * val;
                    }

                }
                cvt.updatePS(num);

            };
    }
  ]);
})();
(function () {
    angular.module('main')
        .controller('mrConfigCtlr', ['$scope', '$http', 'Data', 'net', 'cvt', function ($scope, $http, Data, net, cvt) {

            cvt.first_call = 1;
            
            $scope.connected = false;

            $scope.$on('dataNotAvailable', function () {
                $scope.connected = false;
            });
            $scope.$on("dataAvailable", function(){
                $scope.connected= true;
            });
            

            $scope.stop = function () {
                $http.get(net.address() + 'General/Stop');
            };
            
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
            };



	}]);
})();

(function () {
    angular.module('main').controller('ExFilterCtl', ['$scope', 'net', '$http', 'cvt',
  'Data',
        function ($scope, net, $http, cvt, Data) {

            /* Filter cycle consists of a period that defines the time in seconds
             * between which the filter is cycled to true, length of time in seconds
             * that the filter is on and a boolean indicating whether the syste is set
             * to cycle.
             */

            cvt.first_call = 1;
            
            $scope.filter = {
                cycle: cvt.filter.cycle,
                position: cvt.filter.position,
                updateCycle: function() {
                    
                    cvt.filter.updateCycle(this.cycle);

                },
                updateAuto: function(){
                    this.cycle.auto = !this.cycle.auto;
                    this.updateCycle();
                },
                updatePos: function(){
                    cvt.filter.updatePos(this.position);
                }

            };


            $scope.tremain = Data.filter.tremain;
            $scope.state = Data.filter.state;

            $scope.updateAuto = function () {
                $scope.cycle.auto = !$scope.cycle.auto;
                $scope.updateCycle();
            };

            $scope.$on('dataAvailable', function () {
                $scope.tremain = Data.filter.tremain;
                $scope.state = Data.filter.state;
            });

            $scope.$on('cvtUpdated', function () {
                $scope.filter.cycle = cvt.filter.cycle;
            });
}]);
})();
(function () {
    angular.module('main').factory('ExCrdSvc', crdSvc);

    var shift = false;
    var history = 300;

    /* Annotate for minification. */
    crdSvc.$inject = ['$rootScope', 'Data'];

    /**
     * @ngdoc service
     * @name main.service:ExCrdSvc
     * @requires $rootScope
     * @requires main.service:Data
     *
     * @description
     * Service that handles the CRD Data returned by the main Data service.
     *
     */
    function crdSvc($rootScope, Data) {

        var CrdData = new CrdObject();

        $rootScope.$on('dataAvailable', get_data);

        /**
         * @ngdoc method
         * @ngdoc main.service:ExCrdSvc#get_data
         * @methodOf main.service:ExCrdSvc
         * @returns {Object} CRD data object
         * @description
         * Sort data for graphing.
         */
        function get_data() {

            CrdData = handleCRD(Data, CrdData);

            /**
             * @ngdoc event
             * @name crdDataAvailable
             * @eventType broadcast
             * @eventOf main.service:ExCrdSvc
             *
             * @description
             * Event that broadcasts the CRD Data has been processed
             * and is available.
             */
            $rootScope.$broadcast('crdDataAvaliable');
        }

        return CrdData;
    }

    function CrdObject() {
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

        this.set_history = function (n) {

            if (this.tau.length > n) {

                // Remove the difference
                var x = this.tau.length - n;

                this.tau.splice(0, x);
                this.tau.splice(0, x);
                this.tau0.splice(0, x);
                this.taucorr.splice(0, x);
                this.tau0corr.splice(0, x);
                this.ext.splice(0, x);
                this.extcorr.splice(0, x);
                this.stdevtau.splice(0, x);
                this.etau.splice(0, x);
                this.max.splice(0, x);
                shift = true;
            }
            else{
                shift = false;
            }

            // Reset the length of the history
            history = n;
        };

        this.clear_history = function () {

            // Reset the boolean that tells us to shift the data
            shift = false;

            // Clear all of the arrays
            this.tau = [];
            this.tau0 = [];
            this.taucorr = [];
            this.tau0corr = [];
            this.ext = [];
            this.extcorr = [];
            this.stdevtau = [];
            this.etau = [];
            this.max = [];
        };
    }

    /**
     * @ngdoc method
     * @name main.service:ExCrdSvc#handleCRD
     * @methodOf main.service:ExCrdSvc
     * @description
     * This function handles allocation of the CRD data.  All data may be plotted
     * and as such the data is divided up into arrays of {x,y} pairs for use by
     * plotting libraries.  The length of the arrays is defined by the service
     * and the length is indicated by the input shift.
     * @param {Object} d The JSON data object returned by the server.
     * @param {Object} crd Data object that will be broadcasted to controllers.
     * @return {Object} Data object defined in the inputs.
     */
    function handleCRD(d, crd) {

        /* Alot space for storing the data that will be plugged into the dygraph plots.
         * The data will look like 
         * 
         *      ``[time, val1, val2, ...]``
         *
         * where ``time`` is a ``Date`` object with the value of ``Data.tObj`` above and ``vali`` represents the value of the data 
         * for cell i.  This data will be plugged into an array that will be used for graphing.
         */
        var tau = [d.tObj],
            tau0 = [d.tObj],
            stdevtau = [d.tObj],
            taucorr = [d.tObj],
            tau0corr = [d.tObj],
            ext = [d.tObj],
            extcorr = [d.tObj],
            etau = [d.tObj],
            max = [d.tObj];

        /* We will collect ``shift`` data points before we actually pop the array.
         * Popping the array allows us to stop remove the oldest point so that we can
         * push more data onto the stack in the newest position using ``unshift()``.
         */
        if (shift) {
            crd.tau.shift();
            crd.tau0.shift();
            crd.taucorr.shift();
            crd.tau0corr.shift();
            crd.ext.shift();
            crd.extcorr.shift();
            crd.stdevtau.shift();
            crd.etau.shift();
            crd.max.shift();
        }
        else {

            // Check to make sure we haven't gone past the length of data
            // requested by the user.
            shift = crd.tau.length >= history ? true : false;
        }

        // Store all of the cell data in the temporary variables defined above.
        // TODO: THERE HAS TO BE A FASTER WAY (ITERATOR?)
        for (var index in d.data.CellData) {

            // These parameters are discrete points
            tau.push(d.data.CellData[index].extParam.Tau);
            tau0.push(d.data.CellData[index].extParam.Tau0);
            tau0corr.push(d.data.CellData[index].extParam.Tau0cor);
            taucorr.push(d.data.CellData[index].extParam.taucorr);
            ext.push(d.data.CellData[index].extParam.ext);
            extcorr.push(d.data.CellData[index].extParam.extCorr);
            stdevtau.push(d.data.CellData[index].extParam.stdevTau);
            etau.push(d.data.CellData[index].extParam.eTau);
            max.push(d.data.CellData[index].extParam.max);

        }

        crd.avg_rd = [];
        // Handle the ringdown data
        for (var k = 0; k < d.data.CellData[0].Ringdowns[0].length; k++) {
            var aRD = [k];
            for (var j = 0; j < d.data.CellData.length; j++) {
                aRD.push(d.data.CellData[j].Ringdowns[0][k]);

            }
            crd.avg_rd.push(aRD);
        }

        crd.tau.push(tau);
        crd.tau0.push(tau0);
        crd.tau0corr.push(tau0corr);
        crd.taucorr.push(taucorr);
        crd.extcorr.push(extcorr);
        crd.ext.push(ext);
        crd.stdevtau.push(stdevtau);
        crd.etau.push(etau);
        crd.max.push(max);


        return crd;
    }
})();
(function () {
    angular.module('main').controller('ExCrdCtl', ['$scope', 'cvt', 'ExCrdSvc',
        function ($scope, cvt, ExCrdSvc) {

            cvt.firstcall = 1;
            
            var maxPMTGain = 10;
            var maxLaserGain = 5;

            // Lasers have three inputs
            var laserInput = function (_rate, _DC, _k, enabled, ID) {
                this.rate = _rate;
                this.DC = _DC;
                this.k = _k;
                this.en = enabled;
                this.id = ID;
            };

            /* Wrap the CVT function so that we force the CVT to update
             * when the view changes.  
             * argument[0] === index of laser 
             * argument[1] === rate.
             */
            $scope.setRate = function () {
                var index = arguments[0];
                var rate = arguments[1];
                cvt.crd.setLaserRate(index, rate);

            };

            $scope.show_wvfm = true;
            
            $scope.update_wvfm_state = function(){
                $scope.show_wvfm = !$scope.show_wvfm;

            };

            $scope.setEn = function () {
                var index = arguments[0];
                $scope.laser_ctl[index].en = !$scope.laser_ctl[index].en;

                cvt.crd.setEnable([$scope.laser_ctl[0].en, $scope.laser_ctl[1].en]);
            };

            /* Variable for laser control binding; first element is related to blue,
             * second to red.
             */
            $scope.laser_ctl = [
                new laserInput(cvt.crd.fblue, cvt.crd.dcblue, cvt.crd.kblue/maxLaserGain*100, cvt.crd.eblue, "Blue Laser"),
                new laserInput(cvt.crd.fred, cvt.crd.dcred, cvt.crd.kred/maxLaserGain*100, cvt.crd.ered, "Red Laser")
            ];

            $scope.pmt = cvt.crd.kpmt.map(function(x){return x/maxPMTGain*100;});

            $scope.setGain = function () {
                cvt.crd.setGain($scope.pmt.map(function(x){ return x/100*maxPMTGain;}));
            };

            $scope.setLaserGain = function () {
                cvt.crd.setLaserGain([$scope.laser_ctl[0].k/100*maxLaserGain, $scope.laser_ctl[1].k/100*maxLaserGain]);
            };

            $scope.purge = {
                pos: false,
                flow: 0.16,
                setValve: function () {
                    this.pos = !this.pos;
                    cvt.purge.setSw(this.pos);

                },
                setFlow: function () {

                }
            };

            $scope.data = ExCrdSvc;

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

            // dygraph options object
            $scope.options = {
                title: 'Ringdown Data',
                ylabel: 'Ringdown Magnitude (au)',
                labels: ["t", "Cell 1", "Cell 2", "Cell 3", "Cell 4", "Cell 5"],
                legend: 'always'

            };

            /* Listen for broadcasts from the DATA SERVICE */
            $scope.$on('crdDataAvaliable', function () {

                $scope.data = ExCrdSvc;

                $scope.ringdownAvg = ExCrdSvc.avg_rd;

            });

            $scope.$on('cvtUpdated', function () {
                $scope.laser_ctl[0].rate = cvt.crd.fblue;
                $scope.laser_ctl[0].DC = cvt.crd.dcblue;
                $scope.laser_ctl[0].k = cvt.crd.kblue/maxPMTGain*100;
                $scope.laser_ctl[0].enabled = cvt.crd.eblue;

                $scope.laser_ctl[1].rate = cvt.crd.fred;
                $scope.laser_ctl[1].DC = cvt.crd.dcred;
                $scope.laser_ctl[1].k = cvt.crd.kred/maxPMTGain*100;
                $scope.laser_ctl[1].enabled = cvt.crd.ered;

                $scope.pmt = cvt.crd.kpmt.map(function(x){return x/maxPMTGain*100;});

                //$scope.purge.pos = cvt.general.purge;

            });
        }
    ]);
})();
(function () {
    angular.module('main').directive('exCrdplot', crdPlotDir);

    /**
     * @ngdoc directive
     * @name main.directive:exCrdplot
     *
     * @description
     *
     *
     */
    function crdPlotDir() {
        /**
         * @ngdoc controller
         * @name main.controller:CrdPlotCtl
         * @requires $rootScope
         * @requires main.service:ExCrdSvc
         * @description
         *
         */
        var CrdPlotCtl = function ($rootScope, ExCrdSvc, ExReadCfgSvc) {

            var vm = this;

            /* Plot tau by default... */
            var objectData = 'tau';

            /**
             * @ngdoc property
             * @name main.controller:CrdPlotCtl#cm
             * @propertyOf main.controller:CrdPlotCtl
             * @description
             * Provide a context menu for the CRD graph.  The elements are
             *
             *  * tau
             *  * tau'
             *  * standard deviation
             *  * max
             *
             * Also provides some functionality for clearing the plots and changing the lengths...
             */
            vm.cm = [
                ['<em>&tau;</em>', function () {
                    objectData = "tau";
                    vm.options.ylabel = "<em>&tau;</em> (&mu;s)";
                }],
                ["<em>&tau;'</em>",
                    function () {
                        objectData = "taucorr";
                        vm.options.ylabel = "<em>&tau;'</em> (&mu;s)";
                    }],
                ['<em>&sigma;<sub>&tau;</sub></em>', function () {
                    objectData = "stdevtau";
                    vm.options.ylabel = "<em>&sigma;<sub>&tau;</sub></em> (us)";
                }],
                ['Max', function () {
                    objectData = "max";
                    vm.options.ylabel = "Max (a.u.)";
                }],
                null, // Creates a divider
                ['Clear Data', function () {
                    ExCrdSvc.clear_history();
                }],
                ['Length', null,
                    [['30', function () {
                        ExCrdSvc.set_history(30);
                    }],
                        ['60', function () {
                            ExCrdSvc.set_history(60);
                        }],
                        ['120', function () {
                            ExCrdSvc.set_history(120);
                        }],
                        ['150', function () {
                            ExCrdSvc.set_history(150);
                        }],
                        ['300', function () {
                            ExCrdSvc.set_history(300);
                        }]
                    ]
                ]
            ];

            /**
             * @ngdoc property
             * @name main.controller:CrdPlotCtl#optoins
             * @propertyOf main.controller:CrdPlotCtl
             * @description
             * Options for the CRD graph. The options are based on teh ``dygraph`` plot options.  The ones
             * that are explicit at invocation are
             *
             * * ``ylabel`` - set for the initial plotting of tau
             * * ``labels`` - the initial labels are for time and cells 1-5
             * * ``legend`` - set to always be shown
             * * ``axes``   - set parameters for the axes such as width of the axes
             */
            var CfgObj = ExReadCfgSvc.crd;
            var labels = ["t"].concat(CfgObj.names);
            vm.options = {
                ylabel: "<em>&tau;</em> (&mu;s)",
                labels: labels,
                legend: 'always',
                axes: {
                    y: {
                        axisLabelWidth: 70,
                        drawGrid: CfgObj.yGrid
                    },
                    x: {
                        drawAxis: true,
                        drawGrid: CfgObj.xGrid,
                        axisLabelFormatter: function (d) {
                            return Dygraph.zeropad(d.getHours()) + ":" + Dygraph.zeropad(d.getMinutes()) + ":" + Dygraph.zeropad(d.getSeconds());
                        }
                    }
                },
                series: {}
            };
            var cl = CfgObj.color.length;
            var pl = CfgObj.pattern.length;
            var swl = CfgObj.strokeWidth.length;

            for (var j = 0; j < CfgObj.names.length; j++) {
                var p = CfgObj.pattern[j % pl] === null ? null : Dygraph[CfgObj.pattern[j % pl]];
                vm.options.series[CfgObj.names[j]] = {
                    color: CfgObj.color[j % cl],
                    strokeWidth: CfgObj.strokeWidth[j % swl],
                    strokePattern: p,
                    drawPoints: true
                };

            }

            // If the user specifies a title, put it up there...
            if (vm.title !== undefined) {
                vm.options.title = vm.title;
            }

            // Some default data so that you can see the actual graph
            vm.data = [[0, NaN, NaN, NaN, NaN, NaN]];

            $rootScope.$on('crdDataAvaliable', update_plot);

            /* Update plot with new data. */
            function update_plot() {
                vm.data = ExCrdSvc[objectData];
            }

        };

        // Provide annotation for angular minification
        CrdPlotCtl.$inject = ['$rootScope', 'ExCrdSvc', 'ExReadCfgSvc'];

        return {
            restrict: 'E',
            require: 'contextMenu',
            scope: {
                title: "@?"
            },
            controller: CrdPlotCtl,
            controllerAs: 'vm',
            bindToController: true,
            template: '<context-menu menu-options="vm.cm"><dy-graph options="vm.options" data="vm.data" ></dy-graph></context-menu>'
        };
    }
})();

(function () {
    angular.module('main').controller('ExPasCtl', pas_ctl);

    pas_ctl.$inject = ['$scope', 'cvt', 'ExPasSvc', 'ExReadCfgSvc'];


    function pas_ctl($scope, cvt, ExPasSvc, ExReadCfgSvc) {

        /**
         * @ngdoc controller
         * @name main.controller:ExPasCtl
         * @description
         * Controller for PAS functionality.
         */

        $scope.data = ExPasSvc.data;


        var labels = ExReadCfgSvc.pas.names.slice();

        labels.unshift('t');

        var cl = ExReadCfgSvc.pas.color.length;
        var pl = ExReadCfgSvc.pas.pattern.length;

        $scope.show_wvfm = cvt.pas.send_wvfm;

        
        /**
         * @ngdoc method
         * @name main.controller:ExPasCtl#update_wvfm_state
         * @methodOf main.service:ExPasCtl
         *
         * @description
         * Change state of whether the waveforms will be sent to the 
         * client.  Calls the cvt.pas.send_wvfm() function to store 
         * this in the CVT service.
         */
        $scope.update_wvfm_state = function(){
            $scope.show_wvfm = !$scope.show_wvfm;
            
            cvt.pas.send_wvfm($scope.show_wvfm);

        };
        
        $scope.write_wvfm = cvt.pas.write_wvfm;        
         
        /**
         * @ngdoc method
         * @name main.controller:ExPasCtl#update_wvfm_write_state
         * @methodOf main.service:ExPasCtl
         *
         * @description
         * Update the state of writing PAS waveforms on the server side.
         */
        $scope.update_wvfm_write_state = function(){
            $scope.write_wvfm = !$scope.write_wvfm;
            
            cvt.pas.write_wvfm($scope.write_wvfm);

        };
        
        $scope.$on('cvtUpdated', update_ctl);
        $scope.$on('pasDataAvaliable', display_data);
        $scope.wvfmData = [[0, NaN, NaN, NaN, NaN, NaN]];

        // dygraph options object
        $scope.options = {
            title: 'PAS Waveform Data',
            ylabel: 'Microphone Frequency (a.u.)',
            labels: ['t', 'Cell 1', 'Cell 2', 'Cell 3', 'Cell 4', 'Cell 5'],
            legend: 'always',
            series: {}

        };

        for (var j = 0; j < ExReadCfgSvc.pas.names.length; j++) {
            var p = ExReadCfgSvc.pas.pattern[j % pl] === null ? null : Dygraph[ExReadCfgSvc.pas.pattern[j % pl]];
            $scope.options.series[ExReadCfgSvc.pas.names[j]] = {
                color: ExReadCfgSvc.pas.color[j % cl],
                strokeWidth: 1,
                strokePattern: p,
                drawPoints: false
            };

        }

        $scope.cm_options = [
            ['Mic. Frequency', function () {
                data_set = "micf";
                $scope.options.ylabel = 'Microphone Frequency (a.u.)';
                $scope.options.axes.y.valueRange = [null, null];
            }
            ],
            ['Mic. Time',
                function () {
                    data_set = "mict";
                    $scope.options.ylabel = 'Microphone Time (a.u.)';
                    $scope.options.axes.y.valueRange = [null, null];
                }
            ],
            ['Photodiode Time',
                function () {
                    data_set = "pd";
                    $scope.options.ylabel = 'Photodiode Time (a.u>)';
                    $scope.options.axes.y.valueRange = [null, null];
                }
            ]
        ];

        function display_data() {
            $scope.data = ExPasSvc.data;
            $scope.wvfmData = ExPasSvc.wvfm.micf;
        }
        
        function update_ctl() {
        
            $scope.write_wvfm = cvt.pas.write_wvfm_state;  
            $scope.show_wvfm = cvt.pas.send_wvfm_state;
            
        }

        cvt.first_call = 1;

    }

})();
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
            this.temp = [];
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
                this.temp = [];

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
                abs = [Data.tObj],
                temp = [Data.tObj];

            /* Pop all of the ordered arrays if the arrays are of the set length... */
            if (shift) {
                PasData.f0.shift();
                PasData.IA.shift();
                PasData.Q.shift();
                PasData.p.shift();
                PasData.abs.shift();
                PasData.temp.shift();
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
                        celldata[index].derived.max[1],
                                                      celldata[index].T[0]));
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
                
                // TODO: Make sure this works...we will likely remove the array
                temp.push(celldata[index].T[0]);
            }

            PasData.f0.push(f0);
            PasData.IA.push(IA);
            PasData.Q.push(Q);
            PasData.p.push(p);
            PasData.abs.push(abs);
            PasData.temp.push(temp);

            PasData.drive = Data.data.PAS.Drive;

            PasData.wvfm.mict = [];
            PasData.wvfm.micf = [];
            PasData.wvfm.pd = [];

            // point by point
            var df = celldata[0].MicFreq.dt;
            var dt = celldata[0].MicTime.dt;
            var pdt = celldata[0].PhotoDiode.dt;
            
            for (var k = 0; k < celldata[0].MicFreq.Y.length; k++) {
                var micf = [k*df];
                for (var j = 0; j < celldata.length; j++) {
                    micf.push(celldata[j].MicFreq.Y[k]);
                }

                // Push the data in cell-wise
                PasData.wvfm.micf.push(micf);
            }
            for (var k = 0; k < celldata[0].MicTime.Y.length; k++) {
                var mict = [k*dt];
                for (var j = 0; j < celldata.length; j++) {
                    mict.push(celldata[j].MicTime.Y[k]);
                }

                // Push the data in cell-wise
                PasData.wvfm.mict.push(mict);
            }
            for (var k = 0; k < celldata[0].PhotoDiode.Y.length; k++) {
                var pd = [k*pdt];
                for (var j = 0; j < celldata.length; j++) {
                    pd.push(celldata[index].PhotoDiode.Y[k]);
                }

                // Push the data in cell-wise
                PasData.wvfm.pd.push(pd);
            }

            $rootScope.$broadcast('pasDataAvaliable');
        }

        return PasData;
    }


})();
(function() {
  angular.module('main').controller('ExPasSpkCtl', ['$scope', 'cvt', 'Data',
    function($scope, cvt) {

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

        $scope.speaker.f0 = $scope.speaker.f0 > flim.high? flim.high:$scope.speaker.f0;
        $scope.speaker.f0 = $scope.speaker.f0 < flim.low? flim.low:$scope.speaker.f0;

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

(function () {
    angular.module('main').controller('ExPasLasCtl', ['$scope', 'cvt', 'Data',
        function ($scope, cvt, Data) {

            $scope.lasCtl = [];
            
            var maxRange = 5;

            /** NOTE: This loop initializes the laser controls based on what is
             * in the CVT.  If the initial speaker setting is TRUE, then
             * the value of f0 will be overrun IMMEDIATELY.
             */
            for (var i = 0; i < cvt.pas.las.vr.length; i++) {

                $scope.lasCtl.push(new lasSet(cvt.pas.las.vr[i]/maxRange*100,
                    cvt.pas.las.f0[i],
                    cvt.pas.las.modulation[i],
                    cvt.pas.las.enable[i]));

            };

            $scope.$on('cvtUpdated', function () {

                // Update the laser controls if something has set them on the
                // server-side.
                for (var i = 0; i < cvt.pas.las.vr.length; i++) {

                    $scope.lasCtl[i].Vnorm = cvt.pas.las.vr[i]/maxRange*100;
                    
                    $scope.lasCtl[i].f0 = cvt.pas.las.f0[i];
                    $scope.lasCtl[i].modulation = cvt.pas.las.modulation[i];
                    $scope.lasCtl[i].lasEn = cvt.pas.las.enable[i];

                }
                console.log($scope.lasCtl);

            });

            $scope.updateMod = function () {

                var index = arguments[0];
                $scope.lasCtl[index].modulation = $scope.lasCtl[index].modulation===0?1:0;

                var x = [];
                for (j = 0; j < $scope.lasCtl.length; j++) {
                    x.push($scope.lasCtl[j].modulation);
                }
                cvt.pas.las.updateMod(x);
            };

            /* Update the laser voltage range for the lasers in the current value
             * table.
             */
            $scope.updateLasVolt = function () {
                var x = [];
                var y = [];
                var tempRange = 0;
                for (i = 0; i < $scope.lasCtl.length; i++) {
                    tempRange = $scope.lasCtl[i].Vnorm*maxRange/100;
                    x.push(tempRange);
                    y.push(tempRange/2);
                }
                cvt.pas.las.setVr(x);
                cvt.pas.las.setVo(x);
            };

            $scope.updatef0 = function () {
                var x = [];
                for (i = 0; i < $scope.lasCtl.length; i++) {
                    x.push($scope.lasCtl[i].f0);
                }
                cvt.pas.las.setf0(x);
            };

            $scope.updateEnable = function (i) {

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
     * * Vnorm = voltage range in volts of laser modulation
     * * f0 = modulation frequency in Hz
     * * modulation = boolean representing sine (false) or square (true)
     */
    function lasSet(vr, vo, f0, mod, en) {
        this.Vnorm = vr;
        this.f0 = f0;
        this.modulation = mod;
        this.lasEn = false;
    }

})();
(function () {
    angular.module('main').directive('exPasplot', pas_plot);

    /**
     * @ngdoc directive
     * @name main.directive:exPasPlot
     *
     * @description
     *
     *
     */
    pas_plot.$inject = ['ExReadCfgSvc'];
    function pas_plot(ExReadCfgSvc) {

        /**
         * @ngdoc controller
         * @name main.controller:PasPlotCtl
         * @requires $rootScope
         * @requires main.service:ExPasSvc
         * @description
         *
         */
        var PasPlotCtl = function ($rootScope, ExPasSvc) {

            var vm = this;

            var objectData = 'IA';

            /**
             * @ngdoc property
             * @name main.controller:PasPlotCtl#cm
             * @propertyOf main.controller:PasPlotCtl
             * @description
             * Provide a context menu for the Pas graph.  The elements are
             *
             *  * tau
             *  * tau'
             *  * standard deviation
             *  * max
             *
             * Also provides some functionality for clearing the plots and changing the lengths...
             */
            vm.cm = [
                ['<em>IA (a.u.)</em>', function () {
                    objectData = "IA";
                    vm.options.ylabel = "IA (a.u.)";
                }],
                ["<em>f<sub>0</sub></em>",
                    function () {
                        objectData = "f0";
                        vm.options.ylabel = "<em>f<sub>0</sub></em> (Hz)";
                    }],
                ['Quality', function () {
                    objectData = "Q";
                    vm.options.ylabel = "Quality (a.u.)";
                }],
                ['Noise Floor', function () {
                    objectData = "p";
                    vm.options.ylabel = "Noise (a.u.)";
                }],
                ['<em>&sigma;<sub>abs</sub></em>', function () {
                    objectData = "abs";
                    vm.options.ylabel = "<em>&sigma;<sub>abs</sub></em> (Mm<sup>-1</sup>)";
                }],
                null, // Creates a divider
                ['Clear Data', function () {
                    ExPasSvc.clear();
                }],
                ['History', null, [
                    ['30', function () {
                        ExPasSvc.set_history(30);
                    }],
                    ['60', function () {
                        ExPasSvc.set_history(60);
                    }],
                    ['120', function () {
                        ExPasSvc.set_history(120);
                    }],
                    ['150', function () {
                        ExPasSvc.set_history(150);
                    }],
                    ['300', function () {
                        ExPasSvc.set_history(300);
                    }]
                ]],
                ['Grid', null,
                    [['Grid X', function () {
                    }], ['Grid Y', function () {
                    }], ['Enable', function () {
                    }],
                        ['Disable', function () {
                        }]]
                ]
            ];

            /**
             * @ngdoc property
             * @name main.controller:PasPlotCtl#optoins
             * @propertyOf main.controller:PasPlotCtl
             * @description
             * Options for the Pas graph. The options are based on teh ``dygraph`` plot options.  The ones
             * that are explicit at invocation are
             *
             * * ``ylabel`` - set for the initial plotting of tau
             * * ``labels`` - the initial labels are for time and cells 1-5
             * * ``legend`` - set to always be shown
             * * ``axes``   - set parameters for the axes such as width of the axes
             */

            var CfgObj = ExReadCfgSvc.pas;
            var labels = ["t"].concat(CfgObj.names);
            vm.options = {
                ylabel: "<em>IA</em> (a.u.)",
                labels: labels,
                legend: 'always',
                axes: {
                    y: {
                        axisLabelWidth: 70,
                        drawGrid: CfgObj.yGrid,
                    },
                    x: {
                        drawAxis: true,
                        drawGrid: CfgObj.xGrid,
                        axisLabelFormatter: function (d) {
                            return Dygraph.zeropad(d.getHours()) + ":" + Dygraph.zeropad(d.getMinutes()) + ":" + Dygraph.zeropad(d.getSeconds());
                        }
                    }
                },
                series: {}
            };

            var cl = CfgObj.color.length;
            var pl = CfgObj.pattern.length;
            var swl = CfgObj.strokeWidth.length;

            for (var j = 0; j < CfgObj.names.length; j++) {
                var p = CfgObj.pattern[j % pl] === null ? null : Dygraph[CfgObj.pattern[j % pl]];
                vm.options.series[CfgObj.names[j]] = {
                    color: CfgObj.color[j % cl],
                    strokeWidth: CfgObj.strokeWidth[j % swl],
                    strokePattern: p,
                    drawPoints: true
                };

            }

            // If the user specifies a title, put it up there...
            if (vm.title !== undefined) {
                vm.options.title = vm.title;
            }

            // Some default data so that you can see the actual graph
            vm.data = [[0, NaN, NaN, NaN, NaN, NaN]];

            $rootScope.$on('pasDataAvaliable', update_plot);

            function update_plot() {

                vm.data = ExPasSvc[objectData];

            }

        };

        // Provide annotation for angular minification
        PasPlotCtl.$inject = ['$rootScope', 'ExPasSvc'];

        return {
            restrict: 'E',
            scope: {
                title: "@?"
            },
            controller: PasPlotCtl,
            controllerAs: 'vm',
            bindToController: true,
            template: '<context-menu menu-options="vm.cm"><dy-graph options="vm.options" data="vm.data"></dy-graph></context-menu>'

        };
    }
})();
(function () {
    angular.module('main').directive('exPasWvfm', pas_wvfm);

    /**
     * @ngdoc directive
     * @name main.directive:exPasPlot
     *
     * @description
     *
     *
     */
    pas_wvfm.$inject = ['ExReadCfgSvc'];

    function pas_wvfm(ExReadCfgSvc) {

        /**
         * @ngdoc controller
         * @name main.controller:PasPlotCtl
         * @requires $rootScope
         * @requires main.service:ExPasSvc
         * @description
         *
         */
        var PasWvfmCtl = function ($rootScope, ExPasSvc) {

            var vm = this;

            var objectData = 'micf';
            
            /**
             * @ngdoc property
             * @name main.controller:PasPlotCtl#cm
             * @propertyOf main.controller:PasPlotCtl
             * @description
             * Provide a context menu for the Pas graph.  The elements are
             *
             *  * tau
             *  * tau'
             *  * standard deviation
             *  * max
             *
             * Also provides some functionality for clearing the plots and changing the lengths...
             */
            vm.cm = [
                ['Microphone Frequency Domain', function () {
                    objectData = "micf";
                    vm.options.ylabel = "Mic Frequency Power (a.u.)";
                    vm.options.xlabel = "f (Hz)";
                }],
                ["Microphone Time Domain",
                    function () {
                        objectData = "mict";
                        vm.options.ylabel = "Mic Time Magnitude (a.u.)";
                        vm.options.xlabel = "t";
                    }],
                ['Photodiode Time Domain', function () {
                    objectData = "pd";
                    vm.options.ylabel = "PD Time Magnitude (a.u.)";
                    vm.options.xlabel = "t";
                }],
                null,
                ['Grid', null,
                    [['Grid X', function () {}], ['Grid Y', function () {}], ['Enable', function () {}],
                        ['Disable', function () {}]]
                ]
            ];

            /**
             * @ngdoc property
             * @name main.controller:PasWvfmCtl#optoins
             * @propertyOf main.controller:PasWvfmCtl
             * @description
             * Options for the Pas graph. The options are based on teh ``dygraph`` plot options.  The ones
             * that are explicit at invocation are
             *
             * * ``ylabel`` - set for the initial plotting of tau
             * * ``labels`` - the initial labels are for time and cells 1-5
             * * ``legend`` - set to always be shown
             * * ``axes``   - set parameters for the axes such as width of the axes
             */

            var CfgObj = ExReadCfgSvc.pas;
            var labels = ["f"].concat(CfgObj.names);
            vm.options = {
                ylabel: "Mic Frequency Power (a.u.)",
                labels: labels,
                legend: 'always',
                axes: {
                    y: {
                        axisLabelWidth: 70,
                        drawGrid: CfgObj.yGrid
                    },
                    x: {
                        drawAxis: true,
                        drawGrid: CfgObj.xGrid
                    }
                },
                series: {}
            };

            var cl = CfgObj.color.length;
            var pl = CfgObj.pattern.length;
            var swl = CfgObj.strokeWidth.length;

            for (var j = 0; j < CfgObj.names.length; j++) {
                var p = CfgObj.pattern[j % pl] === null ? null : Dygraph[CfgObj.pattern[j % pl]];
                vm.options.series[CfgObj.names[j]] = {
                    color: CfgObj.color[j % cl],
                    strokeWidth: CfgObj.strokeWidth[j % swl],
                    strokePattern: p,
                    drawPoints: true
                };

            }

            // If the user specifies a title, put it up there...
            if (vm.title !== undefined) {
                vm.options.title = vm.title;
            }

            // Some default data so that you can see the actual graph
            vm.data = [[0, NaN, NaN, NaN, NaN, NaN]];
            
            vm.options.xlabel = "f (Hz)";

            $rootScope.$on('pasDataAvaliable', update_plot);

            function update_plot() {

                vm.data = ExPasSvc.wvfm[objectData];

            }

        };

        // Provide annotation for angular minification
        PasWvfmCtl.$inject = ['$rootScope', 'ExPasSvc'];

        return {
            restrict: 'E',
            scope: {
                title: "@?"
            },
            controller: PasWvfmCtl,
            controllerAs: 'vm',
            bindToController: true,
            template: '<context-menu menu-options="vm.cm"><dy-graph options="vm.options" data="vm.data"></dy-graph></context-menu>'

        };
    }
})();
(function () {
    angular.module('main').directive('exPasTempPlot', pasTempPlotDir);

    function pasTempPlotDir() {
        /**
         * @ngdoc directive
         * @name main.directive:exPasTempPlot
         * @scope
         * @restrict E
         *
         * @description
         * This directive wraps a plot specifically for the purpose of providing
         * a reusable means to display PAS specfiic temperature data returned by the server.
         *
         */

        /**
         * @ngdoc controller
         * @name main.controller:pasTempPoltCtl
         * @requires $rootScope
         * @requires main.service:ExReadCfgSvc
         * @requires main.service:ExPasSvc
         *
         * @description
         * This controller is used specifically for handling data returned by
         * the PAS service to plot the temperature data.
         */

        pasTempPlotDir.$inject = ['$rootScope', 'ExReadCfgSvc', 'ExPasSvc'];
        function pasTempPoltCtl($rootScope, ExReadCfgSvc, ExPasSvc) {


            var vm = this;

            vm.ref = {};

            /**
             * @ngdoc property
             * @name main.controller:pasTempPoltCtl#cm
             * @propertyOf main.controller:pasTempPoltCtl
             *
             * @description
             * Provides an array of arrays for defining the context menu on the plot.
             * Each array within the array consists of
             *
             * 1. ``string`` - name displayed in the context menu.
             * 2. ``function`` - function that is exectuted when the context meny selection
             * is made.
             *
             * The context meny for this plot is defined as follows:
             *
             * * Enable All - enable all plots
             * * Clear Data - empty plot arrays
             * * Autoscale 1x - adjust the limits to the current plot range
             * * Autoscale - set the range to ``[null, null]`` and axis will adjust to the current range
             *
             */
            vm.cm = [[
                    ['Enable All', function () {
                        console.log('Enabling all.');
                    }],
                    ['Clear Data', function () {
                        ExVaisalaSvc.clear_data();
                    }]
                ],
                [
                    ['Autoscale 1x', function () {
                        vm.options.axes.y.valueRange = vm.ref.yAxisRange();
                    }],
                    ['Autoscale', function () {
                        vm.options.axes.y.valueRange = [null, null];
                    }]
                ]

            ];

            /**
             * @ngdoc property
             * @name main.controller:pasTempPoltCtl#options
             * @propertyOf main.controller:pasTempPoltCtl
             *
             * @description
             * Object defining the options for the definition of the dygraph plot.
             * The options defined below set the
             *
             * * ``ylabel`` - set it based on the initial variable plotted (pressure)
             * * ``labels`` - just a default so that the plot is displayed
             * * ``legend`` - always show the legend
             *
             * The options are updated as necessary by the values returned from the
             * data service as well as the selection chosen in the context meny.
             */
            var CfgObj = ExReadCfgSvc.pas;
            vm.options = {
                ylabel: 'Temperature (&deg;C)',
                labels: ['t', 'Cell 1', 'Cell 2', 'Cell 3', 'Cell 4', 'Cell 5'],
                legend: 'always',
                axes: {
                    y: {
                        axisLabelWidth: 70,
                        drawGrid: CfgObj.yGrid
                    },
                    x: {
                        drawAxis: true,
                        drawGrid: CfgObj.xGrid,
                        axisLabelFormatter: function (d) {
                            return Dygraph.zeropad(d.getHours()) + ":" + Dygraph.zeropad(d.getMinutes()) + ":" + Dygraph.zeropad(d.getSeconds());
                        }
                    }
                },
                series: {},
                labelsUTC: true
            };


            // If the user provides a title in the directive call, add the title.
            if (vm.title !== undefined) {
                vm.options.title = vm.title;
            }

            /**
             * @ngdoc property
             * @name main.controller:pasTempPoltCtl#data
             * @propertyOf main.controller:pasTempPoltCtl
             *
             * @description
             * The data to be plotted in the dygraph plot.  This is updated with the selection
             * of the cotnext menu.  The initial value is just a single array that sets the
             * time variable to 0 and the data value to NaN.  This allows the visualization of
             * plot when there is no data available.
             */
            vm.data = [[0, NaN, NaN, NaN, NaN, NaN]];

            $rootScope.$on('pasDataAvaliable', updatePlot);

            /**
             * @ngdoc method
             * @name main.controller:pasTempPoltCtl#updatePlot
             * @methodOf main.controller:FlowPlotCtl
             *
             * @description
             * Simply popluates the ``data`` variable with the PAS temperature arrays.
             *
             */
            function updatePlot() {
                vm.data = ExPasSvc.temp;
            }
        }

        return {
            restrict: 'E',
            require: 'contextMenu',
            scope: {
                title: "@?"
            },
            controller: pasTempPoltCtl,
            controllerAs: 'vm',
            bindToController: true,
            template: '<context-menu menu-options ="vm.cm"><dy-graph options="vm.options" ref="vm.ref" data="vm.data" ></dy-graph></context-menu>'
        };
    }
})();

(function () {
    angular.module('main').controller("ExFlowCtl", FlowCtl);

    FlowCtl.$inject = ['$scope', "cvt", "ExFlowSvc"];


    /**
     * @ngdoc controller
     * @name main.controller:ExFlowCtl
     * @requires $scope
     * @requires main.service:Data
     * @requires main.service:cvt
     * @requires main.service:ExFlowSvc
     *
     * @description
     * Controller for the flow control and visualization page.
     */
    function FlowCtl($scope, cvt, ExFlowSvc) {

        //$scope.Devices = {};
        $scope.DeviceData = ExFlowSvc.data;
        $scope.Device = ExFlowSvc;

        /* Update the CVT - the CVT should call the server... */
        $scope.updateSP = function () {
            var d = arguments[0];
            var key = arguments[1];
            cvt.flows.updateSP(key, d.Qsp);
        };

        $scope.$on('dataAvailable', function () {
            $scope.DeviceData = ExFlowSvc.data;
            $scope.Device = ExFlowSvc;

        });
    }
})();
(function () {
    angular.module('main').directive('exFlowplot', flowPlotDir);

    function flowPlotDir() {
        /**
         * @ngdoc directive
         * @name main.directive:exFlowplot
         * @scope
         * @restrict E
         *
         * @description
         * This directive wraps a plot specifically for the purpose of providing
         * a reusable means to display flow data returned by the server.
         *
         */

        // TODO: Add scope variable for specifying the subsystem so we 
        // don't have to place every variable on the graph...
        // Suggested:
        // * PAS
        // * CRD
        // * System/General

        /**
         * @ngdoc controller
         * @name main.controller:FlowPlotCtl
         * @requires $rootScope
         * @requires main.service:ExFlowSvc
         *
         * @description
         * This controller is used specifically for handling data returned by
         * the flow device service to plot the data.
         */
        var FlowPlotCtl = function ($rootScope, ExFlowSvc, ExReadCfgSvc) {


            var vm = this;

            var data_set = "P";

            vm.ref = {};

            /**
             * @ngdoc property
             * @name main.controller:FlowPlotCtl#cm
             * @propertyOf main.controller:FlowPlotCtl
             *
             * @description
             * Provides an array of arrays for defining the context menu on the plot.
             * Each array within the array consists of
             *
             * 1. ``string`` - name displayed in the context menu.
             * 2. ``function`` - function that is exectuted when the context meny selection
             * is made.
             *
             * The context meny for this plot is defined as follows:
             *
             * * ``P`` - pressure in mb .
             * * ``T`` - temperature in degrees Celsius.
             * * ``Q`` - volumetric flow rate in lpm.
             * * ``Q0`` - mass flow rate in slpm.
             *
             * Not all values are measured by every device.  In every case, the function executed
             * will set the axis label to the correct value.
             *
             */
            vm.cm = [
                ['P', function () {
                    data_set = "P";
                    vm.options.ylabel = '<em>P</em> (mb)';
                    vm.options.axes.y.valueRange = [null, null];
                }
                ],
                ['T',
                    function () {
                        data_set = "T";
                        vm.options.ylabel = '<em>T</em> (&deg;C)';
                        vm.options.axes.y.valueRange = [null, null];
                    }
                ],
                ['Q',
                    function () {
                        data_set = "Q";
                        vm.options.ylabel = '<em>Q</em> (lpm)';
                        vm.options.axes.y.valueRange = [null, null];
                    }
                ],
                ['Q0',
                    function () {
                        data_set = "Q0";
                        vm.options.ylabel = '<em>Q<sub>0</sub></em> (slpm)';
                        vm.options.axes.y.valueRange = [null, null];
                    }
                ],
                null,
                ['Controller', null, [
                    ['Enable All', function () {
                        console.log('Enabling all.');
                    }],
                    ['Clear Data', function () {
                        ExFlowSvc.clear_data();
                    }]]
                ],
                ['Autoscale', null, [
                    ['Autoscale 1x', function () {
                        vm.options.axes.y.valueRange = vm.ref.yAxisRange();
                    }],
                    ['Autoscale', function () {
                        vm.options.axes.y.valueRange = [null, null];
                    }]
                ]
                ]

            ];

            /**
             * @ngdoc property
             * @name main.controller:FlowPlotCtl#options
             * @propertyOf main.controller:FlowPlotCtl
             *
             * @description
             * Object defining the options for the definition of the dygraph plot.
             * The options defined below set the
             *
             * * ``ylabel`` - set it based on the initial variable plotted (pressure)
             * * ``labels`` - just a default so that the plot is displayed
             * * ``legend`` - always show the legend
             *
             * The options are updated as necessary by the values returned from the
             * data service as well as the selection chosen in the context meny.
             */
            var CfgObj = ExReadCfgSvc.flow;
            vm.options = {
                ylabel: '<em>P</em> (mb)',
                labels: ['t', 'Alicat0'],
                legend: 'always',
                axes: {
                    y: {
                        axisLabelWidth: 70,
                        drawGrid: CfgObj.yGrid
                    },
                    x: {
                        drawAxis: true,
                        drawGrid: CfgObj.xGrid,
                        axisLabelFormatter: function (d) {
                            return Dygraph.zeropad(d.getHours()) + ":" + Dygraph.zeropad(d.getMinutes()) + ":" + Dygraph.zeropad(d.getSeconds());
                        }
                    }
                },
                series: {},
                labelsUTC: true
            };


            if (vm.title !== undefined) {
                vm.options.title = vm.title;
            }

            /**
             * @ngdoc property
             * @name main.controller:FlowPlotCtl#data
             * @propertyOf main.controller:FlowPlotCtl
             *
             * @description
             * The data to be plotted in the dygraph plot.  This is updated with the selection
             * of the cotnext menu.  The initial value is just a single array that sets the
             * time variable to 0 and the data value to NaN.  This allows the visualization of
             * plot when there is no data available.
             */
            vm.data = [[0, NaN]];

            $rootScope.$on('FlowDataAvailable', updatePlot);

            /**
             * @ngdoc method
             * @name main.controller:FlowPlotCtl#updatePlot
             * @methodOf main.controller:FlowPlotCtl
             *
             * @description
             * Function to be executed when data is made available via the service.
             * This function will update the data object with data stored in the service
             * and (if necessary) update the ``labels`` property in the ``options`` object.
             *
             */
            function updatePlot() {
                var l = ['t'];
                for (var key in ExFlowSvc.data){
                    l.push(ExFlowSvc.data[key].label);
                }
                //var l = ['t'].concat(ExFlowSvc.label);

                if (l !== vm.options.labels) {
                    /* If the labels have changed (usually the first time the data
                     * service is called), then copy the new labels into the options.
                     *
                     * Remove the time label...
                     */
                    vm.ref.updateOptions({labels: l.slice()});
                    //vm.options.labels = l.slice();

                    var lab = vm.options.labels.slice(1);

                    var cl = CfgObj.color.length;
                    var pl = CfgObj.pattern.length;
                    var swl = CfgObj.strokeWidth.length;

                    for (var j = 0; j < lab.length; j++) {
                        var p = CfgObj.pattern[j % pl] === null ? null : Dygraph[CfgObj.pattern[j % pl]];
                        vm.options.series[lab[j]] = {
                            color: CfgObj.color[j % cl],
                            strokeWidth: CfgObj.strokeWidth[j % swl],
                            strokePattern: p,
                            drawPoints: true
                        };

                    }
                }

                vm.data = ExFlowSvc[data_set];
            }
        };

        FlowPlotCtl.$inject = ['$rootScope', 'ExFlowSvc', 'ExReadCfgSvc'];

        return {
            restrict: 'E',
            require: 'contextMenu',
            scope: {
                title: "@?"
            },
            controller: FlowPlotCtl,
            controllerAs: 'vm',
            bindToController: true,
            template: '<context-menu menu-options ="vm.cm"><dy-graph options="vm.options" ref="vm.ref" data="vm.data" ></dy-graph></context-menu>'
        };
    }
})();
(function () {

    angular.module('main').factory('ExPptSvc', ppt_svc);

    ppt_svc.$inject = ['$rootScope', 'Data', 'cvt'];

    function ppt_svc($rootScope, Data, cvt) {

        /**
         * @ngdoc service
         * @name main.service:ExPptSvc
         * @requires $rootScope
         * @requires main.service:Data
         * @requires main.service.cvt
         *
         * @description
         * Handle PPT Data retrieved from the ``Data`` service
         */
        var maxi = 300,
            index = 0,
            shift = false;

        function PptObj() {
            this.IDs = [];
            this.T = [];
            this.P = [];
            this.data = {};
            this.clear_data = function () {
                this.P = [];
                this.T = [];
                shift = false;
                index = 0;

            };
            this.set_max = function (m) {
                maxi = m;
            };
        }


        function pData(p, t) {
            this.T = t;
            this.P = p;
        }

        var pptData = new PptObj();
        var ppts = cvt.ppt;

        // Update the device table...
        $rootScope.$on('deviceListRefresh', function () {
            ppts = cvt.ppt;
        });

        $rootScope.$on('dataAvailable', getData);

        function getData() {


            var key = "";
            for (var i = 0; i < ppts.length; i++) {

                key = ppts[i].id;

                if (key in Data.data) {

                    if (!(key in pptData.data)) {

                        pptData.data[key] = new pData(Data.data[key].P, Data.data[key].T);

                        if (pptData.IDs.length === 0) {
                            pptData.IDs = [key];
                        } else {
                            pptData.IDs.push(key);
                        }
                    } else {
                        pptData.data[key].P = Data.data[key].P;
                        pptData.data[key].T = Data.data[key].T;
                    }
                }
            }

            ppts.forEach(populate_arrays);

            if (shift) {
                pptData.P.shift();
                pptData.T.shift();
            } else {
                index += 1;
            }

            pptData.P.push(P);
            pptData.T.push(T);
            shift = index >= maxi;

            $rootScope.$broadcast('PptDataAvailable');
        }


        // Temporary arrays for storing data...
        var P, T;

        function populate_arrays(e, i) {
            if (!i) { // First roll
                P = [Data.tObj, pptData.data[e.id].P];
                T = [Data.tObj, pptData.data[e.id].T];
            } else {
                P.push(pptData.data[e.id].P);
                T.push(pptData.data[e.id].T);
            }
        }
        return pptData;
    }

})();
(function () {
    angular.module('main').controller('ExHumidityCtl', ['$scope', 'cvt', 'Data',
    function ($scope, cvt, Data) {

            /** 
             * @ngdoc controller
             * @name main.controller:humidifier
             * @requires $scope
             * @requires main.service:cvt
             * @requires main.service:Data
             *
             * @description
             * Provides functionality for the humidifier data page.
             */


            cvt.first_call = 1;

            /**
             * @ngdoc property
             * @name main.humidifier.high
             * @propertyOf main.controller:humidifier
             * @description
             * Object defining the properties of the high value humidifier - 
             * pid values and enable.  These values are initialized with the 
             * appropriate cvt controls.
             */


            $scope.h = cvt.humidifier;

            $scope.setEnable = function (i) {
                $scope.h[i].en = !$scope.h[i].en;
                $scope.updateHum(i);

            };

            $scope.$on('cvtUpdated', function () {
                $scope.h = cvt.humidifier;
                
            });
        
            $scope.updateHum = function () {
                var i = arguments[0];
                cvt.humidifier[i].updateParams();
            };

            $scope.ctlrOutData = [[0, NaN, NaN]];
            $scope.RH = [[0, NaN, NaN]];
            $scope.optCtlOut = {
                ylabel: "Controller Output",
                labels: ["t", "med", "high"],
                legend: "always"
            };
            $scope.optRH = {
                ylabel: "RH (%)",
                labels: ["t", "med", "high"],
                legend: "always"
            };

    }
  ]);
})();
/** This controller is placed on the O3 cal page and defines what will happen
 *    when a user double clicks on a table element.
 *
 *    When the element containing this controller is first displayed, the values
 *    in the attribute table_vals will be used to populate the canned table for
 *    sequence building using the ng-repeat directive.
 *
 *    When the user double clicks on a row, the controller will call the tableService
 *    setTab method.  This in turn updates the attributes of that service with the ID
 *    of the row that was clicked.  That ID is then broadcast and picked up by the
 *    tableInput-ctlr which populates the table for the sequence with a default value
 *    for the selected element.
 */

(function () {
    angular.module('main')
        .controller('ExCalibrationCtl', ['$scope', 'ExCalibrationSvc', function ($scope, ExCalibrationSvc) {


            $scope.data = [];

            $scope.save = function () {

                ExCalibrationSvc.ship_data($scope.data);

            };

            /* Contains the entries that will go into the canned table. */
            $scope.base_vals = [
                {
                    "id": "Wait",
                    "step": "Wait",
                    "descr": "Set a wait time in the ozone cal in seconds"
                },
                {
                    "id": "Filter",
                    "step": "Filter",
                    "descr": "Boolean that sets the filter state."
                },
                {
                    "id": "Cabin",
                    "step": "Cabin",
                    "descr": "Boolean that sets the cabin valve state."
                },
                {
                    "id": "Denuder",
                    "step": "Denuder/Bypass",
                    "descr": "Boolean that sets the denuder/bypass valve state."
                },
                {
                    "id": "Speaker",
                    "step": "Speaker",
                    "descr": "Boolean that sets the speaker state."
                }];

            $scope.ozone_vals = [
                {
                    "id": "O2-Valve",
                    "step": "O2 Valve",
                    "descr": "Boolean that sets the O2 valve position."
                },
                {
                    "id": "O3-Valve",
                    "step": "O3 Valve",
                    "descr": "Boolean that sets the O3 valve state."
                },
                {
                    "id": "O3-Generator-Power",
                    "step": "O3 Generator",
                    "descr": "Boolean that sets the O3 generator state."
                },
                {
                    "id": "O2-Flow-Rate",
                    "step": "QO2",
                    "descr": "Numeric to set the oxygen flow rate"
                },
                {
                    "id": "O3-Level",
                    "step": "O3 Level",
                    "descr": "Numeric to set the oxygen flow rate"
                },

                {
                    "id": "O3-Dump-Rate",
                    "step": "QO3,dump",
                    "descr": "Ozone dump rate in lpm."
                }];


            // Initial shallow copy of the base vals...
            $scope.table_vals = $scope.base_vals.slice();

            // TODO: provide dropdown for choosing type of calibration and adjust inputs as necessary...
            for (var i = 0; i < $scope.ozone_vals.length; i++){
                $scope.table_vals.push($scope.ozone_vals[i]);
            }


            var val = "";
            var ID = "";
            /* Handle row double clicks */
            $scope.clickRow = function (row) {
                /* tableService will broadcast the the listeners the current ID */
                //tableService.setTab(row.id.toString());
                ID = row.id.toString();
                switch (ID) {
                    case "Wait":
                    case "Speaker":
                        val = "20";
                        break;
                    case "O2-Flow-Rate":
                    case "O3-Dump-Rate":
                        val = "100";
                        break;
                    case "O3-Level":
                        val = "1";
                        break;
                    default:
                        val = "FALSE";
                }

                $scope.data.push(
                    {
                        "id": ID,
                        "val": val
                    }
                );

            };
        }]);
})();

(function () {
    angular.module('main')
        .factory('ExCalibrationSvc', ['$http', 'net', function ($http, net) {

            /*$scope.cal_file = "default";
             $scope.save = function () {
             var xml = '<?xml version="1.0" encoding="utf-8"?>\r\n<OZONE>\r\n';
             SaveData.getData().forEach(function (entry) {
             xml += "\t<" + entry.id + ">" + entry.val + '</' + entry.id + '>\r\n';
             });

             xml += "</OZONE>";
             console.log(xml);

             /* Send the calibration profile as XML data. */
            /* $http({
             method: 'POST',
             url: net.address() + 'Calibration/saveCalFile?file_name=' + $scope.cal_file + ".xml",
             data: xml,
             headers: {
             "Content-Type": 'application/x-www-form-urlencoded'
             }
             })*/
            var tabService = {};
            var build_file = function (data) {
                var xml = '<?xml version="1.0" encoding="utf-8"?>\r\n<OZONE>\r\n';
                data.forEach(function (datum) {
                    xml += "\t<" + datum.id + ">" + datum.val + '</' + datum.id + '>\r\n';
                });

                xml += "</OZONE>";
                console.log(xml);


                return xml;
            };
            tabService.ship_data = function (data) {



                $http({
                    method: 'POST',
                    url: net.address() + 'Calibration/saveCalFile?file_name=' + "test_cal" + ".xml",
                    data: build_file(data),
                    headers: {
                        "Content-Type": 'application/x-www-form-urlencoded'
                    }
                });
            };


            return tabService;
        }]);

})();

(function() {
	angular.module('main').directive('sidebar', sidebar);

	function sidebar() {
		return {
			restrict : 'E',
			scope : {},
			templateUrl : 'html/side.html'
		};
	}

})();

(function() {
  angular.module('main').factory('navservice', ['$http', 'net', 'cvt',
    function($http, net) {

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
			scope : {name:"=?"},
			templateUrl : 'html/navi.html'
		};
	}

})(); 
(function () {
    /**
     * @ngdoc controller
     * @name main.controller:navctlr
     * @requires $scope
     * @requires navservice
     * @description
     * Defines the controller the encompases the navigation meny at the top of the page.
     */
    angular.module('main').controller('navctlr', ['$scope', 'navservice',
        function ($scope, navservice) {

            /**
             * @ngdoc property
             * @name main.navctlr.save
             * @propertyOf main.controller:navctlr
             * @description
             * Boolean representing the current state of the save button element.
             */
            $scope.save = true;

            /**
             * @ngdoc method
             * @name main.navctlr.updateSave
             * @methodOf main.controller:navctlr
             * @description
             * Switches the save state based on the current save state and makes a
             * call to the ``navservice.save()`` to update the value.
             */

            $scope.updateSave = function () {
                $scope.save = !$scope.save;

                navservice.save($scope.save);
            };

            $scope.stop = function () {
                navservice.stop();
            };

        }
    ]);
})();
(function () {
    angular.module('main').controller("ExChecklistCtl", checklist_ctl);

    checklist_ctl.$inject = ['$scope', "ExChecklistSvc"];


    /**
     * @ngdoc controller
     * @name main.controller:ExChecklistCtl
     * @requires $scope
     * @requires main.service:Data
     * @requires main.service:cvt
     * @requires main.service:ExFlowSvc
     *
     * @description
     * Controller for the flow control and visualization page.
     */
    function checklist_ctl($scope, ExChecklistSvc) {

        $scope.ListObj = ExChecklistSvc;

        /**
         * @ngdoc method
         * @methodOf main.controller:ExChecklistCtl
         * @name main.controller:ExChecklistCtl#setChecked
         *
         * @description
         * Function to respond to clicking in checklist.  Should:
         *
         * 1. Update the object in the service
         * 2. Broadcast the task to the server for logging...
         */
        $scope.setChecked = function () {
            ExChecklistSvc.update($scope.ListObj);
        };

        $scope.$on('CheckListUpdated', function () {

            $scope.ListObj = ExChecklistSvc;

        });
    }
})();
(function () {
    angular.module('main').factory('ExChecklistSvc', get_checklist);

    get_checklist.$inject = ['$http', '$location', '$rootScope'];
    function get_checklist($http, $location, $rootScope) {
        /**
         * @ngdoc service
         * @name main.service:ExChecklistSvc
         * @requires $http
         * @requires $location
         * @requires $rootScope
         *
         * @description
         * Service for handling the user defined checklist.
         */

        var listData = {
            "main": [{}],
            update: function (List) {
                this.main = List.main;
            }
        };

        // Get the UI config path
        var s = $location.$$absUrl;
        var loc = s.search('#/');
        s = s.slice(0, loc);

        // On the first load, for some reason the trailing backslash is not there; correct this
        var c = s.slice(-1) === '/' ? '' : '/';

        var main_path = s + c + 'checklist.json';


        listData.load = function() {
            $http.get(main_path)
                .then(function (response) {
                        listData.main = response.data.main;

                        // Add the property checked and set to false since this is startup...
                        for (var i in listData.main) {
                            listData.main[i].checked = [];
                            for (var j in listData.main[i].items) {
                                listData.main[i].checked.push(false);
                            }

                        }
                        $rootScope.$broadcast('CheckListUpdated');
                    },
                    function () {
                        console.log('Checklist not found...');
                    })
                .finally(function () {
                });

        };

        return listData;
    }
})
();
(function () {

    angular.module('main').factory('ExVaisalaSvc', vaisalaSvc);

    /**
     * @ngdoc service
     * @name main.service:ExFlowSvc
     * @requires $rootScope
     * @requires main.service:Data
     *
     * @description
     * Service handling the ordering of the data returned by flow controllers
     * and meters.
     */

    vaisalaSvc.$inject = ['$rootScope', 'Data', 'cvt'];

    function vaisalaSvc($rootScope, Data, cvt) {

        /**
         * @ngdoc property
         * @name main.service:ExFlowSvc#flow
         * @propertyOf main.service:ExFlowSvc
         *
         * @description
         * This is the object that will be returned by the service.  This object contains
         *
         * * IDs - string array containg the IDs of the devices
         * * Q - Array of arrays of volumetric flow values for plotting
         * * P - Array of arrays of pressure values for plotting
         * * T - Array of arrays of temperature values for plotting
         * * Q0 - Array of arrays of mass flow values for plotting
         * * data - object containing single point flow data
         * * ``Qsp`` - an associative array that contains a key and value for each
         * element.  The key is the device ID while the value is the setpoint.
         */

        function VaisalaObj() {
            this.IDs = [];
            this.RH = [];
            this.T = [];
            this.Td = [];
            this.data = {};

            this.clear_data = function(){

                this.RH = [];
                this.Td = [];
                this.T = [];
                shift = false;
                index = 0;

            };
        }

        var vaisala = new VaisalaObj();

        var maxi = 300;

        var shift = false;
        var index = 0;

        function vData() {
            this.RH = 0;
            this.Td = 0;
            this.T = 0;
            this.label = "";
        }


        // Temporary variables for storing array data.
        var RH, T, Td;

        var vaisalas = cvt.vaisala;

        /**
         * @ngdoc method
         * @name main.service:ExFlowSvc#populate_arrays
         * @methodOf main.service:ExFlowSvc
         * @param {object} e Element in array
         * @param {number} i Index in array
         *
         * @description
         * Populate the arrays for the plots.
         */
        function populate_arrays(e, i) {

            var id = e.id;
            if (!i) {
                RH = [Data.tObj, vaisala.data[id].RH];
                T = [Data.tObj, vaisala.data[id].T];
                Td = [Data.tObj, vaisala.data[id].Td];
            } else {
                RH.push(vaisala.data[id].RH);
                T.push(vaisala.data[id].T);
                Td.push(vaisala.data[id].Td);
            }
        }

        $rootScope.$on('dataAvailable', getData);

        $rootScope.$on('deviceListRefresh', function(){
            vaisalas = cvt.vaisala;
        });

        /**
         * @ngdoc method
         * @name main.service:ExFlowSvc#getData
         * @methodOf main.service:ExFlowSvc
         *
         * @description
         * Get the data concerning the Alicats via the Data object returned
         * from the Data service.  Stuff teh data into the flow property of this
         * service.  The first time data is returned, we will check for the
         * presence of the actual object.  If it is not there, check to see if
         *
         * 1. it is a controller, and
         * 2. it is a mass flow device
         */
        function getData() {

            // Store the ID as key
            var key = "";

            for ( var i = 0; i < vaisalas.length; i++) {
                // Check to see if the current ID is in the Data Object
                if (vaisalas[i].id in Data.data) {

                    key = vaisalas[i].id;

                    if (!(key in vaisala.data)) {
                        vaisala.data[key] = new vData();
                        if (vaisala.IDs.length === 0) {
                            vaisala.IDs = [key];
                        } else {
                            vaisala.IDs.push(key);
                        }
                    }

                    vaisala.data[key].RH = Data.data[key].RH;
                    vaisala.data[key].T = Data.data[key].T;
                    vaisala.data[key].Td = Data.data[key].Td;

                    vaisala.data[key].label = vaisalas[i].label;

                }
            }

            vaisalas.forEach(populate_arrays);

            if (shift) {
                vaisala.RH.shift();
                vaisala.T.shift();
                vaisala.Td.shift();
            }
            else {
                index += 1;
            }
            vaisala.RH.push(RH);
            vaisala.T.push(T);
            vaisala.Td.push(Td);

            shift = index >= maxi;

            /**
             * @ngdoc event
             * @name main.service:ExFlowSvc#FlowDataAvailable
             * @eventType broadcast
             * @eventOf main.service:ExFlowSvc
             *
             * @description
             * Announce to observers that flow data is available.
             */
            $rootScope.$broadcast('VaisalaDataAvailable');
        }

        return vaisala;
    }
})();
/**
 * Created by Exscalabar on 22/02/2016.
 */
(function () {
    angular.module('main').controller("ExVaisalaCtl", VaisalaCtl);

    VaisalaCtl.$inject = ['$scope', "cvt", "ExVaisalaSvc"];


    /**
     * @ngdoc controller
     * @name main.controller:ExFlowCtl
     * @requires $scope
     * @requires main.service:Data
     * @requires main.service:cvt
     * @requires main.service:ExFlowSvc
     *
     * @description
     * Controller for the flow control and visualization page.
     */
    function VaisalaCtl($scope, cvt, ExVaisalaSvc) {

        $scope.Devices = {};

        /* Update the CVT - the CVT should call the server... */
        $scope.updateSP = function () {
            var d = arguments[0];
            cvt.flows.updateSP(d.ID, d.sp);
        };

        $scope.$on('VaisalaDataAvailable', function () {
            $scope.Devices = ExVaisalaSvc.data;

        });
    }
})();
(function () {
    angular.module('main').directive('exVaisalaPlot', vaisalaPlotDir);

    function vaisalaPlotDir() {
        /**
         * @ngdoc directive
         * @name main.directive:exVaisalaPlot
         * @scope
         * @restrict E
         *
         * @description
         * This directive wraps a plot specifically for the purpose of providing
         * a reusable means to display flow data returned by the server.
         *
         */

        // TODO: Add scope variable for specifying the subsystem so we
        // don't have to place every variable on the graph...
        // Suggested:
        // * PAS
        // * CRD
        // * System/General

        /**
         * @ngdoc controller
         * @name main.controller:VaisalaPlotCtl
         * @requires $rootScope
         * @requires main.service:ExVaisalaSvc
         *
         * @description
         * This controller is used specifically for handling data returned by
         * the flow device service to plot the data.
         */

        VaisalaPlotCtl.$inject = ['$rootScope', 'ExVaisalaSvc', 'ExReadCfgSvc'];
        function VaisalaPlotCtl($rootScope, ExVaisalaSvc, ExReadCfgSvc) {


            var vm = this;

            var data_set = "RH";

            vm.ref = {};

            /**
             * @ngdoc property
             * @name main.controller:FlowPlotCtl#cm
             * @propertyOf main.controller:FlowPlotCtl
             *
             * @description
             * Provides an array of arrays for defining the context menu on the plot.
             * Each array within the array consists of
             *
             * 1. ``string`` - name displayed in the context menu.
             * 2. ``function`` - function that is exectuted when the context meny selection
             * is made.
             *
             * The context meny for this plot is defined as follows:
             *
             * * ``P`` - pressure in mb .
             * * ``T`` - temperature in degrees Celsius.
             * * ``Q`` - volumetric flow rate in lpm.
             * * ``Q0`` - mass flow rate in slpm.
             *
             * Not all values are measured by every device.  In every case, the function executed
             * will set the axis label to the correct value.
             *
             */
            vm.cm = [
                ['RH', function () {
                    data_set = "RH";
                    vm.options.ylabel = '<em>RH</em> (%)';
                    vm.options.axes.y.valueRange = [null, null];
                }
                ],
                ['T',
                    function () {
                        data_set = "T";
                        vm.options.ylabel = '<em>T</em> (&deg;C)';
                        vm.options.axes.y.valueRange = [null, null];
                    }
                ],
                ['T<sub>d</sub>',
                    function () {
                        data_set = "Td";
                        vm.options.ylabel = '<em>T<sub>d</sub></em> (&deg;C)';
                        vm.options.axes.y.valueRange = [null, null];
                    }
                ],
                null,
                ['Meter', null, [
                    ['Enable All', function () {
                        console.log('Enabling all.');
                    }],
                    ['Clear Data', function () {
                        ExVaisalaSvc.clear_data();
                    }]]
                ],
                ['Autoscale', null, [
                    ['Autoscale 1x', function () {
                        vm.options.axes.y.valueRange = vm.ref.yAxisRange();
                    }],
                    ['Autoscale', function () {
                        vm.options.axes.y.valueRange = [null, null];
                    }]
                ]
                ]

            ];

            /**
             * @ngdoc property
             * @name main.controller:FlowPlotCtl#options
             * @propertyOf main.controller:FlowPlotCtl
             *
             * @description
             * Object defining the options for the definition of the dygraph plot.
             * The options defined below set the
             *
             * * ``ylabel`` - set it based on the initial variable plotted (pressure)
             * * ``labels`` - just a default so that the plot is displayed
             * * ``legend`` - always show the legend
             *
             * The options are updated as necessary by the values returned from the
             * data service as well as the selection chosen in the context meny.
             */
            var CfgObj = ExReadCfgSvc.vaisala;
            vm.options = {
                ylabel: '<em>RH</em> (%)',
                labels: ['t', 'Vaisala0'],
                legend: 'always',
                axes: {
                    y: {
                        axisLabelWidth: 70,
                        drawGrid: CfgObj.yGrid
                    },
                    x: {
                        drawAxis: true,
                        drawGrid: CfgObj.xGrid,
                        axisLabelFormatter: function (d) {
                            return Dygraph.zeropad(d.getHours()) + ":" + Dygraph.zeropad(d.getMinutes()) + ":" + Dygraph.zeropad(d.getSeconds());
                        }
                    }
                },
                series: {},
                labelsUTC: true
            };


            if (vm.title !== undefined) {
                vm.options.title = vm.title;
            }

            /**
             * @ngdoc property
             * @name main.controller:FlowPlotCtl#data
             * @propertyOf main.controller:FlowPlotCtl
             *
             * @description
             * The data to be plotted in the dygraph plot.  This is updated with the selection
             * of the cotnext menu.  The initial value is just a single array that sets the
             * time variable to 0 and the data value to NaN.  This allows the visualization of
             * plot when there is no data available.
             */
            vm.data = [[0, NaN]];

            $rootScope.$on('VaisalaDataAvailable', updatePlot);

            /**
             * @ngdoc method
             * @name main.controller:FlowPlotCtl#updatePlot
             * @methodOf main.controller:FlowPlotCtl
             *
             * @description
             * Function to be executed when data is made available via the service.
             * This function will update the data object with data stored in the service
             * and (if necessary) update the ``labels`` property in the ``options`` object.
             *
             */
            function updatePlot() {
                var l = ['t'];
                for (var key in ExVaisalaSvc.data){

                    l.push(ExVaisalaSvc.data[key].label);
                }

                if (l !== vm.options.labels) {
                    /* If the labels have changed (usually the first time the data
                     * service is called), then copy the new labels into the options.
                     *
                     * Remove the time label...
                     */
                    vm.ref.updateOptions({labels: l.slice()});
                    //vm.options.labels = l.slice();

                    var lab = vm.options.labels.slice(1);

                    var cl = CfgObj.color.length;
                    var pl = CfgObj.pattern.length;
                    var swl = CfgObj.strokeWidth.length;

                    for (var j = 0; j < lab.length; j++) {
                        var p = CfgObj.pattern[j % pl] === null ? null : Dygraph[CfgObj.pattern[j % pl]];
                        vm.options.series[lab[j]] = {
                            color: CfgObj.color[j % cl],
                            strokeWidth: CfgObj.strokeWidth[j % swl],
                            strokePattern: p,
                            drawPoints: true
                        };

                    }
                }

                vm.data = ExVaisalaSvc[data_set];
            }
        }

        return {
            restrict: 'E',
            require: 'contextMenu',
            scope: {
                title: "@?"
            },
            controller: VaisalaPlotCtl,
            controllerAs: 'vm',
            bindToController: true,
            template: '<context-menu menu-options ="vm.cm"><dy-graph options="vm.options" ref="vm.ref" data="vm.data" ></dy-graph></context-menu>'
        };
    }
})();

(function () {
    angular.module('main').controller('ExTetechCtl', tetech_ctl);

    tetech_ctl.$inject = ['$scope', 'ExTetechSvc', 'cvt'];


    function tetech_ctl($scope, ExTetechSvc, cvt) {

        /**
         * @ngdoc controller
         * @name main.controller:ExExTetechCtl
         * @description
         * Controller for TE Tech control functionality.
         */

        $scope.ctl = {"P":1, "I":0.75, "D":0};
        $scope.Tsp = 18;
        $scope.ch_mult = {"htx":0, "clx":1};

        $scope.$on('tetechCVTUpdated', update_ctl);

        function update_ctl(){
            //$scope.data = ExPasSvc;
            console.log('Update TE Tech CVT.');
        }

        $scope.set_pid = function(){
            console.log('New PID control set.');
        };

        $scope.set_mult = function(){

            cvt.tec.updateMult([$scope.ch_mult.htx, $scope.ch_mult.clx]);
          console.log('Set multipliers.');
        };

        $scope.update_sp = function(){

            cvt.tec.updateSP($scope.Tsp);
        };

        cvt.first_call = 1;

    }

})();
(function () {

    angular.module('main').factory('ExTetechSvc', tetechSvc);

    /**
     * @ngdoc service
     * @name main.service:ExTetechSvc
     * @requires $rootScope
     * @requires main.service:Data
     * @requires main.service:cvt
     *
     * @description
     * Service handling the ordering of the data returned by flow controllers
     * and meters.
     */

    tetechSvc.$inject = ['$rootScope', 'Data', 'cvt'];

    function tetechSvc($rootScope, Data, cvt) {

        /**
         * @ngdoc property
         * @name main.service:ExFlowSvc#flow
         * @propertyOf main.service:ExFlowSvc
         *
         * @description
         * This is the object that will be returned by the service.  This object contains
         *
         * * IDs - string array containg the IDs of the devices
         * * Q - Array of arrays of volumetric flow values for plotting
         * * P - Array of arrays of pressure values for plotting
         * * T - Array of arrays of temperature values for plotting
         * * Q0 - Array of arrays of mass flow values for plotting
         * * data - object containing single point flow data
         * * ``Qsp`` - an associative array that contains a key and value for each
         * element.  The key is the device ID while the value is the setpoint.
         */

        function teObj() {
            this.t1 = [];
            this.t2 = [];
            this.pow = [];
            this.data = {"t1": 0, "t2": 0, "power": 0};

            this.cvt = {};

            this.label = "";

            this.clear_data = function () {

                this.t1 = [];
                this.t2 = [];
                this.pow = [];
                index = 0;
                shift = false;

            };
        }

        var tec = new teObj();

        var maxi = 300;

        var shift = false;
        var index = 0;

        tec.cvt = cvt.tec;


        $rootScope.$on('dataAvailable', getData);

        $rootScope.$on('deviceListRefresh', function () {
            tec.cvt = cvt.tec;

            $rootScope.$broadcast('tetechCVTUpdated');
        });

        /**
         * @ngdoc method
         * @name main.service:ExFlowSvc#getData
         * @methodOf main.service:ExFlowSvc
         *
         * @description
         * Get the data concerning the Alicats via the Data object returned
         * from the Data service.  Stuff teh data into the flow property of this
         * service.  The first time data is returned, we will check for the
         * presence of the actual object.  If it is not there, check to see if
         *
         * 1. it is a controller, and
         * 2. it is a mass flow device
         */
        function getData() {

            var techData = Data.data.tetech;

            tec.data.t1 = techData.Input1;
            tec.data.t2 = techData.Input2;
            tec.data.pow = techData.Power;

            tec.label = tec.cvt.label;

            if (shift) {
                tec.t1.shift();
                tec.t2.shift();
                tec.pow.shift();
            }
            else if(index === 0){
                tec.t1 = [[Data.tObj, tec.data.t1]];
                tec.t2 = [[Data.tObj, tec.data.t2]];
                tec.pow = [[Data.tObj, tec.data.pow]];
                index += 1;
            }
            else {
                index += 1;
            }
            tec.t1.push([Data.tObj, tec.data.t1]);
            tec.t2.push([Data.tObj, tec.data.t2]);
            tec.pow.push([Data.tObj, tec.data.pow]);

            shift = index >= maxi;

            /**
             * @ngdoc event
             * @name main.service:ExTetechSvc#TeTechDataAvailable
             * @eventType broadcast
             * @eventOf main.service:ExTetechSvc
             *
             * @description
             * Announce to observers that TEC data is available.
             */
            $rootScope.$broadcast('TeTechDataAvailable');
        }

        return tec;
    }
})();
(function () {
    angular.module('main').directive('exTetechPlot', tetechPlotDir);

    function tetechPlotDir() {
        /**
         * @ngdoc directive
         * @name main.directive:exVaisalaPlot
         * @scope
         * @restrict E
         *
         * @description
         * This directive wraps a plot specifically for the purpose of providing
         * a reusable means to display flow data returned by the server.
         *
         */

        // TODO: Add scope variable for specifying the subsystem so we
        // don't have to place every variable on the graph...
        // Suggested:
        // * PAS
        // * CRD
        // * System/General

        /**
         * @ngdoc controller
         * @name main.controller:TeTechPlotCtl
         * @requires $rootScope
         * @requires main.service:ExTetechSvc
         *
         * @description
         * This controller is used specifically for handling data returned by
         * the TEC device service to plot the data.
         */

        TeTechPlotCtl.$inject = ['$rootScope', 'ExTetechSvc', 'ExReadCfgSvc'];
        function TeTechPlotCtl($rootScope, ExTetechSvc, ExReadCfgSvc) {


            var vm = this;

            var data_set = "t1";

            vm.ref = {};

            /**
             * @ngdoc property
             * @name main.controller:TeTechPlotCtl#cm
             * @propertyOf main.controller:TeTechPlotCtl
             *
             * @description
             * Provides an array of arrays for defining the context menu on the plot.
             * Each array within the array consists of
             *
             * 1. ``string`` - name displayed in the context menu.
             * 2. ``function`` - function that is exectuted when the context meny selection
             * is made.
             *
             * The context meny for this plot is defined as follows:
             *
             * * ``T1``: this is the temperature returned by the ``input1`` string.
             * * ``T2``: this is the temperature returned by the ``input2`` string.
             * * ``Power``: power in % that is going into controlling the TEC for the setpoint temperature
             *
             */
            vm.cm = [
                ['T<sub>1</sub>', function () {
                    data_set = "t1";
                    vm.options.ylabel = '<em>T<sub>1</sub></em> (&deg;C)';
                    vm.options.axes.y.valueRange = [null, null];
                }
                ],
                ['T<sub>2</sub>',
                    function () {
                        data_set = "t2";
                        vm.options.ylabel = '<em>T<sub>2</sub></em> (&deg;C)';
                        vm.options.axes.y.valueRange = [null, null];
                    }
                ],
                ['Power',
                    function () {
                        data_set = "pow";
                        vm.options.ylabel = '<em>Power</em> (%)';
                        vm.options.axes.y.valueRange = [null, null];
                    }
                ],
                null,

                ['Clear Data', function () {
                    ExTetechSvc.clear_data();
                }],
                ['Autoscale', null, [
                    ['Autoscale 1x', function () {
                        vm.options.axes.y.valueRange = vm.ref.yAxisRange();
                    }],
                    ['Autoscale', function () {
                        vm.options.axes.y.valueRange = [null, null];
                    }]
                ]
                ]

            ]
            ;

            /**
             * @ngdoc property
             * @name main.controller:TeTechPlotCtl#options
             * @propertyOf main.controller:TeTechPlotCtl
             *
             * @description
             * Object defining the options for the definition of the dygraph plot.
             * The options defined below set the
             *
             * * ``ylabel`` - set it based on the initial variable plotted (pressure)
             * * ``labels`` - just a default so that the plot is displayed
             * * ``legend`` - always show the legend
             *
             * The options are updated as necessary by the values returned from the
             * data service as well as the selection chosen in the context menu.
             */
            var CfgObj = ExReadCfgSvc.tec;
            vm.options = {
                ylabel: '<em>T<sub>1</sub></em> (&deg;C)',
                labels: ['t', 'T'],
                legend: 'never',
                axes: {
                    y: {
                        axisLabelWidth: 70,
                        drawGrid: CfgObj.yGrid
                    },
                    x: {
                        drawAxis: true,
                        drawGrid: CfgObj.xGrid,
                        axisLabelFormatter: function (d) {
                            return Dygraph.zeropad(d.getHours()) + ":" + Dygraph.zeropad(d.getMinutes()) + ":" + Dygraph.zeropad(d.getSeconds());
                        }
                    }
                },
                series: {},
                labelsUTC: true
            };


            if (vm.title !== undefined) {
                vm.options.title = vm.title;
            }

            /**
             * @ngdoc property
             * @name main.controller:TeTechPlotCtl#data
             * @propertyOf main.controller:TeTechPlotCtl
             *
             * @description
             * The data to be plotted in the dygraph plot.  This is updated with the selection
             * of the cotnext menu.  The initial value is just a single array that sets the
             * time variable to 0 and the data value to NaN.  This allows the visualization of
             * plot when there is no data available.
             */
            vm.data = [[0, NaN]];

            $rootScope.$on('TeTechDataAvailable', updatePlot);

            /**
             * @ngdoc method
             * @name main.controller:FlowPlotCtl#updatePlot
             * @methodOf main.controller:FlowPlotCtl
             *
             * @description
             * Function to be executed when data is made available via the service.
             * This function will update the data object with data stored in the service
             * and (if necessary) update the ``labels`` property in the ``options`` object.
             *
             */
            function updatePlot() {

                if (data_set == 'pow') {
                    l = ["t", "Power"];

                }
                else {
                    l = ['t', 'T'];
                }
                if (l !== vm.options.labels) {
                    /* If the labels have changed (usually the first time the data
                     * service is called), then copy the new labels into the options.
                     *
                     * Remove the time label...
                     */
                    vm.ref.updateOptions({labels: l.slice()});

                    var lab = vm.options.labels.slice(1);

                    var cl = CfgObj.color.length;
                    var pl = CfgObj.pattern.length;
                    var swl = CfgObj.strokeWidth.length;

                    for (var j = 0; j < lab.length; j++) {
                        var p = CfgObj.pattern[j % pl] === null ? null : Dygraph[CfgObj.pattern[j % pl]];
                        vm.options.series[lab[j]] = {
                            color: CfgObj.color[j % cl],
                            strokeWidth: CfgObj.strokeWidth[j % swl],
                            strokePattern: p,
                            drawPoints: true
                        };

                    }
                }

                vm.data = ExTetechSvc[data_set];
            }
        }

        return {
            restrict: 'E',
            require: 'contextMenu',
            scope: {
                title: "@?"
            },
            controller: TeTechPlotCtl,
            controllerAs: 'vm',
            bindToController: true,
            template: '<context-menu menu-options ="vm.cm"><dy-graph options="vm.options" ref="vm.ref" data="vm.data" ></dy-graph></context-menu>'
        };
    }
})();

(function () {
    angular.module('main').directive('exPptPlot', ppt_plot);

    function ppt_plot() {
        /**
         * @ngdoc directive
         * @name main.directive:exPptPlot
         * @scope
         * @restrict E
         *
         * @description
         * This directive wraps a plot specifically for the purpose of providing
         * a reusable means to display pressure transducer data returned by the server.
         *
         */
        PptPlotCtl.$inject = ['$rootScope', 'ExPptSvc', 'ExReadCfgSvc'];

        function PptPlotCtl($rootScope, ExPptSvc, ExReadCfgSvc) {
            /**
             * @ngdoc controller
             * @name main.controller:PptPlotCtl
             * @requires $rootScope
             * @requires main.service:ExReadCfgSvc
             * @requires main.service:ExPptSvc
             *
             * @description
             * This controller is used specifically for handling data returned by
             * the pressure transducer device service to plot the data.
             */
            var vm = this;

            var data_set = "P";
            vm.ref = {};
            vm.cm = [
                ['P', function () {
                    data_set = "P";
                    vm.options.ylabel = '<em>P</em> (mb)';
                    vm.options.axes.y.valueRange = [null, null];
                }
                ],
                ['T',
                    function () {
                        data_set = "T";
                        vm.options.ylabel = '<em>T</em> (&deg;C)';
                        vm.options.axes.y.valueRange = [null, null];
                    }
                ],
                null,
                ['Controller', null, [
                    ['Enable All', function () {
                        console.log('Enabling all.');
                    }],
                    ['Clear Data', function () {
                        ExPptSvc.clear_data();
                    }]]
                ],
                ['Autoscale', null, [
                    ['Autoscale 1x', function () {
                        vm.options.axes.y.valueRange = vm.ref.yAxisRange();
                    }],
                    ['Autoscale', function () {
                        vm.options.axes.y.valueRange = [null, null];
                    }]
                ]
                ]
            ];
            var CfgObj = ExReadCfgSvc.ppt;
            vm.options = {
                ylabel: 'P (mb)',
                labels: ['t', 'PPT0'],
                legend: 'always',
                axes: {
                    y: {
                        axisLabelWidth: 70,
                        drawGrid: CfgObj.yGrid,
                    },
                    x: {
                        drawAxis: true,
                        drawGrid: CfgObj.xGrid,
                        axisLabelFormatter: function (d) {
                            return Dygraph.zeropad(d.getHours()) + ":" +
                                Dygraph.zeropad(d.getMinutes()) + ":" +
                                Dygraph.zeropad(d.getSeconds());
                        }
                    }
                },
                labelsUTC: true
            };


            if (vm.title !== undefined) {
                vm.options.title = vm.title;
            }

            vm.data = [[0, NaN]];
            $rootScope.$on('PptDataAvailable', update_data);

            function update_data() {

                var l = ['t'].concat(ExPptSvc.IDs);

                if (l !== vm.options.labels) {
                    // If the labels have changed (usually the first time the data
                    // service is called), then copy the new labels into the options
                    vm.ref.updateOptions({labels: l.slice()});
                }

                vm.data = ExPptSvc[data_set];

            }
        }

        return {
            restrict: 'E',
            require: 'contextMenu',
            scope: {
                title: "@?"
            },
            controller: PptPlotCtl,
            controllerAs: 'vm',
            bindToController: true,
            template: '<context-menu menu-options ="vm.cm"><dy-graph options="vm.options" ref= "vm.ref" data="vm.data" ></dy-graph></context-menu>'

        };
    }
})();
(function () {
    angular.module('main').factory('ExMeerstetterSvc', mtec_svc);

    /**
     * @ngdoc service
     * @name main.service:ExMeerstetterSvc
     * @requires $rootScope
     * @requires main.service:Data
     * @requires main.service:cvt
     *
     * @description
     * Service handling the ordering of the data returned by flow controllers
     * and meters.
     */

    mtec_svc.$inject = ['$rootScope', 'Data', 'cvt'];

    function mtec_svc($rootScope, Data, cvt) {

        /**
         * @ngdoc property
         * @name main.service:ExMeerstetterSvc#MTecObj
         * @propertyOf main.service:ExMeerstetterSvc
         *
         * @description
         * This is the object that will be returned by the service.  This object contains
         *
         * * IDs - string array containg the IDs of the devices
         * * Q - Array of arrays of volumetric flow values for plotting
         * * P - Array of arrays of pressure values for plotting
         * * T - Array of arrays of temperature values for plotting
         * * Q0 - Array of arrays of mass flow values for plotting
         * * data - object containing single point flow data
         * * ``Qsp`` - an associative array that contains a key and value for each
         * element.  The key is the device ID while the value is the setpoint.
         */

        function MTecObj() {
            this.IDs = [];
            this.Tsink = [];
            this.Tobj = [];
            this.Vout = [];
            this.data = {};

            this.clear_data = function(){

                this.Tsink = [];
                this.Tobj = [];
                this.Vout = [];
                shift = false;
                index =0;

            };
        }

        var mtec = new MTecObj();


        var maxi = 300;

        var shift = false;
        var index = 0;

        function tecData() {
            this.Vout = 0;
            this.Tobj = 0;
            this.Tsink = 0;
            this.label = "";
        }


        // Temporary variables for storing array data.
        var Vout, Tobj, Tsink;

        var tecs = cvt.mTEC;

        /**
         * @ngdoc method
         * @name main.service:ExMeerstetterSvc#populate_arrays
         * @methodOf main.service:ExMeerstetterSvc
         * @param {object} e Element in array
         * @param {number} i Index in array
         *
         * @description
         * Populate the arrays for the plots.
         */
        function populate_arrays(e, i) {

            var id = e.id;
            if (!i) {
                Vout = [Data.tObj, mtec.data[id].Vout];
                Tobj = [Data.tObj, mtec.data[id].Tobj];
                Tsink = [Data.tObj, mtec.data[id].Tsink];
            } else {
                Vout.push(mtec.data[id].Vout);
                Tobj.push(mtec.data[id].Tobj);
                Tsink.push(mtec.data[id].Tsink);
            }
        }

        $rootScope.$on('dataAvailable', getData);

        $rootScope.$on('deviceListRefresh', function(){
            tecs = cvt.mTEC;
        });

        /**
         * @ngdoc method
         * @name main.service:ExMeerstetterSvc#getData
         * @methodOf main.service:ExMeerstetterSvc
         *
         * @description
         * Get the data concerning the Alicats via the Data object returned
         * from the Data service.  Stuff teh data into the flow property of this
         * service.  The first time data is returned, we will check for the
         * presence of the actual object.  If it is not there, check to see if
         *
         * 1. it is a controller, and
         * 2. it is a mass flow device
         */
        function getData() {

            // Store the ID as key
            var key = "";

            for ( var i = 0; i < tecs.length; i++) {
                // Check to see if the current ID is in the Data Object
                if (tecs[i].id in Data.data) {

                    key = tecs[i].id;

                    if (!(key in mtec.data)) {
                        mtec.data[key] = new tecData();
                        if (mtec.IDs.length === 0) {
                            mtec.IDs = [key];
                        } else {
                            mtec.IDs.push(key);
                        }
                    }

                    mtec.data[key].Vout = Data.data[key].Vout;
                    mtec.data[key].Tsink = Data.data[key].Tsink;
                    mtec.data[key].Tobj = Data.data[key].Tobj;

                    mtec.data[key].label = tecs[i].label;

                }
            }

            tecs.forEach(populate_arrays);

            if (shift) {
                mtec.Vout.shift();
                mtec.Tsink.shift();
                mtec.Tobj.shift();
            }
            else {
                index += 1;
            }
            mtec.Vout.push(P);
            mtec.Tsink.push(T);
            mtec.Tobj.push(Q);

            shift = index >= maxi;

            /**
             * @ngdoc event
             * @name main.service:ExMeerstetterSvc#MTecDataAvailable
             * @eventType broadcast
             * @eventOf main.service:ExMeerstetterSvc
             *
             * @description
             * Announce to observers that flow data is available.
             */
            $rootScope.$broadcast('MTecDataAvailable');
        }

        return mtec;
    }
})();