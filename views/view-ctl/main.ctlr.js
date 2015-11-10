(function () {
    angular.
        module('main').
        controller('main2',
                   ['$scope', 'Data',
                    function ($scope, Data) {
                        
                        $scope.rd = {};
                        
                        $scope.purge = false;
                        
                        $scope.data = Data;
                        
                        $scope.onClick = function (points, evt) {
                            console.log(points, evt);
                        };

                        $scope.optionsPlot1 = {
                            chart: {
                                type: 'lineChart',
                                height: 300,
                                margin: {
                                    top: 20,
                                    right: 40,
                                    bottom: 60,
                                    left: 75
                                },
                                x: function (d) {
                                    return d.x;
                                },
                                y: function (d) {
                                    return d.y;
                                },
                                useInteractiveGuideline: false,
                                yAxis: {
                                    tickFormat: function (d) {
                                        return d3.format('0.01f')(d);
                                    },
                                    axisLabel: 'Testing'
                                },
                                xAxis: {
                                    tickFormat: function (d) {
                                        return d3.time.format('%X')(new Date(d));
                                    },
                                    rotateLabels: -45
                                },
                                transitionDuration: 0,
                                showXAxis: true,
                                showYAxis: true
                            }
                        };

                        /** Options used for plotting. */
                        $scope.optionsPlot2 = {
                            chart: {
                                type: 'lineChart',
                                height: 300,
                                margin: {
                                    top: 20,
                                    right: 10,
                                    bottom: 60,
                                    left: 75
                                },
                                x: function(d) {
                                    return d.x;
                                },
                                y: function(d) {
                                    return d.y;
                                },
                                useInteractiveGuideline: true,
                                yAxis: {
                                    tickFormat: function(d) {
                                        return d3.format('0.01f')(d);
                                    },
                                    axisLabel: 'Testing'
                                },
                                xAxis: {
                                    tickFormat: function(d) {
                                        return d3.time.format('%X')(new Date(d));
                                    },
                                    rotateLabels: -45
                                },
                                transitionDuration: 500,
                                showXAxis: true,
                                showYAxis: true
                            }
                        };

                        $scope.plot1Data = [{
                            values: [],
                            key: 'Cell 0'
                        }, {
                            values: [],
                            key: 'Cell 1'
                        }, {
                            values: [],
                            key: 'Cell 2'
                        }, {
                            values: [],
                            key: 'Cell 3'
                        }, {
                            values: [],
                            key: 'Cell 4'
                        }];
                        $scope.plot2Data = [{
                            values: [],
                            key: 'Cell 0'
                        }, {
                            values: [],
                            key: 'Cell 1'
                        }, {
                            values: [],
                            key: 'Cell 2'
                        }, {
                            values: [],
                            key: 'Cell 3'
                        }, {
                            values: [],
                            key: 'Cell 4'
                        }];

                        $scope.$on('dataAvailable', function () {

                            $scope.data = Data;

                            var dataOut = {
                                "plot1Data": [{
                                    values: [],
                                    key: 'Cell 0'
                                }, {
                                    values: [],
                                    key: 'Cell 1'
                                }, {
                                    values: [],
                                    key: 'Cell 2'
                                }, {
                                    values: [],
                                    key: 'Cell 3'
                                }, {
                                    values: [],
                                    key: 'Cell 4'
                                }],
                                "plot2Data": [{
                                    values: [],
                                    key: 'Cell 0'
                                }, {
                                    values: [],
                                    key: 'Cell 1'
                                }, {
                                    values: [],
                                    key: 'Cell 2'
                                }, {
                                    values: [],
                                    key: 'Cell 3'
                                }, {
                                    values: [],
                                    key: 'Cell 4'
                                }]
                            };
                            
                            for (k = 0; k < Data.crd.cell.length; k++) {
                                $scope.plot1Data[k].values = Data.crd.cell[k].avg_rd;
                            }

                            for (i = 1; i < 5; i++) {
                                $scope.plot2Data[i].values = Data.pas.cell[i].IA;
                            }
                        });
                    }
                   ]);

})();
