const productModel = require("../models/productModel")
const userController = require("../controllers/userController")

const { isValidReqBody, isValid, isValidTitle, isValidObjectId,
    isNumber, validInstallment, isBoolean, isValidStyle } = require("../middleware/validation")

//================================================[CREATE API FOR PRODUCT]=======================================================================


const createProducts = async function (req, res) {
    try {
        let data = req.body;
        if (!isValidReqBody(data)) { return res.status(400).send({ status: false, message: "Insert Data : BAD REQUEST" }); }


        //*************************** [DESTRUCTURING DATA] ********************/

        let { title, description, price, currencyId, currencyFormat,
            isFreeShipping, style, installments } = data;

        //*************************** [CHECKING VALIDATION OF REQUIRED :TRUE] ********************/


        if (!isValid(title)) { return res.status(400).send({ status: false, message: "Please Provide Title" }) }
        if (!isValid(description)) { return res.status(400).send({ status: false, message: "Please Provide description" }) }
        if (!isValid(price)) { return res.status(400).send({ status: false, message: "Please Provide price" }) }
        if (!isValid(currencyId)) { return res.status(400).send({ status: false, message: "Please Provide currencyId" }) }
        if (!isValid(currencyFormat)) { return res.status(400).send({ status: false, message: "Please Provide currencyFormat" }) }
        // if (!isValid(availableSizes)) { return res.status(400).send({ status: false, message: "Please Provide availableSizes" }) }

        //*************************** [Style Validation] ********************/

        if (!isValidStyle(style)) { return res.status(400).send({ status: false, message: "Please Enter Valid Style" }) }

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

        //*************************** [isFreeShipping Validation] ************/

        if (typeof isFreeShipping != 'undefined') {
            isFreeShipping = isFreeShipping.trim()
            if (!["true", "false"].includes(isFreeShipping)) {
                return res.status(400).send({ status: false, message: "isFreeshipping is a boolean type only :Ex- true / false" });
            }
        }

        //*************************** [Product Image Validation] ************/

        let files = req.files
        if (!(files && files.length)) {
            return res.status(400).send({ status: false, message: "Please Provide Profile Image" });
        }
        let uploadedproductImage = await userController.uploadFile(files[0])
        data.productImage = uploadedproductImage

        //*************************** [Creating Data] ***********************/

        let CreatedData = await productModel.create(data)
        return res.status(201).send({ status: true, message: 'Success', data: CreatedData })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err })
    }
}

//================================================[GET API]===================================================================================



