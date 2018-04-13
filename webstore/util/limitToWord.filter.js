(function() {
    'use strict'
    
    angular
        .module('store.util')
        .filter('limitToWord', limitToWord)
    
    function limitToWord() {
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
    }
})()