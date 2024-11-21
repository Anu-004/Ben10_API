import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

dotenv.config(); // Load environment variables from .env file

const app = express();
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:5173/"],
  methods: ["GET", "POST","PUT","DELETE"]
})); // Enable CORS for all routes
app.use(express.urlencoded({ extended: true }));


// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files
// app.use("/assets", express.static(path.join(__dirname, "assets")));


// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Serve static files

// MongoDB connection
const uri = process.env.MONGODB_URI;

mongoose
  .connect(uri, { useNewUrlParser: true })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Create schema with an image URL
const ben10Schema = new mongoose.Schema({
  characterName: { type: String, required: true },
  characterDescription: { type: String, required: true },
  image: { Buffer },
  name: { String }
});

// Create model/collection
const Ben10 = mongoose.model("ben10", ben10Schema);


// Set up Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Create a new post with an image upload
app.post("/api/ben", async (req, res) => {
  // upload.single("image"),
  try {
    // const { characterName, characterDescription} = req.body;
    // const imageUrl = req.file ? `/assets/${req.file.filename}` : undefined;

    // const newPost = new Post({
    //   characterName,
    //   characterDescription,
    //   imageUrl:req.body.imageUrl,
    const newCharacter = new Ben10({
      characterName: req.body.characterName,
      characterDescription: req.body.characterDescription,
      image: {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      },
    });
    const savedCharacter = await newCharacter.save()
   

    res.status(200).json({
      message: "Character uploaded successfully",
      character: savedCharacter,
    });


    // const savedPost = await newPost.save();
    // res.status(200).json(savedPost);
  } catch (err) {
    res.status(400).json({ message: "Something went wrong while post", err });
  }
});


// Configure Multer for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "asstes/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });
// const upload = multer({ storage });


// Get post by ID
// app.get("/api/ben/:id", async (req, res) => {
//   try {
//     const getPost = await Post.findById(req.params.id);
//     if (getPost) {
//       res.status(200).json(getPost);
//     } else {
//       res.status(404).json({ message: `Post with id ${req.params.id} not found` });
//     }
//   } catch (err) {
//     res.status(400).json({ message: "Something went wrong", err });
//   }
// });

// // Get all posts with optional limit
// app.get("/api/ben", async (req, res) => {
//   try {
//     const limit = Number(req.query.limit);
//     const posts = limit ? await Post.find().limit(limit) : await Post.find();
//     res.status(200).json(posts);
//   } catch (err) {
//     res.status(400).json({ message: "Something went wrong", err });
//   }
// });

// // Update post by ID
app.put("/api/ben/:id", async (req, res) => {
  try {
    const updatePost = await Ben10.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (updatePost) {
      res.status(200).json(updatePost);
    } else {
      res.status(404).json({ message: `Post with id ${req.params.id} not found` });
    }
  } catch (err) {
    res.status(500).json({ message: "Something went wrong while edit", err });
  }
});

// // Delete post by ID
app.delete("/api/ben/:id", async (req, res) => {
  try {
    const deletePost = await Ben10.findByIdAndDelete(req.params.id);
    if (deletePost) {
      res.status(200).json({ message: `Post with id: ${req.params.id} deleted`},deletePost);
    } else {
      res.status(404).json({ message: `Post with id ${req.params.id} not found` });
    }
  } catch (err) {
    res.status(500).json({ message: "Something went wrong", err });
  }
});




// API to retrieve all characters
app.get("/api/ben", async (req, res) => {
  try {
    const characters = await Ben10.find({});
    res.status(200).json({
      message: "Characters retrieved successfully",
      characters,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving characters", error });
  }
});




// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
