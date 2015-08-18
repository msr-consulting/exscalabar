(function() {
  angular.module('main').controller('power', ['$scope', 'cvt',
    function($scope, cvt) {
      $scope.power = {
        "TEC": false,
        "Laser": false,
        "Pump": false,
        "O3 Gen": false,
        "Denuder":false
      };

      $scope.toggle = function(id){
        // Flip the bit
        $scope.power[id] = !$scope.power[id];

        //Sketch out space for the values used below
        var index = 0;
        var num = 0;
        var val = 0;

        /* Convert the array of booleans for the power to
         * a decimal integer.  We will send this decimal
         * integer back for the power.
         */
        for (var property in $scope.power){
          if ($scope.power.hasOwnProperty(property)){
            val = $scope.power[property]?1:0;
            num += Math.pow(2,index)*val;
            index +=1;
          }
        }
        alert(num);

      };
    }
  ]);
})();
