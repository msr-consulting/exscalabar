(function () {
    angular.module('main').factory('ExReadCfgSvc', read_cfg);

    read_cfg.$inject = ['$http', '$location', '$rootScope'];
    function read_cfg($http, $location, $rootScope) {
        /**
         * @ngdoc service
         * @name main.service:ExReadCfgSvc
         * @requires $http
         *
         * @description
         * Simple service to retrieve configuration information from the
         * json config file ``ui.json`` located in the main directory.
         */

        var cfg = {
            name: "",
            version: "",
            pas: {
                colors: [],
                xGrid: false,
                yGrid: false
            },
            crd: {
                colors: [],
                xGrid: false,
                yGrid: false
            },
            flow: {
                colors: [],
                xGrid: false,
                yGrid: false
            }
        };

        var loc = $location.$$absUrl.search('#/');
        var cfg_path = $location.$$absUrl.slice(0, loc) + 'ui.json';

        var promise = $http.get(cfg_path)
            .then(function (response) {
                    cfg.name = response.data.name;
                    cfg.version = response.data.version;
                    cfg.pas.xGrid = response.data.pasplot.xGrid;
                    cfg.pas.yGrid = response.data.pasplot.yGrid;
                    cfg.pas.xGrid = response.data.crdplot.xGrid;
                    cfg.pas.yGrid = response.data.crdplot.yGrid;
                    cfg.flow.xGrid = response.data.flowplot.xGrid;
                    cfg.flow.yGrid = response.data.flowplot.yGrid;


                    $rootScope.$broadcast('CfgUpdated');
                },
                function () {
                    console.log('Configuration file not found.');
                    cfg.name = "EXSCALABAR";
                    cfg.version = "0.1.0";

                })
            .finally(function () {
            });

        return cfg;
    }
})();