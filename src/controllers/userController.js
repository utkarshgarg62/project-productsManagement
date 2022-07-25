const userModel = require('../models/userModel')
const bcrypt = require ('bcrypt');

const createUser = async function (req, res) {
    try {
        let data = req.body
        let userData = await userModel.create(data)
        res.status(201).send({ status: true, message: userData })
    }
    catch {
        res.status(501).send({ status: true, message: userData })
    }
}



const loginUser = async function (req, res) {
    try {

        let data = req.body
        const { email, password } = data //<=== destructure the data here

        const userEmail = await userModel.findOne({ email: email })
        let hashedPassword = user.password
        const userPassword = await bcrypt.compare( hashedPassword, password)

        let token = jwt.sign({
            userId: userEmail._id,                              // <== unique Id
            email: userEmail.email,                             // <== email
            password: userPassword,                             // <== password        
            at: Math.floor(Date.now() / 1000),                  //issued date
            exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60   //expires in 24 hr 
        
        },  "project_5" )    // <==== secret key


        res.status(200).setHeader("x-api-key", token);
        res.status(200).send({ status: true, message: 'Success', data: { userId, token } });

    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports.createUser = createUser
module.exports.loginUser = loginUser