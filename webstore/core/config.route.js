(function() {
    'use strict'
    
    angular
        .module('store.core')
        .config(configureRoute)

    configureRoute.$inject = ['$routeProvider']
    
    function configureRoute($routeProvider) {
        $routeProvider
            .when("/", {
                templateUrl: '/webstore/index/index.html',
                controller: 'Index',
                controllerAs: 'vm'
            })
            .when("/checkout", {
                templateUrl: '/webstore/checkout/checkout.html',
                controller: 'Checkout',
                controllerAs: 'vm'
            })
    }
})()