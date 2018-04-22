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

        vm.orderId
        vm.orderStatus
        vm.price
        vm.receiveAddress
        vm.qrCode

        vm.showReceiveAddress = showReceiveAddress
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

        function showReceiveAddress() {
            return (vm.orderStatus == "UNPAID" || vm.orderStatus == null) && vm.receiveAddress != null
        }

        function saveForm() {
            if (checkoutForm.$invalid) return;

            vm.formLocked = true

            dataservice.postOrderDetails(vm.cart, vm.selectedCurrency.ticker, vm.checkoutInfo.name, vm.checkoutInfo.email).then(function (response) {
                vm.orderId = response.id
                vm.receiveAddress = response.address
                vm.qrCode = response.qrCode
                vm.price = response.price / vm.selectedCurrency.exchangeRate
            })

            setInterval(checkOrderStatus, 1000 * 5) // Start checking the status of the order every 5 seconds
        }

        function checkOrderStatus() {
            dataservice.getOrderStatus(vm.orderId).then(function (response) {
                vm.orderStatus = response.status
            })
        }
    }
})()