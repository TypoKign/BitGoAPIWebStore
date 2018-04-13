(function() {
    'use strict'
    
    angular.module('store', [
        // Core application logic
        'store.core', 'store.util',

        // Features
        'store.index', 'store.checkout', 'store.layout', 'store.productcards', 'store.productinfo', 'store.cartdialog'
    ])
})()