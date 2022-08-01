const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
const productController = require('../controllers/productController')
const cartController = require('../controllers/cartController')
const orderController = require('../controllers/orderController')
const middleware = require('../middleware/middleware')

// User APIs 
router.post('/register', userController.createUser)
router.post('/login', userController.loginUser)
router.get('/user/:userId/profile', middleware.authentication, userController.getUserById)
router.put('/user/:userId/profile', middleware.authentication, middleware.authorization, userController.updateUser)

// Product APIs
router.post('/products', productController.createProducts )
router.get('/products', productController.getProduct )
router.get('/products/:productId', productController.getProductsById )
router.put('/products/:productId', productController.updateProduct)
router.delete('/products/:productId', productController.deleteProduct)

// Cart APIs
router.post('/users/:userId/cart',middleware.authentication, middleware.authorization, cartController.addToCart )
router.put('/users/:userId/cart', cartController.updateCart)
router.get('/users/:userId/cart',middleware.authentication, middleware.authorization, cartController.getCart )
router.delete('/users/:userId/cart', cartController.deleteCart)

// Order APIs
router.post('/users/:userId/orders', orderController.createOrder )
router.put('/users/:userId/orders', orderController.updateOrder)


module.exports = router;