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
                strokeWidth: [],
                pattern: [],
                type: [],
                xGrid: false,
                yGrid: false
            },
            crd: {
                colors: [],
                strokeWidth: [],
                pattern: [],
                type: [],
                xGrid: false,
                yGrid: false
            },
            flow: {
                colors: [],
                strokeWidth: [],
                pattern: [],
                type: [],
                xGrid: false,
                yGrid: false
            },
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

        function get_longest(CfgObj) {
            var longest = CfgObj.pattern.length > CfgObj.strokeWidth.length
                ? CfgObj.pattern.length : CfgObj.strokeWidth.length;

            longest = longest > CfgObj.color.length ? longest : CfgObj.color.length;

            return longest;


        }

        $http.get(cfg_path)
            .then(function (response) {
                    cfg.name = response.data.name;
                    cfg.version = response.data.version;
                    cfg.pas.xGrid = response.data.pasplot.xGrid;
                    cfg.pas.yGrid = response.data.pasplot.yGrid;
                    cfg.pas.xGrid = response.data.crdplot.xGrid;
                    cfg.pas.yGrid = response.data.crdplot.yGrid;

                    cfg.flow= response.data.flowplot;

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