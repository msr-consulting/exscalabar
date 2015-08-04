/** This service handles network settings that can be set in the sidebar.
 *  This communicates the settings in the sidebar to the other portions of
 *  the application that require the ip address and port.
 *
 *  This application stores the settings in local storage so that they are
 *  restored on refresh.
 */

(function() {
	angular.module('main').factory('net', function() {

		/* On power up, check for the key 'ip' in the local cache.  If it does not
		 * exist, add the key and set it to the value below.
		 */
		if (!localStorage.ip) {
			localStorage.ip = "192.168.0.73";
		}

		/* On power up, check for the key 'port' in the local cache.  If it does not
		 * exist, add the key and set it to the value 8001 (the debug port).
		 */
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

			/** Setter for the IP Address and port of the server.  This function
			  * will cache the data using an HTML5 localStorage call.
				*/
			setNetworkParams : function(ip, port) {
				this._ip = ip;
				this.port = port;
				localStorage.ip = ip;
				localStorage.port = port;
			},

			/** Set the IP address of the local server.  Cache the address using
			  * HTML5 localStorage.
				* @param {string} - IP address in xxx.xxx.xxx.xxx form.
				*/
			setIP : function(ip) {
				this.ip = ip;
				localStorage.ip = ip;
			},

			/** Set the port on which we are talking to the server.  Cache the port
			  * using HTML5 localStorage.
				* @param {integer} - Value for port.
				*/
			setPort : function(port) {
				this.port = port;
				localStorage.port = port;
			},

			/** Use this function to return the address of the web service.
			  * @return {string} - address in format 'http://[IP]:[Port]/xService/'
				*/
			address : function() {
				return 'http://' + this.ip + ':' + this.port  + '/xService/';
			}
		};
	});

})();
