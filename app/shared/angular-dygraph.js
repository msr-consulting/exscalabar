(function () {
    'use strict';
    angular.module('dygraph', [])
        .controller('dygraphCtl', ['$scope', function ($scope) {
            var self = this;
            
            $scope.ID = "234";


        }])
        .directive('dyGraph', function () {

            var link = function (scope, element, attrs) {

                scope.api = {
                    addGraph: function () {

                        var g = {};

                        if (scope.object !== null) {

                            g = new Dygraph( // Add with injected options
                                element,
                                scope.data,
                                scope.options
                            );

                        } else { // Add with default options

                            g = new Dygraph(
                                element,
                                scope.data
                            );
                        }
                        return g;
                    }
                };

                // reference to the graph - initialize the graph
                scope.ref = scope.api.addGraph();

                // Set up watches
                // Listen for changes in data
                scope.$watch('scope.data', function () {
                    scope.ref.updateOptions({
                        'file': scope.data
                    });
                });

                scope.api.addGraph();
            }

            return {
                restrict: 'E',
                controller: 'dygraphCtl',
                scope: {
                    data: '=?', // data to populate chart with
                    cID:"=",
                    options: '=?' // use API defaults if not present
                },
                template: function (el, scope) {
                    /*if (typeof cID === undefined) {
                        var rn = Math.floor(Math.random() * 16000);
                        cID = "dygraph_" + rn.toString();
                    }*/
                   // return '<div id="' + cID + '"></div>';
                },
                link: function ($scope, el, attrs) {
                    console.log(cID);
                }
            }
        });
})();