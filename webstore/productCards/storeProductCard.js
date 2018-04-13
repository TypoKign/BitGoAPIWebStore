(function() {
    'use strict'
    
    angular
        .module('store.productcards')
        .directive('storeProductCard', storeProductCard)

    function storeProductCard() {
        var directive = {
            templateUrl: 'webstore/productCards/storeProductCard.html',
            scope: {
                product: '=',
                currencies: '='
            },
            restrict: 'E',
            controller: ProductCard,
            controllerAs: 'vm',
            bindToController: true
        }

        return directive
    }

    ProductCard.$inject = ['$mdDialog', 'cart']

    function ProductCard($mdDialog, cart) {
        var vm = this

        vm.showProductInfo = showProductInfo
        vm.addToCart = addToCart

        function showProductInfo($event) {
            $mdDialog.show({
                parent: angular.element(document.body),
                targetEvent: $event,
                templateUrl: '/webstore/productInfo/productInfo.html',
                clickOutsideToClose: true,
                locals: {
                    product: vm.product,
                    currencies: vm.currencies,
                    addToCart: vm.addToCart
                },
                bindToController: true,
                controller: 'ProductInfo', // /webstore/productInfo/productInfo.js
                controllerAs: 'vm'
            })
        }

        function addToCart() {
            cart.addToCart(vm.product._id, 1)
        }
    }
})()