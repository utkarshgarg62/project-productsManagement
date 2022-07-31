const orderModel = require("../models/orderModel")


//================================================[CREATE ORDER API=======================================================================


const createOrder = async function (req, res) {
    try {
        let userId =req.params.userId
        let data =req.body
        let dataToBeAdded = {
            userId:userId,


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
        let userId =req.params.userId
        let data =req.body
        let dataToBeUpdated = {
            userId:userId,


        }
        let updatedOrder = await orderModel .findByIdAndUpdate({_id:userId},dataToBeUpdated,{new:true})
        res.status(200).send({status: true, message: 'Success', data: updatedOrder })
    }
    catch(err) {
        res.status(500).send({status: false, message:err })
    }
}

//================================================[MODULE EXPORTS]=======================================================================


module.exports.createOrder = createOrder
module.exports.updateOrder = updateOrder
