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
            shift = false,
            leaki=60;

        function PptObj() {
            this.IDs = [];
            this.T = [];
            this.P = [];
            this.leak = [];
            this.labels = [];
            this.data = {};
            this.clear_data = function () {
                this.P = [];
                this.T = [];
                this.leak = [];
                shift = false;
                index = 0;

            };
            this.set_max = function (m) {
                maxi = m;
            };
        }


        function pData(p, t, l) {
            this.T = t;
            this.P = p;
            this.leak = l;
        }

        var pptData = new PptObj();
        var ppts = cvt.ppt;

        // Update the device table...
        $rootScope.$on('deviceListRefresh', function () {
            ppts = cvt.ppt;
        });

        $rootScope.$on('dataAvailable', getData);

        function getData() {


            var key = "",
                dt=0,
                ix=0;
            
            if(index>=2){
                ix = (index<=leaki) ? 0 : index-leaki;           
                dt=Data.tObj-pptData.P[ix][0];
            }
            for (var i = 0; i < ppts.length; i++) {

                key = ppts[i].id;

                if (key in Data.data) {

                    if (!(key in pptData.data)) {

                        pptData.data[key] = new pData(Data.data[key].P, Data.data[key].T, 0);

                        if (pptData.IDs.length === 0) {
                            pptData.IDs = [key];
                            
                            pptData.labels = [ppts[i].label];
                        } else {
                            pptData.IDs.push(key);
                            pptData.labels.push(ppts[i].label);
                        }
                    } else {
                        pptData.data[key].P = Data.data[key].P;
                        pptData.data[key].T = Data.data[key].T;
                        if(dt>0){
                            var lk=pptData.data[key].P-pptData.P[ix][i+1];
                            pptData.data[key].leak=60000.0*lk/dt;
                        }else{
                            pptData.data[key].leak = 0;
                        }
                    }
                }
            }

            ppts.forEach(populate_arrays);
        

            if (shift) {
                pptData.P.shift();
                pptData.T.shift();
                pptData.leak.shift();
            } else {
                index += 1;
            }

            pptData.P.push(P);
            pptData.T.push(T);
            pptData.leak.push(leak);
            shift = index >= maxi;
            


            $rootScope.$broadcast('PptDataAvailable');
        }


        // Temporary arrays for storing data...
        var P, T, leak;

        function populate_arrays(e, i) {
            if (!i) { // First roll
                P = [Data.tObj, pptData.data[e.id].P];
                T = [Data.tObj, pptData.data[e.id].T];
                leak = [Data.tObj, pptData.data[e.id].leak];
            } else {
                P.push(pptData.data[e.id].P);
                T.push(pptData.data[e.id].T);
                leak.push(pptData.data[e.id].leak);
            }
        }
        
        
        return pptData;
    }

})();