(function() {
  angular.module('main').factory('navservice', ['$http', 'net', 'cvt',
    function($http, net, cvt) {

      var nav = {};
      nav.stop = function() {
        $http.get(net.address() + 'General/Stop');
      };

      nav.save = function(save){

        var s = save?1:0;
        $http.get(net.address() + 'General/Save?save='+s.toString());
      };

      return nav;
    }
  ]);
})();
