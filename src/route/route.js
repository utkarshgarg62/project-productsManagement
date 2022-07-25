const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
const middleware = require('../middleware/middleware')


router.post('/register', userController.createUser )
router.post('/login', userController.loginUser )
router.get('/user/:userId/profile',middleware.authentication, userController.getUserById )
router.put('/user/:userId/profile',middleware.authentication, userController.updateUser)

module.exports = router;