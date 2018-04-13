(function() {
    'use strict'
    
    angular
        .module('store.layout')
        .factory('sidebar', sidebar)

    sidebar.$inject = ['$mdSidenav']

    function sidebar($mdSidenav) {
        return {
            openSidebar: openSidebar
        }

        function openSidebar() {
            return $mdSidenav('sidebar').toggle()
        }
    }
})()