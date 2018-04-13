(function() {
    'use strict'
    
    angular
        .module('store.cartdialog')
        .controller('CartDialog', CartDialog)
    
    CartDialog.$inject = ['$location', '$mdDialog', '$mdEditDialog', 'dataservice', 'cart']
    
    function CartDialog($location, $mdDialog, $mdEditDialog, dataservice, cart) {
        var vm = this
        
        vm.currencies = []
        vm.cart
        vm.cartTotal = 0
        vm.selectedCurrency
        
        vm.selectCurrency = selectCurrency
        vm.removeFromCart = removeFromCart
        vm.editQuantity = editQuantity
        vm.checkout = checkout
        
        start()
        
        function start() {
            dataservice.getCurrencies().then(function (data) {
                vm.currencies = data
                selectCurrency(vm.currencies[0])
            })

            refreshCart()
        }

        function refreshCart() {
            cart.getCart().then(function (data) {
                vm.cart = data

                vm.cartTotal = 0

                for (let i = 0; i < vm.cart.length; i++) {
                    vm.cartTotal += vm.cart[i].price * vm.cart[i].quantity
                }
            })
        }
        
        function selectCurrency(currency) {
            vm.selectedCurrency = currency
            cart.setCurrency(currency)
        }

        function removeFromCart(index) {
            cart.removeFromCart(vm.cart[index]._id)
            refreshCart()
        }

        function editQuantity($event, product) {
            $mdEditDialog.large({
                title: "Set Quantity",
                modelValue: product.quantity,
                placeholder: product.quantity,
                type: 'number',
                save: function(input) {
                    cart.setQuantity(product._id, input.$modelValue)
                    refreshCart()
                },
                targetEvent: $event,
                validators: {
                    min: 1,
                    'ng-pattern': "/^[1-9][0-9]*$/"
                }
            })
        }

        function checkout() {
            $mdDialog.hide()
            $location.path('/checkout')
        }
    }
})()