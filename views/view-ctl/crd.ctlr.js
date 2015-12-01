(function () {
    angular.module('main').controller('crd', ['$scope', 'cvt', 'Data',
    function ($scope, cvt, Data) {

            //$scope.rd = {};

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

            // Space data - allows us to display the dygraph plot with no data if not connected
            $scope.ringdownAvg = [[0, NaN, NaN, NaN, NaN, NaN]];
            $scope.pData = [[0, NaN, NaN, NaN, NaN, NaN]];
            // $scope.ringdownFit = [];

            // dygraph options object
            $scope.options = {
                title: 'Ringdown Data',
                ylabel: 'Ringdown Magnitude (au)',
                labels: ["t", "Cell 1", "Cell 2", "Cell 3", "Cell 4", "Cell 5"]

            };

            $scope.optPData = {
                title: "CRD Data",
                ylabel: "data",
                xlabel: "time",
                labels: ["t", "Cell 1", "Cell 2", "Cell 3", "Cell 4", "Cell 5"]
            };

            $scope.pDataCMOptions = [
                ['tau', function () {
                    $scope.optPData.ylabel = "tau (us)";
            }],
                ["tau'", 
                 function () {
                    $scope.optPData.ylabel = "tau' (us)";
            }],
                ['stdev', function () {}]
            ];

            /* Listen for broadcasts from the DATA SERVICE */
            $scope.$on('dataAvailable', function () {

                $scope.data = Data.crd;

                var data = updateCRD(Data.crd);

                $scope.ringdownAvg = data.rdAvg;

            });
    }
  ]);

    function updateCRD(d) {
        var dataOut = {
            "tauData": [],
            "rdFit": [],
            "rdAvg": []
        };

        /*dataOut.tauData[0].values = d.cell[0].max;
        dataOut.tauData[1].values = d.cell[0].tau0;
        dataOut.tauData[2].values = d.cell[0].stdvTau;*/
        for (k = 0; k < d.cell[0].avg_rd.length; k++) {
            var aRD = [k];
            for (j = 0; j < d.cell.length; j++) {
                aRD.push(d.cell[j].avg_rd[k]);

            }
            dataOut.rdAvg.push(aRD);
        }

        return dataOut;

    }
})();