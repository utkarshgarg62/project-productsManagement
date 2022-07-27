const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
const productController = require('../controllers/productController')
const middleware = require('../middleware/middleware')

// User APIs 
router.post('/register', userController.createUser)
router.post('/login', userController.loginUser)
router.get('/user/:userId/profile', middleware.authentication, userController.getUserById)
router.put('/user/:userId/profile', middleware.authentication, middleware.authorization, userController.updateUser)

// Product APIs
router.post('/products', productController.createProducts )
// router.get('/products', productController. )
router.get('/products/:productId', productController.getProductsById )
router.put('/products/:productId', productController.updateProduct)
router.delete('/products/:productId', productController.deleteProduct)


module.exports = router;