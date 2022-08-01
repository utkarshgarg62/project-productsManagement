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

        let { productId, quantity } = data

        let checkProduct = await productModel .findOne({_id:productId,isDeleted:false})
        if(!checkProduct){ return res.status(404).send({ status: false, message: "Product Do Not Exits or DELETED" }) }

        let arr1=[]
        let products = {
            productId:productId,
            quantity:quantity
        }
        arr1.push(products)
        let totalPriceCalculated = checkProduct.price * products.quantity

        let checkCartExitsForUserId = await cartModel.findOne({ userId: userIdInPath })

        // IF CART IS NOT FOUND IN DB
        if (!checkCartExitsForUserId) {
            let dataToBeCreated = {
                userId: userIdInPath,
                items: arr1,
                totalPrice: totalPriceCalculated,
                totalItems: 1
            }
            let createdData = await cartModel.create(dataToBeCreated)
            return res.status(201).send({ status: true, message: "Success", data: createdData })
        }

        // IF CART IS FOUND IN DB
        else {
            let arr2= checkCartExitsForUserId.items
            let productAdded = {
                productId:productId,
                quantity:quantity
            }
            arr2.push(productAdded)

            let dataToBeAdded = {
                items: arr2,
                totalPrice: totalPriceCalculated,
                totalItems: 1
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

        let userId = req.params.userId
        let { cartId, productId, removeProduct } = req.body;

        // PRODUCT ID 
        if (!productId) { return res.status(404).send({ status: false, message: "Please Provide Product" }) }
        if (!isValidObjectId(productId)){return res.status(404).send({ status: false, message: "Please Provide Valid Product" }) }

        // PRODUCT DELTED OR NOT PRESENT IN THE DB
        let product = await productModel.findOne({ _id: productId, isDeleted: false, });
        if (!product) { return res.status(400).send({ status: false, msg: "Product does not exist" }) }

        // CART 
        let cart = await cartModel.findOne({ userId: userId });
        if (!cart) { return res.status(400).send({ status: false, msg: "Product does not exist" }) }

        // IF THERE IS *cartID* PRESENT
        if (cartId) {
            if (!isValidObjectId(cartId)) { return res.status(400).send({ status: false, message: " Enter a valid cartId" }) }

            // ID YOU PROVIDE AND THE ID WHICH IS IN DB IS NOT MATCH
            if (cartId !== cart._id.toString()) 
            { return res.status(400).send({ status: false, msg: "This cart does not belong to the user" }) }
        }

        // REMOVE PRODUCTS
        if (!removeProduct) return res.status(400).send({ status: false, message: "Please enter removeProduct details" })

        let arr = cart.items;
        compareId = arr.findIndex((obj) => obj.productId == productId)
        if (compareId == -1) { return res.status(400).send({ status: false, msg: "The product is not available in this cart" }) }


        let quantity1 = arr[compareId].quantity;
        if (removeProduct == 0) {                       // <=== if remove Product is 0
            arr.splice(compareId - 1, 1);
            cart.totalItems = arr.length
            cart.totalPrice -= product.price * quantity1;
            await cart.save();
            
            return res.status(200).send({ status: true, data: cart });
        
        } else if (removeProduct == 1) {                // <=== if remove Product is 1
            if (arr[compareId].quantity == 1) {
                arr.splice(compareId - 1, 1);
                cart.totalItems = arr.length;
                cart.totalPrice -= product.price;
                await cart.save();
                return res.status(200).send({ status: true, data: cart });
            } else if (arr[compareId].quantity > 1) arr[compareId].quantity -= 1;
            cart.totalItems = arr.length;
            cart.totalPrice -= product.price;
            await cart.save();

            return res.status(200).send({ status: true, data: cart });
        }

        // let updatedCart = await cartModel.findByIdAndUpdate({ _id: userId }, data, { new: true })
        // return res.status(200).send({ status: true, message: 'Success', data: updatedCart })



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