(function() {
  angular.module('main').controller('navctlr', ['$scope', 'navservice',
    function($scope, navservice) {

      $scope.save = true;

      $scope.updateSave = function() {
        $scope.save = !$scope.save;

        navservice.save($scope.save);
      };

      $scope.stop = function() {
        navservice.stop();
      };

    }
  ]);
})();
