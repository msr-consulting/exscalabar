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

                promise = $http.get(net.address() + 'General/cvt?force=' + cvt.first_call).then(function (response) {

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

                });

            };

            /** @ngdoc object
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
            this.las.vr = vr;

            http.get(net.address() +
                'PAS_CMD/UpdateVrange?Vrange=' + vr.join(','));

        };
        
        this.send_wvfm = function(wvfm){
            var data = wvfm?1:0;
            console.log('New value for waveform retrieval is ' + data);
            http.get(net.address() +
                'PAS_CMD/wvfm?write=' + data);
            
        }
        
        
        this.write_wvfm = function(wvfm){
            var data = wvfm?1:0;
            console.log('New value for waveform retrieval is ' + data);
            http.get(net.address() +
                'PAS_CMD/WVFM_to_File?Write_Data=' + data);
            
        }

        this.las.setVo = function (vo) {
            this.las.vr = vr;

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