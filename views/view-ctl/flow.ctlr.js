(function () {
    angular.module('main').controller("flowCtlr", ['$scope', "Data", "cvt",
	function ($scope, Data, cvt) {

            // Stores the position in the controller array
            var i = -1;

            cvt.first_call = 1;

            //Array that will hold the setpoints...
            $scope.setpoints = [];

            function mData() {
                this.P = 0;
                this.T = 0;
                this.Q = 0;
                this.Q0 = 0;
                this.Q = 0;
            }

            function flowDevice(label, id, t, isCtl, sp) {
                this.label = label;
                this.ID = id;
                this.type = t;
                this.isController = isCtl;
                this.data = new mData();

                // TODO: This should be set by the CVT based on i
                this.sp = sp;

                // If this device is not a controller, the index will be -1...
                this.index = -1;

                /* If this device is a controller, push the new setpoint into the
                 * setpoint array and update the index.
                 * REALLY, THIS SHOULD BE PURELY A FUNCTION OF THE CVT AND SHOULD
                 * NOT BE CONTROLLED BY THIS HERE - THIS IS TEMPORARY....
                 */

                // TESTED AND FUNCTIONAL
                if (isCtl) {
                    $scope.setpoints.push(sp);
                    // Update the global index
                    i += 1;

                    // Update the instance controller index...
                    this.index = i;
                }
            }

            /* TODO: This is hard coded now but should not be.  IDs should correspond to config
             * file IDs.
             */

            $scope.Devices = [new flowDevice("Dry Red", "TestAlicat", "mflow", true, 0),
							new flowDevice("Dry Blue", "dryBlue", "mflow", false, 0),
							new flowDevice("Denuded Blue", "deBlue", "mflow", false, 0),
							new flowDevice("Denuded Red", "deRed", "mflow", true, 0),
							new flowDevice("PAS Green", "pGreen", "mflow", false, 0),
							new flowDevice("CRD High Humidified", "crdHighHum", "mflow", false, 0),
							new flowDevice("CRD Low Humidified", "crdLowHum", "mflow", false, 0),
							new flowDevice("Mirror Purge Flow", "crdMirror", "mflow", false, 0),
							new flowDevice("Pressure Controller", "pCtl", "pressure", false, 0),
							new flowDevice("O3 Bypass", "o3Bypass", "mflow", true, 0),
						 ];

            /* Update the CVT - the CVT should call the server... */
            $scope.updateSP = function (d) {
                cvt.flows.updateSP(d.ID, d.sp);
            };

            $scope.$on('dataAvailable', function () {
                for (j = 0; j < $scope.Devices.length; j++) {
                    // If the mass flow controller is present in the data...
                    if ($scope.Devices[j].ID in Data) {

                        $scope.Devices[j].P = Data[$scope.Devices[j].ID].P;
                        $scope.Devices[j].T = Data[$scope.Devices[j].ID].T;
                        $scope.Devices[j].Q = Data[$scope.Devices[j].ID].Q;
                        $scope.Devices[j].Q0 = Data[$scope.Devices[j].ID].Q0;
                        $scope.Devices[j].Qsp = Data[$scope.Devices[j].ID].Qsp;

                    }
                }
            });
	}]);
})();