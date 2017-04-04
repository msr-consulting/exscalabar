(function() {
    angular.module('main').controller('ExDevStatusCtl', dev_stat_ctl);

    dev_stat_ctl.$inject = ['$scope', 'cvt', 'ExDevStatusSvc', 'Data'];

    function dev_stat_ctl($scope, cvt, ExDevStatusSvc, Data) {

      $scope.keys = Array.from(ExDevStatusSvc.statusMap.keys());
      $scope.values = Array.from(ExDevStatusSvc.statusMap.values());

      $scope.$on('deviceStatusRefresh', function(){
              $scope.keys = Array.from(ExDevStatusSvc.statusMap.keys());
              $scope.values = Array.from(ExDevStatusSvc.statusMap.values());
      });


    }
})();
