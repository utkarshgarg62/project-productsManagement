const cartModel = require("../models/cartModel")
const orderModel = require("../models/orderModel")
const userModel = require("../models/userModel")
const { isValid, isValidObjectId, isValidReqBody, } = require("../middleware/validation")


//================================================[CREATE ORDER API=======================================================================


const createOrder = async function (req, res) {
    try {
        let userIdInPath =req.params.userId
        if (!isValidObjectId(userIdInPath)) { return res.status(404).send({ status: false, message: "Invalid UserId" }) }

        let checkUserId = await userModel.findById({ _id: userIdInPath })
        if (!checkUserId) { return res.status(404).send({ status: false, message: "UserId Do Not Exits" }) }

        let data =req.body
        let { cancellable, status  }= data

        if(cancellable==false && status == "cancled"){
            return res.status(400).send({status:false,message:"user can not cancel this order as this order has cancellable - false"})
        }

        let cartDetails= await cartModel .findOne({userId:userIdInPath})
        if(!cartDetails){return res.status(404).send({status:false,message:"Cart Do not Exists"})}

        
        let sum = 0;
        for (let i = 0; i < cartDetails.items.length; i++) {
            sum = sum + cartDetails.items[i].quantity
        }
        let totalQuantity = sum


        let dataToBeAdded = {
            userId:cartDetails.userId,
            items:cartDetails.items,
            totalPrice:cartDetails.totalPrice,
            totalItems:cartDetails.totalItems,
            totalQuantity:totalQuantity,
            cancellable:data.cancellable,
            status:data.status,
        }
        let createdOrder = await orderModel .create(dataToBeAdded)
        res.status(201).send({status: true, message: 'Success', data: createdOrder })
    }
    catch(err) {
        res.status(500).send({status: false, message:err })
    }
}

//================================================[UPDATE ORDER API]=======================================================================


const updateOrder = async function (req, res) {
    try {
        let userIdInPath = req.params.userId
        if (!isValidObjectId(userIdInPath)) { return res.status(400).send({ status: false, message: "Invalid userId" }) }

        let checkUserId = await userModel.findById({ _id: userIdInPath })
        if (!checkUserId) { return res.status(404).send({ status: false, message: "UserId Do Not Exits" }) }

        let data = req.body
        if (!isValidReqBody(data)) { return res.status(400).send({ status: false, message: "Insert Data : BAD REQUEST" }); }

        const { orderId, status } = data

        let order = await orderModel.findOne({ _id: orderId, isDeleted: false })
        if (!order) { return res.status(404).send({ status: false, message: "Order is not exist in DB" }) }

        if(userIdInPath != order.userId){
            return res.status(400).send({status:false,message:"This order does not belong to the given userId"})
        }

        if(order.cancellable==false && status == "cancled"){
            return res.status(400).send({status:false,message:"user can not cancel this order as this order has cancellable - false"})
        }

        // if(order.status=='completed' ){
        //     return res.status(400).send({status:false,message:"user can not cancel this order as this order has cancellable - false"})
        // } // to be handled

        // STATUS VALIDATION
        if (status || status == "") {
            if (!isValid(status)) { return res.status(400).send({ status: false, message: "Please Provide status" }) }
            if (!((status == 'pending') || (status == 'cancled') || (status == 'completed'))) { return res.status(400).send({ status: false, message: "'pending', 'cancled', 'completed' are suitable for the status " }) }
        }

        
        let updatedOrder = await orderModel.findByIdAndUpdate({ _id: orderId }, data, { new: true })
        res.status(200).send({ status: true, message: 'Success', data: updatedOrder })
    }
    catch(err) {
        res.status(500).send({status: false, message:err })
    }
}

//================================================[MODULE EXPORTS]=======================================================================


module.exports.createOrder = createOrder
module.exports.updateOrder = updateOrder
