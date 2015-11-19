(function() {
	angular.module('main').directive('msg', msgFunc);

	function msgFunc() {
		return {
			restrict : 'E',
			scope : {},
			templateUrl : 'app/msg/msg.html'
		};
	}

})();
