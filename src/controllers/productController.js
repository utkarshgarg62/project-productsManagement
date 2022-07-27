const jwt = require("jsonwebtoken")
const aws = require("aws-sdk")
const userModel = require('../models/userModel')
const { isValid, isValidObjectId, isValidName, isNumber, isValidPrice, isBoolean,  isValidMobile, isValidPassword, isValidReqBody, isValidPincode } = require("../middleware/validation")
const bcrypt = require('bcrypt');
const saltRounds = 10;


const updateProduct = async function (req, res) {
    try {
        let ProductId = req.params.productId

        let data = req.body

        let { title, description, price, currencyId, currencyFormat, isFreeShipping, productImage, style, availableSizes, installments} = data

        if (!isValidObjectId(ProductId)) return res.status(400).send({ status: false, message: "Invalid ProductId" })

        let Product = await productModel.findOne({ _id: ProductId, isDeleted: false })
        if (!Product) { return res.status(404).send({ status: false, message: "Product not exist in DB" }) }

        if (!isValidReqBody(data)) { return res.status(400).send({ status: false, message: "Insert Data : BAD REQUEST" }); }

        if (data.hasOwnProperty("title")) {
            if (!isValid(title)) { return res.status(400).send({ status: false, message: "Please Provide title " }) }
            if (!isValidName(title)) { return res.status(400).send({ status: false, message: "Enter a Valid title !" }) }
        }

        if (data.hasOwnProperty("description")) {
            if (!isValid(description)) { return res.status(400).send({ status: false, message: "Please Provide description" }) }
            if (!isValidName(description)) { return res.status(400).send({ status: false, message: "Enter a Valid description !" }) }
        }

        if (data.hasOwnProperty("price")) {
            if (!isNumber(price)) { return res.status(400).send({ status: false, message: "Please Provide price" }) }
            if (!isValidPrice(price)) { return res.status(400).send({ status: false, message: "Enter a Valid price !" }) }
        }

        if (data.hasOwnProperty("style")) {
            if (!isValid(style)) { return res.status(400).send({ status: false, message: "Please Provide price" }) }
            if (!isValidName(style)) { return res.status(400).send({ status: false, message: "Enter a Valid price !" }) }
        }

        if (data.hasOwnProperty("productImage")) {
            if (!isValidName(productImage)) { // <===========================   MUST BE A PROBLEM IN THIS LINE  
                return res.status(400).send({ status: false, message: "productImage is missing ! " })
            }
        }

        if (data.hasOwnProperty("isFreeShipping")) {
            if (!isBoolean(isFreeShipping)) {  // <=========================== There Must be a problem 
                return res.status(400).send({ status: false, message: "Boolean Value should be present ! " })
            }
        }

        if (data.hasOwnProperty("installments")) {
            if (!isNumber(installments)) { return res.status(400).send({ status: false, message: "Please Provide price" }) }
            if (!isValidPrice(installments)) { return res.status(400).send({ status: false, message: "Enter a Valid price !" }) }
        }

        // ===============================================================>
        //  <====== ₹
        // currencyId, currencyFormat, availableSizes <===== this are incompleted

        let Updatedata = await userModel.findOneAndUpdate({ _id: userId }, data, { new: true })
        res.status(201).send({ status: true, message: "User profile Updated", data: Updatedata })


    } catch (err) {
        res.status(500).send({ status: false, message: err })
    }
}

const deleteProduct = async function (req, res) {

    try {
        let ProductId = req.params.productId
        let date = new Date()

        let Product = await productModel.findOne({ _id: ProductId, isDeleted: false })
        if (!Product) { return res.status(404).send({ status: false, message: "Product not exist in DB" }) }

        let check = await productModel.findOneAndUpdate(
            { _id: BookId }, { isDeleted: true, deletedAt: date }, { new: true })

        return res.status(200).send({ status: true, message: "success", data: check })


    } catch (err) {
        res.status(500).send({ status: false, message: err })
    }
}

module.exports.updateProduct = updateProduct
module.exports.deleteProduct = deleteProduct