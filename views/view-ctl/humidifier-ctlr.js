(function() {
  angular.module('main').controller('humidifier', ['$scope', 'cvt', 'Data',
    function($scope, cvt, Data) {

      $scope.high = cvt.humidifier.high;
      $scope.med = cvt.humidifier.med;

      $scope.updateMedEn = function(){
        $scope.med.en = !$scope.med.en;
        cvt.humidifier.med = $scope.med.en;
      };
      $scope.updateHighEn = function(){
        $scope.high.en = !$scope.high.en;
        cvt.humidifier.high = $scope.high.en;
      };

    }
  ]);
})();
