(function () {
    angular.module('main').controller('ExPasCtl', pas_ctl);

    pas_ctl.$inject = ['$scope', 'cvt', 'ExPasSvc', 'ExReadCfgSvc', 'Data'];


    function pas_ctl($scope, cvt, ExPasSvc, ExReadCfgSvc, Data) {
        
        //cvt.changeWvfmState(false, true);
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
        console.log()
        $scope.show_wvfm = cvt.pas.send_wvfm_state;

        if($scope.show_wvfm){
            Data.wvfmSet('PAS');
        }else{
            Data.wvfmSet();
        }

        
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
            cvt.pas.send_wvfm_state=$scope.show_wvfm;
         if($scope.show_wvfm){
           Data.wvfmSet('PAS');
        }else{
            Data.wvfmSet();
        }

        };
        
        $scope.write_wvfm = cvt.pas.write_wvfm_state;        
         
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