(function () {
    angular.module('main').directive('exCrdplot', crdPlotDir);

    /**
     * @ngdoc directive
     * @name main.directive:exCrdplot
     *
     * @description
     *
     *
     */
    function crdPlotDir() {
        /**
         * @ngdoc controller
         * @name main.controller:CrdPlotCtl
         * @requires $rootScope
         * @requires main.service:ExCrdSvc
         * @description
         *
         */
        var CrdPlotCtl = function ($rootScope, ExCrdSvc, ExReadCfgSvc) {

            var vm = this;

            /* Plot tau by default... */
            var objectData = 'tau';

            /**
             * @ngdoc property
             * @name main.controller:CrdPlotCtl#cm
             * @propertyOf main.controller:CrdPlotCtl
             * @description
             * Provide a context menu for the CRD graph.  The elements are
             *
             *  * tau
             *  * tau'
             *  * standard deviation
             *  * max
             *
             * Also provides some functionality for clearing the plots and changing the lengths...
             */
            vm.cm = [
                ['<em>&tau;</em>', function () {
                    objectData = "tau";
                    vm.options.ylabel = "<em>&tau;</em> (&mu;s)";
                }],
                ["<em>&tau;'</em>",
                    function () {
                        objectData = "taucorr";
                        vm.options.ylabel = "<em>&tau;'</em> (&mu;s)";
                    }],
                ['<em>&sigma;<sub>&tau;</sub></em>', function () {
                    objectData = "stdevtau";
                    vm.options.ylabel = "<em>&sigma;<sub>&tau;</sub></em> (us)";
                }],
                ['Max', function () {
                    objectData = "max";
                    vm.options.ylabel = "Max (a.u.)";
                }],
                null, // Creates a divider
                ['Clear Data', function () {
                    ExCrdSvc.clear_history();
                }],
                ['Length', null,
                    [['30', function () {
                        ExCrdSvc.set_history(30);
                    }],
                        ['60', function () {
                            ExCrdSvc.set_history(60);
                        }],
                        ['120', function () {
                            ExCrdSvc.set_history(120);
                        }],
                        ['150', function () {
                            ExCrdSvc.set_history(150);
                        }],
                        ['300', function () {
                            ExCrdSvc.set_history(300);
                        }]
                    ]
                ]
            ];

            /**
             * @ngdoc property
             * @name main.controller:CrdPlotCtl#optoins
             * @propertyOf main.controller:CrdPlotCtl
             * @description
             * Options for the CRD graph. The options are based on teh ``dygraph`` plot options.  The ones
             * that are explicit at invocation are
             *
             * * ``ylabel`` - set for the initial plotting of tau
             * * ``labels`` - the initial labels are for time and cells 1-5
             * * ``legend`` - set to always be shown
             * * ``axes``   - set parameters for the axes such as width of the axes
             */
            var CfgObj = ExReadCfgSvc.crd;
            var labels = ["t"].concat(CfgObj.names);
            vm.options = {
                ylabel: "<em>&tau;</em> (&mu;s)",
                labels: labels,
                legend: 'always',
                axes: {
                    y: {
                        axisLabelWidth: 70,
                        drawGrid: CfgObj.yGrid
                    },
                    x: {
                        drawAxis: true,
                        drawGrid: CfgObj.yGrid,
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

            $rootScope.$on('crdDataAvaliable', update_plot);

            /* Update plot with new data. */
            function update_plot() {
                vm.data = ExCrdSvc[objectData];
            }

        };

        // Provide annotation for angular minification
        CrdPlotCtl.$inject = ['$rootScope', 'ExCrdSvc', 'ExReadCfgSvc'];

        return {
            restrict: 'E',
            require: 'contextMenu',
            scope: {
                title: "@?"
            },
            controller: CrdPlotCtl,
            controllerAs: 'vm',
            bindToController: true,
            template: '<context-menu menu-options="vm.cm"><dy-graph options="vm.options" data="vm.data" ></dy-graph></context-menu>'
        };
    }
})();
