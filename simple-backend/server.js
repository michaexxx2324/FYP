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
  "user id": String,
  "warning": String,
  "health analysis": String
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
        nutritionInformation: product["nutrition information"],
        warning: product["warning"],
        healthAnalysis: product["health analysis"]
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
  const { itemName, itemCode, nutritionInformation, userId, warning, healthAnalysis } = req.body;

  if (!itemName || !itemCode || !nutritionInformation) {
    return res.status(400).send("Missing required fields");
  }

  try {
    // Check if it already exists to update it instead of creating duplicate
    let existingScan = await ScanHistory.findOne({ "item code": itemCode, "user id": userId || "anonymous" });

    if (existingScan) {
      existingScan["item name"] = itemName;
      existingScan["nutrition information"] = nutritionInformation;
      if (warning) existingScan["warning"] = warning;
      if (healthAnalysis) existingScan["health analysis"] = healthAnalysis;
      
      await existingScan.save();
      console.log('Scan history updated:', itemName);
      return res.status(200).json({ message: "Scan history updated successfully", data: existingScan });
    }

    const newScan = new ScanHistory({
      "item name": itemName,
      "item code": itemCode,
      "nutrition information": nutritionInformation,
      "user id": userId || "anonymous", // Default to anonymous if not provided
      "warning": warning,
      "health analysis": healthAnalysis
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
    // Sort by _id descending (latest first) since 'time' is a string
    const comments = await Comment.find({ "news id": newsId }).sort({ _id: -1 });
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
  age: Number,
  height: String,
  weight: String,
  allergies: [String],
  dietPreferences: [String],
  healthStatus: [String],
  isVip: { type: Boolean, default: false },
  coupons: [{
    code: String,
    discount: String,
    partner: String,
    dateWon: { type: Date, default: Date.now }
  }],
  favoritePosts: [String],
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema, 'users');

// Register Endpoint
app.post('/api/register', async (req, res) => {
  const { email, username, password, dob, age, height, weight, allergies, dietPreferences, healthStatus } = req.body;
  
  console.log('Registering user with data:', { email, age, height, weight, healthStatus });

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
      age,
      height,
      weight,
      allergies,
      dietPreferences, // Now an array
      healthStatus,
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
        dob: user.dob,
        age: user.age,
        height: user.height,
        weight: user.weight,
        isVip: user.isVip,
        allergies: user.allergies,
        dietPreferences: user.dietPreferences,
        healthStatus: user.healthStatus,
        coupons: user.coupons || [],
        favoritePosts: user.favoritePosts || []
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Update Profile Endpoint
app.post('/api/user/update', async (req, res) => {
  const { userId, username, email, allergies, dietPreferences, healthStatus, dob, age, height, weight, isVip, password } = req.body;

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
    if (healthStatus) user.healthStatus = healthStatus;
    if (dob) user.dob = dob;
    if (age) user.age = age;
    if (height) user.height = height;
    if (weight) user.weight = weight;
    
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
        dietPreferences: user.dietPreferences,
        healthStatus: user.healthStatus,
        dob: user.dob,
        age: user.age,
        height: user.height,
        weight: user.weight
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

// Quiz Questions Endpoint (Simulating AI generation)
app.get('/api/quiz/questions', (req, res) => {
  const allQuestions = [
    {
      id: 1,
      question: "What is the common name for the food additive E621?",
      options: ["Monosodium Glutamate (MSG)", "Sodium Benzoate", "Aspartame", "Tartrazine"],
      answer: "Monosodium Glutamate (MSG)"
    },
    {
      id: 2,
      question: "Which additive is commonly used as a preservative in soft drinks?",
      options: ["E211 (Sodium Benzoate)", "E102 (Tartrazine)", "E300 (Vitamin C)", "E951 (Aspartame)"],
      answer: "E211 (Sodium Benzoate)"
    },
    {
      id: 3,
      question: "What is the primary purpose of emulsifiers in food?",
      options: ["To mix oil and water", "To sweeten the food", "To add color", "To preserve shelf life"],
      answer: "To mix oil and water"
    },
    {
      id: 4,
      question: "Which of these is a natural food coloring?",
      options: ["Beetroot Red (E162)", "Tartrazine (E102)", "Sunset Yellow (E110)", "Brilliant Blue (E133)"],
      answer: "Beetroot Red (E162)"
    },
    {
      id: 5,
      question: "E300 is better known as which vitamin?",
      options: ["Vitamin C", "Vitamin A", "Vitamin D", "Vitamin B12"],
      answer: "Vitamin C"
    },
    {
      id: 6,
      question: "Which additive is often used as a sweetener in diet sodas?",
      options: ["Aspartame (E951)", "Sugar", "Salt", "MSG"],
      answer: "Aspartame (E951)"
    },
    {
      id: 7,
      question: "What does the 'E' in E-numbers stand for?",
      options: ["Europe", "Edible", "Energy", "Essential"],
      answer: "Europe"
    },
    {
      id: 8,
      question: "Which additive is used to prevent clumping in powdered foods?",
      options: ["Anti-caking agent", "Preservative", "Humectant", "Thickener"],
      answer: "Anti-caking agent"
    },
    {
      id: 9,
      question: "Nitrates and Nitrites are commonly found in which type of food?",
      options: ["Processed meats", "Fresh fruits", "Dairy products", "Grains"],
      answer: "Processed meats"
    },
    {
      id: 10,
      question: "Which of the following is a flavor enhancer?",
      options: ["E621", "E102", "E202", "E415"],
      answer: "E621"
    }
  ];

  // Shuffle and pick 5
  const shuffled = allQuestions.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 5);

  res.json(selected);
});

// Add Coupon Endpoint
app.post('/api/user/coupon', async (req, res) => {
  const { userId, coupon } = req.body;

  if (!userId || !coupon) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Initialize coupons array if it doesn't exist
    if (!user.coupons) {
      user.coupons = [];
    }

    // Add coupon
    user.coupons.push(coupon);
    await user.save();

    res.json({ 
      message: "Coupon added successfully", 
      coupons: user.coupons 
    });
  } catch (error) {
    console.error("Add coupon error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Blog Schema
const BlogSchema = new mongoose.Schema({
  "post name": String,
  "post content": String,
  "post datetime": { type: Date, default: Date.now },
  "user id": String
}, { strict: false });

const Blog = mongoose.model('Blog', BlogSchema, 'blog');

// Blog Comments Schema
const BlogCommentSchema = new mongoose.Schema({
  "post id": String,
  "comments": String,
  "comments datetime": { type: Date, default: Date.now },
  "district": String,
  "user id": String,
  "user name": String
}, { strict: false });

const BlogComment = mongoose.model('BlogComment', BlogCommentSchema, 'blog comments');

// Favorites Schema
const FavoriteSchema = new mongoose.Schema({
  "post id": String,
  "user id": String
}, { strict: false });

const Favorite = mongoose.model('Favorite', FavoriteSchema, 'favorites');

// Get All Blogs (with search)
app.get('/api/blogs', async (req, res) => {
  const { search } = req.query;
  let query = {};
  
  if (search) {
    query = {
      $or: [
        { "post name": { $regex: search, $options: 'i' } },
        { "post content": { $regex: search, $options: 'i' } }
      ]
    };
  }

  try {
    // Fetch all matching blogs without sorting in DB to avoid index errors
    const blogs = await Blog.find(query).lean();
    
    // Sort in memory
    blogs.sort((a, b) => new Date(b["post datetime"]) - new Date(a["post datetime"]));

    console.log(`Found ${blogs.length} blogs`);
    if (blogs.length > 0) {
      console.log('Sample blog:', blogs[0]);
    }

    res.json(blogs.map(b => ({
      id: b._id,
      title: b["post name"],
      content: b["post content"],
      authorId: b["user id"],
      createdAt: b["post datetime"]
    })));
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ message: error.message });
  }
});

// Create Blog Post
app.post('/api/blogs', async (req, res) => {
  const { title, content, authorId } = req.body;
  
  try {
    const newBlog = new Blog({
      "post name": title,
      "post content": content,
      "user id": authorId,
      "post datetime": new Date()
    });
    await newBlog.save();
    res.status(201).json({
      id: newBlog._id,
      title: newBlog["post name"],
      content: newBlog["post content"],
      authorId: newBlog["user id"],
      createdAt: newBlog["post datetime"]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Single Blog Post
app.get('/api/blogs/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).lean();
    if (!blog) return res.status(404).json({ message: "Blog post not found" });
    res.json({
      id: blog._id,
      title: blog["post name"],
      content: blog["post content"],
      authorId: blog["user id"],
      createdAt: blog["post datetime"]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add Comment
app.post('/api/blog-comments', async (req, res) => {
  const { postId, text, userId, userName, district } = req.body;
  try {
    const newComment = new BlogComment({
      "post id": postId,
      "comments": text,
      "user id": userId,
      "user name": userName,
      "district": district || "Unknown",
      "comments datetime": new Date()
    });
    await newComment.save();
    res.json(newComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Comments for a Post
app.get('/api/blog-comments/:postId', async (req, res) => {
  try {
    // Fetch comments without sorting in DB
    const comments = await BlogComment.find({ "post id": req.params.postId }).lean();
    
    // Sort in memory
    comments.sort((a, b) => new Date(b["comments datetime"]) - new Date(a["comments datetime"]));

    res.json(comments.map(c => ({
      id: c._id,
      postId: c["post id"],
      text: c["comments"],
      userId: c["user id"],
      userName: c["user name"],
      district: c["district"],
      createdAt: c["comments datetime"]
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add to Favorites
app.post('/api/favorites', async (req, res) => {
  const { userId, postId } = req.body;
  try {
    // Check if already exists
    const existing = await Favorite.findOne({ "user id": userId, "post id": postId });
    if (existing) {
      return res.status(400).json({ message: "Already in favorites" });
    }

    const newFavorite = new Favorite({
      "user id": userId,
      "post id": postId
    });
    await newFavorite.save();
    res.json({ message: "Added to favorites" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove from Favorites
app.delete('/api/favorites', async (req, res) => {
  const { userId, postId } = req.body;
  try {
    await Favorite.deleteOne({ "user id": userId, "post id": postId });
    res.json({ message: "Removed from favorites" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check if Favorite
app.get('/api/favorites/check/:userId/:postId', async (req, res) => {
  try {
    const favorite = await Favorite.findOne({ "user id": req.params.userId, "post id": req.params.postId });
    res.json({ isFavorite: !!favorite });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get User Favorites (with Post details)
app.get('/api/favorites/:userId', async (req, res) => {
  try {
    const favorites = await Favorite.find({ "user id": req.params.userId }).lean();
    const postIds = favorites.map(f => f["post id"]);
    
    const posts = await Blog.find({ _id: { $in: postIds } }).lean();
    
    // Sort by post datetime descending (latest first)
    posts.sort((a, b) => new Date(b["post datetime"]) - new Date(a["post datetime"]));

    res.json(posts.map(b => ({
      id: b._id,
      title: b["post name"],
      content: b["post content"],
      authorId: b["user id"],
      createdAt: b["post datetime"]
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
