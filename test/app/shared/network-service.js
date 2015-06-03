(function(){
	angular.module('main')
	.factory('net', function(){
		return {
			ip: "192.168.0.73", 
			port: "8001",
			getNetworkParams: function(){return {"ip": this.ip, "port": this._port};},
			setNetworkParams: function(ip, port){this._ip = ip; this.port = port;},
			setIP: function(ip){this.ip = ip;},
			setPort: function(port){this.port = port;},
			address: function(){return this.ip + ':' + this.port;}
		};
	});
	
})();