const userModel = require('../models/userModel')


const createUser = async function(req,res){
    try{
        let data=req.body
        let userData= await userModel .create(data)
        res.status(201).send({status:true, message: userData})
    }
    catch{
        res.status(501).send({status:true, message: userData})
    }
}

module.exports.createUser=createUser