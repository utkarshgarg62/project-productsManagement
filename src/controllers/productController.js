const productModel = require("../models/productModel")
const aws = require("../aws/aws_config")

const {
    isValidReqBody,
    isValid,
    isValidObjectId,
    isValidTitle,
    isValidName,
    isValidPrice,
    isBoolean,
    isNumber,
    isValidEmail,
    isValidMobile,
    isValidPassword,
    isValidPincode
} = require("../middleware/validation")

//================================================[CREATE API FOR PRODUCT]=======================================================================


const createProducts = async function (req, res) {

    try {
        let data = req.body;
        if (!isValidReqBody(data)) { return res.status(400).send({ status: false, message: "Insert Data : BAD REQUEST" }); }


        //*************************** [DESTRUCTURINGP DATA] ********************/

        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, installments } = data;

        //*************************** [CHECKING VALIDATION OF REQUIRED :TRUE] ********************/


        if (!isValid(title)) { return res.status(400).send({ status: false, message: "Please Provide Title" }) }
        if (!isValid(description)) { return res.status(400).send({ status: false, message: "Please Provide description" }) }
        if (!isValid(price)) { return res.status(400).send({ status: false, message: "Please Provide price" }) }
        if (!isValid(currencyId)) { return res.status(400).send({ status: false, message: "Please Provide currencyId" }) }
        if (!isValid(currencyFormat)) { return res.status(400).send({ status: false, message: "Please Provide currencyFormat" }) }
        // if (!isValid(availableSizes)) { return res.status(400).send({ status: false, message: "Please Provide availableSizes" }) }

        //*************************** [Style Validation] ********************/

        if (!isValid(style)) { return res.status(400).send({ status: false, message: "Please Enter Valid Style" }) }

        //*************************** [Prize Validation] ********************/

        if (!isValid(price))
            return res.status(400).send({ status: false, message: "price required" });
        if (price == 0)
            return res.status(400).send({ status: false, message: "price can't be 0" })
        if (!price.match(/^\d{0,8}(\.\d{1,4})?$/))
            return res.status(400).send({ status: false, message: "price invalid" })


        //*************************** [Title Validation] ********************/


        if (!isValidTitle(title)) { return res.status(400).send({ status: false, message: "Enter a Valid Title" }) }

        let checkTitle = await productModel.findOne({ title: title })
        if (checkTitle) return res.status(400).send({ status: false, message: "Title already exists" })


        //*************************** [Currency Id Validation] *****************/

        if (currencyId.trim() !== 'INR')
            return res.status(400).send({ status: false, message: "currencyId must be INR only" });

        //*************************** [Currency Format Validation] ************/

        if (currencyFormat.trim() !== '₹')
            return res.status(400).send({ status: false, message: "currencyformat must be ₹ only" });

        //*************************** [Installments Validation] ************/

        if (isValid(installments)) {
            if (!validInstallment(installments))
                return res.status(400).send({ status: false, message: "Installment is Invalid :Enter 2 digit Number" });
        }

        //*************************** [Available Sizes Validation] ************/


        let availableSizes = req.body.availableSizes.split(",").map(x => x.trim())

        for (let i = 0; i < availableSizes.length; i++) {       // <=== running a for loop here

            if (!(["S", "XS", "M", "X", "L", "XXL", "XL"].includes(availableSizes[i]))) {
                // console.log(availableSizes[i])
                return res.status(400).send({ status: false, message: "Size should be among ['S','XS','M','X','L','XXL','XL'] only!" })
            }

            if (availableSizes.indexOf(availableSizes[i]) != i) {
                return res.status(400).send({ status: false, message: "Size not present!" })
            }
        }
        data.availableSizes = availableSizes

        //*************************** [isFreeShipping Validation] ************/

        if (typeof isFreeShipping != 'undefined') {
            isFreeShipping = isFreeShipping.trim()
            if (!["true", "false"].includes(isFreeShipping)) {
                return res.status(400).send({ status: false, message: "isFreeshipping is a boolean type only :Ex- true / false" });
            }
        }

        //*************************** [Product Image Validation] ************/

        let files = req.files
        if (!(files && files.length > 0)) {
            return res.status(400).send({ status: false, message: "Please Provide Profile Image" });
        }
        let uploadedproductImage = await aws.uploadFile(files[0])
        data.productImage = uploadedproductImage

        //*************************** [Creating Data] ***********************/

        let CreatedData = await productModel.create(data)
        res.status(201).send({ status: true, message: 'Success', data: CreatedData })
    }
    catch (err) {
        res.status(500).send({ status: false, message: err })
    }
}

