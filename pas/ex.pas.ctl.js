(function () {
    angular.module('main').controller('ExPasCtl', pas_ctl);

    pas_ctl.$inject = ['$scope', 'Data', 'ExPasSvc'];
    function pas_ctl($scope, Data, ExPasSvc) {

        /**
         * @ngdoc controller
         * @name main.controller:ExPasCtl
         * @description
         * Controller for PAS functionality.
         */

        $scope.data = Data.pas;

        $scope.on('pasDataAvailable', display_data);

        function display_data(){}

        var selPlot = 0;

        cvt.first_call = 1;

        $scope.pData = [[0, NaN, NaN, NaN, NaN, NaN]];

        // TODO: move all of this plot related stuff into a directive for reuse...
        $scope.options = {
            ylabel: "IA",
            labels: ["t", "Cell 1", "Cell 2", "Cell 3", "Cell 4", "Cell 5"],
            legend: 'always'
        };

        $scope.pDataCMOptions = [
            ['IA', function () {
                $scope.options.ylabel = "IA";
                selPlot = 0;

            }],
            ["f0",
                function () {
                    $scope.options.ylabel = "f0 (Hz)";
                    selPlot = 1;
                }],
            ['Q', function () {
                $scope.options.ylabel = "Q";
                selPlot = 2;
            }]
        ];

        // Listen for data
        $scope.$on('dataAvailable', function () {

            $scope.data = Data.pas;

            switch (selPlot) {
                case 0:
                    $scope.pData = $scope.data.cell.IA;
                    break;
                case 1:
                    $scope.pData = $scope.data.cell.f0;
                    break;
                case 2:
                    $scope.pData = $scope.data.cell.Q;
                    break;
                case 3:
                    $scope.pData = $scope.data.cell.p;
                    break;
                case 4:
                    $scope.pData = $scope.data.cell.abs;
                    break;
            }
        });


    }

})();