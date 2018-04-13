(function() {
    'use strict'
    
    angular
        .module('store.layout')
        .factory('about', about)

    about.$inject = ['$mdDialog']

    function about($mdDialog) {
        return {
            showAboutDialog: showAboutDialog
        }

        function showAboutDialog($event) {
            $mdDialog.show({
                parent: angular.element(document.body),
                targetEvent: $event,
                templateUrl: '/webstore/layout/about.html',
                clickOutsideToClose: true
            })
        }
    }

})()