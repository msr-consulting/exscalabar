(function() {
	angular.module('main').directive('sidebar', sidebar);
	
	function sidebar() {
		return {
			restrict : 'E',
			scope : {},
			templateUrl : 'app/sidebar/side.html'
		};
	}

})();
