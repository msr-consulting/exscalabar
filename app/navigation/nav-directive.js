(function() {
	angular.module('main').directive('navi', navi);

	function navi() {
		return {
			restrict : 'E',
			scope : {},
			templateUrl : 'app/navigation/navi.html'
		};
	}

})(); 