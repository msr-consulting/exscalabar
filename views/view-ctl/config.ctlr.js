(function () {
    angular.module('main')
        .controller('mrConfigCtlr', ['$scope', '$http', 'Data', 'net', function ($scope, $http, Data, net) {

            $scope.network = {"ip": net.ip,
                         "port":net.port};

            $scope.changeIP = function () {
                net.setIP($scope.network.ip);
            };
            $scope.changePort = function () {
                net.setPort($scope.network.port);
            };



	}]);
})();
