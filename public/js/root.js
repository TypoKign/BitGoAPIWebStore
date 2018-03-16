var rootModule = angular.module('root', [])

rootModule.controller("index", ["$scope", function ($scope) {
    $scope.message="Hello world"
}])