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
                "ppt": [],
                "cal":{
                    active: false,
                    o3_valve: false,
                    lamp: 0
                },
                "ozone":{
                    valve: false,
                    updateValve: function(val){
                        this.valve = val;
                        var cmd = val ? 1 : 0;
                        $http.get(net.address() + 'Calibration/ChangeO3Valve?State=' + cmd);
                    }
                }
            };



            /* ****************** FOR TESTING ***********************/
            /* cvt.mTEC = [new mtec("Test1", "mTEC01", true, "00", 15, "01"),
                 new mtec("Test2", "mTEC01", true, "01", 132, "02"),
                 new mtec("Test3", "mTEC01", true, "02", 15, "03")];
             cvt.mTEC[0].ctl_temp = 1;

             cvt.mTEC[0].pid = [12, 0.3, 4];*/

            /* ****************** END TESTING ***********************/

            cvt.setCabinValve = function (pos) {
                var x = pos ? 1 : 0;
                $http.get(net.address() + 'General/Cabin?val=' + x);

            };

            cvt.setDenuderBypassValve = function (pos) {
                var x = pos ? 1 : 0;
                $http.get(net.address() + 'General/DenudedBypass?val=' + x);

            };

            cvt.setFilterValve = function (pos) {
                var x = pos ? 1 : 0;
                $http.get(net.address() + 'General/UpdateFilter?State=' + x);

            };

            cvt.setSaveData = function (val) {

                var s = val ? 1 : 0;

                $http.get(net.address() + 'General/Save?save=' + s.toString());

            }

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
            cvt.humidifier = [new Humidifier(0.75, 1, 0, 20, false, "Medium"),
                new Humidifier(0.75, 1, 0, 30, false, "High")];

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
            
            cvt.tec = {};

            // TODO: most of the update setpoint commands should be removed from the cvt if there is not direct interaction with the cvt service itself (i.e. we are not storing something in the cvt
           // cvt.tec.updateSP = function (sp) {
            //    $http.get(net.address() + 'General/DevSP?SP=' + sp + '&DevID=tetech');
           // };

            //cvt.tec.updateMult = function (m) {
                ///xService/tetech/multipliers?mult={value}
             //   $http.get(net.address() + 'tetech/multipliers?mult=' + m.toString());
            //};

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

                                    cvt.alicat.push(new device(dd.label, d, dd.controller, dd.sn, dd.setpoint, dd.address));

                                } else {
                                    cvt.alicat = [new device(dd.label, d, dd.controller, dd.sn, dd.setpoint, dd.address)];
                                }
                                break;
                            case "mTEC":
                                if (cvt.mTEC.length > 0 && !findDevID(cvt.mTEC, d)) {
                                    cvt.mTEC.push(new mtec(dd.label, d, dd.controller, dd.sn, dd.setpoint, dd.address, $http, net));
                                } else {
                                    cvt.mTEC = [new mtec(dd.label, d, dd.controller, dd.sn, dd.setpoint, dd.address, $http, net)];
                                }
                                break;
                            case "vaisala":
                                if (cvt.vaisala.length > 0 && !findDevID(cvt.vaisala, d)) {
                                    cvt.vaisala.push(new device(dd.label, d, dd.controller, dd.sn, 0, dd.address, $http, net));
                                } else {

                                    cvt.vaisala = [new device(dd.label, d, dd.controller, dd.sn, 0, dd.address, $http, net)];
                                }
                                break;
                            case "ppt":
                                if (cvt.ppt.length > 0 && !findDevID(cvt.ppt, d)) {
                                    cvt.ppt.push(new device(dd.label, d, dd.controller, dd.sn, 0, dd.address, $http, net));
                                } else {
                                    cvt.ppt = [new device(dd.label, d, dd.controller, dd.sn, 0, dd.address, $http, net)];
                                }
                                break;
                            case "TEC":
                                if (isEmpty(cvt.tec)) {

                                    cvt.tec = new te_tec(dd.label, d, dd.controller, dd.sn, dd.setpoint, dd.address, $http, net);

                                }
                                break;
                            default:
                                console.log("Unexpected device found...");
                            }
                            $rootScope.$broadcast('deviceListRefresh');
                        }

                        var h = response.data.humidifier;

                        cvt.humidifier[0].p = h.med.p;
                        cvt.humidifier[0].i = h.med.i;
                        cvt.humidifier[0].d = h.med.d;
                        cvt.humidifier[0].en = h.med.ctl;
                        cvt.humidifier[0].sp = h.med.rhsp;

                        cvt.humidifier[1].p = h.high.p;
                        cvt.humidifier[1].i = h.high.i;
                        cvt.humidifier[1].d = h.high.d;
                        cvt.humidifier[1].en = h.high.ctl;
                        cvt.humidifier[1].sp = h.high.rhsp;

                        /* Update the CRD controls */
                        cvt.crd.fred = crd.red.f;
                        cvt.crd.fblue = crd.blue.f;
                        cvt.crd.dcred = crd.red.dc;
                        cvt.crd.dcblue = crd.blue.dc;
                        cvt.crd.kpmt = crd.kpmt;
                        cvt.crd.kblue0 = crd.klaser[1];
                        cvt.crd.kblue1 = crd.klaser[2];
                        cvt.crd.kred = crd.klaser[0];

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
                        cvt.pas.spk.connected = pas.filter_cycle;

                        cvt.filter.cycle.period = response.data.Filter.period;
                        cvt.filter.cycle.length = response.data.Filter.length;
                        cvt.filter.cycle.auto = response.data.Filter.auto;

                        cvt.filter.position = response.data.general.filter_pos;
                        cvt.inlet = response.data.general.inlet;
                        
                        cvt.ozone.valve = response.data.calibration.o3_valve;

                        cvt.purge.pos = response.data.general.purge;
                        
                        cvt.cal.o3_valve = response.data.calibration.o3_valve;

                        var power = Number(response.data.general.power).toString(2);

                        while (power.length < 5) {
                            power = "0"+ power;

                        }

                        cvt.power.Pump = power[4] == '1';
                        cvt.power.O3Gen = power[3] == '1';
                        cvt.power.Denuder = power[2] == '1';
                        cvt.power.Laser = power[1] == '1';
                        cvt.power.TEC = power[0] == '1';


                        /*
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

                }, function errorCallback(response) {
                    $rootScope.$broadcast('cvtNotAvailable');
                }).finally(function () {

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
    function device(l, id, ctlr, sn, sp, addr, _http, _net) {


        // Pass in these references and store them locally...
        this.net = _net;
        this.http = _http;

        this.label = l;
        this.id = id;
        this.ctlr = ctlr;
        this.sn = sn;
        this.sp = sp;
        this.address = addr;

        this.updateSetpoint = function (val) {
            this.sp = val;
            this.http.get(this.net.address() + 'General/DevSP?SP=' + this.sp + '&DevID=' + this.id);
        }
    }

    // The TEC both have PID controls, so create a prototype that
    // will store these controls; presently, we will not extend the
    // constructor until we are certain

    function tec(l, id, ctlr, sn, sp, addr, _http, _net) {
        device.call(this, l, id, ctlr, sn, sp, addr, _http, _net);
        this.pid = [1, 0, 0];
    }

    tec.prototype = Object.create(device.prototype);
    tec.prototype.updateSP = function (sp) {
        this.sp = sp;
    }
    tec.prototype.updateCtlParams = function (index, val) {
        this.pid[index] = val;
        $http.get(net.address() + 'General/tec_ctl_params?DevID=' + this.id + '&d=' + this.pid[2] + '&i=' + this.pid[1] + '&p=' + this.pid[0]);
    };


    // TE Technology TEC is a one off and has two additional parameters
    // we want to expose - cooling and heating factors.
    function te_tec(l, id, ctlr, sn, sp, addr, _http, _net) {
        tec.call(this, l, id, ctlr, sn, sp, addr, _http, _net)


        // These are multiplication 
        this.htx = 0;
        this.clx = 1;
        this.updateHtx = function (val) {
            this.htx = val;
            this.updateServerHeatingParams();

        }
        this.updateClx = function (val) {
            this.clx = val;
            this.updateServerHeatingParams();

        }

        this.updateServerHeatingParams = function() {
            this.http.get(this.net.address() + 'tetech/multipliers?mult=' + [this.htx, this.clx].toString());
        }

        //this.updateCtlParams = function(index, val){
        //tec.call(this, index, val);   

        //console.log("Updating TE Tech PID");
        //}

        this.updateSP = function (sp) {
            tec.prototype.updateSP.call(this, sp);
            try {
                this.http.get(this.net.address() + 'General/DevSP?SP=' + sp + '&DevID=tetech');
            } catch (e) {
                console.log("Attempt to set TE Tech setpoint failed.  Server unavailable.")
            }

        }
    }

    te_tec.prototype = Object.create(tec.prototype);

    // The meerstetter TECs have a bunch of stuff that we may be interested
    // in.  One property is whether we are controlling on temperature or power.

    function mtec(l, id, ctlr, sn, sp, addr, _http, _net) {
        tec.call(this, l, id, ctlr, sn, sp, addr, _http, _net);
        this.ctl_temp = 0;


        this.updateCtlParams = function (index, val) {
            tec.call.updateCtlParams.call(this, index, val);

            console.log("Updating Meerstetter Tech PID with ID " + this.ID + ".");
        }

        this.updateCtlVal = function () {

            this.ctl_temp = !this.ctl_temp;

            var c = val ? 1 : 0;

            http.get(net.address() + 'meerstetter/mctl?val=' +
                c + '&DevID=' + this.id);

            //http://192.168.101.214:8001/xService/meerstetter/mctl/:id?val={value}

        };
    }

    mtec.prototype = Object.create(tec.prototype);
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
        this.write_taus = false;

        this.update_tau_write = function (state) {
            this.write_taus = state;

            var val = state ? 1 : 0;
            var cmd = 'CRDS_CMD/WriteTausFile?Write_Data=' + val;
            http.get(net.address() + cmd);

        }

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
        this.kblue0 = 1;
        this.kblue1 = 1;
        // PMT gains
        this.kpmt = [0, 0, 0, 0, 0];
        // Blue enable state
        this.eblue0 = true;
        this.eblue1 = true;
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
            this.eblue0 = vals[0];
            this.eblue1 = vals[1];
            this.ered = vals[2];

            var enr = this.ered ? 1 : 0;
            var enb0 = this.eblue0 ? 1 : 0;
            var enb1 = this.eblue1 ? 1 : 0;


            var cmd = 'CRDS_CMD/LaserEnable?Red=' + enr + '&Blue0=' + enb0 + '&Blue1=' + enb1;
            http.get(net.address() + cmd);
        };

        this.setGain = function (val) {

            this.kpmt = val;

            http.get(net.address() + 'CRDS_CMD/Vpmt?V=' + val.toString());

        };

        this.setLaserGain = function (val) {

            this.kred = val[2];
            this.kblue0 = val[0];
            this.kblue1 = val[1];
            http.get(net.address() + 'CRDS_CMD/LaserGain?B1=' + val[1] + '&B0=' + val[0] + '&R=' + val[2]);
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

        this.send_wvfm = function (wvfm) {
            var data = wvfm ? 1 : 0;

            this.send_wvfm_state = wvfm;
            console.log('New value for waveform retrieval is ' + data);
            http.get(net.address() +
                'PAS_CMD/wvfm?write=' + data);

        };


        this.write_wvfm = function (wvfm) {
            var data = wvfm ? 1 : 0;

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

            for (var i = 0; i < en.length; i++) {
                enByte += en[i] ? (Math.pow(2, i)) : 0;
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

        this.spk.connectToFilter = function (val) {
            var c = val ? 1 : 0;
            //http://192.168.101.214:8001/xService/PAS_CMD/SpkFilterConnect?conn={value}
            http.get(net.address() + 'PAS_CMD/SpkFilterConnect?conn=' + c);

        };

        this.spk.connected = false;

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