//================================================[GET API]===================================================================================


const getProduct = async function (req, res) {

    try {
        let filter = req.query;
        let query = { isDeleted: false };


        if (filter) {
            const { name, size, priceSort, priceGreaterThan, priceLessThan } = filter;

            //*************************** [Filtering By Size] ***********************/

            if (isValid(size)) {
                if (!isValid(size)) { return res.status(400).send({ status: false, message: "Enter size" }) }
                query['availableSizes'] = size.toUpperCase()
            }

            //*************************** [Filtering By Name] ***********************/


            if (isValid(name)) { query['title'] = name }

            //*************************** [Filtering By Price Greater Than] ***********************/

            if (isValid(priceGreaterThan)) {
                if (!isNumber(priceGreaterThan)) { return res.status(400).send({ status: false, messsage: "Enter a valid price in priceGreaterThan" }) }
                query['price'] = { '$gt': priceGreaterThan }
            }


            //*************************** [Filtering By Price less Than] ***********************/

            if (isValid(priceLessThan)) {
                if (!isNumber(priceLessThan)) { return res.status(400).send({ status: false, messsage: "Enter a valid price in priceLessThan" }) }
                query['price'] = { '$lt': priceLessThan }
            }
            if (priceLessThan && priceGreaterThan) { query['price'] = { '$lte': priceLessThan, '$gte': priceGreaterThan } }

            //*************************** [Filtering By Price sort] ***********************/

            if (priceSort) {
                if ((priceSort == 1 || priceSort == -1)) {
                    let filterProduct = await productModel.find(query).sort({ price: priceSort })

                    if (!filterProduct) {
                        return res.status(404).send({ status: false, message: "No products found with this query" })
                    }
                    return res.status(200).send({ status: false, message: "Success", data: filterProduct })
                }
                return res.status(400).send({ status: false, message: "priceSort must have 1 or -1 as input" })
            }
        }

        let data = await productModel.find(query).sort({ price: -1 }); 

        if (data.length == 0) {
            return res.status(400).send({ status: false, message: "NO data found" });
        }

        return res.status(200).send({ status: true, message: "Success",count: data.length, data: data });


    } catch (err) {
        return res.status(500).send({ status: false, message: err });
    }
};


//================================================[GET API FOR PRODUCT ID]==================================================================


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
            return res.status(200).send({ status: true, message: "Success", data: data })
        }

    } catch (err) {
        res.status(500).send({ status: false, message: err })
    }
}


//================================================[UPDATE API FOR PRODUCT]==================================================================



