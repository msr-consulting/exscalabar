(function () {
    angular.module('main').directive('exPasplot', pas_plot);

    /**
     * @ngdoc directive
     * @name main.directive:exPasPlot
     *
     * @description
     *
     *
     */
    pas_plot.$inject = ['ExReadCfgSvc'];
    function pas_plot(ExReadCfgSvc) {

        /**
         * @ngdoc controller
         * @name main.controller:PasPlotCtl
         * @requires $rootScope
         * @requires main.service:ExPasSvc
         * @description
         *
         */
        var PasPlotCtl = function ($rootScope, ExPasSvc) {

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
                ['<em>IA (a.u.)</em>', function () {
                    objectData = "IA";
                    vm.options.ylabel = "IA (a.u.)";
                }],
                ["<em>f<sub>0</sub></em>",
                    function () {
                        objectData = "f0";
                        vm.options.ylabel = "<em>f<sub>0</sub></em> (Hz)";
                    }],
                ['Quality', function () {
                    objectData = "Q";
                    vm.options.ylabel = "Quality (a.u.)";
                }],
                ['Noise Floor', function () {
                    objectData = "p";
                    vm.options.ylabel = "Noise (a.u.)";
                }],
                ['<em>&sigma;<sub>abs</sub></em>', function () {
                    objectData = "abs";
                    vm.options.ylabel = "<em>&sigma;<sub>abs</sub></em> (Mm<sup>-1</sup>)";
                }],
                null, // Creates a divider
                ['Clear Data', function () {
                    ExPasSvc.clear();
                }],
                ['History', null, [
                    ['30', function () {
                        ExPasSvc.set_history(30);
                    }],
                    ['60', function () {
                        ExPasSvc.set_history(60);
                    }],
                    ['120', function () {
                        ExPasSvc.set_history(120);
                    }],
                    ['150', function () {
                        ExPasSvc.set_history(150);
                    }],
                    ['300', function () {
                        ExPasSvc.set_history(300);
                    }]
                ]],
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
             * @name main.controller:PasPlotCtl#optoins
             * @propertyOf main.controller:PasPlotCtl
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
            var labels = ["t"].concat(CfgObj.names);
            vm.options = {
                ylabel: "<em>IA</em> (a.u.)",
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

                vm.data = ExPasSvc[objectData];

            }

        };

        // Provide annotation for angular minification
        PasPlotCtl.$inject = ['$rootScope', 'ExPasSvc'];

        return {
            restrict: 'E',
            scope: {
                title: "@?"
            },
            controller: PasPlotCtl,
            controllerAs: 'vm',
            bindToController: true,
            template: '<context-menu menu-options="vm.cm"><dy-graph options="vm.options" data="vm.data"></dy-graph></context-menu>'

        };
    }
})();