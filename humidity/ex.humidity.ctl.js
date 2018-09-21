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


    //cvt.changeWvfmState(false, false);

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
    $scope.tec=[];
      
    function Humidifier_TECS(){
       for(var m in cvt.mTEC){
         if(cvt.mTEC[m].id=="HighTEC"){
              $scope.tec[0]=cvt.mTEC[m];
         }
         if(cvt.mTEC[m].id=="MedTEC"){
              $scope.tec[1]=cvt.mTEC[m];
         }
      }
    }
    Humidifier_TECS();      
    $scope.setEnable = function (i) {
      $scope.h[i].en = !$scope.h[i].en;
      $scope.updateHum(i);

    };

    $scope.$on('cvtUpdated', function () {
      $scope.h = cvt.humidifier;
      
      Humidifier_TECS();
    });
      
    $scope.updateCtl = function (i) {
      $scope.tec[i].updateCtlVal(cvt.mTEC);

    };


    $scope.$on('dataAvailable', updatePlot);

    function updatePlot(){
       var high=Data.data.humhigh;
       var med=Data.data.hummed;
       var thisRH=[Data.tObj,high.RH,high.RHsp,high.Eff,med.RH,med.RHsp,med.Eff];
       var thisTemp=[Data.tObj,high.Td,high.TdReq,high.Tsp,high.Tobj,med.Td,med.TdReq,med.Tsp,med.Tobj];
       $scope.RH_data.push(thisRH);
       if($scope.RH_data.length>300){$scope.RH_data.shift();}
       $scope.RH=$scope.RH_data;
       $scope.T_data.push(thisTemp);
       if($scope.T_data.length>300){$scope.T_data.shift();}
       $scope.Temps=$scope.T_data;
       $scope.ctlrOut_data.push([Data.tObj,Data.data.HighTEC.Iout,Data.data.MedTEC.Iout]);
       if($scope.ctlrOut_data.length>300){$scope.ctlrOut_data.shift();}
       $scope.ctlrOut=$scope.ctlrOut_data;
       //$scope.ctlrOutData.push([Data.tObj,Data.data.MedTEC.Iout,Data.data.HighTEC.Iout]);

       //$scope.optCtlOut.valueRange=[null,null];
       //$scope.ctlref.updateOptions({'file':$scope.ctlrOut_data});
       //$scope.optCtlOut.axes.y.valueRange=[-5,5];
       //$scope.optCtlOut.axes.y.valueRange=[null,null];
    }
    $scope.updateHum = function () {
      var i = arguments[0];
      cvt.humidifier[i].updateParams();
    };
    $scope.ctlrOut_data=[];
    $scope.ctlrOut = [[new Date(),0,0]];
    $scope.RH = [[new Date(),0,0,0,0,0,0]];
    $scope.RH_data = [];
    $scope.Temps = [[new Date(),0,0,0,0,0,0,0,0]];
    $scope.T_data = [];
    $scope.optCtlOut = {
      ylabel: "Controller Output",
      labels: ["t", "high", "med"],
      colors:["red","blue"],
      series:{"high":{strokePattern:null},
              "med":{strokePattern:null}},
      strokeWidth:2,
      legend: "always"
    };
    $scope.optRH = {
      ylabel: "RH (%)",
      labels: ["t", "high.RH","high.RHsp","high.Eff","med.RH","med.RHsp","med.Eff"],
      colors:["red","pink","orange","blue","lightblue","green"],
      visibility:[true,true,false,true,true,false],
      strokeWidth:2,
      series:{"high.RH":{strokePattern:null},
              "high.RHsp":{strokePattern:null},
              "high.Eff":{strokePattern:null},
              "med.RH":{strokePattern:null},
              "med.RHsp":{strokePattern:null},
              "med.Eff":{strokePattern:null}},
      legend: "always"
    };
     
    $scope.optTemp = {
      ylabel: "Temp (C)",
      labels: ["t", "high.Td","high.TdReq","high.Tsp","high.Tobj","med.Td","med.TdReq","med.Tsp","med.Tobj"],
      colors:["red","orange","pink","yellow","blue","green","lightblue","purple"],
      legend: "always",
      strokeWidth:2,
      series:{"high.Td":{strokePattern:null},
              "high.TdReq":{strokePattern:null},
              "high.Tsp":{strokePattern:null},
              "high.Tobj":{strokePattern:null},
              "med.Td":{strokePattern:null},
              "med.TdReq":{strokePattern:null},
              "med.Tsp":{strokePattern:null},
              "med.Tobj":{strokePattern:null}},
    };
    $scope.RHcm=[['Clear Data',function(){$scope.RH_data=[];}]];
    $scope.Tempcm=[['Clear Data',function(){$scope.T_data=[];}]];
    $scope.Ctlcm=[['Clear Data',function(){$scope.ctlrOut_data=[];}]];
  }
]);
})();
