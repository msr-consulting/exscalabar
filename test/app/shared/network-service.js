/** This service handles network settings that can be set in the sidebar.
 *  This communicates the settings in the sidebar to the other portions of
 *  the application that require the ip address and port. 
 * 
 *  This application stores the settings in local storage so that they are 
 *  restored on refresh.
 */

(function() {
	angular.module('main').factory('net', function() {

		if (!localStorage.ip) {
			localStorage.ip = "192.168.0.73";
		}

		if (!localStorage.port) {
			localStorage.port = "8001";
		}

		return {
			ip : localStorage.ip,
			port : localStorage.port,
			getNetworkParams : function() {
				return {
					"ip" : this.ip,
					"port" : this._port
				};
			},
			setNetworkParams : function(ip, port) {
				this._ip = ip;
				this.port = port;
				localStorage.ip = ip;
				localStorage.port = port;
			},
			setIP : function(ip) {
				this.ip = ip;
				localStorage.ip = ip;
			},
			setPort : function(port) {
				this.port = port;
				localStorage.port = port;
			},
			address : function() {
				return 'http://' + this.ip + ':' + this.port  + '/xService/';
			}
		};
	});

})(); 