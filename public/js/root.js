var rootModule = angular.module('root', ['ngMaterial'])

rootModule.controller("index", function ($scope, $mdSidenav, $mdDialog, $mdToast) {
    $scope.itemsInCart = 0 // Shown as a badge on the shopping cart icon (top right)
    $scope.products = [ // List of products to populate the product cards
        {
            name: "Product 1",
            description: "First product",
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

    $scope.currencies = [ // List of supported currencies
        {
            name: "bitcoin",
            ticker: "btc",
            icon: "/svg/btc.svg",
            iconColor: "orange",
            exchangeRate: 10000 // TODO: get from API
        },
        {
            name: "ether",
            ticker: "eth",
            icon: "/svg/eth.svg",
            iconColor: "purple",
            exchangeRate: 900 // TODO: get from API
        },
        {
            name: "ripple",
            ticker: "xrp",
            icon: "/svg/xrp.svg",
            iconColor: "blue",
            exchangeRate: 0.80 // TODO: get from API
        },
        {
            name: "bitcoincash",
            ticker: "bch",
            icon: "/svg/bch.svg",
            iconColor: "lightGreen",
            exchangeRate: 1200 // TODO: get from API
        },
        {
            name: "litecoin",
            ticker: "ltc",
            icon: "/svg/ltc.svg",
            iconColor: "silver",
            exchangeRate: 200 // TODO: get from API
        }
    ]

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

    // Add to cart and snackbar logic
    $scope.addToCart = function(productName) {
        $mdToast.show($mdToast.simple().textContent(`Added ${productName} to cart!`))
    }
})

// Set the color theme of Angular Material
rootModule.config(function ($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('deep-purple')
        .accentPalette('orange')
})