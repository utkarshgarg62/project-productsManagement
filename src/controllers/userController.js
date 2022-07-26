const userModel = require('../models/userModel')
const { isValid, isValidObjectId, isValidName, isValidString, isValidEmail, isValidMobile, isValidPassword, isValidReqBody } = require("../middleware/validation")
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require("jsonwebtoken")

//================================================[CREATE API FOR USER]=======================================================================


const createUser = async function (req, res) {
    try {

        let data = req.body

        if (!isValidReqBody(data)) { return res.status(400).send({ status: false, message: "Insert Data : BAD REQUEST" }); }

        let { fname, lname, email, profileImage, phone, password, address } = data

        if (!isValid(fname)) { return res.status(400).send({ status: false, message: "Please Provide First Name" }) }
        if (!isValidName(fname)) { return res.status(400).send({ status: false, message: "Enter a Valid Fname" }) }


        if (!isValid(lname)) { return res.status(400).send({ status: false, message: "Please Provide Last Name" }) }
        if (!isValidName(lname)) { return res.status(400).send({ status: false, message: "Enter a Valid Lname" }) }


        if (!isValid(email)) { return res.status(400).send({ status: false, message: "Please Provide Email" }) }
        if (!isValidEmail(email)) { return res.status(400).send({ status: false, message: "Enter a Valid Email" }) }


        if (!isValid(profileImage)) { return res.status(400).send({ status: false, message: "Please Provide Profile Image" }) }


        if (!isValid(phone)) { return res.status(400).send({ status: false, message: "Please Provide Phone Number" }) }
        if (!isValidMobile(phone)) { return res.status(400).send({ status: false, message: "Enter a Valid Phone Number" }) }


        if (!isValid(password)) { return res.status(400).send({ status: false, message: "Please Provide Password" }) }
        if (!isValidPassword(password)) { return res.status(400).send({ status: false, message: "Minimum eight characters, at least 1 letter and 1 number in Password : Min 8 and Max 15" }) }

        const hash = bcrypt.hashSync(password, saltRounds);
        data.password = hash


        if (!isValid(address)) { return res.status(400).send({ status: false, message: "Please Provide Address" }) }

        if (address.shipping) {
            if (!isValidReqBody(address.shipping.street)) {
                return res.status(400).send({ status: false, message: "Shipping address's Street is Required" })
            }

            if (!isValidReqBody(address.shipping.city)) {
                return res.status(400).send({ status: false, message: "Shipping address's City is Required" })
            }

            if (!isValidReqBody(address.shipping.pincode)) {
                return res.status(400).send({ status: false, message: "Shipping address's Pincode is Required" })

            }
        } else { return res.status(400).send({ status: false, message: "Shipping address is Required" }) }



        if (address.billing) {
            if (!isValidReqBody(address.billing.street)) {
                return res.status(400).send({ status: false, message: "Billing address's Street is Required" })
            }

            if (!isValidReqBody(address.billing.city)) {
                return res.status(400).send({ status: false, message: "Billing address's City is Required" })
            }

            if (!isValidReqBody(address.billing.pincode)) {
                return res.status(400).send({ status: false, message: "Billing address's Pincode is Required" })

            }
        } else { return res.status(400).send({ status: false, message: "Billing address is Required" }) }



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


        res.status(200).setHeader("x-api-key", token);
        res.status(200).send({ status: true, message: 'Success', data: { userId, token } });

    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}



//================================================[GET API FOR USER]==================================================================



const getUserById = async function (req, res) {
    try {

        const userId = req.params.userId

        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Invalid userId" })

        const userData = await userModel.findOne({ _id: userId })
            .select({ address: 1, _id: 1, fname: 1, lname: 1, email: 1, profileImage: 1, phone: 1, password: 1 })

        if (!userData) return res.status(404).send({ status: false, message: "User not found " })

        return res.status(200).send({ status: true, message: "user profile details", data: userData })

    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })

    }
}


//================================================[UPDATE API FOR USER]==========================================================



const updateUser = async function (req, res) {
    try {

        let userId = req.params.userId

        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Invalid userId" })

        let checkUser = await userModel.findById({ _id: userId })
        if (!checkUser) { return res.status(404).send({ status: false, message: "user not found" }) }

        let data = req.body

        let { fname, lname, email, profileImage, phone, password, address } = data
        
        if (!isValidReqBody(data)) { return res.status(400).send({ status: false, message: "Insert Data : BAD REQUEST" }); }

        if (data.hasOwnProperty("fname")) {
            if (!isValid(fname)) { return res.status(400).send({ status: false, message: "Please Provide First Name" }) }
            if (!isValidName(fname)) { return res.status(400).send({ status: false, message: "Enter a Valid Fname !" }) }
        }


        if (data.hasOwnProperty("lname")) {
            if (!isValid(lname)) { return res.status(400).send({ status: false, message: "Please Provide Last Name" }) }
            if (!isValidName(lname)) { return res.status(400).send({ status: false, message: "Enter a Valid Lname !" }) }
        }

        if (data.hasOwnProperty("email")) {
            if (!isValid(email)) { return res.status(400).send({ status: false, message: "Please Provide Email" }) }
            if (!isValidEmail(email)) { return res.status(400).send({ status: false, message: "Enter a Valid Email !" }) }

            let checkEmail = await userModel.findOne({ email: email })
            if (checkEmail) return res.status(400).send({ status: false, message: "Email already exists" })
        }

        if (data.hasOwnProperty("profileImage")) {
            if (!isValidName(profileImage)) {
                return res.status(400).send({ status: false, message: "ProfileImage is missing ! " })
            }
        }

        if (data.hasOwnProperty("phone")) {
            if (!isValid(phone)) { return res.status(400).send({ status: false, message: "Please Provide Phone Number" }) }
            if (!isValidMobile(phone)) { return res.status(400).send({ status: false, message: "Enter a Valid Phone Number! " }) }

            let checkPhone = await userModel.findOne({ phone: phone })
            if (checkPhone) return res.status(400).send({ status: false, message: "Phone Number already exists" })
        }

        if (data.hasOwnProperty("password")) {
            if (!isValid(password)) { return res.status(400).send({ status: false, message: "Please Provide Password" }) }
            if (!isValidPassword(password)) { return res.status(400).send({ status: false, message: "Enter a Valid password 8 min and 15 max !" }) }

            const hash = bcrypt.hashSync(password, saltRounds);     // <== 
            data.password = hash
        }

        // if (address) {
        //     if (!isValidPassword(password)) {
        //         return res.status(400).send({ status: false, message: "Minimum eight characters, at least 1 letter and 1 number in Password : Min 8 and Max 15" })
        //     }
        // }

        let Updatedata = await userModel.findOneAndUpdate({ _id: userId }, data, { new: true })
        res.status(201).send({ status: true, message: "User profile Updated", data: Updatedata })

    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}


//================================================[MODULE EXPORTS]=======================================================================




module.exports.createUser = createUser
module.exports.loginUser = loginUser
module.exports.getUserById = getUserById
module.exports.updateUser = updateUser
