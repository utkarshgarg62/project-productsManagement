const cartModel = require("../models/cartModel")
const userModel = require('../models/userModel')
const productModel = require("../models/productModel")
const aws = require("../aws/aws_config")
const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt');
const saltRounds = 10;

const {
    isValidReqBody,
    isValid,
    isValidObjectId,
    isValidTitle,
    isValidName,
    isValidPrice,
    isBoolean,
    isNumber,
    isValidEmail,
    isValidMobile,
    isValidPassword,
    isValidPincode
} = require("../middleware/validation")


//================================================[ADD TO CART API]=======================================================================


const addToCart = async function (req, res) {
    try {



    } catch (err) {
        res.status(500).send({ status: false, message: err })
    }
}

//================================================[UPDATE CART API]=======================================================================


const updateCart = async function (req, res) {

    try {
        let cartId = req.body.cartId
        let productId = req.body.productId
        let userId = req.params.userId
        let data = req.body


        if (!isValidObjectId(cartId)) { return res.status(400).send({ status: false, message: "Invalid cartId" }) }
        if (!cartId) { return res.status(400).send({ status: false, message: "CartId Not Present" }) }

        if (!isValidObjectId(productId)) { return res.status(400).send({ status: false, message: "Invalid ProductId" }) }

        if (!isValidObjectId(userId)) { return res.status(400).send({ status: false, message: "Invalid userId" }) }

        if (!isValidReqBody(data)) { return res.status(400).send({ status: false, message: "Insert Data : BAD REQUEST" }); }


        // PRODUCT DELTED OR NOT PRESENT IN THE DB
        let productNotFound = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!productNotFound) { return res.status(404).send({ status: false, message: "Product not exist" }) }

        // USER DELTED OR NOT PRESENT IN THE DB
        let userNotFound = await userModel.findOne({ _id: userId, isDeleted: false })
        if (!userNotFound) { return res.status(404).send({ status: false, message: "User not exist" }) }

        // CART DELTED OR NOT PRESENT IN THE DB
        let cartNotFound = await cartModel.findOne({ _id: cartId, isDeleted: false })
        if (!cartNotFound) { return res.status(404).send({ status: false, message: "Cart not exist" }) }




        let updatedCart = await cartModel.findByIdAndUpdate({ _id: userId }, data, { new: true })
        return res.status(200).send({ status: true, message: 'Success', data: updatedCart })


    } catch (err) {
        res.status(500).send({ status: false, message: err })
    }
}

//================================================[GET CART API]=======================================================================



const getCart = async function (req, res) {
    try {


    }
    catch {


    }
}

//================================================[DLETE CART API]=======================================================================



const deleteCart = async function (req, res) {
    

    // try {
    //     let cartId = req.params.cartId
    //     let date = new Date()

    //     let Cart = await cartModel.findOne({ _id: cartId })
    //     if (!Cart) { return res.status(404).send({ status: false, message: "cart not exist" }) }

    //     //checking is cart already deleted 
    //     if (Cart.isDeleted == true)
    //         return res.status(404).send({ status: false, message: "cart is Already deleted" });

    //     await cartModel.findOneAndUpdate({ _id: cartId }, { isDeleted: true, deletedAt: date }, { new: true })
    //     return res.status(200).send({ status: true, message: "success", data: "Cart is Deleted" })


    // } catch (err) {
    //     return res.status(500).send({ status: false, message: err.message })
    // }

}


//================================================[MODULE EXPORTS]=======================================================================


module.exports.addToCart = addToCart
module.exports.updateCart = updateCart
module.exports.getCart = getCart
module.exports.deleteCart = deleteCart