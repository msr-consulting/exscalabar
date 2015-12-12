/** This service is used for defining how device data is displayed.
 *  Several devices can be controlled (mass flow controller and temperature
 * 	controllers), but most are just display purposes.  This service will
 * 	regularly check to see if the configuration has been updated and notify
 *  all users of updates.
 */

(function() {
	angular.module('main').factory('cirrus.crd.svc', [function(){}]);
})();
