(function () {
    angular.module('main').controller('ExPasLasCtl', ['$scope', 'cvt', 'Data',
        function ($scope, cvt, Data) {

            $scope.lasCtl = [];

            /** NOTE: This loop initializes the laser controls based on what is
             * in the CVT.  If the initial speaker setting is TRUE, then
             * the value of f0 will be overrun IMMEDIATELY.
             */
            for (var i = 0; i < cvt.pas.las.vr.length; i++) {

                $scope.lasCtl.push(new lasSet(cvt.pas.las.vr[i],
                    cvt.pas.las.voffset[i],
                    cvt.pas.las.f0[i],
                    cvt.pas.las.modulation[i],
                    cvt.pas.las.enable[i]));

            }

            // Listen for data
            $scope.$on('dataAvailable', function () {

                /* If the current position of the speaker is TRUE (speaker is on),
                 * populate the modulation frequencies in the laser controls with
                 * the current resonant frequency measured by the microphone.
                 */
                if (Data.pas.drive) {
                    for (i = 0; i < Data.pas.cell.length; i++) {
                        $scope.lasCtl[i].f0 = $scope.data.cell[i].f0[0].y;
                    }
                }
            });

            $scope.$on('cvtUpdated', function () {

                // Update the laser controls if something has set them on the
                // server-side.
                for (var i = 0; i < cvt.pas.las.vr.length; i++) {

                    $scope.lasCtl[i].vr = cvt.pas.las.vr[i];
                    $scope.lasCtl[i].vo = cvt.pas.las.voffset[i];
                    $scope.lasCtl[i].f0 = cvt.pas.las.f0[i];
                    $scope.lasCtl[i].mod = cvt.pas.las.modulation[i];
                    $scope.lasCtl[i].en = cvt.pas.las.enable[i];

                }

            });

            $scope.updateMod = function () {

                var index = arguments[0];
                $scope.lasCtl[index].modulation = !$scope.lasCtl[index].modulation;

                var x = [];
                for (j = 0; j < $scope.lasCtl.length; j++) {
                    x.push($scope.lasCtl[j].modulation);
                }
                cvt.pas.las.updateMod(x);
            };

            /* Update the laser voltage range for the lasers in the current value
             * table.
             */
            $scope.updateVr = function () {
                var x = [];
                for (i = 0; i < $scope.lasCtl.length; i++) {
                    x.push($scope.lasCtl[i].Vrange);
                }
                cvt.pas.las.setVr(x);
            };

            /* Update the voltage offset in the current value table. */
            $scope.updateVo = function () {
                var x = [];
                for (i = 0; i < $scope.lasCtl.length; i++) {
                    x.push($scope.lasCtl[i].Voffset);
                }
                cvt.pas.las.setVo(x);
            };

            $scope.updatef0 = function () {
                var x = [];
                for (i = 0; i < $scope.lasCtl.length; i++) {
                    x.push($scope.lasCtl[i].f0);
                }
                cvt.pas.las.setf0(x);
            };

            $scope.updateEnable = function (i) {

                $scope.lasCtl[i].lasEn = !$scope.lasCtl[i].lasEn;
                var x = [];
                for (i = 0; i < $scope.lasCtl.length; i++) {
                    x.push($scope.lasCtl[i].lasEn);
                }
                cvt.pas.las.updateEnable(x);

            };

        }
    ]);

    /** PAS Laser settings object.  The settings are
     * * Vrange = voltage range in volts of laser modulation
     * * Voffset = voltage offset in volts for laser modulation.
     * * f0 = modulation frequency in Hz
     * * modulation = boolean representing sine (false) or square (true)
     */
    function lasSet(vr, vo, f0, mod, en) {
        this.Vrange = vr;
        this.Voffset = vo;
        this.f0 = f0;
        this.modulation = mod;
        this.lasEn = false;
    }

})();