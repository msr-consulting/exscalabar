(function() {
    angular.module('main')
      .controller('ExFooterCtl', ['$scope', 'ExMsgSvc','Data',function($scope, ExMsgSvc, Data) {

          $scope.filter = true;
          $scope.time = "Not connected";
          $scope.connected = false;
          $scope.o3On = false;
          $scope.cabin = false;
          $scope.pumpBlocked = false;
          $scope.impBlocked = false;
          $scope.interlock = false;

          $scope.num_codes = [0, 0, 0];


          // Initially time is not available
          $scope.time = "Not Connected";


          $scope.$on('dataAvailable', function() {

            /* Populate the variables pertinent to the sidebar */
            $scope.time = Data.tObj.toLocaleTimeString('en-US', {
              hour12: false
            });
            $scope.filter = Data.filter;
            $scope.cabin = Data.Cabin;

            /* TODO: Have an issue with saving data - doesn't appear to be returning properly.
             * The save variable should be in the CVT rather than in the data object.
             *
             */
            //$scope.save = Data.save;
            $scope.connected = true;
          });
          
          $scope.$on('msgAvailable', function() {
                  $scope.num_codes =ExMsgSvc.numType;
            });


            $scope.$on('dataNotAvailable', function() {
              $scope.connected = false;
            });


          }]);
      })();
