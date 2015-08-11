(function() {
	angular.module('main').controller('msgCtlr', ['Data', '$scope',
	function(Data, $scope) {

    $scope.msgs = [];
		$scope.error_code = [];

		$scope.num_codes = [0,0,0];

    $scope.$on('msgAvailable', function(){

			var x = Data.popMsgQueue();

			for (i =0; i < x.length; i++){
				$scope.msgs.push(x[i]);

				if (x[i].search('ERROR') > 0){
					$scope.error_code.push(2);
					$scope.num_codes[2] += 1;
				}
				else if (x[i].search('WARNING') > 0) {
					$scope.error_code.push(1);
					$scope.num_codes[1] += 1;
				}
				else{
					$scope.error_code.push(0);
					$scope.num_codes[0] += 1;
				}
			}

			$scope.clrMsgs = function(){
				$scope.num_codes = [0,0,0];
				$scope.msgs = [];
			};



    });


	}]);
})();
