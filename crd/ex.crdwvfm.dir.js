(function () {
    angular.module('main').directive('exCrdWvfm', crd_wvfm);

    /**
     * @ngdoc directive
     * @name main.directive:exCrdWvfm
     *
     * @description
     * Directive defines a space for building a dygraph plot for the CRD
     * ringdowns.
     *
     */
    crd_wvfm.$inject = ['ExReadCfgSvc'];

    function crd_wvfm(ExReadCfgSvc) {

        /**
         * @ngdoc controller
         * @name main.controller:CrdWvfmCtl
         * @requires $rootScope
         * @requires main.service:ExCrdSvc
         * @description
         * Controller for the ringdown plotting directive.
         */
        var CrdWvfmCtl = function ($rootScope, ExCrdSvc) {

            var vm = this;

            /**
             * @ngdoc property
             * @name main.controller:CrdWvfmCtl#cm
             * @propertyOf main.controller:CrdWvfmCtl
             * @description
             * Provide a context menu for the CRD ringdown graph.
             */
            vm.cm = [
                ['Grid', null,
                    [['Grid X', function () {
                    }], ['Grid Y', function () {
                    }], ['Enable', function () {
                    }],
                        ['Disable', function () {
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

            /**
             * @ngdoc property
             * @name main.controller:CrdWvfmCtl#options
             * @propertyOf main.controller:CrdWvfmCtl
             * @description
             * Options for the Pas graph. The options are based on teh ``dygraph`` plot options.  The ones
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
                ylabel: "Ringdown Amplitude (a.u.)",
                labels: labels,
                legend: 'always',
                axes: {
                    y: {
                        axisLabelWidth: 70,
                        drawGrid: CfgObj.yGrid
                    },
                    x: {
                        drawAxis: true,
                        drawGrid: CfgObj.xGrid
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

            vm.options.xlabel = "t";

            $rootScope.$on('crdDataAvaliable',
                function () {
                    vm.data = ExCrdSvc.avg_rd
                });

        };

        // Provide annotation for angular minification
        CrdWvfmCtl.$inject = ['$rootScope', 'ExCrdSvc'];

        return {
            restrict: 'E',
            scope: {
                title: "@?"
            },
            controller: CrdWvfmCtl,
            controllerAs: 'vm',
            bindToController: true,
            template: '<context-menu menu-options="vm.cm"><dy-graph options="vm.options" data="vm.data"></dy-graph></context-menu>'

        };
    }
})();