const getProduct = async function (req, res) {
    try {
        let filter = req.query;
        let query = { isDeleted: false };
        if (filter) {
            const { name, description, isFreeShipping, style, size, installments } =
                filter;

            if (name) {
                if (!isValidString(name)) return res.status(400).send({ status: false, message: "name  must be alphabetic characters" })
                query.title = name;
            }
            if (description) {
                if (!isValidString(description)) return res.status(400).send({ status: false, message: "description  must be alphabetic characters" })
                query.description = description.trim();

            }
            if (isFreeShipping) {
                if (!((isFreeShipping === 'true') || (isFreeShipping === 'false'))) {
                    return res.status(400).send({ status: false, massage: 'isFreeShipping should be a boolean value' })
                }
                query.isFreeShipping = isFreeShipping;
            }
            if (style) {
                if (!isValidString(style)) return res.status(400).send({ status: false, message: "style  must be alphabetic characters" })
                query.style = style.trim();
            }
            if (installments) {
                if (!/^[0-9]+$/.test(installments)) return res.status(400).send({ status: false, message: "installments must be in numeric" })

                query.installments = installments;
            }
            if (size) {
                let sizes = size.split(/[\s,]+/)
                let arr = ["S", "XS", "M", "X", "L", "XXL", "XL"]
                console.log(sizes)
                for (let i = 0; i < sizes.length; i++) {
                    if (arr.indexOf(sizes[i]) == -1)
                        return res.status(400).send({ status: false, message: "availabe sizes must be (S, XS,M,X, L,XXL, XL)" })
                }
                const sizeArr = size
                    .trim()
                    .split(",")
                    .map((x) => x.trim());
                query.availableSizes = { $all: sizeArr };
            }
        }
        if (filter.priceLessThan) {
            if (!/^[0-9 .]+$/.test(filter.priceLessThan)) return res.status(400).send({ status: false, message: "priceLessThan must be in numeric" })
        }
        if (filter.priceGreaterThan) {
            if (!/^[0-9 .]+$/.test(filter.priceGreaterThan)) return res.status(400).send({ status: false, message: "priceGreaterThan must be in numeric" })
        }

        let data = await productModel.find({ ...query }).sort("price");

        if (data.length == 0) {
            return res.status(400).send({ status: false, message: "NO data found" });
        }

        return res.status(200).send({ status: true, message: "Success", count: data.length, data: data });
    } catch (err) {
        return res.status(500).send({ status: false, error: err.message });
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

        updatedProductDetails = {}
        let files = req.productImage

        if (files) {
            if (isValidReqBody(files)) {
                if (!(files && files.length > 0)) {
                    return res.status(400).send({ status: false, message: "please provide product image" })
                }
                var updatedProductImage = await config.uploadFile(files[0])
            }
            productProfile.productImage = updatedProductImage
        }

        if (!isValidObjectId(ProductId)) return res.status(400).send({ status: false, message: "Invalid ProductId" })

        let Product = await productModel.findOne({ _id: ProductId, isDeleted: false })
        if (!Product) { return res.status(404).send({ status: false, message: "Product not exist in DB" }) }

        if (!isValidReqBody(data)) { return res.status(400).send({ status: false, message: "Insert Data : BAD REQUEST" }); }


        if (isValid(title)) {
            const isTitleAlreadyUsed = await productModel.findOne({ title: title });
            if (isTitleAlreadyUsed) { return res.status(400).send({ status: false, message: "title is already used" }) }
            if (!isValid(title)) { return res.status(400).send({ status: false, message: "Please Provide title " }) }
            if (!isValidTitle(title)) { return res.status(400).send({ status: false, message: "Enter a Valid title !" }) }
        }

        if (isValid(description)) {
            if (!isValid(description)) { return res.status(400).send({ status: false, message: "Please Provide description" }) }
            if (!isValidTitle(description)) { return res.status(400).send({ status: false, message: "Enter a Valid description !" }) }
            // description=  description.replace(/  +/g, ' ')
        }


        if (isValid(price)) {

            if (!(!isNaN(Number(price)))) { return res.status(400).send({ status: false, message: `Price should be a valid number` }) }
            if (price < 0) { return res.status(400).send({ status: false, message: 'price cannot be less than 0' }) }

        }


        if (style) {
            if (!isValid(style)) { return res.status(400).send({ status: false, message: "Please Provide style" }) }
            if (!isValidTitle(style)) { return res.status(400).send({ status: false, message: "Enter a Valid style" }) }
        }


        // if (isValid(productImage)) {
        //     if (!isValidName(productImage)) { // <=========================== MUST BE A PROBLEM IN THIS LINE in future
        //         return res.status(400).send({ status: false, message: "productImage is missing ! " })
        //     }
        // }

        if (isValid(isFreeShipping)) {
            if (!isBoolean(isFreeShipping)) {  // <=========================== There Must be a problem in future
                return res.status(400).send({ status: false, message: "Boolean Value should be present ! " })
            }
        }

        if (installments) {
            if (!isValid(installments)) { return res.status(400).send({ status: false, message: "not a valid number" }) }
            if (!isNumber(installments)) { return res.status(400).send({ status: false, message: "Enter a Valid EMI Installment !" }) }
        }

        if (isValid.currencyId) {
            if (!(currencyId == "INR")) { return res.status(400).send({ status: false, message: "Please Provide 'INR'" }) }
        }

        if (isValid.currencyFormat) {
            let rupeesSymbol = getSymbolFromCurrency('₹')
            // console.log(rupeesSymbol)
            if (!rupeesSymbol) { return res.status(400).send({ status: false, message: "Please Provide ₹ Symbol" }) }
        }

        // if (isValid.availableSizes) {
        //     if (!availableSizes) return res.status(400).send({ status: false, message: "Please enter availableSizes" })

        //     if (!isValid(availableSizes)) return res.status(400).send({ status: false, message: "Provide valid availableSizes" })

        //     if (availableSizes != "S" && availableSizes != "M" && availableSizes != "L" && availableSizes != "S" && availableSizes != "X" && availableSizes != "XS" && availableSizes != "XL" && availableSizes != "XXl")
        //         return res.status(400).send({ status: false, message: 'Provide Only  "S", "XS", "M", "X", "L", "XXL", "XL" ' })
        // }

        let updateData = await productModel.findOneAndUpdate({ _id: ProductId }, data, { new: true })
        return res.status(201).send({ status: true, message: "User profile Updated", data: updateData })


    } catch (err) {
        res.status(500).send({ status: false, message: err })
    }
}


//================================================[DLETE API FOR PRODUCT]==================================================================


const deleteProduct = async function (req, res) {

    try {
        let ProductId = req.params.productId
        let date = new Date()

        let Product = await productModel.findOne({ _id: ProductId })
        if (!Product) { return res.status(404).send({ status: false, message: "Product not exist in DB" }) }

        if (Product.isDeleted == true) return res.status(404).send({ status: false, message: "Data is Already deleted" });

        await productModel.findOneAndUpdate({ _id: ProductId }, { isDeleted: true, deletedAt: date }, { new: true })
        return res.status(200).send({ status: true, message: "success", data: "Deleted Data" })

    } catch (err) {
        res.status(500).send({ status: false, message: err })
    }

}


//================================================[MODULE EXPORTS]==================================================================



module.exports.updateProduct = updateProduct
module.exports.deleteProduct = deleteProduct
module.exports.createProducts = createProducts
module.exports.getProductsById = getProductsById
module.exports.getProduct = getProduct