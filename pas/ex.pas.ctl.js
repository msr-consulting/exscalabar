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

        $scope.show_wvfm = true;

        $scope.update_wvfm_state = function(){
            $scope.show_wvfm = !$scope.show_wvfm;

        };


        $scope.$on('pasDataAvaliable', display_data);
        $scope.wvfmData = [[0, NaN, NaN, NaN, NaN, NaN]];

        // dygraph options object
        $scope.options = {
            title: 'PAS Waveform Data',
            ylabel: 'Microphone Frequency (a.u.)',
            labels: labels,
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
            console.log('PAS data updated.');
            $scope.data = ExPasSvc.data;

            $scope.wvfmData = ExPasSvc.wvfm.micf;
        }

        cvt.first_call = 1;

    }

})();