const mongoose = require('mongoose');

// Define Schema based on user description:
// _id, item name, item code, nutrition information
const ProductSchema = new mongoose.Schema({
  "item name": String,
  "item code": String,
  "nutrition information": String
}, { strict: false }); // strict: false allows other fields to exist

let Product;
try {
  Product = mongoose.model('Product');
} catch {
  // Assuming the collection name in MongoDB is 'items' or similar. 
  // Mongoose pluralizes the model name 'Product' to 'products'.
  // If your collection has a different name, pass it as the 3rd argument:
  // mongoose.model('Product', ProductSchema, 'your_collection_name');
  Product = mongoose.model('Product', ProductSchema);
}

const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.COSMOS_DB_CONNECTION_STRING);
  }
};

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    const barcode = req.query.barcode || (req.body && req.body.barcode);

    if (!barcode) {
        context.res = {
            status: 400,
            body: "Please pass a barcode on the query string or in the request body"
        };
        return;
    }

    try {
        await connectDB();
        
        // Query by "item code"
        const product = await Product.findOne({ "item code": barcode });

        if (product) {
            context.res = {
                body: {
                    itemName: product["item name"],
                    itemCode: product["item code"],
                    nutritionInformation: product["nutrition information"]
                }
            };
        } else {
            context.res = {
                status: 404,
                body: "Product not found"
            };
        }
    } catch (error) {
        context.log.error("Database error:", error);
        context.res = {
            status: 500,
            body: "Internal Server Error: " + error.message
        };
    }
};
