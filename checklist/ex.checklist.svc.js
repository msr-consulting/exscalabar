(function () {
    angular.module('main').factory('ExChecklistSvc', get_checklist);

    get_checklist.$inject = ['$http', '$location', '$rootScope'];
    function get_checklist($http, $location, $rootScope) {
        /**
         * @ngdoc service
         * @name main.service:ExChecklistSvc
         * @requires $http
         * @requires $location
         * @requires $rootScope
         *
         * @description
         * Service for handling the user defined checklist.
         */

        var list_data = [];

        // Get the UI config path
        var s = $location.$$absUrl;
        var loc = s.search('#/');
        s = s.slice(0, loc);

        // On the first load, for some reason the trailing backslash is not there; correct this
        var c = s.slice(-1) === '/' ? '' : '/';

        var main_path = s + c + 'checklist.json';

        $http.get(main_path)
            .then(function (response) {
                    list_data = response.data.main;
                    $rootScope.$broadcast('CheckListUpdated');
                },
                function () {
                    console.log('Checklist not found...');
                })
            .finally(function () {
            });

        console.log(list_data);
        return list_data;
    }
})();