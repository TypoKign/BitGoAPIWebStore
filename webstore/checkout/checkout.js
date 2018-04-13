(function() {
    'use strict'
    
    angular
        .module('store.checkout')
        .controller('Checkout', Checkout)

    Checkout.$inject = ['$cookies', 'cart', 'dataservice']

    function Checkout($cookies, cart, dataservice) {
        var vm = this

        vm.cart = []
        vm.selectedCurrency
        vm.checkoutInfo = {}
        vm.formLocked = false

        vm.price
        vm.receiveAddress
        vm.qrCode

        vm.saveForm = saveForm

        start()

        function start() {
            cart.getCart().then(function (cart) {
                vm.cart = cart
            })

            dataservice.getCurrencies().then(function (currencies) {
                vm.selectedCurrency = currencies.find( currency => currency.ticker === $cookies.get("bgwsCurrency") )
            })

            console.log('Loaded checkout view')
        }

        function saveForm() {
            if (checkoutForm.$invalid) return;

            vm.formLocked = true

            dataservice.postOrderDetails(vm.cart, vm.selectedCurrency.ticker, vm.checkoutInfo.name, vm.checkoutInfo.email).then(function (response) {
                vm.receiveAddress = response.address
                vm.qrCode = response.qrCode
                vm.price = response.price / vm.selectedCurrency.exchangeRate
            })
        }
    }
})()