(function() {
    'use strict'
    
    angular
        .module('store.index')
        .controller('Index', Index)

    Index.$inject = ['$q', 'dataservice', 'layout']

    function Index($q, dataservice, layout) {
        var vm = this

        // Scope variables
        vm.currencies = []
        vm.products = []
        vm.productCategories = []
        vm.selectedCategory = 'all'

        // Scope functions
        vm.setSelectedCategory = setSelectedCategory
        vm.shouldShowCard = shouldShowCard
        vm.showCart = showCart
        vm.openSidebar = openSidebar
        vm.showAboutDialog = showAboutDialog

        start()

        // Page init process
        function start() {
            var promises = [getCurrencies(), getProducts(), getProductCategories()]

            return $q.all(promises).then(function() {
                console.log('Loaded index view')
            })
        }

        // Scope function implementations
        function setSelectedCategory(category) {
            vm.selectedCategory = category
        }
        
        function shouldShowCard(product) {
            if (vm.selectedCategory === 'all') return true;
            if (product.category === vm.selectedCategory) return true;
            return false;
        }

        function openSidebar() {
            layout.openSidebar()
        }
        
        function showAboutDialog($event) {
            layout.showAboutDialog($event)
        }

        function showCart($event) {
            layout.showCart($event)
        }
        
        function getCurrencies() {
            return dataservice.getCurrencies().then(function (data) {
                vm.currencies = data
                return vm.currencies
            })
        }

        function getProducts() {
            return dataservice.getProducts().then(function (data) {
                vm.products = data
                return vm.products
            })
        }
        
        function getProductCategories() {
            return dataservice.getProductCategories().then(function (data) {
                vm.productCategories = data
                return vm.productCategories
            })
        }
    }
})()