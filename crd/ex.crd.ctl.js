(function () {
    angular.module('main').controller('ExCrdCtl', ['$scope', 'cvt', 'Data',
    function ($scope, cvt, Data) {

            cvt.firstcall = 1;

            // Lasers have three inputs
            var laserInput = function (_rate, _DC, _k, enabled, ID) {
                this.rate = _rate;
                this.DC = _DC;
                this.k = _k;
                this.en = enabled;
                this.id = ID;
            };

            var objectData = "tau";

            /* Wrap the CVT function so that we force the CVT to update
             * when the view changes.  
             * argument[0] === index of laser 
             * argument[1] === rate.
             */
            $scope.setRate = function () {
                var index = arguments[0];
                var rate = arguments[1];
                cvt.crd.setLaserRate(index, rate);

            };

            $scope.setEn = function () {
                var index = arguments[0];
                $scope.laser_ctl[index].en = !$scope.laser_ctl[index].en;

                cvt.crd.setEnable([$scope.laser_ctl[0].en, $scope.laser_ctl[1].en]);
            };

            /* Variable for laser control binding; first element is related to blue,
             * second to red.
             */
            $scope.laser_ctl = [
        new laserInput(cvt.crd.fblue, cvt.crd.dcblue, cvt.crd.kblue, cvt.crd.eblue, "Blue Laser"),
        new laserInput(cvt.crd.fred, cvt.crd.dcred, cvt.crd.kred, cvt.crd.ered, "Red Laser")
      ];

            $scope.pmt = cvt.crd.kpmt;

            $scope.setGain = function () {
                cvt.crd.setGain($scope.pmt);
            };

            $scope.setLaserGain = function () {
                cvt.crd.setLaserGain([$scope.laser_ctl[0].k, $scope.laser_ctl[1].k]);
            };

            $scope.purge = {
                pos: false,
                flow: 0.16,
                setValve: function () {
                    this.pos = !this.pos;
                    cvt.purge.setSw(this.pos);

                },
                setFlow: function () {

                }
            };

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
                ylabel: "tau (us)",
                labels: ["t", "Cell 1", "Cell 2", "Cell 3", "Cell 4", "Cell 5"],
                legend: 'always'
            };

            $scope.pDataCMOptions = [
                ['tau', function () {
                    $scope.optPData.ylabel = "tau (us)";
                    objectData = "tau";


            }],
                ["tau'",
                 function () {
                        $scope.optPData.ylabel = "tau' (us)";
                        objectData = "taucorr";
                }],
                ['stdev', function () {
                    $scope.optPData.ylabel = "std. tau (us)";
                    objectData = "stdevtau";
                }],
                ['max', function () {
                    $scope.optPData.ylabel = "max";
                    objectData = "max";
                }]
            ];

            /* Listen for broadcasts from the DATA SERVICE */
            $scope.$on('dataAvailable', function () {

                $scope.data = Data.crd;

                var data = updateCRD(Data.crd);

                $scope.ringdownAvg = data.rdAvg;
                $scope.pData = Data.crd.cell[objectData];

            });

            $scope.$on('cvtUpdated', function () {
                $scope.laser_ctl[0].rate = cvt.crd.fblue;
                $scope.laser_ctl[0].DC = cvt.crd.dcblue;
                $scope.laser_ctl[0].k = cvt.crd.kblue;
                $scope.laser_ctl[0].enabled = cvt.crd.eblue;

                $scope.laser_ctl[1].rate = cvt.crd.fred;
                $scope.laser_ctl[1].DC = cvt.crd.dcred;
                $scope.laser_ctl[1].k = cvt.crd.kred;
                $scope.laser_ctl[1].enabled = cvt.crd.ered;

                $scope.pmt = cvt.crd.kpmt;

                //$scope.purge.pos = cvt.general.purge;

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