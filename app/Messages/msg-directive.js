(function() {
	angular.module('main').directive('msg', msg_);

	function msg_() {
		return {
			restrict : 'E',
			scope : {},
			templateUrl : 'app/Messages/msg.html'
		};
	}

})(); 
