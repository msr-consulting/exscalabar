(function () {
    angular.module('main').directive('exPptPlot', ppt_plot);

    function ppt_plot() {
        PptPlotCtl.$inject = ['$rootScope', 'ExPptSvc', 'ExReadCfgSvc'];
        function PptPlotCtl($rootScope, ExPptSvc, ExReadCfgSvc) {
            var vm = this;

            var d = 'P';
            vm.ref = {};
            vm.cm = [];
            vm.options = {
                ylabel: 'P (mb)',
                labels: ['t', 'Alicat0'],
                legend: 'always',
                axes: {
                    y: {
                        axisLabelWidth: 70,
                        drawGrid: ExReadCfgSvc.ppt.yGrid,
                    },
                    x: {
                        drawAxis: true,
                        drawGrid: ExReadCfgSvc.ppt.xGrid,
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

            vm.data = [[0,NaN]];
            $rootScope.$on('PptDataAvailable', update_data);

            function update_data(){

                var l = ['t'].concat(ExPptSvc.IDs);

                if (l !== vm.options.labels) {
                    // If the labels have changed (usually the first time the data
                    // service is called), then copy the new labels into the options
                    vm.options.labels = l.slice();
                }

                vm.data = ExPptSvc[d];

            }
        }

        return {
            restrict: 'E',
            require: 'contextMenu',
            scope: {
                title: "@?"
            },
            controller: PptPlotCtl,
            controllerAs: 'vm',
            bindToController: true,
            template: '<context-menu menu-options ="vm.cm"><dy-graph options="vm.options" ref= "vm.ref" data="vm.data" ></dy-graph></context-menu>'

        }
    }
})()