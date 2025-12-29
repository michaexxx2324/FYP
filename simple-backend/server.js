const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection String
const CONNECTION_STRING = "mongodb://faifai0818:4rqANRenpgTzZDbsDWfgfr9LYsUn0OTbtA6Vxgnuzsf51MpFgiv5z8GpOQdjNidt4dKV4nliyyi3ACDbYCkrfw%3D%3D@faifai0818.mongo.cosmos.azure.com:10255/foodlabel?ssl=true&retrywrites=false&maxIdleTimeMS=120000&appName=@faifai0818@";

// Connect to MongoDB
mongoose.connect(CONNECTION_STRING)
  .then(() => console.log('Connected to MongoDB (Cosmos DB)'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Define Schema
const ProductSchema = new mongoose.Schema({
  "item name": String,
  "item code": String,
  "nutrition information": String
}, { strict: false });

const Product = mongoose.model('Product', ProductSchema, 'FoodLabelBarCodeScan');

// API Endpoint
app.get('/api/GetProduct', async (req, res) => {
  const barcode = req.query.barcode;

  if (!barcode) {
    return res.status(400).send("Please pass a barcode on the query string");
  }

  console.log(`Searching for barcode: ${barcode}`);

  try {
    const product = await Product.findOne({ "item code": barcode });

    if (product) {
      console.log('Product found:', product["item name"]);
      res.json({
        itemName: product["item name"],
        itemCode: product["item code"],
        nutritionInformation: product["nutrition information"]
      });
    } else {
      console.log('Product not found');
      res.status(404).send("Product not found");
    }
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
