(function () {
    angular.module('main').directive('exFlowplot', flowPlotDir);

    function flowPlotDir() {

        /**
         * @ngdoc directive
         * @name main.directive:exFlowplot
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
         * @name main.controller:FlowPlotCtl
         * @requires $rootScope
         * @requires main.service:ExFlowSvc
         *
         * @description
         * This controller is used specifically for handling data returned by
         * the flow device service to plot the data.
         */
        var FlowPlotCtl = function ($rootScope, ExFlowSvc) {


            var vm = this;

            var data_set = "P";


            /**
             * @ngdoc property
             * @name main.controller:FlowPlotCtl#cm
             * @propertyOf main.controller:FlowPlotCtl
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
             * * ``P`` - pressure in mb .
             * * ``T`` - temperature in degrees Celsius.
             * * ``Q`` - volumetric flow rate in lpm.
             * * ``Q0`` - mass flow rate in slpm.
             *
             * Not all values are measured by every device.  In every case, the function executed
             * will set the axis label to the correct value.
             *
             */
            vm.cm = [
                ['P', function () {
                    data_set = "P";
                    console.log("Select P.");
                    vm.options.ylabel = 'P (mb)';
                }
                ],
                ['T',
                    function () {
                        data_set = "T";
                        console.log("Select T.");
                        vm.options.ylabel = 'T (degC)';
                    }
                ],
                ['Q',
                    function () {
                        data_set = "Q";
                        console.log("Select Q.");
                        vm.options.ylabel = 'Q (lpm)';
                    }
                ],
                ['Q0',
                    function () {
                        data_set = "Q0";
                        console.log("Select Q0.");
                        vm.options.ylabel = 'T (degC)';
                        vm.options.ylabel = 'Q0 (slpm)';
                    }
                ],
                null,
                ['Clear Data', function(){}],
                ['Autoscale', function(){}],
                ['Autoscale 1x', function(){}]
            ];

            /**
             * @ngdoc property
             * @name main.controller:FlowPlotCtl#options
             * @propertyOf main.controller:FlowPlotCtl
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
             * data service as well as the selection chosen in the context meny.
             */
            vm.options = {
                ylabel: 'P (mb)',
                labels: ['t', 'Alicat0'],
                legend: 'always',
                axes: {
                    y: {
                        axisLabelWidth: 70
                    },
                    x: {
                        drawAxis: true,
                        axisLabelFormatter: function (d) {
                            return Dygraph.zeropad(d.getHours()) + ":" + Dygraph.zeropad(d.getMinutes()) + ":" + Dygraph.zeropad(d.getSeconds());
                        }
                    }
                },
                labelsUTC: true
                //sigFigs:2
            };

            if (vm.title !== undefined) {
                vm.options.title = vm.title;
            }

            /**
             * @ngdoc property
             * @name main.controller:FlowPlotCtl#data
             * @propertyOf main.controller:FlowPlotCtl
             *
             * @description
             * The data to be plotted in the dygraph plot.  This is updated with the selection
             * of the cotnext menu.  The initial value is just a single array that sets the
             * time variable to 0 and the data value to NaN.  This allows the visualization of
             * plot when there is no data available.
             */
            vm.data = [[0, NaN]];

            $rootScope.$on('FlowDataAvailable', updatePlot);

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
                var l = ['t'].concat(ExFlowSvc.IDs);

                if (l !== vm.options.labels) {
                    // If the labels have changed (usually the first time the data
                    // service is called), then copy the new labels into the options
                    vm.options.labels = l.slice();
                }

                vm.data = ExFlowSvc[data_set];
            }
        };

        FlowPlotCtl.$inject = ['$rootScope', 'ExFlowSvc'];

        return {
            restrict: 'E',
            scope: {
                title: "@?"
            },
            controller: FlowPlotCtl,
            controllerAs: 'vm',
            bindToController: true,
            template: '<dy-graph options="vm.options" data="vm.data" context-menu="vm.cm"></dy-graph>'
        };
    }
})();