
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    selectedCategory: {
        type: String,
        required: true
    },
    itemWeight: {
        type : String,
        value: Number,
        unit: String,
        required: true
    },
    // inStock: Boolean,
    stockKeepingUnit: Number,        // stock keeping unit
    status: {
        type: String,
        default: 'Available',
        required: true
    },
    regularPrice: {
        type: Number,
        required: true
    },
    salePrice: {
        type: Number,
        required: true
    },
    description : {
        type : String
    },
    image : [
         String
        // type: Buffer
    ],
    contentType: {
        type: String, // Mime type of the image
        // required: true
    },
    deletedAt : {
        type : String,
        default : 'Not-Deleted'
    }
},{
    timestamps : true
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
