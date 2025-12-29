const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your_jwt_secret_key_here_make_it_long_and_secure'; // In production, use env var

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

// Comments Schema
const CommentSchema = new mongoose.Schema({
  "user id": String,
  "user name": String,
  "comments": String,
  "time": String,
  "district": String,
  "news id": String
}, { strict: false });

const Comment = mongoose.model('Comment', CommentSchema, 'comments');

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

// Save Comment Endpoint
app.post('/api/SaveComment', async (req, res) => {
  const { userId, userName, comments, time, district, newsId } = req.body;

  if (!comments || !newsId) {
    return res.status(400).send("Missing required fields");
  }

  try {
    const newComment = new Comment({
      "user id": userId || "anonymous",
      "user name": userName || "Anonymous",
      "comments": comments,
      "time": time || new Date().toLocaleString(),
      "district": district || "Unknown",
      "news id": newsId
    });

    await newComment.save();
    console.log('Comment saved for news:', newsId);
    res.status(201).json({ message: "Comment saved successfully", data: newComment });
  } catch (error) {
    console.error("Error saving comment:", error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
});

// Get Comments Endpoint
app.get('/api/GetComments', async (req, res) => {
  const newsId = req.query.newsId;

  if (!newsId) {
    return res.status(400).send("Please pass a newsId on the query string");
  }

  try {
    const comments = await Comment.find({ "news id": newsId });
    res.json(comments.map(c => ({
      id: c._id,
      userId: c["user id"],
      userName: c["user name"],
      text: c["comments"],
      time: c["time"],
      district: c["district"]
    })));
  } catch (error) {
    console.error("Error fetching comments:", error);
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

// User Schema
const UserSchema = new mongoose.Schema({
  userId: { type: String, unique: true },
  email: { type: String, unique: true, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  dob: String,
  allergies: [String],
  dietPreferences: [String],
  isVip: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema, 'users');

// Register Endpoint
app.post('/api/register', async (req, res) => {
  const { email, username, password, dob, allergies, dietPreferences } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: "Email already registered" });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ message: "Username already taken" });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate User ID
    const userId = 'user_' + Math.random().toString(36).substr(2, 9);

    const newUser = new User({
      userId,
      email,
      username,
      password: hashedPassword,
      dob,
      allergies,
      dietPreferences, // Now an array
      isVip: false
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully", userId });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Login Endpoint
app.post('/api/login', async (req, res) => {
  const { login, password } = req.body; // login can be email or username

  if (!login || !password) {
    return res.status(400).json({ message: "Missing credentials" });
  }

  try {
    const user = await User.findOne({ $or: [{ email: login }, { username: login }] });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate Token
    const token = jwt.sign(
      { userId: user.userId, isVip: user.isVip },
      JWT_SECRET,
      { expiresIn: '30m' }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        isVip: user.isVip,
        allergies: user.allergies,
        dietPreferences: user.dietPreferences
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Update User Profile Endpoint
app.put('/api/user/update', async (req, res) => {
  const { userId, username, email, password, allergies, dietPreferences, isVip } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (allergies) user.allergies = allergies;
    if (dietPreferences) user.dietPreferences = dietPreferences;
    if (typeof isVip !== 'undefined') user.isVip = isVip; // Allow updating VIP status
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        isVip: user.isVip,
        allergies: user.allergies,
        dietPreferences: user.dietPreferences
      }
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Reset Password Endpoint
app.post('/api/reset-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // In a real app, send an email. Here we just simulate success.
    res.json({ message: "Password reset link sent to your email." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
