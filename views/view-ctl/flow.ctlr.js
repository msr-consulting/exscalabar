(function() {
	angular.module('main').controller("flowCtlr", ['$scope', "Data", "cvt",
	function($scope, Data, cvt) {
		
		// Stores the position in the controller array
		var i = -1;
		
		//Array that will hold the setpoints...
		$scope.setpoints = [];
 
		function flowDevice(id, t, isCtl, sp){
			this.ID = id;
			this.type = t;
			this.isController = isCtl;
			
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
			if (isCtl){
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
		$scope.Devices = [new flowDevice("Dry Red", "mflow", true,0), 
							new flowDevice("Dry Blue", "mflow", false,0), 
							new flowDevice("Denuded Blue", "mflow", false,0),
							new flowDevice("Denuded Red", "mflow", true,0),
							new flowDevice("PAS Green", "mflow", false,0),
							new flowDevice("CRD High Humidified", "mflow", false,0),
							new flowDevice("CRD Low Humidified", "mflow", false,0),
							new flowDevice("Mirror Purge Flow", "mflow", false,0),
							new flowDevice("Pressure Controller", "pressure", false,0),
							new flowDevice("O3 Bypass", "mflow", true,0),
						 ];
		
		/* Update the CVT - the CVT should call the server... */			 
		$scope.updateSP = function(){
			
		};
	}]);
})();
