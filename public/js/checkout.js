/**
* checkout.js
* Served with the /checkout.html page. Provides Angular module for the checkout process
*/

var checkoutModule = angular.module('checkout', ['ngCookies', 'ngMaterial', 'md.data.table'])

function CheckoutController($scope, $http, $cookies, $location) {
    $http.get("http://" + $location.host() + "/api/products").then((response) => {
        products = response.data
        
        $scope.cart = $cookies.getObject('cart').map( (cartItem) => ({
            _id: cartItem._id,
            quantity: cartItem.quantity,
            name: products.find( element => element._id === cartItem._id ).name,
            price: products.find( element => element._id === cartItem._id ).price
        }))

        $scope.cartTotal = 0

        for (let i = 0; i < $scope.cart.length; i++) {
            $scope.cartTotal += $scope.cart[i].price
        }
    })

    $http.get("http://" + $location.host() + "/api/currencies").then((response) => {
        currencies = response.data

        $scope.selectedCurrency = currencies.find( element => element.ticker === $cookies.get('currency') )
        
        $scope.cartTotal /= $scope.selectedCurrency.exchangeRate
    })

    $scope.checkoutInfo = {}
    $scope.receiveAddress

    function getReceiveAddress(callback) {
        var data = {
            cart: $cookies.getObject('cart'),
            currency: $cookies.get('currency'),
            checkoutInfo: $scope.checkoutInfo
        }
        $http.post("http://" + $location.host() + "/api/checkout", data).then((response) => {
            callback(response.address, response.qrCode)
        })
    }

    $scope.saveForm = function() {
        if ($scope.checkoutForm.$invalid) return;

        $scope.formLocked = true
                
        getReceiveAddress((address, qrCode) => {
            $scope.receiveAddress = address
            $scope.qrCode = qrCode
        })
    }
}

checkoutModule.controller("checkout", CheckoutController)

checkoutModule.config( ($mdThemingProvider) => {
    $mdThemingProvider.theme('default')
    .primaryPalette('deep-purple')
    .accentPalette('orange')
})