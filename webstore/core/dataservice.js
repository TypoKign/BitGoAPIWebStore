(function() {
    'use strict'

    angular
        .module('store.core')
        .factory('dataservice', dataservice)

    dataservice.$inject = ["$http"]

    function dataservice($http) {
        return {
            getCurrencies: getCurrencies,
            getProducts: getProducts,
            getProductCategories: getProductCategories,
            postOrderDetails: postOrderDetails
        }

        // Queries the server for a list of supported currencies, tickers, images, and exchange rates
        function getCurrencies() {
            return $http.get('/api/currencies')
                        .then(function (response) {
                            return response.data
                        })
        }

        // Queries the server for a list of all products
        function getProducts() {
            return $http.get('/api/products')
                        .then(function (response)  {
                            return response.data
                        })
        }

        // Queries the server for a list of all categories
        function getProductCategories() {
            return $http.get('/api/categories')
                        .then(function (response) {
                            return response.data
                        })
        }

        // Sends information about an order to the server and returns a receive address for the buyer to deposit funds into
        function postOrderDetails(cart, currencyTicker, buyerName, buyerEmail) {
            // Convert cart array of full products (with unnecessary data like category) into an array of product references (by ID) and quantities
            var cartWithReferences = cart.map(element => ({
                product: element._id,
                quantity: element.quantity
            }))

            var orderData = {
                cart: cartWithReferences,
                currencyTicker: currencyTicker,
                buyerName: buyerName,
                buyerEmail: buyerEmail
            }

            return $http.post('/api/checkout', orderData)
                        .then(function (response) {
                            return response.data
                        })
        }
    }
})()