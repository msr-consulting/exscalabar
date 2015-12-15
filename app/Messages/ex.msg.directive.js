(function() {
	angular.module('main').directive('exMsgDirective', msg_);
    /**
     * @ngdoc directive
     * @name main.directive:msg
     * @restrict E
     * @scope
     * @description
     * Provides a template for displaying messages.
     * @deprecated
     */

	function msg_() {
		return {
			restrict : 'E',
			scope : {},
			templateUrl : 'app/Messages/msg.html'
		};
	}

})(); 
