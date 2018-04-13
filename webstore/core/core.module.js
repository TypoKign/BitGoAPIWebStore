(function() {
    'use strict'
    
    angular
        .module('store.core', [
            // Angular extension libs
            'ngRoute', 'ngCookies', 'ngSanitize',

            // 3rd party libs
            'ngMaterial', 'md.data.table'
        ])
})()