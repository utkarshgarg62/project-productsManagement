// const mongoose = require("mongoose")

//Value Validation
const isValid = function(value){
    if(typeof value ==='undefined' || value ===null)  return false
    if(typeof value ==='string' && value.trim().length ===0)return false
    return true
}

module.exports={
    isValid
}