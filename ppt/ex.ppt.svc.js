(function () {

    angular.module('main').factory('ExPptSvc', ppt_svc);

    var maxi = 300, index = 0;


    ppt_svc.$inject = ['$rootScope', 'Data', 'cvt']
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


        var pptData = new PptObj();
        var ppts = cvt.ppt;

        var shift = false;

        // Update the device table...
        $rootScope.$on('deviceListRefresh', function () {
            ppts = cvt.ppt;
        });

        $rootScope.$on('dataAvailable', getData);

        function getData() {

            for (var p in ppts) {

                var key = p.id;
                if (key in Data.data) {

                    if (!key in pptData.data) {
                        pptData.data[key] = new pData(Data.data[key].P, Data.data[key].T);
                        if (pptData.IDs === 0) {
                            pptData.IDs = [key];
                        }
                        else {
                            pptData.IDs.push(key);
                        }
                    }
                    else {
                        pptData.data[key].P = Data.data[key].P;
                        pptData.data[key].T = Data.data[key].T;
                    }

                    ppts.forEach(populate_arrays);

                    if (shift) {
                        pptData.P.shift();
                        pptData.T.shift();
                    }
                    else{
                        index += 1;
                    }

                    pptData.P.push(P);
                    pptData.T.push(T);
                    shift = index >= maxi;

                    $rootScope.$broadcast('PptDataAvailable');

                }
            }
        }


        // Temporary arrays for storing data...
        var P, T;

        function populate_arrays(e, i) {


            if (!i) {// First roll
                P = [Data.tObj, pptData.data[e.id].P];
                T = [Data.tObj, pptData.data[e.id].T];
            }
            else {
                P.push(pptData.data[e.id].P);
                T.push(pptData.data[e.id].T);
            }

        }


        return pptData;


    }


    function PptObj() {
        this.IDs = [];
        this.T = [];
        this.P = [];
        this.data = {};
        this.clear_data = function () {
            this.P = [];
            this.T = [];

        };
        this.set_max = function(m){

            maxi = m;

        }
    }


    function pData(p, t) {
        this.T = t;
        this.P = p;
    }

})();


