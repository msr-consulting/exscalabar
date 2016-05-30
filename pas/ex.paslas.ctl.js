(function () {
    angular.module('main').controller('ExPasLasCtl', ['$scope', 'cvt', 'Data',
        function ($scope, cvt, Data) {

            $scope.lasCtl = [];
            
            var maxRange = 5;

            /** NOTE: This loop initializes the laser controls based on what is
             * in the CVT.  If the initial speaker setting is TRUE, then
             * the value of f0 will be overrun IMMEDIATELY.
             */
            for (var i = 0; i < cvt.pas.las.vr.length; i++) {

                $scope.lasCtl.push(new lasSet(cvt.pas.las.vr[i]/maxRange*100,
                    cvt.pas.las.f0[i],
                    cvt.pas.las.modulation[i],
                    cvt.pas.las.enable[i]));

            };

            $scope.$on('cvtUpdated', function () {

                // Update the laser controls if something has set them on the
                // server-side.
                for (var i = 0; i < cvt.pas.las.vr.length; i++) {

                    $scope.lasCtl[i].Vnorm = cvt.pas.las.vr[i]/maxRange*100;
                    
                    $scope.lasCtl[i].f0 = cvt.pas.las.f0[i];
                    $scope.lasCtl[i].modulation = cvt.pas.las.modulation[i];
                    $scope.lasCtl[i].lasEn = cvt.pas.las.enable[i];

                }
                console.log($scope.lasCtl);

            });

            $scope.updateMod = function () {

                var index = arguments[0];
                $scope.lasCtl[index].modulation = $scope.lasCtl[index].modulation===0?1:0;

                var x = [];
                for (j = 0; j < $scope.lasCtl.length; j++) {
                    x.push($scope.lasCtl[j].modulation);
                }
                cvt.pas.las.updateMod(x);
            };

            /* Update the laser voltage range for the lasers in the current value
             * table.
             */
            $scope.updateLasVolt = function () {
                var x = [];
                var y = [];
                var tempRange = 0;
                for (i = 0; i < $scope.lasCtl.length; i++) {
                    tempRange = $scope.lasCtl[i].Vnorm*maxRange/100;
                    x.push(tempRange);
                    y.push(tempRange/2);
                }
                cvt.pas.las.setVr(x);
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
     * * Vnorm = voltage range in volts of laser modulation
     * * f0 = modulation frequency in Hz
     * * modulation = boolean representing sine (false) or square (true)
     */
    function lasSet(vr, vo, f0, mod, en) {
        this.Vnorm = vr;
        this.f0 = f0;
        this.modulation = mod;
        this.lasEn = false;
    }

})();