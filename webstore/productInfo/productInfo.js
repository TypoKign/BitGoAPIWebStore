(function() {
    'use strict'
    
    angular
        .module('store.productinfo')
        .controller('ProductInfo', ProductInfo)

    ProductInfo.$inject = ['cart']

    function ProductInfo(cart) {
        var vm = this
        vm.quantity = 1

        vm.addToCart = addToCart

        function addToCart(product, quantity) {
            cart.addToCart(product._id, quantity )
        }
    }
})()