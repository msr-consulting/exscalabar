(function () {
    angular.module('main')
        .factory('ExCalibrationSvc', ['$http', 'net', function ($http, net) {

            /*$scope.cal_file = "default";
             $scope.save = function () {
             var xml = '<?xml version="1.0" encoding="utf-8"?>\r\n<OZONE>\r\n';
             SaveData.getData().forEach(function (entry) {
             xml += "\t<" + entry.id + ">" + entry.val + '</' + entry.id + '>\r\n';
             });

             xml += "</OZONE>";
             console.log(xml);

             /* Send the calibration profile as XML data. */
            /* $http({
             method: 'POST',
             url: net.address() + 'Calibration/saveCalFile?file_name=' + $scope.cal_file + ".xml",
             data: xml,
             headers: {
             "Content-Type": 'application/x-www-form-urlencoded'
             }
             })*/
            var tabService = {};
            var build_file = function (data) {
                var xml = '<?xml version="1.0" encoding="utf-8"?>\r\n<OZONE>\r\n';
                data.forEach(function (datum) {
                    xml += "\t<" + datum.id + ">" + datum.val + '</' + datum.id + '>\r\n';
                });

                xml += "</OZONE>";
                console.log(xml);


                return xml;
            };
            tabService.ship_data = function (data) {

                $http({
                    method: 'POST',
                    url: net.address() + 'Calibration/saveCalFile?file_name=' + "test_cal" + ".xml",
                    data: build_file(data),
                    headers: {
                        "Content-Type": 'application/x-www-form-urlencoded'
                    }
                });
            };
            
            tabService.lampVal = function(){
                
                $http({
                    method: 'POST',
                    url: net.address() + 'Calibration/saveCalFile?file_name=' + "test_cal" + ".xml",
                    data: build_file(data),
                    headers: {
                        "Content-Type": 'application/x-www-form-urlencoded'
                    }
                });
                
            };


            return tabService;
        }]);

})();
