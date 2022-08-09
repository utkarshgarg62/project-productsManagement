const cartModel = require("../models/cartModel")
const userModel = require("../models/userModel")
const productModel = require("../models/productModel")
const { isValidObjectId, isValidReqBody, } = require("../middleware/validation")


//================================================[ADD TO CART API]=======================================================================


const addToCart = async function (req, res) {
    try {
        let userIdInPath = req.params.userId
        if (!isValidObjectId(userIdInPath)) { return res.status(404).send({ status: false, message: "Invalid UserId" }) }

        // TO CHECK WHEATHER USERID EXISTS OR NOT IN USER_MODEL
        let checkUserId = await userModel.findById({ _id: userIdInPath })
        if (!checkUserId) { return res.status(404).send({ status: false, message: "UserId Do Not Exits" }) }

        let data = req.body
        if (!isValidReqBody(data)) { return res.status(400).send({ status: false, message: "Insert Data : BAD REQUEST" }); }

        let { productId } = data
        
        // TO CHECK WHEATHER PRODUCTID IS PRESENT OR NOT
        if (!isValidReqBody(productId)) { return res.status(404).send({ status: false, message: "Please Provide ProductId" }) }

        // TO VALIDATE THE PRODUCTID
        if (!isValidObjectId(productId)) { return res.status(404).send({ status: false, message: "Invalid ProductId" }) }

        // DOING DB CALL TO GET ALL DATA FROM PRODUCT MODEL
        let checkProduct = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!checkProduct) { return res.status(404).send({ status: false, message: "Product Do Not Exists or DELETED" }) }
        

        // DB CALL TO CHECK WHETHER THE CART IS PRESENT OR NOT FOR THAT USER
        let checkCartExistsForUserId = await cartModel.findOne({ userId: userIdInPath })

        // IF CART IS FOUND IN DB // TO ADD PRODUCTS
        if (checkCartExistsForUserId) {

            // STORING THE ITEMS DATA PRESENT IN DB OF CART FROM ABOVE DB CALL IN VARIABLE- (ARR2)
            let arr2 = checkCartExistsForUserId.items

            // CREATING AN OBJECT
            let productAdded = {
                productId: productId,
                quantity: 1
            }

            // COMPARE PRODUCTID IS GIVING THE INDEX OF PRODUCTID WITH ( FINDINDEX )
            let compareProductId = arr2.findIndex((obj) => obj.productId == productId);  // 2ND PRODUCT ID- GETTING FROM REQUEST BODY

            if (compareProductId == -1) {  // AGAR PRODUCTID MATCH NI HOTI HAI
                arr2.push(productAdded)     // ADDING NEW PRODUCT
            } else {
                arr2[compareProductId].quantity += 1;       // INCREASING QUANTITY
            }

            // GETTING TOTAL PRICE AFTER ADDING PRODUCT IN ARRAY 
            // GETTING PRICE OF THE PRODUCT BY DOING DB CALL - STORED IN A VARIABLE (CHECK_PRODUCT) & TAKING PRICE FROM THAT
            let totalPriceUpdated = checkCartExistsForUserId.totalPrice + (checkProduct.price)

            //GETTING TOTAL ITEMS BY CHECKING THE LENGTH OF ARRAY
            let totalItemsUpdated = arr2.length

            //STORING ALL THE ITEMS WHICH WE WANT TO UPDATE IN A SINGLE VARIABLE NAMED AS - (DATA_TO_BE_ADDED)
            let dataToBeAdded = {
                items: arr2, 
                totalPrice: totalPriceUpdated,
                totalItems: totalItemsUpdated
            }
            let updatedData = await cartModel.findOneAndUpdate({ userId: userIdInPath },
                dataToBeAdded,
                { new: true }
            )
            return res.status(201).send({ status: true, message: "Success", data: updatedData })
        }

        // IF CART IS NOT FOUND IN DB // TO ADD PRODUCT AND CREATE CART
        if (!checkCartExistsForUserId) {
            
            // TAKING A EMPTY ARRAY
            let arr1 = []

            // CREATING AN OBJECT
            let products = {
                productId: productId,       // GETTING PRODUCT_ID FROM REQUEST BODY
                quantity: 1                 // BY DEFAULT STORING QUANTITY AS 1
            }
            arr1.push(products)
            
            // GETTING TOTAL PRICE WHEN QUANTITY IS INCREASING BY 1
            let totalPriceCalculated = checkProduct.price * products.quantity

            //STORING ALL THE ITEMS WHICH WE WANT TO UPDATE IN A SINGLE VARIABLE NAMED AS - (DATA_TO_BE_CREATED)
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

        // TO CHECK WHEATHER USERID EXISTS OR NOT IN USER_MODEL
        let checkUserId = await userModel.findById({ _id: userIdInPath })
        if (!checkUserId) { return res.status(404).send({ status: false, message: "UserId Do Not Exits" }) }

        let data = req.body
        if (!isValidReqBody(data)) { return res.status(400).send({ status: false, message: "Insert Data : BAD REQUEST" }); }

        let { productId, removeProduct } = data

        // TO CHECK WHEATHER PRODUCTID IS PRESENT OR NOT
        if (!isValidReqBody(productId)) { return res.status(404).send({ status: false, message: "Please Provide ProductId" }) }

        // TO VALIDATE THE PRODUCTID
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

        //IF CART IS FOUND IN DB // TO REDUCE AND REMOVE PRODUCT FROM CART
        if (checkCartExistsForUserId) {

            //************************************IF USER GIVE REMOVEPRODUCT VALUE AS 1*************************************//


            if (removeProduct == 1) {

                arr1[compareProductId].quantity -= 1;        // REDUCING QUANTITY BY 1
                if (arr1[compareProductId].quantity == 0) {  // IF QUANTITY GOES BELOW 1
                    arr1.splice(compareProductId, 1)         // REMOVE THE PRODUCT FROM ITEMS IF QUATITY GOES BELOW 1
                }

                // GETTING TOTAL PRICE AFTER REMOVE PRODUCT IN ARRAY AND DEACREASING IN PRICE 
                let totalPriceUpdated = checkCartExistsForUserId.totalPrice - (checkProduct.price)

                //GETTING TOTAL ITEMS BY CHECKING THE LENGTH OF ARRAY
                let totalItemsUpdated = arr1.length

                //STORING ALL THE ITEMS WHICH WE WANT TO UPDATE IN A SINGLE VARIABLE NAMED AS - (DATA_TO_BE_UPDATED)
                let dataToBeUpdated = {
                    items: arr1,
                    totalPrice: totalPriceUpdated,
                    totalItems: totalItemsUpdated
                }
                let updatedData = await cartModel.findOneAndUpdate({ userId: userIdInPath },
                    dataToBeUpdated,
                    { new: true }
                )
                return res.status(200).send({ status: true, message: "Success", data: updatedData })
            }


            //****************************************IF USER GIVE REMOVEPRODUCT VALUE AS 0**********************************//
            
            
            if (removeProduct == 0) {

                // REMOVING THE PRODUCT FROM SPLICE , HERE (COMPARE_PRODUCT_ID) IS THE INDEX WHICH WE ARE GETTING FROM LINE 145
                let arr2 = arr1.splice(compareProductId, 1)

                // STORING THE QUANTITY OF THE PRODUCT IN A VARIABLE, SO WE CAN USE IT FURTHER TO CALCULATE PRICE
                let quantity = arr2[0].quantity

                // CALCULATING THE TOTAL_PRICE AFTER THE REMOVAL OF THE PRODUCT
                let totalPriceUpdated = checkCartExistsForUserId.totalPrice - (checkProduct.price * quantity)

                //GETTING TOTAL ITEMS BY CHECKING THE LENGTH OF ARRAY
                let totalItemsUpdated = arr1.length

                //STORING ALL THE ITEMS WHICH WE WANT TO UPDATE IN A SINGLE VARIABLE NAMED AS - (DATA_TO_BE_UPDATED)
                let dataToBeUpdated = {
                    items: arr1,
                    totalPrice: totalPriceUpdated,
                    totalItems: totalItemsUpdated
                }
                let updatedData = await cartModel.findOneAndUpdate({ userId: userIdInPath },
                    dataToBeUpdated,
                    { new: true }
                )
                return res.status(200).send({ status: true, message: "Success", data: updatedData })
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
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Invalid UserId" })

        // CHECKING WHEATHER CART EXISTS FOR THE GIVEN USER OR NOT
        let cartData = await cartModel.findOne({ userId: userId })
        if (!cartData) {return res.status(400).send({ status: false, message: "this user has no cart" })}

        res.status(200).send({ status: true, message:"Success", data: cartData })
    }
    catch (err) {
        res.status(500).send({ status: false, message: err })
    }
}

//================================================[DLETE CART API]=======================================================================



const deleteCart = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Invalid UserId" })

        // CHECKING WHEATHER USER IS PRESENT IN USER_MODEL OR NOT
        let checkUser = await userModel.findById(userId)
        if (!checkUser) { return res.status(400).send({ status: false, msg: "User not Found" }) }

        // CHECKING WHEATHER CART IS PRESENT FOR THE GIVEN USER OR NOT
        let Cart = await cartModel.findOne({ userId: userId })
        if (!Cart) {return res.status(404).send({ status: false, msg: "Cart Not Exists" })}

        // EMPTY THE CART BY [ FIND_ONE_AND_UPDATE ] METHOD
        let cartDeleted = await cartModel.findOneAndUpdate({ userId: userId },
            { $set: { items: [], totalItems: 0, totalPrice: 0 } }, 
            { new: true })

        return res.status(204).send({ status: true, message: "Success", data: cartDeleted })
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