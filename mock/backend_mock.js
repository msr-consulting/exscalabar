(function(ng){

    if (!document.URL.match(/\?nobackedn$/)){
        return;
    }
    console.log('========= STARTING BACKEND!!!! ==========');

    initializeStubBackend();

    function initializeStubBackend(){
        ng.module('cirrus')
            .config(function($provide){
                $provide.decorator('$httpBackend', angular.mock.e2e.$httpBackendDecorator);
            })
            .run(function($httpBackend){});
    }
})(angular);