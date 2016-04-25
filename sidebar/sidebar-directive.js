(function() {
	angular.module('main').directive('sidebar', sidebar);

	function sidebar() {
		return {
			restrict : 'E',
			scope : {},
			templateUrl : 'html/side.html'
		};
	}

})();
