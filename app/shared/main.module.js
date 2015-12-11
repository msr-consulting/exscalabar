
/**
 * @ngdoc overview
 * @name main
 * @requires ngRoute
 * @requires ui.bootstrap
 * @requires ui.bootstrap.contextMenu
 * @requires dygraph
 * @requires cirrus.ui.button
 * @requires cirrus.ui.numeric
 * @requires cirrus.ui.string
 * @description
 * Angular module for the EXSCALABAR UI.
 */
(function () {
    angular.module('main', ['ngRoute', 'ui.bootstrap',
                           'ui.bootstrap.contextMenu', 'dygraph',
                           'cirrus.ui.ibutton', 'cirrus.ui.inumeric',
                           'cirrus.ui.string']);
})();