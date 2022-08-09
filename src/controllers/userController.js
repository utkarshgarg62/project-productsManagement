const userModel = require('../models/userModel')
const aws=require("../aws/aws_config")
const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt');
const saltRounds = 10;

const { 
    isValid, 
    isValidObjectId, 
    isValidName, 
    isValidEmail, 
    isValidMobile, 
    isValidPassword, 
    isValidReqBody, 
    isValidPincode 
} = require("../middleware/validation")




//================================================[CREATE API FOR USER]=======================================================================


const createUser = async function (req, res) {
    try {

        let data = req.body
        if (!isValidReqBody(data)) { return res.status(400).send({ status: false, message: "Insert Data : BAD REQUEST" }); }

        let { fname, lname, email, phone, password, address } = data

        if (!isValid(fname)) { return res.status(400).send({ status: false, message: "Please Provide First Name" }) }
        if (!isValidName(fname)) { return res.status(400).send({ status: false, message: "Enter a Valid Fname" }) }


        if (!isValid(lname)) { return res.status(400).send({ status: false, message: "Please Provide Last Name" }) }
        if (!isValidName(lname)) { return res.status(400).send({ status: false, message: "Enter a Valid Lname" }) }


        if (!isValid(email)) { return res.status(400).send({ status: false, message: "Please Provide Email" }) }
        if (!isValidEmail(email)) { return res.status(400).send({ status: false, message: "Enter a Valid Email" }) }


        let files = req.files
        if (!(files && files.length)) {
            return res.status(400).send({ status: false, message: "Please Provide Profile Image" });
        }
        let uploadedprofileImage = await aws.uploadFile(files[0])
        data.profileImage = uploadedprofileImage


        if (!isValid(phone)) { return res.status(400).send({ status: false, message: "Please Provide Phone Number" }) }
        if (!isValidMobile(phone)) { return res.status(400).send({ status: false, message: "Enter a Valid Phone Number" }) }


        if (!isValid(password)) { return res.status(400).send({ status: false, message: "Please Provide Password" }) }
        if (!isValidPassword(password)) { return res.status(400).send({ status: false, message: "Minimum eight characters, at least 1 letter and 1 number in Password : Min 8 and Max 15" }) }

        const convertedPassword = bcrypt.hashSync(password, saltRounds);
        data.password = convertedPassword

        //Address Validation
        if (!isValid(address)) { return res.status(400).send({ status: false, message: "Please Provide Address" }) }
        let add = JSON.parse(address)
        if (!isValid(add.shipping))
            return res.status(400).send({ status: false, message: "shipping address required" });
        if (!isValid(add.billing))
            return res.status(400).send({ status: false, message: "billing address required" });
        if (!isValid(add.shipping.city))
            return res.status(400).send({ status: false, message: "shipping city required" });
        if (!isValid(add.shipping.street))
            return res.status(400).send({ status: false, message: "shipping street required" });
        if (!isValid(add.shipping.pincode))
            return res.status(400).send({ status: false, message: "shipping pincode required" });
        if (!isValidPincode(add.shipping.pincode))
            return res.status(400).send({ status: false, message: "shipping pincode invalid" });
        if (!isValid(add.billing.street))
            return res.status(400).send({ status: false, message: "billing street required" });
        if (!isValid(add.billing.city))
            return res.status(400).send({ status: false, message: "billing city required" });
        if (!isValid(add.billing.pincode))
            return res.status(400).send({ status: false, message: "billing pincode required" });
        if (!isValidPincode(add.billing.pincode))
            return res.status(400).send({ status: false, message: "billing pincode invalid" })
        data.address = add
        //validation ends

        let checkEmail = await userModel.findOne({ email: email })
        if (checkEmail) return res.status(400).send({ status: false, message: "Email already exists" })

        let checkPhone = await userModel.findOne({ phone: phone })
        if (checkPhone) return res.status(400).send({ status: false, message: "Phone Number already exists" })


        let userData = await userModel.create(data)
        res.status(201).send({ status: true, message: 'Success', data: userData })
    }
    catch (err) {
        res.status(500).send({ status: false, message: err })
    }
}


//================================================[LOGIN API FOR USER]=======================================================================

const loginUser = async function (req, res) {
    try {

        let data = req.body

        if (!isValidReqBody(data)) { return res.status(400).send({ status: false, message: "Insert Data : BAD REQUEST" }); }

        let { email, password } = data

        if (!email) { return res.status(400).send({ status: false, message: "Please provide email" }); }
        if (!password) { return res.status(400).send({ status: false, message: "Please provide password" }); }


        const userEmail = await userModel.findOne({ email: email })
        if (!userEmail) { return res.status(401).send({ status: false, message: "Invalid Email" }) }

        let hashedPassword = userEmail.password
        let userPassword = bcrypt.compareSync(password, hashedPassword)

        if (!userPassword) { return res.status(401).send({ status: false, message: "Invalid Password" }) }

        let userId = userEmail._id
        let token = jwt.sign({

            userId: userId,                                     //unique Id
            at: Math.floor(Date.now() / 1000),                  //issued date
            exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60   //expires in 24 hr 

        }, "project_5")


        res.header("Authorization", token);
        res.status(200).send({ status: true, message: 'Success', data: { userId, token } });

    }
    catch (err) {
        res.status(500).send({ status: false, message: err })
    }
}



//================================================[GET API FOR USER]==================================================================



