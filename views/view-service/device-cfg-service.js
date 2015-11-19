/** This service is used for defining how device data is displayed.
 *  Several devices can be controlled (mass flow controller and temperature
 * 	controllers), but most are just display purposes.  This service will
 * 	regularly check to see if the configuration has been updated and notify
 *  all users of updates.
 */

(function() {
	angular.module('main').directive('devicecCfg', deviceCfg);

	function deviceCfg() {

		var flow = {
			'Name' : "",
			'IsController' : false,
			'CtlUnits' : "lpm"
		};

		var cfg = {
			"mfc" : [],
			"vaisala" : [],
			"meerstetter" : [],
			"ppt" : []
		};

		// TODO: Add server side functionality for updating the configuration.
		cfg.checkCfg = function() {
			promise = $http.get(net.address() + 'General/deviceCfg').then(function(data, status, headers, config) {

			} /* End success*/);
		};

		return cfg;

	}

})();
