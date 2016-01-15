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
                }
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

                        cvt.filter.cycle.period = response.data.filter.period;
                        cvt.filter.cycle.length = response.data.filter.length;
                        cvt.filter.cycle.auto = response.data.filter.auto;

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

    /**
     * This is a prototype for devices.
     */
    function device(){
        this.label = "";
        this.id = "";
        this.ctlr = false;
        this.sn = "";
        this.sp = "";
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

        this.las.setVo = function (vo) {
            this.las.vr = vr;

            http.get(net.address() +
                'PAS_CMD/UpdateVoffset?Voffset=' + vo.join(','));

        };

        this.las.updateMod = function (mod) {
            this.moduldation = mod;

            var val = [];

            for (i = 0; i < mod.length; i++) {
                val.push(mod ? 1 : 0);
            }

            //$http.get(net.address() +
            //  'PAS_CMD/UpdateVoffset?Voffset=' + val.join(','));

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