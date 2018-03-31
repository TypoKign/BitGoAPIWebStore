/**
 * root.js
 * 
 * Served to the client along with index.html. Provides Angular controllers for the home page and product info cards
 */

var rootModule = angular.module('root', ['ngMaterial', 'ngMessages', 'ngSanitize', 'md.data.table'])

function ProductInfoController($scope, product, currencies, addToCart) {
    $scope.product = product
    $scope.currencies = currencies
    $scope.addToCart = addToCart
}

function CartController($scope, cart, currencies) {
    $scope.cart = cart
    $scope.currencies = currencies
    $scope.selectedCurrency = currencies[0]

    $scope.selectCurrency = function(currency) {
        $scope.selectedCurrency = currency
    }
}

function IndexController($scope, $http, $location, $mdSidenav, $mdDialog, $mdToast) {
    $scope.cart = []

    $http.get($location.$$absUrl + "api/products").then((response) => {
        $scope.products = response.data
    })

    $http.get($location.$$absUrl + "api/currencies").then((response) => {
        $scope.currencies = response.data
    })

    $scope.productCategories = [
        "Category 1",
        "Category 2",
        "Category 3",
        "Category 4"
    ]
    $scope.selectedCategory = "all"

    $scope.openSidenav = function() {
        $mdSidenav('sidenav').toggle()
    }

    $scope.showDialog = function($event, url) {
        $mdDialog.show({
            parent: angular.element(document.body),
            targetEvent: $event,
            templateUrl: url,
            clickOutsideToClose: true
        })
    }

    $scope.showProductInfo = function($event, product) {
        $mdDialog.show({
            parent: angular.element(document.body),
            targetEvent: $event,
            templateUrl: '/product-info.html',
            clickOutsideToClose: true,
            locals: {
                product: product,
                currencies: $scope.currencies,
                addToCart: $scope.addToCart
            }, 
            controller: ProductInfoController
        })
    }

    $scope.showCart = function($event) {
        $mdDialog.show({
            parent: angular.element(document.body),
            targetEvent: $event,
            templateUrl: '/cart.html',
            clickOutsideToClose: true,
            locals: {
                cart: $scope.cart,
                currencies: $scope.currencies
            },
            controller: CartController
        })
    }

    $scope.setSelectedCategory = function(category) {
        $scope.selectedCategory = category
    }

    // Add to cart and snackbar logic
    $scope.addToCart = function(product, quantity) {
        quantity = quantity || 1
        $mdToast.show($mdToast.simple().textContent(`Added ${quantity} × ${product.name} to cart!`)) // unicode times character
        product.quantity = quantity
        $scope.cart.push(product)
    }
}

rootModule.controller("index", IndexController)

// Word-aware limitTo directive slightly modified from https://stackoverflow.com/a/18096071/4645098
rootModule.filter('limitToWord', () => {
    return function(text, length, tail) {
        if (!text) return '';

        length = parseInt(length, 10)
        if (!length) return '';
        if (text.length <= length) return text

        text = text.substr(0, length)
        var lastSpace = text.lastIndexOf(' ')
        if (lastSpace !== -1) {
            if (text.charAt(lastSpace - 1) === '.' || text.charAt(lastSpace - 1) === ',') {
                lastSpace--
            }
            text = text.substr(0, lastSpace)
        }

        return text + (tail || '&hellip;')
    }
})

// Set the color theme of Angular Material
rootModule.config(function ($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('deep-purple')
        .accentPalette('orange')
})