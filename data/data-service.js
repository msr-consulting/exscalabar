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

            var lastTime=0;
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
            
            dataObj.wvfmReq='';
            
            dataObj.wvfmSet=function(opt){
                switch(opt){
                    case 'PAS':
                        this.wvfmReq='&PASwvfm=1';
                        break;
                    case 'CRDS':
                        this.wvfmReq='&CRDS=1';
                        break;
                    default:
                        this.wvfmReq='';
                }
            }
            
            var busy = false;

            dataObj.getData = function () {
                if (busy) {
                    // Don't just line up endless requests...
                    return;
                }
                busy = true;
                promise = $http.get(net.address() + 'General/Data?Last='+lastTime+this.wvfmReq)
                    .then(function (response) {

                        if (response.status != 200) {
                            if (response.status !== 204){
                                $rootScope.$broadcast('dataNotAvailable');
                            }
                        }
                        else {
                            lastTime=response.data.Time;
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
                    }, function (response) {
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