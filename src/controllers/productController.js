const productModel = require("../models/productModel")
const userController=require("../controllers/userController")
const { isValidReqBody, isValid, isValidTitle, isValidObjectId, isNumber } = require("../middleware/validation")

//================================================[CREATE API FOR PRODUCT]=======================================================================



const createProducts = async function (req, res) {
    try {
        let data = req.body;


        let files = req.files
        if (!(files && files.length)) {
            return res.status(400).send({ status: false, message: "Please Provide Profile Image" });
        }
        let uploadedproductImage = await userController.uploadFile(files[0])
        data.productImage = uploadedproductImage

        // if (!isValidReqBody(data)) { return res.status(400).send({ status: false, message: "Insert Data : BAD REQUEST" }); }

        // let { title, description, price, currencyId, currencyFormat,
        //     isFreeShipping, productImage, style, availableSizes, installments,
        //     deleteAt, isdDeleted } = data;

        // if (!isValid(title)) { return res.status(400).send({ status: false, message: "Please Provide Title" }) }
        // if (!isValidTitle(title)) { return res.status(400).send({ status: false, message: "Enter a Valid Title" }) }

        // if (!isValid(description)) { return res.status(400).send({ status: false, message: "Please Provide description" }) }

        // if (!isValid(price)) { return res.status(400).send({ status: false, message: "Please Provide price" }) }

        // if (!isValid(currencyId)) { return res.status(400).send({ status: false, message: "Please Provide currencyId" }) }

        // if (!isValid(currencyFormat)) { return res.status(400).send({ status: false, message: "Please Provide currencyFormat" }) }
        // if (!isValid(productImage)) { return res.status(400).send({ status: false, message: "Please Provide productImage" }) }
        // if (!isValid(availableSizes)) { return res.status(400).send({ status: false, message: "Please Provide availableSizes" }) }

        // if (!isBoolean(isFreeShipping)) { return res.status(400).send({ status: false, message: "isFreeShipping can only be true/false" }) }



        // let checkTitle = await productModel.findOne({ title: title })
        // if (checkTitle) return res.status(400).send({ status: false, message: "Title already exists" })


        let CreatedData = await productModel.create(data)
        return res.status(201).send({ status: true, message: 'Success', data: CreatedData })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err })
    }
}


//================================================[GET API FOR PRODUCT]==================================================================


const getProductsById = async function (req, res) {
    try {
        let productId = req.params.productId
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Incorrect Product Id format" })

        let data = await productModel.findById({ _id: productId })
        if (!data) {
            return res.status(404).send({ status: false, message: "product Id not found" })
        }
        if (data.isDeleted == true) {
            return res.status(400).send({ status: false, message: "data is already deleted" })
        }
        else {
            return res.status(200).send({ status: true, message: "success", data: data })
        }

    } catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
}


//================================================[UPDATE API FOR PRODUCT]==================================================================



const updateProduct = async function (req, res) {
    try {
        let ProductId = req.params.productId

        let data = req.body

        let { title, description, price, currencyId, currencyFormat, isFreeShipping, productImage, style, availableSizes, installments } = data

        if (!isValidObjectId(ProductId)) return res.status(400).send({ status: false, message: "Invalid ProductId" })

        let Product = await productModel.findOne({ _id: ProductId, isDeleted: false })
        if (!Product) { return res.status(404).send({ status: false, message: "Product not exist in DB" }) }

        if (!isValidReqBody(data)) { return res.status(400).send({ status: false, message: "Insert Data : BAD REQUEST" }); }

        if (data.hasOwnProperty("title")) {
            if (!isValid(title)) { return res.status(400).send({ status: false, message: "Please Provide title " }) }
            if (!isValidName(title)) { return res.status(400).send({ status: false, message: "Enter a Valid title !" }) }
        }

        if (data.hasOwnProperty("description")) {
            if (!isValid(description)) { return res.status(400).send({ status: false, message: "Please Provide description" }) }
            if (!isValidName(description)) { return res.status(400).send({ status: false, message: "Enter a Valid description !" }) }
        }

        if (data.hasOwnProperty("price")) {
            if (!isNumber(price)) { return res.status(400).send({ status: false, message: "Please Provide price" }) }
            if (!isValidPrice(price)) { return res.status(400).send({ status: false, message: "Enter a Valid price !" }) }
        }

        if (data.hasOwnProperty("style")) {
            if (!isValid(style)) { return res.status(400).send({ status: false, message: "Please Provide price" }) }
            if (!isValidName(style)) { return res.status(400).send({ status: false, message: "Enter a Valid price !" }) }
        }

        if (data.hasOwnProperty("productImage")) {
            if (!isValidName(productImage)) { // <===========================   MUST BE A PROBLEM IN THIS LINE  
                return res.status(400).send({ status: false, message: "productImage is missing ! " })
            }
        }

        if (data.hasOwnProperty("isFreeShipping")) {
            if (!isBoolean(isFreeShipping)) {  // <=========================== There Must be a problem 
                return res.status(400).send({ status: false, message: "Boolean Value should be present ! " })
            }
        }

        if (data.hasOwnProperty("installments")) {
            if (!isNumber(installments)) { return res.status(400).send({ status: false, message: "Please Provide price" }) }
            if (!isValidPrice(installments)) { return res.status(400).send({ status: false, message: "Enter a Valid price !" }) }
        }

        // ===============================================================>
        //  <====== ₹
        // currencyId, currencyFormat, availableSizes <===== this are incompleted

        let Updatedata = await userModel.findOneAndUpdate({ _id: userId }, data, { new: true })
        res.status(201).send({ status: true, message: "User profile Updated", data: Updatedata })


    } catch (err) {
        res.status(500).send({ status: false, message: err })
    }
}



//================================================[DLETE API FOR PRODUCT]==================================================================




const deleteProduct = async function (req, res) {

    try {
        let ProductId = req.params.productId
        let date = new Date()

        let Product = await productModel.findOne({ _id: ProductId, isDeleted: false })
        if (!Product) { return res.status(404).send({ status: false, message: "Product not exist in DB" }) }

        let check = await productModel.findOneAndUpdate(
            { _id: BookId }, { isDeleted: true, deletedAt: date }, { new: true })

        return res.status(200).send({ status: true, message: "success", data: check })


    } catch (err) {
        res.status(500).send({ status: false, message: err })
    }
}

//================================================[MODULE EXPORTS]==================================================================



module.exports.updateProduct = updateProduct
module.exports.deleteProduct = deleteProduct
module.exports.createProducts = createProducts
module.exports.getProductsById = getProductsById