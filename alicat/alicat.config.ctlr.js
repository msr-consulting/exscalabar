(function() {
    angular.module('main')
      .controller('mrAlicatConfigCtlr', ['$scope', function($scope) {
          
          
          /* This will contain the template for the list of Alicat
           * devices.
           */
          function ListEntry(addr, id){
              this.address = addr;
              this.id = id;
          }
          
          $scope.entry = new ListEntry("A","default");
          
          /* Store devices here */
          $scope.devices = [];
          
          $scope.addDevice = function(){
              $scope.devices.push(new ListEntry($scope.entry.address, $scope.entry.id));
              
          };
          
          $scope.rmDevice = function(){
              // Not implemented
          };
          
      }]);
})();