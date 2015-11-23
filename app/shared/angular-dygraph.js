(function () {
    'use strict';
    angular.module('dygraph', [])
        .controller('dygraphCtl', ['$scope', function ($scope) {
            var self = this;

            $scope.ID = Math.floor(Math.random() * 16000);


        }])
        .directive('dyGraph', function () {

            var link = function (scope, element, attrs) {

                scope.ID = Math.floor(Math.random() * 16000);

                // This is where the content is...
                var div = element[0].children[0];

                scope.data = [[1,2],[15,0]];

                /*for (var i = 0; i < 1000; i++) {
                    var base = 10 * Math.sin(i / 90.0);
                    scope.data.push([i, base, base + Math.sin(i / 2.0)]);
                }*/
                console.log(scope.ID);
                console.log(div);
                scope.api = {
                    addGraph: function () {

                        var g = {};

                        if (scope.object !== null) {

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

                // reference to the graph - initialize the graph
                scope.ref = scope.api.addGraph();

                // Set up watches
                // Listen for changes in data
                /*scope.$watch('scope.data', function () {
                    scope.ref.updateOptions({
                        'file': scope.data
                    });
                });

                scope.api.addGraph();*/
            }

            return {
                restrict: 'E',
                //controller: 'dygraphCtl',
                scope: {
                    ID: '=?',
                    options: '=?',
                    data: '=?'
                },
                template: function (el, scope) {
                    //scope.ID = Math.floor(Math.random()*16000);
                    return '<div id="{{ID}}" style="width:600px;height:300px;">Hello World!  The ID is {{ID}}</div>';
                },
                link: link
                    /*function (scope, el, attrs) {

                                        //el.innerHTML = '<div id="div_g">Hello World!</div>';
                                        scope.ID = Math.floor(Math.random() * 16000);

                                        console.log(scope.ID);
                                    }*/
            }
        });
})();