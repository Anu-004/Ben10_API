// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import arm from "./assets/4arm.png"
dotenv.config(); // Load environment variables from .env file

const app = express();
app.use(express.json());
app.use(cors()); // Enable CORS for all routes
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
const uri = process.env.MONGODB_URI;

mongoose
  .connect(uri)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Create schema with an image URL
const PostSchema = new mongoose.Schema({
  characterName: { type: String, required: true },
  characterDescription: { type: String, required: true },
//   imageUrl: { type: String }, // New field for character image
});

// Create model/collection
const Post = mongoose.model("ben10", PostSchema);

// Create a new post
app.post("/api/ben", async (req, res) => {
  const newPost = new Post({
    characterName: req.body.characterName,
    characterDescription: req.body.characterDescription,
    imageUrl: req.body.imageUrl, // Store image URL from request
  });

    try {
        const ben = req.body
        let result
        if(Array.isArray(ben)){
            result = await Post.insertMany(ben)
        } else {
            const newBen=new Post(ben)
            result = await newBen.save()
        }
    // const savedPost = await newPost.save();
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: "Something went wrong", err });
  }
});

// Get post by ID
app.get("/api/ben/:id", async (req, res) => {
  try {
    const getPost = await Post.findById(req.params.id);
    if (getPost) {
      res.status(200).json(getPost);
    } else {
      res.status(404).json({ message: `Post with id ${req.params.id} not found` });
    }
  } catch (err) {
    res.status(400).json({ message: "Something went wrong", err });
  }
});

// Get all posts with optional limit
app.get("/api/ben", async (req, res) => {
  try {
    const limit = Number(req.query.limit);
    const posts = limit ? await Post.find().limit(limit) : await Post.find();
    res.status(200).json(posts);
  } catch (err) {
    res.status(400).json({ message: "Something went wrong", err });
  }
});

// Update post by ID
app.put("/api/ben/:id", async (req, res) => {
  try {
    const updatePost = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (updatePost) {
      res.status(200).json(updatePost);
    } else {
      res.status(404).json({ message: `Post with id ${req.params.id} not found` });
    }
  } catch (err) {
    res.status(500).json({ message: "Something went wrong", err });
  }
});

// Delete post by ID
app.delete("/api/ben/:id", async (req, res) => {
  try {
    const deletePost = await Post.findByIdAndDelete(req.params.id);
    if (deletePost) {
      res.status(200).json(deletePost);
    } else {
      res.status(404).json({ message: `Post with id ${req.params.id} not found` });
    }
  } catch (err) {
    res.status(500).json({ message: "Something went wrong", err });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
