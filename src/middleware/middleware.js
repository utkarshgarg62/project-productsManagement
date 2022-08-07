const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const { isValidObjectId } = require("../middleware/validation");

//=====================================================Authentication========================================================================


const authentication = function (req, res, next) {
    try {
        let token = req.headers["authorization"]
        if (!token) return res.status(401).send({ status: false, message: "token is not present" })

        // console.log(token)       // Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiO...
        let token1 = token.split(" ").pop() // For taking the last part as token we are using pop() 
        // console.log(token1)      // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiO...

        let decodedToken = jwt.verify(token1, "project_5", 
        (err, decodedToken) => {
            if (err) {
                return res.status(401).send({ status: false, Error: err.message })
            }
            req.userLoggedIn = decodedToken.userId
        }
        )
        next()

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}




//====================================================Authorization========================================================================



const authorization = async function (req, res, next) {

    try {
        let userLoggedIn = req.userLoggedIn
        let fromParamsUserId = req.params.userId

        if (fromParamsUserId) {
            if (!isValidObjectId(fromParamsUserId)) return res.status(400).send({ status: false, msg: "enter valid userId" })
            let userdata = await userModel.findById(fromParamsUserId)
            if (!userdata) { return res.status(404).send({ status: false, msg: "No User Exists" }) }
            let UserId = userdata._id
            if (UserId != userLoggedIn) {
                return res.status(403).send({ status: false, msg: "User logged is not allowed to change data of another user " })
            }
        }


        next();
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}


//====================================================[MODULE EXPORTS]=====================================================================


module.exports.authentication = authentication
module.exports.authorization = authorization