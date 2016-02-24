(function () {
    angular.module('main').factory('ExReadCfgSvc', read_cfg);

    read_cfg.$inject = ['$http', '$location', '$rootScope'];
    function read_cfg($http, $location, $rootScope) {
        /**
         * @ngdoc service
         * @name main.service:ExReadCfgSvc
         * @requires $http
         * @requires $location
         * @requires $rootScope
         *
         * @description
         * Simple service to retrieve configuration information from the
         * json config file ``ui.json`` located in the main directory.
         */

        var cfg = {
            name: "",
            version: "",
            pas: {},
            crd: {},
            flow: {},
            main_path: ""
        };

        // Get the UI config path
        var s = $location.$$absUrl;
        var loc = s.search('#/');
        s = s.slice(0, loc);

        // On the first load, for some reason the trailing backslash is not there; correct this
        var c = s.slice(-1) === '/' ? '' : '/';

        cfg.main_path = s + c;
        var cfg_path = cfg.main_path + 'ui.json';

        $http.get(cfg_path)
            .then(function (response) {
                    cfg.name = response.data.name;
                    cfg.version = response.data.version;
                    cfg.pas = response.data.pasplot;
                    cfg.crd = response.data.crdplot;

                    cfg.flow = response.data.flowplot;
                    cfg.vaisala = response.data.vaisala;

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