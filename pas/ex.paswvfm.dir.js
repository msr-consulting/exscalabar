(function () {
    angular.module('main').directive('exPasWvfm', pas_wvfm);

    /**
     * @ngdoc directive
     * @name main.directive:exPasPlot
     *
     * @description
     *
     *
     */
    pas_wvfm.$inject = ['ExReadCfgSvc'];
    function pas_wvfm(ExReadCfgSvc) {

        /**
         * @ngdoc controller
         * @name main.controller:PasPlotCtl
         * @requires $rootScope
         * @requires main.service:ExPasSvc
         * @description
         *
         */
        var PasWvfmCtl = function ($rootScope, ExPasSvc) {

            var vm = this;

            var objectData = 'IA';

            /**
             * @ngdoc property
             * @name main.controller:PasPlotCtl#cm
             * @propertyOf main.controller:PasPlotCtl
             * @description
             * Provide a context menu for the Pas graph.  The elements are
             *
             *  * tau
             *  * tau'
             *  * standard deviation
             *  * max
             *
             * Also provides some functionality for clearing the plots and changing the lengths...
             */
            vm.cm = [
                ['Microphone Frequency Domain', function () {
                    objectData = "micf";
                    vm.options.ylabel = "Mic Frequency Power (a.u.)";
                }],
                ["Microphone Time Domain",
                    function () {
                        objectData = "mict";
                        vm.options.ylabel = "Mic Time Magnitude (a.u.)";
                    }],
                ['Photodiode Time Domain', function () {
                    objectData = "pd";
                    vm.options.ylabel = "PD Time Magnitude (a.u.)";
                }],
                null,
                ['Grid', null,
                    [['Grid X', function () {
                    }], ['Grid Y', function () {
                    }], ['Enable', function () {
                    }],
                        ['Disable', function () {
                        }]]
                ]
            ];

            /**
             * @ngdoc property
             * @name main.controller:PasWvfmCtl#optoins
             * @propertyOf main.controller:PasWvfmCtl
             * @description
             * Options for the Pas graph. The options are based on teh ``dygraph`` plot options.  The ones
             * that are explicit at invocation are
             *
             * * ``ylabel`` - set for the initial plotting of tau
             * * ``labels`` - the initial labels are for time and cells 1-5
             * * ``legend`` - set to always be shown
             * * ``axes``   - set parameters for the axes such as width of the axes
             */

            var CfgObj = ExReadCfgSvc.pas;
            var labels = ["f"].concat(CfgObj.names);
            vm.options = {
                ylabel: "Mic Frequency Power (a.u.)",
                labels: labels,
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
                            return Dygraph.zeropad(d.getHours()) + ":" + Dygraph.zeropad(d.getMinutes()) + ":" + Dygraph.zeropad(d.getSeconds());
                        }
                    }
                },
                series: {}
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

            // If the user specifies a title, put it up there...
            if (vm.title !== undefined) {
                vm.options.title = vm.title;
            }

            // Some default data so that you can see the actual graph
            vm.data = [[0, NaN, NaN, NaN, NaN, NaN]];

            $rootScope.$on('pasDataAvaliable', update_plot);

            function update_plot() {

                vm.data = ExPasSvc.wvfm[objectData];

            }

        };

        // Provide annotation for angular minification
        PasWvfmCtl.$inject = ['$rootScope', 'ExPasSvc'];

        return {
            restrict: 'E',
            scope: {
                title: "@?"
            },
            controller: PasWvfmCtl,
            controllerAs: 'vm',
            bindToController: true,
            template: '<context-menu menu-options="vm.cm"><dy-graph options="vm.options" data="vm.data"></dy-graph></context-menu>'

        };
    }
})();