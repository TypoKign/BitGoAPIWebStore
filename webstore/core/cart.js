(function() {
    'use strict'
    
    angular
        .module('store.core')
        .factory('cart', cart)

    cart.$inject = ['$cookies', 'dataservice']

    function cart($cookies, dataservice) {
        var cart = $cookies.get('bgwsCart')
        
        return {
            getCart: getCart,
            getCompactCart: getCompactCart,
            addToCart: addToCart,
            removeFromCart: removeFromCart,
            setQuantity: setQuantity,
            setCurrency: setCurrency
        }
        
        /**
         * Returns the value of the bgwsCart, which only contains the product's ID (product) and the quantity (quantity). Does not contain product category, price, etc.
         */
        function getCompactCart() {
            if ($cookies.getObject('bgwsCart')) {
                return $cookies.getObject('bgwsCart')
            }
            return []
        }

        /**
         * Gets the value of the bgwsCart cookie, then queries the server for additional information regarding the products in the cart. Returns an array of products including their category, price, etc.
         */
        function getCart() {
            var compactCart = getCompactCart()
            
            return dataservice.getProducts().then(function (allProducts) {
                var completeCart = []

                for (let i = 0; i < compactCart.length; i++) {
                    completeCart[i] = allProducts.find( product => product._id === compactCart[i].product)
                    completeCart[i].quantity = compactCart[i].quantity
                }

                return completeCart
            })
        }

        /**
         * Adds {quantity} products to the cart. If the product already exists in the cart, it increments that product's quantity. Otherwise, it adds the new product to the cart.
         * @param {String} productId The product's ID from the server
         * @param {Number} quantity The number of products to add to the cart
         */
        function addToCart(productId, quantity) {
            quantity = quantity || 1 // quantity may be null if called from the main page

            var cart = getCompactCart()
            var existingProduct = cart.find( element => element.product === productId)

            if (existingProduct === undefined) {
                cart.push({
                    product: productId,
                    quantity: quantity
                })
            } else {
                existingProduct.quantity += quantity
            }

            $cookies.putObject('bgwsCart', cart)
        }

        /**
         * Removes an item with a specified ID from the cart cookie
         * @param {String} productId The product's ID from the server
         */
        function removeFromCart(productId) {
            var cart = getCompactCart()
            cart.splice( cart.findIndex( element => element.product === productId), 1 )
            $cookies.putObject('bgwsCart', cart)
        }

        /**
         * Changes the quantity field of an item in the cart, and reflects it in the cookie
         * @param {String} productId The product's ID from the server
         * @param {Number} quantity The new quantity to assign to that product
         */
        function setQuantity(productId, quantity) {
            var cart = getCompactCart()
            var index = cart.findIndex( element => element.product === productId)
            cart[index].quantity = quantity
            $cookies.putObject('bgwsCart', cart)
        }

        /**
         * Sets the selected currency cookie
         * @param {Object} currency The object representation of the currency to select
         */
        function setCurrency(currency) {
            $cookies.put('bgwsCurrency', currency.ticker)
        }
    }
})()