(function () {
    angular.module('main').controller('crd', ['$scope', 'cvt', 'Data',
    function ($scope, cvt, Data) {
        
        $scope.rd = {};

            // Lasers have three inputs
            var laserInput = function (_rate, _DC, _k, enabled, ID) {
                this.rate = _rate;
                this.DC = _DC;
                this.k = _k;
                this.en = enabled;
                this.id = ID;
            };

            $scope.setRate = function (i, f) {
                cvt.crd.setLaserRate(i, f);

            };

            /* Variable for laser control binding; first element is related to blue,
             * second to red.
             */
            $scope.laser_ctl = [
        new laserInput(cvt.crd.fblue, cvt.crd.dcblue, cvt.crd.kblue, cvt.crd.eblue, "Blue Laser"),
        new laserInput(cvt.crd.fred, cvt.crd.dcred, cvt.crd.kred, cvt.crd.ered, "Red Laser")
      ];

            $scope.pmt = cvt.crd.kpmt;

            $scope.purge = false;

            $scope.data = Data.crd;

            // TODO: Implement enabled functionality
            $scope.setEnable = function (index) {

                $scope.laser_ctl[index].en = !$scope.laser_ctl[index].en;
                var enabled = $scope.laser_ctl[index].en;
                switch (index) {
                case 0:
                    cvt.crd.eblue = enabled;
                    break;
                case 1:
                    cvt.crd.ered = enabled;
                    break;
                default:

                }

            };

            $scope.ringdownAvg = ringdownT;
            $scope.ringdownFit = ringdownT;

            $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
            $scope.series = ['Series A', 'Series B'];
            $scope.data = [[65, 59, 80, 81, 56, 55, 40],[28, 48, 40, 19, 86, 27, 90]];
            $scope.onClick = function (points, evt) {
                console.log(points, evt);
            };

            $scope.tauData = [{
                values: [],
                key: 'tau'
      }, {
                values: [],
                key: 'tau_0'
      }, {
                values: [],
                key: 'sigma_tau'
      }];

            $scope.optionsRingdown = {
                chart: {
                    type: 'lineChart',
                    height: 300,
                    useVoronoi: false,
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
                            return d3.format('d')(d);
                        },
                        axisLabel: 'Testing'
                    },
                    xAxis: {
                        rotateLabels: -45
                    },
                    transitionDuration: 500,
                    showXAxis: true,
                    showYAxis: true
                }
            };


            $scope.options = {
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

            $scope.$on('dataAvailable', function () {

                $scope.data = Data.crd;

                var data = updateCRD(Data.crd);

                $scope.tauData = data.tauData;
                $scope.ringdownAvg = data.rdAvg;
                $scope.ringdownFit = data.rdFit;
                $scope.rd.api.update();

            });
    }
  ]);

    /* Template for returning ringdown data */
    var ringdownT = [{
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


    function updateCRD(d) {
        var dataOut = {
                "tauData": [],
                "rdFit": ringdownT,
                "rdAvg": ringdownT
            };
        
            /*dataOut.tauData[0].values = d.cell[0].max;
            dataOut.tauData[1].values = d.cell[0].tau0;
            dataOut.tauData[2].values = d.cell[0].stdvTau;*/
        for (k = 0; k < d.cell.length; k++) {
            dataOut.rdAvg[k].values = d.cell[k].avg_rd;
            dataOut.rdFit[k].values = d.cell[k].fit_rd;
        }

        return dataOut;

    }
})();