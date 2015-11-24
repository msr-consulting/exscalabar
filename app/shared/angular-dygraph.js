(function () {
    'use strict';
    angular.module('dygraph', [])
        .directive('dyGraph', function ($window) {


            /* Link function used in the DDO returned below...*/
            var link = function (scope, element, attrs) {

               /* var parent = element.parent();
                console.log(parent)
                var w = angular.element($window);
                w.bind('resize', function () {
                    resize();
                });

                function resize() {
                    scope.ref.resize(parent.width(), parent.height());
                }*/

                // ID for defining the element that will contain the
                // graph produced by dygraph
                scope.ID = Math.floor(Math.random() * 16000);

                // This is where the content is...
                var div = element[0].children[0];

                scope.api = {
                    addGraph: function () {

                        var g = {};

                        if (scope.options !== null) {

                            g = new Dygraph( // Add with injected options
                                div,
                                scope.data,
                                scope.options
                            );

                        } else { // Add with default options

                            g = new Dygraph(
                                div,
                                scope.data
                            );
                        }
                        return g;
                    }
                };

                scope.ref = scope.api.addGraph();


                /* reference to the graph - initialize the graph
                 * If object equality (last value in the $watch expression)
                 * is not true, the functionwill not work properly...
                 */
                scope.$watch('data', function () {
                    if (scope.data !== 0) {
                        // Only update if there data
                        scope.ref.updateOptions({
                            'file': scope.data
                        });
                    }
                }, true);
            }

            return {
                restrict: 'E',
                scope: {
                    options: '=?',
                    data: '='
                },
                template: function (el, scope) {
                    return '<div id="{{ID}}" class = "dygraphClass"></div>';
                },
                link: link
            }
        });
})();