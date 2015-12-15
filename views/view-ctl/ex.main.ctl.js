(function () {
    angular.
    module('main').
    controller('ExMainCtl', controller);

    function controller($scope, Data) {
        
         $scope.optPData = {
                ylabel: "tau (us)",
                labels: ["t", "Cell 1", "Cell 2", "Cell 3", "Cell 4", "Cell 5"],
                legend: 'always'
            };

            $scope.pDataCMOptions = [
                ['tau', function () {
                    $scope.optPData.ylabel = "tau (us)";
                    objectData = "tau";


            }],
                ["tau'",
                 function () {
                        $scope.optPData.ylabel = "tau' (us)";
                        objectData = "taucorr";
                }],
                ['stdev', function () {
                    $scope.optPData.ylabel = "std. tau (us)";
                    objectData = "stdevtau";
                }],
                ['max', function () {
                    $scope.optPData.ylabel = "max";
                    objectData = "max";
                }]
            ];
        
            $scope.pData = [[0, NaN, NaN, NaN, NaN, NaN]];

    }
    controller.$inject = ['$scope', 'Data'];

})();