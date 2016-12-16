(function () {
  angular.module('main').controller('ExHumidityCtl', ['$scope', 'cvt', 'Data',
  function ($scope, cvt, Data) {

    /**
    * @ngdoc controller
    * @name main.controller:humidifier
    * @requires $scope
    * @requires main.service:cvt
    * @requires main.service:Data
    *
    * @description
    * Provides functionality for the humidifier data page.
    */


    cvt.first_call = 1;


    cvt.changeWvfmState(false, false);

    /**
    * @ngdoc property
    * @name main.humidifier.high
    * @propertyOf main.controller:humidifier
    * @description
    * Object defining the properties of the high value humidifier -
    * pid values and enable.  These values are initialized with the
    * appropriate cvt controls.
    */


    $scope.h = cvt.humidifier;

    $scope.setEnable = function (i) {
      $scope.h[i].en = !$scope.h[i].en;
      $scope.updateHum(i);

    };

    $scope.$on('cvtUpdated', function () {
      $scope.h = cvt.humidifier;

    })

    $scope.$on('dataAvailable', updatePlot);

    function updatePlot(){
       console.log('Update humidity plot');
       $scope.RH.push([Data.tObj,Data.data.vMedRH.RH,Data.data.vHighRH.RH]);
       //$scope.ctlrOutData.push([Data.tObj,Data.data.MedTEC.Iout,Data.data.HighTEC.Iout]);
       console.log($scope);
       //$scope.optCtlOut.valueRange=[null,null];
       //$scope.ctlref.updateOptions({axes:{y:{valueRange:[null,null]}}});
       //$scope.optCtlOut.axes.y.valueRange=[-5,5];
       //$scope.optCtlOut.axes.y.valueRange=[null,null];
    }
    $scope.updateHum = function () {
      var i = arguments[0];
      cvt.humidifier[i].updateParams();
    };

    $scope.ctlrOutData = [[new Date(),null,null]];
    $scope.RH = [[new Date(),null,null]];
    $scope.optCtlOut = {
      ylabel: "Controller Output",
      labels: ["t", "med", "high"],
      legend: "always",
      valueRange:[null,null]
    };
    $scope.optRH = {
      ylabel: "RH (%)",
      labels: ["t", "med", "high"],
      legend: "always",
      valueRange:[null,null]
    };

  }
]);
})();
