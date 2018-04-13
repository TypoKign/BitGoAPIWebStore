(function() {
    'use strict'
    
    var core = angular.module('store.core')

    core.config(mdConfig)
    core.config(routeConfig)

    mdConfig.$inject = ['$mdThemingProvider']
    // Set the primary and accent colors for ngMaterial
    function mdConfig($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('deep-purple')
            .accentPalette('orange')
    }

    routeConfig.$inject = ['$locationProvider']
    function routeConfig($locationProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        })
    }
})()