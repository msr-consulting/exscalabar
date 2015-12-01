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
                labels: ["t", "Cell 1", "Cell 2", "Cell 3", "Cell 4", "Cell 5"],
                legend: 'always'

            };

            $scope.optPData = {
                title: "CRD Data",
                ylabel: "data",
                labels: ["t", "Cell 1", "Cell 2", "Cell 3", "Cell 4", "Cell 5"],
                legend: 'always'
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
                $scope.pData = Data.crd.cell.max;

            });
    }
  ]);

    function updateCRD(d) {
        var dataOut = {
            "tauData": [],
            "rdFit": [],
            "rdAvg": []
        };

        for (i = 1; i < d.cell.tau[0].length; i++) {
            dataOut.tauData.push([d.cell.tau[0][i], d.cell.tau0[0][i], d.cell.taucorr[0][i], d.cell.tau0corr[0][i], d.cell.ext[0][i]]);
        }
        dataOut.rdAvg = d.cell.avg_rd;

        return dataOut;

    }
})();