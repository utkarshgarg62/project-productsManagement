const cartModel = require("../models/cartModel")
const userModel = require("../models/userModel")
const productModel = require("../models/productModel")
const { isValidObjectId, isValidReqBody, } = require("../middleware/validation")


//================================================[ADD TO CART API]=======================================================================


const addToCart = async function (req, res) {
    try {
        let userIdInPath = req.params.userId
        let checkUserId = await userModel.findById({ _id: userIdInPath })
        if (!checkUserId) { return res.status(404).send({ status: false, message: "UserId Do Not Exits" }) }

        let data = req.body
        let { userId, items, totalPrice, totalItems } = data
        console.log(userIdInPath)

        let checkCartExitsForUserId = await cartModel.findOne({ userId: userIdInPath })
        if (!checkCartExitsForUserId) {
            let dataToBeCreated = {
                userId: userIdInPath,
                items: items,
                totalPrice: totalPrice,
                totalItems: totalItems
            }
            let createdData = await cartModel.create(dataToBeCreated)
            return res.status(201).send({ status: true, message: "Success", data: createdData })
        }
        else {
            let dataToBeAdded = {
                items: items,
                totalPrice: totalPrice,
                totalItems: totalItems
            }
            let updatedData = await cartModel.findOneAndUpdate({ userId: userIdInPath },
                dataToBeAdded,
                { new: true }
            )
            return res.status(201).send({ status: true, message: "Successfully Added", data: updatedData })
        }
    }
    catch (err) {
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


    }
    catch (err) {
        res.status(500).send({ status: false, message: err })
    }
}

//================================================[GET CART API]=======================================================================



const getCart = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Incorrect user Id format" })

        let cartData = await cartModel.findOne({ userId: userId })
        if (!cartData) {
            return res.status(400).send({ status: false, message: "this user has no cart" })
        }
        res.status(200).send({ status: true, data: cartData })
    }
    catch (err) {
        res.status(500).send({ status: false, message: err })
    }
}

//================================================[DLETE CART API]=======================================================================



const deleteCart = async function (req, res) {
    try {
        let userId = req.params.userId

        //check if the document is found with that user id 
        let checkUser = await userModel.findById(userId)
        if (!checkUser) { return res.status(400).send({ status: false, msg: "user not found" }) }

        let Cart = await cartModel.findOne({ userId: userId })
        if (!Cart) {
            return res.status(404).send({ status: false, msg: "cart not exists" })
        }
        const items = []
        let cartDeleted = await cartModel.findOneAndUpdate({ userId: userId },
            { $set: { items: items, totalItems: 0, totalPrice: 0 } }, { new: true })


        return res.status(200).send({ status: true, data: cartDeleted })
    }
    catch (err) {
        res.status(500).send({ status: false, message: err })
    }
}


//================================================[MODULE EXPORTS]=======================================================================


module.exports.addToCart = addToCart
module.exports.updateCart = updateCart
module.exports.getCart = getCart
module.exports.deleteCart = deleteCart