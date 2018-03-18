var rootModule = angular.module('root', [])

rootModule.controller("index", ["$scope", function ($scope) {
    $scope.message="Hello world"
    $scope.itemsInCart = 0
    $scope.products = [
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
}])