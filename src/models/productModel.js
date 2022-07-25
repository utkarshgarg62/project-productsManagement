const mongoose = require('mongoose')

const productSchema = new mongoose.schema({

    title: {
        type: String,
        required: true,
        unique: true
    },

    description: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true,
    },

    currencyId: {
        type: String,
        required: true,
        // INR
    },

    currencyFormat: {
        type: string,
        required: true,
        // Rupee symbol
    },

    isFreeShipping: {
        type: Boolean,
        default: false
    },

    productImage: {
        type: String,
        require: true
    },  // s3 link

    style: {
        type: string
    },

    availableSizes: {
        type: String,
        enum: ["S", "XS", "M", "X", "L", "XXL", "XL"]
    },

    installments: {
        type: Number
    },

    deletedAt: {
        type: Date,
    },

    isDeleted: {
        type: boolean,
        default: false
    },

}, { timeStamp: true })

module.exports = mongoose.model('productModel', productSchema)