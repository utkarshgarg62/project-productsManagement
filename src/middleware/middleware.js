const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const { isValidObjectId } = require("../middleware/validation");

//=====================================================Authentication========================================================================


const authentication = function (req, res, next) {
    try {
        let token = req.headers["authorization"]
        if (!token) return res.status(401).send({ status: false, message: "Token is not Present" })

        // console.log(token)       // Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiO...

        let token1 = token.split(" ").pop() // For taking the last part as token we are using pop() 

        // console.log(token1)      // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiO...

        let decodedToken = jwt.verify(token1, "project_5", 
        (err, decodedToken) => {
            if (err) {
                return res.status(401).send({ status: false, message: err })
            }

            // STORING THE DECODED TOKEN USER_ID IN A RESPONSE BODY , FOR FURTHER USE IN AUTHORIZATION
            req.userLoggedIn = decodedToken.userId
        })

        next()

    } catch (err) {
        return res.status(500).send({ status: false, message: err })
    }
}




//====================================================Authorization========================================================================



const authorization = async function (req, res, next) {

    try {

        // TAKING THE USER_LOGGED_IN FROM AUTHENTICATION - RESPONSE
        let userLoggedIn = req.userLoggedIn

        // STORING THE USERID IN A VARIABLE GETTING FROM PATH PARAMS
        let fromParamsUserId = req.params.userId

        if (fromParamsUserId) {

            // VALIDATING USER_ID
            if (!isValidObjectId(fromParamsUserId)) return res.status(400).send({ status: false, msg: "Invalid UserId" })

            // CHECKING WHEATHER USER_ID IN A USER_MODEL
            let userdata = await userModel.findById(fromParamsUserId)
            if (!userdata) { return res.status(404).send({ status: false, msg: "No User Exists" }) }

            // STORING THE USER_ID IN A VARIABLE GETTING FROM ABOVE DB CALL IN LINE 55
            let UserId = userdata._id

            // COMPARE THE BOTH USER_ID GETTING FROM PATH PARAMS AND DECODED TOKEN
            if (UserId != userLoggedIn) {
                return res.status(403).send({ status: false, message: "User logged is not allowed to change data of another user " })
            }
        }

        next();
    }
    catch (err) {
        res.status(500).send({ status: false, message: err })
    }
}


//====================================================[MODULE EXPORTS]=====================================================================


module.exports.authentication = authentication
module.exports.authorization = authorization