var rootModule = angular.module('root', [])

rootModule.controller("index", ["$scope", function ($scope) {
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
        price: 9.99
    }]

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

    // Add to cart and snackbar logic
    var snackbarDiv = document.querySelector("#add-to-cart-snackbar")
    var decrementItemsInCart = function() { $scope.itemsInCart-- }
    $scope.addToCart = function(itemName) {
        $scope.itemsInCart++;

        var snackBarData = {
            message: "Added " + itemName + " to cart!",
            timeout: 4000,
            actionHandler: decrementItemsInCart,
            actionText: "Undo"
        }

        snackbarDiv.MaterialSnackbar.showSnackbar(snackBarData)
    }
}])