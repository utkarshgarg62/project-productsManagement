const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId

const orderSchema = new mongoose.schema({

    userId: {
        type: ObjectId,
        required: true,
        refs: 'userModel'
    },

    items: [{
        productId: {
            type: ObjectId,
            require: true,
            refs: 'productModel'
        },

        quantity: {
            ype: Number,
            required: true,
            min: 1
        }
    }],

    totalPrice: {
        type: Number,
        required: true,
        comment: "Holds total price of all the items in the cart"
    },

    totalItems: {
        type: Number,
        required: true,
        comment: "Holds total number of items in the cart"
    },

    totalQuantity: {
        type: Number,
        required: true,
        comment: "Holds total number of quantity in the cart"
    },

    cancellable: {
        type: Boolean,
        default: true
    },

    status: {
        type: String,
        default: 'pending',
        enum: [pending, completed, cancled]
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

mongoose.exports = mongoose.model('orderModel', orderSchema)