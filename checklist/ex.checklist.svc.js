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

        var listData = {
            "main": [{}],
            update: function (List) {
                this.main = List.main;
            }
        };

        // Get the UI config path
        var s = $location.$$absUrl;
        var loc = s.search('#/');
        s = s.slice(0, loc);

        // On the first load, for some reason the trailing backslash is not there; correct this
        var c = s.slice(-1) === '/' ? '' : '/';

        var main_path = s + c + 'checklist.json';


        listData.load = function() {
            $http.get(main_path)
                .then(function (response) {
                        listData.main = response.data.main;

                        // Add the property checked and set to false since this is startup...
                        for (var i in listData.main) {
                            listData.main[i].checked = [];
                            for (var j in listData.main[i].items) {
                                listData.main[i].checked.push(false);
                            }

                        }
                        $rootScope.$broadcast('CheckListUpdated');
                    },
                    function () {
                        console.log('Checklist not found...');
                    })
                .finally(function () {
                });

        };

        return listData;
    }
})
();