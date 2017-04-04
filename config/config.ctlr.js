(function () {
    angular.module('main')
        .controller('mrConfigCtlr', ['$scope', '$http', 'Data', 'net', 'cvt', function ($scope, $http, Data, net, cvt) {

            cvt.first_call = 1;



            $scope.connected = false;
            $scope.notconnected = false;
            $scope.rebooting = false;
            $scope.reboottime = 0;
            $scope.flasher=null;

            $scope.filter_speaker = cvt.pas.spk.connected;


            $scope.$on('dataNotAvailable', function () {

                  $scope.connected = false;
                  $scope.notconnected = true;

            });

            $scope.$on("dataAvailable", function () {
                    $scope.connected = true;
                    $scope.notconnected = false;
                    if((new Date()-$scope.reboottime)>10000){
                       clearInterval($scope.flasher);
                       $scope.rebooting=false;
                    }
            });
            $scope.$on('cvtUpdated', function () {
                $scope.filter.pos = cvt.filter.position;
                $scope.filter.len = cvt.filter.cycle.length;
                $scope.filter.per = cvt.filter.cycle.period;
                $scope.filter.auto = cvt.filter.cycle.auto;
                $scope.filter_speaker = cvt.pas.spk.connected;
                //$scope.cabin = cvt.inlet;
            });


            $scope.stop = function () {
                 if($scope.connected){
                    $http.get(net.address() + 'General/Stop');
                    $scope.connected=false;
                }
            };

            $scope.start = function () {
                if(($scope.notconnected)){
                     $http.get(net.address() + 'General/Start').then(
                         function(){
                             $scope.notconnected=false;
                         }
                     );
               }
            };

             $scope.flashreboot = function (){
                $scope.rebooting=!($scope.rebooting);
            };

           $scope.reboot = function () {
                var d=new Date();
                if((d-$scope.reboottime)>10000){
                   $http.get(net.address() + 'General/Reboot').then(
                       function () {
                          $scope.connected=false;
                          $scope.notconnected=false;
                          $scope.reboottime=d;
                          $scope.flasher=setInterval($scope.flashreboot,300);
                       });
                }
            };

            $scope.network = {
                "ip": net.ip,
                "port": net.port
            };

            $scope.changeIP = function () {
                net.setIP($scope.network.ip);
            };
            $scope.changePort = function () {
                net.setPort($scope.network.port);
            };

            $scope.connectFilterSpeaker = function(){
                $scope.filter_speaker = !$scope.filter_speaker;
                cvt.pas.spk.connectToFilter($scope.filter_speaker);

            };

            $scope.filter = {
                pos: true,
                auto: true,
                len: 30,
                per: 360,
                updatePos: function () {
                    this.pos = !this.pos;
                    cvt.setFilterValve($scope.filter);
                },
                updateAuto: function () {
                    this.auto = !this.auto;
                    this.updateCycle();
                    console.log("update filter auto");
                },
                updateCycle: function(){
                    var cycle = {period: this.per,
                                length: this.len,
                                auto: this.auto};
                    cvt.filter.updateCycle(cycle);

                }
            };

            $scope.file = {
                folder: "exscalabar\\data",
                main: "u:\\",
                mirror: "v:\\",
                prefix: "ex_",
                ext: ".txt",
                max: 10,
                save: true
            };



	}]);
})();
