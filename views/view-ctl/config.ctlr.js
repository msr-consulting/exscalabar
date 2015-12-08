(function () {
    angular.module('main')
        .controller('mrConfigCtlr', ['$scope', '$http', 'Data', 'net', 'cvt', function ($scope, $http, Data, net, cvt) {

            cvt.first_call = 1;
            
            $scope.network = {"ip": net.ip,
                         "port":net.port};

            $scope.changeIP = function () {
                net.setIP($scope.network.ip);
            };
            $scope.changePort = function () {
                net.setPort($scope.network.port);
            };
            
            $scope.filter = {
                pos:true,
                auto:true,
                len: 30,
                per: 360,
                updatePos: function(){
                    this.pos = !this.pos;
                    console.log("updating filter position");
                },
                updateAuto: function(){
                    auto = !auto;
                    console.log("update filter auto");
                }
            };
            
            $scope.file = {
                folder: "exscalabar\\data",
                main: "u:\\",
                mirror: "v:\\",
                prefix: "ex_",
                ext: ".txt",
                max:10,
                save:true
            }



	}]);
})();
