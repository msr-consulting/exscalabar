(function () {
    angular.module('main').controller('ExCommonCtl', ['$scope', 'cvt', 'Data',
    function ($scope, cvt, Data) {

            $scope.$on('dataAvailable', get_data);

            $scope.impactor = {
                diffV: false,
                blocked: 0
            };

            function get_data() {
                $scope.impactor = {
                    diffV: Data.data.impDiffV,
                    blocked: Data.data.impBlocked
                };
            }
    }
  ]);
})();