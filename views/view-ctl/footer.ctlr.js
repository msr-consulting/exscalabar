(function() {
    angular.module('main')
      .controller('footerCtlr', ['$scope', 'Data', function($scope, Data) {

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

          /* This is a broadcast from the data service.  If there is a new message,
           * we will pop the message queue and log the fact that there was a
           * message.
           * TODO: Need place to put messages.
           */
          $scope.$on('msgAvailable', function() {

              var x = Data.popMsgQueue();

              for (i = 0; i < x.length; i++) {

                if (x[i].search('ERROR') > 0) {
                  $scope.num_codes[2] += 1;
                } else if (x[i].search('WARNING') > 0) {
                  $scope.num_codes[1] += 1;
                } else {
                  $scope.num_codes[0] += 1;
                }
              }
            });


            $scope.$on('dataNotAvailable', function() {
              $scope.connected = false;
            });


          }]);
      })();
