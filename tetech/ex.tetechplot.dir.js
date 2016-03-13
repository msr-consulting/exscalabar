(function () {
    angular.module('main').directive('exTetechPlot', tetechPlotDir);

    function tetechPlotDir() {
        /**
         * @ngdoc directive
         * @name main.directive:exVaisalaPlot
         * @scope
         * @restrict E
         *
         * @description
         * This directive wraps a plot specifically for the purpose of providing
         * a reusable means to display flow data returned by the server.
         *
         */

        // TODO: Add scope variable for specifying the subsystem so we
        // don't have to place every variable on the graph...
        // Suggested:
        // * PAS
        // * CRD
        // * System/General

        /**
         * @ngdoc controller
         * @name main.controller:TeTechPlotCtl
         * @requires $rootScope
         * @requires main.service:ExTetechSvc
         *
         * @description
         * This controller is used specifically for handling data returned by
         * the TEC device service to plot the data.
         */

        TeTechPlotCtl.$inject = ['$rootScope', 'ExTetechSvc', 'ExReadCfgSvc'];
        function TeTechPlotCtl($rootScope, ExTetechSvc, ExReadCfgSvc) {


            var vm = this;

            var data_set = "t1";

            vm.ref = {};

            /**
             * @ngdoc property
             * @name main.controller:TeTechPlotCtl#cm
             * @propertyOf main.controller:TeTechPlotCtl
             *
             * @description
             * Provides an array of arrays for defining the context menu on the plot.
             * Each array within the array consists of
             *
             * 1. ``string`` - name displayed in the context menu.
             * 2. ``function`` - function that is exectuted when the context meny selection
             * is made.
             *
             * The context meny for this plot is defined as follows:
             *
             * * ``T1``: this is the temperature returned by the ``input1`` string.
             * * ``T2``: this is the temperature returned by the ``input2`` string.
             * * ``Power``: power in % that is going into controlling the TEC for the setpoint temperature
             *
             */
            vm.cm = [
                ['T<sub>1</sub>', function () {
                    data_set = "t1";
                    vm.options.ylabel = '<em>T<sub>1</sub></em> (&deg;C)';
                    vm.options.axes.y.valueRange = [null, null];
                }
                ],
                ['T<sub>2</sub>',
                    function () {
                        data_set = "t2";
                        vm.options.ylabel = '<em>T<sub>2</sub></em> (&deg;C)';
                        vm.options.axes.y.valueRange = [null, null];
                    }
                ],
                ['Power',
                    function () {
                        data_set = "pow";
                        vm.options.ylabel = '<em>Power</em> (%)';
                        vm.options.axes.y.valueRange = [null, null];
                    }
                ],
                null,

                ['Clear Data', function () {
                    ExTetechSvc.clear_data();
                }],
                ['Autoscale', null, [
                    ['Autoscale 1x', function () {
                        vm.options.axes.y.valueRange = vm.ref.yAxisRange();
                    }],
                    ['Autoscale', function () {
                        vm.options.axes.y.valueRange = [null, null];
                    }]
                ]
                ]

            ]
            ;

            /**
             * @ngdoc property
             * @name main.controller:TeTechPlotCtl#options
             * @propertyOf main.controller:TeTechPlotCtl
             *
             * @description
             * Object defining the options for the definition of the dygraph plot.
             * The options defined below set the
             *
             * * ``ylabel`` - set it based on the initial variable plotted (pressure)
             * * ``labels`` - just a default so that the plot is displayed
             * * ``legend`` - always show the legend
             *
             * The options are updated as necessary by the values returned from the
             * data service as well as the selection chosen in the context menu.
             */
            var CfgObj = ExReadCfgSvc.tec;
            vm.options = {
                ylabel: 'T<sub>1</sub>',
                labels: ['t', 'T1'],
                legend: 'always',
                axes: {
                    y: {
                        axisLabelWidth: 70,
                        drawGrid: CfgObj.yGrid
                    },
                    x: {
                        drawAxis: true,
                        drawGrid: CfgObj.xGrid,
                        axisLabelFormatter: function (d) {
                            return Dygraph.zeropad(d.getHours()) + ":" + Dygraph.zeropad(d.getMinutes()) + ":" + Dygraph.zeropad(d.getSeconds());
                        }
                    }
                },
                series: {},
                labelsUTC: true
            };


            if (vm.title !== undefined) {
                vm.options.title = vm.title;
            }

            /**
             * @ngdoc property
             * @name main.controller:TeTechPlotCtl#data
             * @propertyOf main.controller:TeTechPlotCtl
             *
             * @description
             * The data to be plotted in the dygraph plot.  This is updated with the selection
             * of the cotnext menu.  The initial value is just a single array that sets the
             * time variable to 0 and the data value to NaN.  This allows the visualization of
             * plot when there is no data available.
             */
            vm.data = [[0, NaN]];

            $rootScope.$on('TeTechDataAvailable', updatePlot);

            /**
             * @ngdoc method
             * @name main.controller:FlowPlotCtl#updatePlot
             * @methodOf main.controller:FlowPlotCtl
             *
             * @description
             * Function to be executed when data is made available via the service.
             * This function will update the data object with data stored in the service
             * and (if necessary) update the ``labels`` property in the ``options`` object.
             *
             */
            function updatePlot() {
                var l = ['t'];
                for (var key in ExTetechSvc.data) {

                    l.push(ExTetechSvc.data[key].label);
                }

                if (l !== vm.options.labels) {
                    /* If the labels have changed (usually the first time the data
                     * service is called), then copy the new labels into the options.
                     *
                     * Remove the time label...
                     */
                    vm.ref.updateOptions({labels: l.slice()});
                    //vm.options.labels = l.slice();

                    var lab = vm.options.labels.slice(1);

                    var cl = CfgObj.color.length;
                    var pl = CfgObj.pattern.length;
                    var swl = CfgObj.strokeWidth.length;

                    for (var j = 0; j < lab.length; j++) {
                        var p = CfgObj.pattern[j % pl] === null ? null : Dygraph[CfgObj.pattern[j % pl]];
                        vm.options.series[lab[j]] = {
                            color: CfgObj.color[j % cl],
                            strokeWidth: CfgObj.strokeWidth[j % swl],
                            strokePattern: p,
                            drawPoints: true
                        };

                    }
                }

                vm.data = ExTetechSvc[data_set];
            }
        }

        return {
            restrict: 'E',
            require: 'contextMenu',
            scope: {
                title: "@?"
            },
            controller: TeTechPlotCtl,
            controllerAs: 'vm',
            bindToController: true,
            template: '<context-menu menu-options ="vm.cm"><dy-graph options="vm.options" ref="vm.ref" data="vm.data" ></dy-graph></context-menu>'
        };
    }
})();
