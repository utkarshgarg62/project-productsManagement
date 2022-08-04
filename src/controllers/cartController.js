const cartModel = require("../models/cartModel")
const userModel = require("../models/userModel")
const productModel = require("../models/productModel")
const { isValidObjectId, isValidReqBody, } = require("../middleware/validation")


//================================================[ADD TO CART API]=======================================================================


const addToCart = async function (req, res) {
    try {
        let userIdInPath = req.params.userId
        if (!isValidObjectId(userIdInPath)) { return res.status(404).send({ status: false, message: "Invalid UserId" }) }

        let checkUserId = await userModel.findById({ _id: userIdInPath })
        if (!checkUserId) { return res.status(404).send({ status: false, message: "UserId Do Not Exits" }) }

        let data = req.body

        let { productId } = data

        if (!isValidReqBody(productId)) { return res.status(404).send({ status: false, message: "Please Provide ProductId" }) }
        if (!isValidObjectId(productId)) { return res.status(404).send({ status: false, message: "Invalid ProductId" }) }

        let checkProduct = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!checkProduct) { return res.status(404).send({ status: false, message: "Product Do Not Exists or DELETED" }) }
        

        // DB CALL TO CHECK WHETHER THE CART IS PRESENT OR NOT FOR THAT USER
        let checkCartExistsForUserId = await cartModel.findOne({ userId: userIdInPath })

        // IF CART IS FOUND IN DB // TO ADD PRODUCTS
        if (checkCartExistsForUserId) {
            let arr2 = checkCartExistsForUserId.items
            let productAdded = {
                productId: productId,
                quantity: 1
            }
            let compareProductId = arr2.findIndex((obj) => obj.productId == productId);  // 2nd productid- req.body mile gai
            // console.log(compareProductId)
            if (compareProductId == -1) {  // AGAR PRODUCTID MATCH NI HOTI HAI
                arr2.push(productAdded)     // ADDING NEW PRODUCT
            } else {
                arr2[compareProductId].quantity += 1;       // INCREASING QUANTITY
            }

            let totalPriceUpdated = checkCartExistsForUserId.totalPrice + (checkProduct.price)
            let totalItemsUpdated = arr2.length

            let dataToBeAdded = {
                items: arr2,
                totalPrice: totalPriceUpdated,
                totalItems: totalItemsUpdated
            }
            let updatedData = await cartModel.findOneAndUpdate({ userId: userIdInPath },
                dataToBeAdded,
                { new: true }
            )
            return res.status(201).send({ status: true, message: "Successfully Added", data: updatedData })
        }

        // IF CART IS NOT FOUND IN DB // TO ADD PRODUCT AND CREATE CART
        if (!checkCartExistsForUserId) {
            
            let arr1 = []
            let products = {
                productId: productId,
                quantity: 1
            }
            arr1.push(products)

            let totalPriceCalculated = checkProduct.price * products.quantity

            let dataToBeCreated = {
                userId: userIdInPath,
                items: arr1,
                totalPrice: totalPriceCalculated,
                totalItems: 1
            }
            let createdData = await cartModel.create(dataToBeCreated)
            return res.status(201).send({ status: true, message: "Success", data: createdData })
        }
    }
    catch (err) {
        res.status(500).send({ status: false, message: err })
    }
}

//================================================[UPDATE CART API]=======================================================================


const updateCart = async function (req, res) {

    try {

        let userIdInPath = req.params.userId
        if (!isValidObjectId(userIdInPath)) { return res.status(404).send({ status: false, message: "Invalid UserId" }) }

        let checkUserId = await userModel.findById({ _id: userIdInPath })
        if (!checkUserId) { return res.status(404).send({ status: false, message: "UserId Do Not Exits" }) }

        let data = req.body

        let { productId, removeProduct } = data

        if (!isValidReqBody(productId)) { return res.status(404).send({ status: false, message: "Please Provide ProductId" }) }
        if (!isValidObjectId(productId)) { return res.status(404).send({ status: false, message: "Invalid ProductId" }) }

        if (!(removeProduct == 1 || removeProduct == 0)) {
            return res.status(400).send({ status: false, message: "Remove Product Should only be 1 and 0 (1 - To Reduce Quantity & 0 - To Remove Product)" })
        }
        
        let checkProduct = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!checkProduct) { return res.status(404).send({ status: false, message: "Product Do Not Exits or DELETED" }) }

        // DB CALL TO CHECK WHETHER THE CART EXISTS AUR NOT 
        let checkCartExistsForUserId = await cartModel.findOne({ userId: userIdInPath })

            // STORING THE ITEMS DATA (ARR) IN arr1 (TAKING ITEMS FROM ABOVE DB CALL)
            let arr1 = checkCartExistsForUserId.items

            // FINDING THE INDEX OF THE USER GIVEN PRODUCTID WHETHER PRESENT IN DB OR NOT IN CART ITEMS
            let compareProductId = arr1.findIndex((obj) => obj.productId == productId);

            // IF NOT PRESENT IT WILL GIVE THE INDEX AS -1 
            if (compareProductId == -1) {
                return res.status(200).send({ status: false, message: "ProductId is not available in the cart" })
            }

        // IF CART IS FOUND IN DB // TO REDUCE AND REMOVE PRODUCT FROM CART
        if (checkCartExistsForUserId) {

            // IF USER GIVE REMOVEPRODUCT VALUE AS 1
            if (removeProduct == 1) {

                arr1[compareProductId].quantity -= 1;
                if (arr1[compareProductId].quantity == 0) {
                    arr1.splice(compareProductId, 1)
                }

                let totalPriceUpdated = checkCartExistsForUserId.totalPrice - (checkProduct.price)
                let totalItemsUpdated = arr1.length

                let dataToBeUpdated = {
                    items: arr1,
                    totalPrice: totalPriceUpdated,
                    totalItems: totalItemsUpdated
                }
                let updatedData = await cartModel.findOneAndUpdate({ userId: userIdInPath },
                    dataToBeUpdated,
                    { new: true }
                )
                return res.status(200).send({ status: true, message: "Successfully Reduced the Quantity", data: updatedData })
            }

            // IF USER GIVE REMOVEPRODUCT VALUE AS 0
            if (removeProduct == 0) {

                let arr2 = arr1.splice(compareProductId, 1)
                let quantity = arr2[0].quantity
                let totalPriceUpdated = checkCartExistsForUserId.totalPrice - (checkProduct.price * quantity)
                let totalItemsUpdated = arr1.length

                let dataToBeUpdated = {
                    items: arr1,
                    totalPrice: totalPriceUpdated,
                    totalItems: totalItemsUpdated
                }
                let updatedData = await cartModel.findOneAndUpdate({ userId: userIdInPath },
                    dataToBeUpdated,
                    { new: true }
                )
                return res.status(200).send({ status: true, message: "Successfully Removed Product", data: updatedData })
            }

        }

        // IF CART IS NOT FOUND IN DB 
        if (!checkCartExistsForUserId) {
            return res.status(400).send({ status: false, message: "Cart Do Not Exits" })
        }

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


        return res.status(200).send({ status: true, message: "Cart is Empty", data: cartDeleted })
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