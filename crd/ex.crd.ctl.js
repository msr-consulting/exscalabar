(function () {
    angular.module('main').controller('ExCrdCtl', ['$scope', 'cvt', 'ExCrdSvc',
        function ($scope, cvt, ExCrdSvc) {

            cvt.firstcall = 1;
            
            var maxPMTGain = 10;
            var maxLaserGain = 5;
            
            $scope.write_wvfm_data = false;
            $scope.write_taus = cvt.crd.write_taus;

            // Lasers have three inputs
            var laserInput = function (_rate, _DC, _k, enabled, ID) {
                this.rate = _rate;
                this.DC = _DC;
                this.k = _k;
                this.en = enabled;
                this.id = ID;
            };

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

            $scope.show_wvfm = true;
            
            $scope.update_wvfm_state = function(){
                $scope.show_wvfm = !$scope.show_wvfm;

            };
            
            $scope.update_tau_write= function(){
                $scope.write_taus = !$scope.write_taus;
                cvt.crd.update_tau_write($scope.write_taus);
            }

            $scope.setEn = function () {
                var index = arguments[0];
                $scope.laser_ctl[index].en = !$scope.laser_ctl[index].en;

                cvt.crd.setEnable([$scope.laser_ctl[0].en, $scope.laser_ctl[1].en]);
            };

            /* Variable for laser control binding; first element is related to blue,
             * second to red.
             */
            $scope.laser_ctl = [
                new laserInput(cvt.crd.fblue, cvt.crd.dcblue, cvt.crd.kblue/maxLaserGain*100, cvt.crd.eblue, "Blue Laser"),
                new laserInput(cvt.crd.fred, cvt.crd.dcred, cvt.crd.kred/maxLaserGain*100, cvt.crd.ered, "Red Laser")
            ];

            $scope.pmt = cvt.crd.kpmt.map(function(x){return x/maxPMTGain*100;});

            $scope.setGain = function () {
                cvt.crd.setGain($scope.pmt.map(function(x){ return x/100*maxPMTGain;}));
            };

            $scope.setLaserGain = function () {
                cvt.crd.setLaserGain([$scope.laser_ctl[0].k/100*maxLaserGain, $scope.laser_ctl[1].k/100*maxLaserGain]);
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

            $scope.data = ExCrdSvc;

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

            // dygraph options object
            $scope.options = {
                title: 'Ringdown Data',
                ylabel: 'Ringdown Magnitude (au)',
                labels: ["t", "Cell 1", "Cell 2", "Cell 3", "Cell 4", "Cell 5"],
                legend: 'always'

            };

            /* Listen for broadcasts from the DATA SERVICE */
            $scope.$on('crdDataAvaliable', function () {

                $scope.data = ExCrdSvc;

                $scope.ringdownAvg = ExCrdSvc.avg_rd;

            });

            $scope.$on('cvtUpdated', function () {
                $scope.laser_ctl[0].rate = cvt.crd.fblue;
                $scope.laser_ctl[0].DC = cvt.crd.dcblue;
                $scope.laser_ctl[0].k = cvt.crd.kblue/maxLaserGain*100;
                $scope.laser_ctl[0].enabled = cvt.crd.eblue;

                $scope.laser_ctl[1].rate = cvt.crd.fred;
                $scope.laser_ctl[1].DC = cvt.crd.dcred;
                $scope.laser_ctl[1].k = cvt.crd.kred/maxLaserGain*100;
                $scope.laser_ctl[1].enabled = cvt.crd.ered;

                $scope.pmt = cvt.crd.kpmt.map(function(x){return x/maxPMTGain*100;});

                $scope.write_taus = cvt.crd.write_taus;
                //$scope.purge.pos = cvt.general.purge;

            });
        }
    ]);
})();