const getUserById = async function (req, res) {
    try {

        const userId = req.params.userId
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Invalid userId" })

        let userData = await userModel.findOne({ _id: userId })
        if (!userData) return res.status(404).send({ status: false, message: "User not found " })

        res.status(200).send({ status: true, message: "Fetch user details is successful", data: userData })

    }
    catch (err) {
        res.status(500).send({ status: false, message: err })

    }
}


//================================================[UPDATE API FOR USER]==========================================================



const updateUser = async function (req, res) {
  
    try {
        let data = req.body;
        if (!isValidReqBody(data)) return res.status(400).send({ status: false, message: "Insert Data : BAD REQUEST" });

        let userId = req.params.userId
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Invalid userId" })

        let userProfile = await userModel.findById({ _id: userId })
        if (!userProfile) { return res.status(404).send({ status: false, message: "user not found" }) }

        let { fname, lname, email, phone, password, address, profileImage } = data

        let files = req.files

        if (files) {
            if (isValidReqBody(files)) {
                if (!(files && files.length > 0)) {
                    return res.status(400).send({ status: false, message: "please provide profile image" })
                }
                var updatedProfileImage = await aws.uploadFile(files[0])
                // console.log(updatedProfileImage)
            }
            data.profileImage = updatedProfileImage
        }

        if (isValid(fname) || fname =="" ) {
            if (!isValid(fname)) { return res.status(400).send({ status: false, message: "Please Provide First Name" }) }
            if (!isValidName(fname)) { return res.status(400).send({ status: false, message: "Enter a Valid Fname !" }) }
            userProfile.fname = fname
        }


        if (isValid(lname) || lname =="" ) {
            if (!isValid(lname)) { return res.status(400).send({ status: false, message: "Please Provide Last Name" }) }
            if (!isValidName(lname)) { return res.status(400).send({ status: false, message: "Enter a Valid Lname !" }) }
            userProfile.lname = lname
        }

        if (isValid(email) || email =="" ) {
            if (!isValid(email)) { return res.status(400).send({ status: false, message: "Please Provide Email" }) }
            if (!isValidEmail(email)) { return res.status(400).send({ status: false, message: "Enter a Valid Email !" }) }

            let checkEmail = await userModel.findOne({ email: email })
            if (checkEmail) return res.status(400).send({ status: false, message: "Email already exists" })
            userProfile.email = email
        }

        if (isValid(phone) || phone =="" ) {
            if (!isValid(phone)) { return res.status(400).send({ status: false, message: "Please Provide Phone Number" }) }
            if (!isValidMobile(phone)) { return res.status(400).send({ status: false, message: "Enter a Valid Phone Number! " }) }

            let checkPhone = await userModel.findOne({ phone: phone })
            if (checkPhone) return res.status(400).send({ status: false, message: "Phone Number already exists" })
            userProfile.phone = phone
        }

        if (isValid(password) || password =="" ) {
            if (!isValid(password)) { return res.status(400).send({ status: false, message: "Please Provide Password" }) }
            if (!isValidPassword(password)) { return res.status(400).send({ status: false, message: "Enter a Valid password 8 min and 15 max !" }) }

            const hashedPass = bcrypt.hashSync(data.password, saltRounds);
            data.password = hashedPass
        }


        //Address validation ->
        if (isValid(address)) {
            let add = JSON.parse(data.address)
            data.address=add


            if (add.shipping) {
                if (typeof add.shipping != 'object' || Object.keys(add.shipping).length == 0)
                    return res.status(400).send({ status: false, message: "Shipping address not valid" })

                if (add.shipping.street) {
                    if (!isValid(add.shipping.street))
                        return res.status(400).send({ status: false, message: "Shipping address street not valid" })
                    userProfile.address.shipping.street = add.shipping.street

                }if (add.shipping.city) {
                    if (!isValid(add.shipping.city))
                        return res.status(400).send({ status: false, message: "Shipping address city not valid" })
                    userProfile.address.shipping.city = add.shipping.city

                } if (add.shipping.pincode) {
                    if (!isValid(add.shipping.pincode) || !isValidPincode(add.shipping.pincode))
                        return res.status(400).send({ status: false, message: "Shipping address pincode not valid" })
                    userProfile.address.shipping.pincode = add.shipping.pincode
                }
            }
            if (add.billing) {
                if (typeof add.billing != 'object' || Object.keys(add.billing).length == 0)
                    return res.status(400).send({ status: false, message: "billing address not valid" })

                if (add.billing.street) {
                    if (!isValid(add.billing.street))
                        return res.status(400).send({ status: false, message: "Billing address street not valid" })
                    userProfile.address.billing.street = add.billing.street

                } if (add.billing.city) {
                    if (!isValid(add.billing.city))
                        return res.status(400).send({ status: false, message: "billing address city not valid" })
                    userProfile.address.billing.city = add.billing.city

                } if (add.billing.pincode) {
                    if (!isValid(add.billing.pincode) || !isValidPincode(add.billing.pincode))
                        return res.status(400).send({ status: false, message: "billing pincode invalid" })
                    userProfile.address.billing.pincode = add.billing.pincode

                }
            }
        }




        let Updatedata = await userModel.findOneAndUpdate({ _id: userId }, data, { new: true })
        res.status(200).send({ status: true, message: "User profile Updated", data: Updatedata })
    }
    catch (err) {
        res.status(500).send({ status: false, message: err })
    }
}


//================================================[MODULE EXPORTS]=======================================================================




module.exports.createUser = createUser
module.exports.loginUser = loginUser
module.exports.getUserById = getUserById
module.exports.updateUser = updateUser
