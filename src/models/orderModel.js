const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId

const orderSchema = new mongoose.Schema({

    userId: {
        type: ObjectId,
        required: true,
        ref: 'userModel'
    },

    items: [{
        productId: {
            type: ObjectId,
            required: true,
            ref: 'productModel'
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    }],

    totalPrice: {
        type: Number,
        required: true,
    },

    totalItems: {
        type: Number,
        required: true,
    },

    totalQuantity: {
        type: Number,
        required: true,
    },

    cancellable: {
        type: Boolean,
        default: true
    },

    status: {
        type: String,
        default: 'pending',
        enum: ["pending", "completed", "canceled"]
    },

    deletedAt: {
        type: Date,
        comment: "when the document is deleted"
    },

    isDeleted: {
        type: Boolean,
        default: false
    },

}, { timestamps: true })

module.exports = mongoose.model('orderModel', orderSchema)
