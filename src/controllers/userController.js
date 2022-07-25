const userModel = require('../models/userModel')


const createUser = async function(req,res){
    try{
        let data=req.body
        let userData= await userModel.create(data)
        res.status(201).send({status:true, message:'Success', data:userData})
    }
    catch(err){
        res.status(500).send({status:false, message:err})
    }
}

module.exports.createUser=createUser
