const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController')


router.post('/register', userController.createUser )
// router.post('/login', userController. )
// router.get('/user/:userId/profile', userController. )
// router.put('/user/:userId/profile', userController. )

module.exports = router;