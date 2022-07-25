const userModel = require('../models/userModel')
const { isValid, isValidObjectId } = require("../middleware/validation")

//================================================[CREATE API FOR USER]=======================================================================


const createUser = async function (req, res) {
    try {
        let data = req.body
        if (Object.keys(data).length < 1) { return res.status(400).send({ status: false, message: "Insert Data : BAD REQUEST" }); }

        let { fname, lname, email, profileImage, phone, password, address } = data

        if (!isValid(fname)) { return res.status(400).send({ status: false, message: "Please Provide First Name" }) }
        if (!isValid(lname)) { return res.status(400).send({ status: false, message: "Please Provide Last Name" }) }
        if (!isValid(email)) { return res.status(400).send({ status: false, message: "Please Provide Email" }) }
        if (!isValid(profileImage)) { return res.status(400).send({ status: false, message: "Please Provide Profile Image" }) }
        if (!isValid(phone)) { return res.status(400).send({ status: false, message: "Please Provide Phone Number" }) }
        if (!isValid(password)) { return res.status(400).send({ status: false, message: "Please Provide Password" }) }
        if (!isValid(address)) { return res.status(400).send({ status: false, message: "Please Provide Address" }) }


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
        const { email, password } = data //<=== destructure the data here

        const userEmail = await userModel.findOne({ email: email })
        let hashedPassword = user.password
        const userPassword = await bcrypt.compare(hashedPassword, password)
        
        let token = jwt.sign({
            userId: userEmail._id,                              // <== unique Id
            email: userEmail.email,                             // <== email
            password: userPassword,                             // <== password        
            at: Math.floor(Date.now() / 1000),                  //issued date
            exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60   //expires in 24 hr 
            
        }, "project_5")    // <==== secret key
        
        
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
        
        if (!userData) return res.status(404).send({ status: false, message: "User is not found " })
        return res.status(200).send({ status: true, message: "user profile details", data: userData })
    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
        
    }
}


//================================================[UPDATE API FOR USER]==========================================================



const updateUser = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Invalid userId" })

        let data = req.body
        if (Object.keys(data).length < 1) { return res.status(400).send({ status: false, message: "Insert Data : BAD REQUEST" }); }

        let Updatedata = await userModel.findOneAndUpdate({ _id: userId }, data, { new: true })
        res.status(201).send({ status: true, message: "User profile Updated", data: Updatedata })
        
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}


//================================================[MODULE EXPORTS]=======================================================================




module.exports.createUser = createUser
module.exports.loginUser=loginUser
module.exports.getUserById=getUserById
module.exports.updateUser = updateUser