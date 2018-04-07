/**
 * root.js
 * 
 * Served to the client along with index.html. Provides Angular controllers for the home page and product info cards
 */

var rootModule = angular.module('root', ['ngCookies', 'ngMaterial', 'ngMessages', 'ngSanitize', 'md.data.table'])

function ProductInfoController($scope, product, currencies, addToCart) {
    $scope.product = product
    $scope.currencies = currencies
    $scope.addToCart = addToCart
}

function CartController($scope, $mdEditDialog, $cookies, $window, cart, currencies) {
    $scope.cart = cart
    $scope.currencies = currencies
    $scope.selectedCurrency = currencies[0]
    $scope.cartTotal = 0

    $scope.$watch('cart', (newProducts) => {
        $scope.cartTotal = 0

        for (let i = 0; i < cart.length; i++) {
            $scope.cartTotal += newProducts[i].price * newProducts[i].quantity
        }
    }, true)

    $scope.selectCurrency = function(currency) {
        $scope.selectedCurrency = currency
    }

    $scope.removeFromCart = function(index) {
        $scope.cart.splice(index,1)
    }

    $scope.editQuantity = function($event, product) {
        $mdEditDialog.large({
            title: "Set Quantity",
            modelValue: product.quantity,
            placeholder: product.quantity,
            save: function(input) {
                product.quantity = input.$modelValue
            },
            targetEvent: $event,
            validators: {
                min: 1,
                'ng-pattern': "/^[1-9][0-9]*$/"
            }
        })
    }

    $scope.checkout = function() {
        var shrunkCart = $scope.cart.map(product => ({
            _id: product._id,
            quantity: product.quantity
        }))

        $cookies.putObject("cart", shrunkCart)
        $cookies.put("currency", $scope.selectedCurrency.ticker)

        $window.location.href = "http://" + $window.location.host + "/checkout"
    }
}

function IndexController($scope, $http, $window, $location, $cookies, $mdSidenav, $mdDialog, $mdToast, $mdEditDialog) {
    $http.defaults.headers.post['Content-Type'] = 'application/json';
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
            templateUrl: '/modals/product-info.html',
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
            templateUrl: '/modals/cart.html',
            clickOutsideToClose: true,
            locals: {
                $mdEditDialog: $mdEditDialog,
                $cookies: $cookies,
                $window: $window,
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
        var newId = product._id // _id field from MongoDB, guaranteed to be unique for each product, making the find function easy
        quantity = quantity || 1 // Quantity may be null if this function is called from the main page

        $mdToast.show($mdToast.simple().textContent(`Added ${quantity} × ${product.name} to cart!`)) // unicode times character

        // See if we already have some of the product in the cart
        var existingProduct = $scope.cart.find( element => element._id === newId )

        // If we don't already have some of the product in our cart, push the product to the cart
        // Else, increment the quantity of the existing product record
        if (existingProduct === undefined) {
            product.quantity = quantity
            $scope.cart.push(product)
        } else {
            existingProduct.quantity += quantity
        }
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