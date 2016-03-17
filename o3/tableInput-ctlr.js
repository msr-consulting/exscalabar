(function () {
    angular.module('main')
        .controller('InputTable', ['$scope', 'tableService', 'ExSaveCalData',
            function ($scope, tableService, SaveData) {

                $scope.data = [];

                $scope.update_data = function(){
                    SaveData.setData($scope.data);
                }

                /* Handle the broadcast from the buildCal-service */
                $scope.$on('handleBroadcast', function () {

                    // The ID from the cal table
                    var tID = tableService.getTab();
                    // Value of the
                    var val = "";

                    /* The following switch statement defines the default values */
                    switch (tID) {
                        case "O3-Valve":
                        case"O2-Valve":
                        case"O3-Generator":
                        case "Filter":
                        case "O3-Generator-Power":
                        case "Denuder":
                        case "Cabin":
                        case "Filter":
                            val = 'FALSE';
                            break;
                        case "Wait":
                        case "Speaker":
                            val = "20";
                            break;

                        case "O2-Flow-Rate":
                        case "O3-Dump-Rate":
                            val = "100";
                            break;
                        case "O3-Level":
                            val = "1";
                            break;
                        default:
                    }

                    // Push the data into an array
                    $scope.data.push({
                        "id": tID,
                        "val": val
                    });
                    SaveData.setData($scope.data);
                });

            }]);
})();
