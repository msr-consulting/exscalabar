
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
    function pas_plot() {

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
                ['IA', function () {
                    objectData = "IA";
                    vm.options.ylabel = "IA (a.u.)";
                }],
                ["f0",
                    function () {
                        objectData = "f0";
                        vm.options.ylabel = "f0 (Hz)";
                    }],
                ['Quality', function () {
                    objectData = "Q";
                    vm.options.ylabel = "Quality (a.u.)";
                }],
                ['Noise Floor', function () {
                    objectData = "p";
                    vm.options.ylabel = "Noise (a.u.)";
                }],
                ['Absorption', function () {
                    objectData = "abs";
                    vm.options.ylabel = "Absorption (Mm-1)";
                }],
                null, // Creates a divider
                ['Clear Data', function () {
                    ExPasSvc.clear();
                }],
                ['>', 'History'],
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
                }],
                ['<']
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
            vm.options = {
                ylabel: "IA (a.u.)",
                labels: ["t", "Cell 1", "Cell 2", "Cell 3", "Cell 4", "Cell 5"],
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
                }
            };

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
            //template: '<dy-graph options="vm.options" data="vm.data" context-menu="vm.cm"></dy-graph>'

            template: '<dy-graph options="vm.options" data="vm.data"></dy-graph>'

        };
    }
})();