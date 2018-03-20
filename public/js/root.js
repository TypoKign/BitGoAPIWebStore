var rootModule = angular.module('root', ['ngMaterial'])

function ProductInfoController($scope, product, currencies, addToCart) {
    $scope.product = product
    $scope.currencies = currencies
    $scope.addToCart = addToCart
}

function IndexController($scope, $http, $location, $mdSidenav, $mdDialog, $mdToast) {
    $scope.itemsInCart = 0 // Shown as a badge on the shopping cart icon (top right)
    $scope.products = [ // List of products to populate the product cards
        {
            name: "Product 1",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
            price: 99.99
        },
        {
            name: "Product 2",
            description: "Second product",
            price: 9.99
        },
        {
            name: "Product 3",
            description: "Third product",
            price: 9.99
        },
        {
            name: "Product 4",
            description: "Fourth product",
            price: 99.99
        },
        {
            name: "Product 5",
            description: "Fifth product",
            price: 9.99
        },
        {
            name: "Product 6",
            description: "Sixth product",
            price: 999.99
        }
    ]

    $scope.currencies = []
    $http.get($location.$$absUrl + "api/currencies").then((response) => {
        $scope.currencies = response.data
    })

    $scope.productCategories = [
        "Category 1",
        "Category 2",
        "Category 3",
        "Category 4"
    ]

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
            }, controller: ProductInfoController
        })
    }

    // Add to cart and snackbar logic
    $scope.addToCart = function(productName, amount) {
        amount = amount || 1
        $mdToast.show($mdToast.simple().textContent(`Added ${amount} × ${productName} to cart!`)) // unicode times character
    }
}

rootModule.controller("index", IndexController)

// Set the color theme of Angular Material
rootModule.config(function ($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('deep-purple')
        .accentPalette('orange')
})