(function () {
    /**
     * @ngdoc controller
     * @name main.controller:navctlr
     * @requires $scope
     * @requires navservice
     * @description
     * Defines the controller the encompases the navigation meny at the top of the page.
     */
    angular.module('main').controller('navctlr', ['$scope', 'navservice', 'cvt',
        function ($scope, navservice, cvt) {

            /**
             * @ngdoc property
             * @name main.navctlr.save
             * @propertyOf main.controller:navctlr
             * @description
             * Boolean representing the current state of the save button element.
             */
            $scope.save = cvt.save;

            $scope.$on('cvtUpdated', function () {
               $scope.save = cvt.save;
             });


            /**
             * @ngdoc method
             * @name main.navctlr.updateSave
             * @methodOf main.controller:navctlr
             * @description
             * Switches the save state based on the current save state and makes a
             * call to the ``navservice.save()`` to update the value.
             */

            $scope.updateSave = function () {
                $scope.save = !$scope.save;

                navservice.save($scope.save);
            };

            $scope.stop = function () {
                navservice.stop();
            };

        }
    ]);
})();
