const userModel = require('../models/userModel')
const { isValid } = require("../middleware/validation")


const createUser = async function(req,res){
    try{
        let data=req.body
        if (Object.keys(data).length<1)
            {return res.status(400).send({ status: false, message: "Insert Data : BAD REQUEST" });}

        let {fname,lname,email,profileImage,phone,password,address}=data

        if(!isValid(fname)) { return res.status(400).send({status:false, message:"Please Provide First Name"}) }
        if(!isValid(lname)) { return res.status(400).send({status:false, message:"Please Provide Last Name"}) }
        if(!isValid(email)) { return res.status(400).send({status:false, message:"Please Provide Email"}) }
        if(!isValid(profileImage)) { return res.status(400).send({status:false, message:"Please Provide Profile Image"}) }
        if(!isValid(phone)) { return res.status(400).send({status:false, message:"Please Provide Phone Number"}) }
        if(!isValid(password)) { return res.status(400).send({status:false, message:"Please Provide Password"}) }
        if(!isValid(address)) { return res.status(400).send({status:false, message:"Please Provide Address"}) }


        let checkEmail=await userModel.findOne({email:email})
        if(checkEmail) return res.status(400).send({status: false, message :"Email already exists"})

        let checkPhone=await userModel.findOne({phone:phone})
        if(checkPhone) return res.status(400).send({status: false, message :"Phone Number already exists"})
        

        let userData= await userModel.create(data)
        res.status(201).send({status:true, message:'Success', data:userData})
    }
    catch(err){
        res.status(500).send({status:false, message:err})
    }
}

module.exports.createUser=createUser




const updateUser = async function(req,res){
    try{
        let userId = req.params.userId
        let data = req.body
        let Updatedata = await userModel.findByIdAndUpdate({_id:userId}, data, {new:true})
        res.status(201).send({status:true,message:"User profile Updated", data:Updatedata})

    }
    catch(err){
        res.status(500).send({status:false, message:err.message})
    }
}

module.exports.updateUser=updateUser