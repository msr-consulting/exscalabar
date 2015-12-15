(function() {
	angular.module('main').directive('ExMsgDirective', msgFunc);

	function msgFunc() {
		return {
			restrict : 'E',
			scope : {},
			templateUrl : 'app/msg/msg.html'
		};
	}

})();
