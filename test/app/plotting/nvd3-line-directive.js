(function(){
	angular.module('main')
	.directive('nvd3Line', ['Data', function(Data){
		return{
			restric: 'E',
			scope: {
				data: '=',
				xlabel:'&',
				ylabel:'&'
				
			},
			link: function(scope, element, attr){
				scope.on('dataAvailable', function(){
					alert('Oh no!  there is data available!');
				});
			}
		};
	}]);
})();