const updateProduct = async function (req, res) {

    try {
        let ProductId = req.params.productId
        let data = req.body
        let files = req.productImage
        let { title, description, price, currencyId, currencyFormat, isFreeShipping, productImage, style, availableSizes, installments } = data


        if (files) {
            if (isValidReqBody(files)) {
                if (!(files && files.length > 0 || files == "")) {
                    return res.status(400).send({ status: false, message: "files provide product image" })
                }
                var updatedProductImage = await config.uploadFile(files[0])
            }
            productProfile.productImage = updatedProductImage
        }

        // VALIDATING THE PRODUCT_ID
        if (!isValidObjectId(ProductId)) { return res.status(400).send({ status: false, message: "Invalid ProductId" }) }

        let Product = await productModel.findOne({ _id: ProductId, isDeleted: false })

        if (!Product) { return res.status(404).send({ status: false, message: "Product not exist in DB" }) }

        if (!isValidReqBody(data)) { return res.status(400).send({ status: false, message: "Insert Data : BAD REQUEST" }); }


        // TITLE <========================================
        if (title || title == "") {

            if (!isValid(title)) { return res.status(400).send({ status: false, message: `Title is required` }) }

            // DUPLICACY OF TITLE
            let isTitleAlreadyUsed = await productModel.findOne({ title: title });
            if (isTitleAlreadyUsed) { return res.status(400).send({ status: false, message: `${title} Is Already Used` }) }
            if (!isValidTitle(title)) { return res.status(400).send({ status: false, message: "Enter a Valid title !" }) }
        }

        // DESCRIPTION <========================================
        if (description || description == "") {

            if (!isValid(description)) { return res.status(400).send({ status: false, message: "Please Provide description" }) }
            if (!isValidTitle(description)) { return res.status(400).send({ status: false, message: "Enter a Valid description !" }) }
        }

        // PRICE <========================================
        if (price || price == "") {

            if (!isValid(price)) { return res.status(400).send({ status: false, message: "Please Provide price" }) }
            if (!(!isNaN(Number(price)))) { return res.status(400).send({ status: false, message: `Price should be a valid number` }) }
            if (price < 0) { return res.status(400).send({ status: false, message: 'price cannot be less than 0' }) }
        }

        // STYLE <========================================
        if (style || style == "") {

            if (!isValid(style)) { return res.status(400).send({ status: false, message: "Please Provide style" }) }
            if (!isValidTitle(style)) { return res.status(400).send({ status: false, message: "Enter a Valid style" }) }
        }

        // FREE SHIPPING <==============================================
        if (isFreeShipping || isFreeShipping == "") {

            if (!isValid(isFreeShipping)) { return res.status(400).send({ status: false, message: "Please Provide Boolean Value" }) }
            if (!isBoolean(isFreeShipping)) { return res.status(400).send({ status: false, message: "Only True or False" }) }
        }

        // INSTALLMENTS <==============================================
        if (installments || installments == "") {

            if (!isValid(installments)) { return res.status(400).send({ status: false, message: "not a valid installments" }) }
            if (!isNumber(installments)) { return res.status(400).send({ status: false, message: "Enter a Valid EMI Installment" }) }
        }

        // CURRENCY ID <==============================================
        if (currencyId || currencyId == "") {

            if (!isValid(currencyId)) { return res.status(400).send({ status: false, message: "Please Provide currency id" }) }
            if (currencyId !== "INR") { return res.status(400).send({ status: false, message: "Please Provide INR" }) }
        }

        // CURRENCY ID <==============================================
        if (currencyFormat || currencyFormat == "") {

            if (!isValid(currencyId)) { return res.status(400).send({ status: false, message: "Please Provide currency id" }) }
            if (currencyFormat !== "₹") { return res.status(400).send({ status: false, message: "Please Provide ₹" }) }
        }


        // PRODUCT IMAGE <==============================================
        if (productImage || productImage == "") {

            if (!isValid(productImage)) { return res.status(400).send({ status: false, message: "Please Provide productImage" }) }
            if (!isValidName(productImage)) { return res.status(400).send({ status: false, message: "productImage is missing" }) }
        }

        // AVAILABLE SIZES <========================================
        if (availableSizes || availableSizes == "") {

            let availableSizes = req.body.availableSizes.split(",").map(x => x.trim())

            for (let i = 0; i < availableSizes.length; i++) {

                if (!(["S", "XS", "M", "X", "L", "XXL", "XL"].includes(availableSizes[i]))) {
                    console.log(availableSizes[i])
                    return res.status(400).send({ status: false, message: "Size should be among ['S','XS','M','X','L','XXL','XL'] only!" })
                }

                if (availableSizes.indexOf(availableSizes[i]) != i) {
                    return res.status(400).send({ status: false, message: "Size not present!" })
                }
            }
            data.availableSizes = availableSizes
        }



        let updateData = await productModel.findOneAndUpdate({ _id: ProductId }, data, { new: true })
        return res.status(200).send({ status: true, message: "Update product details is successful", data: updateData })


    } catch (err) {
        return res.status(500).send({ status: false, message: err })
    }
}


//================================================[DELETE API FOR PRODUCT]==================================================================


const deleteProduct = async function (req, res) {

    try {
        let ProductId = req.params.productId

        // VALIDATING THE PRODUCT_ID
        if (!isValidObjectId(ProductId)) { return res.status(400).send({ status: false, message: "Invalid ProductId" }) }

        let date = new Date()

        let Product = await productModel.findOne({ _id: ProductId })
        if (!Product) { return res.status(404).send({ status: false, message: "Product not exist in DB" }) }

        //checking already deleted data
        if (Product.isDeleted == true)
            return res.status(404).send({ status: false, message: "Product is Already deleted" });


        await productModel.findOneAndUpdate({ _id: ProductId }, { isDeleted: true, deletedAt: date }, { new: true })
        return res.status(200).send({ status: true, message: "Product deletion is successful", data: "Deleted Data" })

    } catch (err) {
        return res.status(500).send({ status: false, message: err })
    }

}


//================================================[MODULE EXPORTS]==================================================================



module.exports.createProducts = createProducts
module.exports.getProductsById = getProductsById
module.exports.getProduct = getProduct
module.exports.updateProduct = updateProduct
module.exports.deleteProduct = deleteProduct
