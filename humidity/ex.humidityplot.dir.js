(function () {
    angular.module('main').directive('exHumidPlot', humid_plot);

    function humid_plot() {
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
        PptPlotCtl.$inject = ['$rootScope', 'ExHumidSvc', 'ExReadCfgSvc'];

        function PptPlotCtl($rootScope, ExHumidSvc, ExReadCfgSvc) {
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

            var data_set = "RH";
            vm.ref = {};
            vm.cm = [
                ['RH', function () {
                    data_set = "RH";
                    vm.options.ylabel = '<em>RH</em> (%)';
                    vm.options.axes.y.valueRange = [null, null];
                }
                ],
                ['T',
                    function () {
                        data_set = "Td";
                        vm.options.ylabel = '<em>Td</em> (&deg;C)';
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
            var CfgObj = ExReadCfgSvc.humid;
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
            $rootScope.$on('HumidDataAvailable', update_data);

            function update_data() {

                var l = ['t'].concat(ExPptSvc.labels);

                if (l !== vm.options.labels) {
                    // If the labels have changed (usually the first time the data
                    // service is called), then copy the new labels into the options
                    vm.ref.updateOptions({labels: l.slice()});
                }

                vm.data = ExHumidSvc[data_set];

            }
        }

        return {
            restrict: 'E',
            require: 'contextMenu',
            scope: {
                title: "@?"
            },
            controller: HumidPlotCtl,
            controllerAs: 'vm',
            bindToController: true,
            template: '<context-menu menu-options ="vm.cm"><dy-graph options="vm.options" ref= "vm.ref" data="vm.data" ></dy-graph></context-menu>'

        };
    }
})();
