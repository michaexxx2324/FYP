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

// ScanHistory Schema
const ScanHistorySchema = new mongoose.Schema({
  "item name": String,
  "item code": String,
  "nutrition information": String,
  "user id": String
}, { strict: false });

const ScanHistory = mongoose.model('ScanHistory', ScanHistorySchema, 'ScanHistory');

// API Endpoint
app.get('/api/GetProduct', async (req, res) => {
  const barcode = req.query.barcode;

  if (!barcode) {
    return res.status(400).send("Please pass a barcode on the query string");
  }

  console.log(`Searching for barcode: ${barcode}`);

  try {
    // First check the main product database
    let product = await Product.findOne({ "item code": barcode });
    let source = 'FoodLabelBarCodeScan';

    // If not found, check the scan history
    if (!product) {
      product = await ScanHistory.findOne({ "item code": barcode });
      source = 'ScanHistory';
    }

    if (product) {
      console.log(`Product found in ${source}:`, product["item name"]);
      res.json({
        itemName: product["item name"],
        itemCode: product["item code"],
        nutritionInformation: product["nutrition information"]
      });
    } else {
      console.log('Product not found in either collection');
      res.status(404).send("Product not found");
    }
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
});

// Save Scan History Endpoint
app.post('/api/SaveScanHistory', async (req, res) => {
  const { itemName, itemCode, nutritionInformation, userId } = req.body;

  if (!itemName || !itemCode || !nutritionInformation) {
    return res.status(400).send("Missing required fields");
  }

  try {
    const newScan = new ScanHistory({
      "item name": itemName,
      "item code": itemCode,
      "nutrition information": nutritionInformation,
      "user id": userId || "anonymous" // Default to anonymous if not provided
    });

    await newScan.save();
    console.log('Scan history saved:', itemName);
    res.status(201).json({ message: "Scan history saved successfully", data: newScan });
  } catch (error) {
    console.error("Error saving scan history:", error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
});

// Delete Scan History Endpoint
app.delete('/api/DeleteScanHistory', async (req, res) => {
  const { itemCode } = req.query;

  if (!itemCode) {
    return res.status(400).send("Missing itemCode");
  }

  try {
    // Only delete from ScanHistory (User generated content)
    const result = await ScanHistory.deleteOne({ "item code": itemCode });
    
    if (result.deletedCount > 0) {
      console.log(`Deleted history for code: ${itemCode}`);
      res.status(200).send("Deleted successfully");
    } else {
      // If not found in ScanHistory, it might be a main product or already deleted
      res.status(404).send("Item not found in ScanHistory");
    }
  } catch (error) {
    console.error("Error deleting history:", error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
