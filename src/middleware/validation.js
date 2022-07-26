const mongoose = require("mongoose")

//Request Body Validation
const isValidReqBody = function (requestBody) {
    return Object.keys(requestBody).length > 0;
};



//Value Validation
const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}

//Name Validation
const isValidName = function (name) {
    const nameRegex = /^[a-zA-Z]{2,30}$/
    return nameRegex.test(name)
}

//Email Validation
const isValidEmail = function (email) {
    const emailRegex = /^[a-z0-9][a-z0-9-_\.]+@([a-z]|[a-z0-9]?[a-z0-9-]+[a-z0-9])\.[a-z0-9]{2,10}(?:\.[a-z]{2,10})?$/
    return emailRegex.test(email)
}

//Mobile Validation
const isValidMobile = function (mobile) {
    var re = /^((\+91)?|91)?[6789][0-9]{9}$/;
    return re.test(mobile);
}

//Password Validation
const isValidPassword = function (password) {
    const passRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,15}$/
    return passRegex.test(password)
}

//ObjectId Validation
const isValidObjectId = function (id) {
    var ObjectId = mongoose.Types.ObjectId;
    return ObjectId.isValid(id)
}

//Pincode Validation
const isValidPincode = function (pincode) {
    const pincodeRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,15}$/
    return pincodeRegex.test(pincode)
}



module.exports = {
    isValidReqBody,
    isValid,
    isValidObjectId,
    isValidName,
    isValidEmail,
    isValidMobile,
    isValidPassword,
    isValidPincode
}
