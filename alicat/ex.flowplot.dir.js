(function () {
    angular.module('main').
    directive('exFlowplot', flowPlotDir);

    function flowPlotDir() {

        /** 
         * @ngdoc directive
         * @name main.directive:exFlowplot
         * @scope
         * @restrict E
         *
         * @description
         * Directive for wrapping the flow plot data up. To allow for reuse.
         * 
         */

        // TODO: Add scope variable for specifying the subsystem so we 
        // don't have to place every variable on the graph...
        // Suggested:
        // * PAS
        // * CRD
        // * System/General

        var flowPlotCtl = function ($rootScope, ExFlowSvc) {


            var vm = this;

            var data_set = "P";


            vm.cm = [['P', function () {
                    data_set = "P";
                    console.log("Select P.");
                    vm.options.ylabel = 'P (mb)';
                }],
                     ['T',
            function () {
                        data_set = "T";
                        console.log("Select T.");
                    vm.options.ylabel = 'T (degC)';
                }],
                     ['Q',
            function () {
                        data_set = "Q";
                        console.log("Select Q.");
                    vm.options.ylabel = 'Q (lpm)';
                }],
                     ['Q0',
            function () {
                        data_set = "Q0";
                        console.log("Select Q0.");
                    vm.options.ylabel = 'T (degC)';
                    vm.options.ylabel = 'Q0 (slpm)';
                }]
                    ];

            vm.options = {
                ylabel: 'Q (lpm)',
                labels: ['t', 'Alicat0'],
                legend: 'always'
            };
            vm.data = [[0, NaN]];

            $rootScope.$on('FlowDataAvailable', updatePlot);

            function updatePlot() {
                vm.data = ExFlowSvc[data_set];
            }

            console.log('Load controller for flow plot director.');


        };

        flowPlotCtl.$inject = ['$rootScope', 'ExFlowSvc'];

        return {
            restrict: 'E',
            scope: {},
            controller: flowPlotCtl,
            controllerAs: 'vm',
            bindToController: true,
            template: '<dy-graph options="vm.options" data="vm.data" context-menu="vm.cm"></dy-graph>'
        };
    }
})();