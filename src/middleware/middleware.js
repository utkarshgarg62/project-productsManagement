const jwt = require("jsonwebtoken");


const authentication = function (req, res, next) {
    try {
        let token = req.headers["x-api-key"]
        if (!token) return res.status(401).send({ status: false, message: "token is not present" })

        jwt.verify(token, "Project_5", (err, decoded) => {
            if (err) {
                res.status(401).send({ status: false, Error: err.message })
            }
            req.token = decoded
        })

        next()

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports.authentication = authentication