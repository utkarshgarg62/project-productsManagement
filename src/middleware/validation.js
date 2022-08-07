const mongoose = require("mongoose")

//Request Body Validation
const isValidReqBody = function (requestBody) {
    return Object.keys(requestBody).length > 0;
};

//Title Validation
const isValidTitle =function(title){
    const  titleRegex =/[a-zA-Z0-9 ]/
    return titleRegex.test(title)
}

//Value Validation
const isValid = function (value) {
    if (typeof value === 'undefined' || value === 'null' ) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}

//Name Validation
const isValidName = function (name) {
    const nameRegex = /^[a-zA-Z]{1,30}$/
    return nameRegex.test(name)
}

//Name Validation
const isValidStyle = function (name) {
    const nameRegex = /^[a-zA-Z ]{1,30}$/
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
    const pincodeRegex = /^[1-9]{1}?[0-9]{5}$/
    return pincodeRegex.test(pincode)
}
//Pincode Price
const isValidPrice = function (price) {
    const priceRegex = /^[1-9]\d{0,6}\.\d{1}$/
    return priceRegex.test(price)
}

//Boolean Validation
const isBoolean = function(value){
    if(value === 'true' || value === 'false') return true
    return false
}

//Number (Price) Validation
const isNumber = function (value){
    const number = /[0-9]/
    return number.test(value)
}

//Installment Validation
const validInstallment = function (value) {
    const installRegex = /^[0-9]{1,2}$/
    return installRegex.test(value)
}

module.exports = {
    isValidReqBody,
    isValid,
    isValidObjectId,
    isValidTitle,
    isValidName,
    isValidStyle,
    isValidEmail,
    isValidMobile,
    isValidPassword,
    isValidPincode,
    isValidPrice,
    isBoolean,
    isNumber,
    validInstallment
}
