(function() {
    'use strict'
    
    angular
        .module('store.layout')
        .factory('layout', layout)

    layout.$inject = ['$mdSidenav', '$mdDialog']

    function layout($mdSidenav, $mdDialog) {
        return {
            openSidebar: openSidebar,
            showAboutDialog: showAboutDialog,
            showCart: showCart
        }

        function openSidebar() {
            return $mdSidenav('sidebar').toggle()
        }

        function showAboutDialog($event) {
            $mdDialog.show({
                parent: angular.element(document.body),
                targetEvent: $event,
                templateUrl: '/webstore/layout/about.html',
                clickOutsideToClose: true
            })
        }

        function showCart($event, data) {
            $mdDialog.show({
                parent: angular.element(document.body),
                targetEvent: $event,
                templateUrl: '/webstore/cartDialog/cartDialog.html',
                clickOutsideToClose: true,
                locals: data,
                bindToController: true,
                controller: 'CartDialog',
                controllerAs: 'vm'
            })
        }
    }
})()