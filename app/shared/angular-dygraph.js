(function () {
    'use strict';
    angular.module('dygraph', [])
        .controller('DygraphCtl', ['$scope', function ($scope) {
            var self = this;

            /*this.init = function (element) {
                self.$element = element;
            }*/
            
        }])
        .directive('dygraph', function () {

            var link = function (scope, element) {

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
                controller: 'DygraphCtl',
                scope: {
                    data: '=', // data to populate chart with
                    options: '=?' // use API defaults if not present
                },
                link: link
            }
        });
})();