(function(){
	angular.module('main')
	.controller('MainCtlr', ['Data', '$scope','$interval', function(Data, $scope, $interval){
		
		$interval(Data.getData, 1000);
		
	}]);
})();
