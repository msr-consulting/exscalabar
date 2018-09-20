(function () {
    angular.module('main').directive('exPasTempPlot', pasTempPlotDir);

    function pasTempPlotDir() {
        /**
         * @ngdoc directive
         * @name main.directive:exPasTempPlot
         * @scope
         * @restrict E
         *
         * @description
         * This directive wraps a plot specifically for the purpose of providing
         * a reusable means to display PAS specfiic temperature data returned by the server.
         *
         */

        /**
         * @ngdoc controller
         * @name main.controller:pasTempPoltCtl
         * @requires $rootScope
         * @requires main.service:ExReadCfgSvc
         * @requires main.service:ExPasSvc
         *
         * @description
         * This controller is used specifically for handling data returned by
         * the PAS service to plot the temperature data.
         */

        pasTempPlotDir.$inject = ['$rootScope', 'ExReadCfgSvc', 'ExPasSvc'];
        function pasTempPoltCtl($rootScope, ExReadCfgSvc, ExPasSvc) {


            var vm = this;

            vm.ref = {};

            /**
             * @ngdoc property
             * @name main.controller:pasTempPoltCtl#cm
             * @propertyOf main.controller:pasTempPoltCtl
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
             * * Enable All - enable all plots
             * * Clear Data - empty plot arrays
             * * Autoscale 1x - adjust the limits to the current plot range
             * * Autoscale - set the range to ``[null, null]`` and axis will adjust to the current range
             *
             */
            vm.cm = [
                    ['Enable All', function () {
                        console.log('Enabling all.');
                    }],
                    ['Clear Data', function () {
                        ExVaisalaSvc.clear_data();
                    }],
                
                    ['Autoscale 1x', function () {
                        vm.options.axes.y.valueRange = vm.ref.yAxisRange();
                    }],
                    ['Autoscale', function () {
                        vm.options.axes.y.valueRange = [null, null];
                    }]
                

            ];

            /**
             * @ngdoc property
             * @name main.controller:pasTempPoltCtl#options
             * @propertyOf main.controller:pasTempPoltCtl
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
            var CfgObj = ExReadCfgSvc.pas;
            var labels = ["t"].concat(CfgObj.names);
            vm.options = {
                ylabel: 'Temperature (&deg;C)',
                labels: labels,
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

            var cl = CfgObj.color.length;
            var pl = CfgObj.pattern.length;
            var swl = CfgObj.strokeWidth.length;

            for (var j = 0; j < CfgObj.names.length; j++) {
                var p = CfgObj.pattern[j % pl] === null ? null : Dygraph[CfgObj.pattern[j % pl]];
                vm.options.series[CfgObj.names[j]] = {
                    color: CfgObj.color[j % cl],
                    strokeWidth: CfgObj.strokeWidth[j % swl],
                    strokePattern: p,
                    drawPoints: true
                };

            }

 
            // If the user provides a title in the directive call, add the title.
            if (vm.title !== undefined) {
                vm.options.title = vm.title;
            }

            /**
             * @ngdoc property
             * @name main.controller:pasTempPoltCtl#data
             * @propertyOf main.controller:pasTempPoltCtl
             *
             * @description
             * The data to be plotted in the dygraph plot.  This is updated with the selection
             * of the cotnext menu.  The initial value is just a single array that sets the
             * time variable to 0 and the data value to NaN.  This allows the visualization of
             * plot when there is no data available.
             */
            vm.data = [[0, NaN, NaN, NaN, NaN, NaN]];

            $rootScope.$on('pasDataAvaliable', updatePlot);

            /**
             * @ngdoc method
             * @name main.controller:pasTempPoltCtl#updatePlot
             * @methodOf main.controller:FlowPlotCtl
             *
             * @description
             * Simply popluates the ``data`` variable with the PAS temperature arrays.
             *
             */
            function updatePlot() {
                

                vm.data = ExPasSvc.temp;
            }
        }

        return {
            restrict: 'E',
            require: 'contextMenu',
            scope: {
                title: "@?"
            },
            controller: pasTempPoltCtl,
            controllerAs: 'vm',
            bindToController: true,
            template: '<context-menu menu-options ="vm.cm"><dy-graph options="vm.options" ref="vm.ref" data="vm.data" ></dy-graph></context-menu>'
        };
    }
})();
