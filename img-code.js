import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config(); // Load environment variables from .env file

const app = express();
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:5173/"],
  methods: ["GET", "POST", "PUT", "DELETE"],
})); // Enable CORS for all routes
app.use(express.urlencoded({ extended: true }));

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB connection
const uri = process.env.MONGODB_URI;

mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Create schema with an image field
const ben10Schema = new mongoose.Schema({
  characterName: { type: String, required: true },
  characterDescription: { type: String, required: true },
  // 
  imageUrl: {
    data: Buffer, // For storing binary data
    contentType: String, // To store the MIME type (e.g., image/png, image/jpeg)
  },
});

// Create model/collection
const Ben10 = mongoose.model("ben10", ben10Schema);

// Set up Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Create a new character with an image upload
// 
app.post("/api/ben", upload.single("image"), async (req, res) => {
  try {
    const { characterName, characterDescription } = req.body;

    const newCharacter = new Ben10({
      characterName,
      characterDescription,
      // 
      imageUrl: {
        data: req.file.buffer, // Binary data from uploaded file
        contentType: req.file.mimetype, // MIME type of the file
      },
    });

    const savedCharacter = await newCharacter.save();
    res.status(200).json({
      message: "Character uploaded successfully",
      character: savedCharacter,
    });
  } catch (err) {
    res.status(400).json({ message: "Something went wrong while uploading character", err });
  }
});

// Update character by ID (including image update)
// 
app.put("/api/ben/:id", upload.single("image"), async (req, res) => {
  try {
    const updateData = {
      characterName: req.body.characterName,
      characterDescription: req.body.characterDescription,
    };

    if (req.file) {
      // 
      updateData.imageUrl = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }

    const updatedCharacter = await Ben10.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (updatedCharacter) {
      res.status(200).json(updatedCharacter);
    } else {
      res.status(404).json({ message: `Character with id ${req.params.id} not found` });
    }
  } catch (err) {
    res.status(500).json({ message: "Something went wrong while updating character", err });
  }
});

// Delete character by ID
app.delete("/api/ben/:id", async (req, res) => {
  try {
    const deletedCharacter = await Ben10.findByIdAndDelete(req.params.id);
    if (deletedCharacter) {
      res.status(200).json({ message: `Character with id ${req.params.id} deleted`, deletedCharacter });
    } else {
      res.status(404).json({ message: `Character with id ${req.params.id} not found` });
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

// API to retrieve a character by ID
app.get("/api/ben/:id", async (req, res) => {
  try {
    const character = await Ben10.findById(req.params.id);
    if (character) {
      res.status(200).json(character);
    } else {
      res.status(404).json({ message: `Character with id ${req.params.id} not found` });
    }
  } catch (error) {
    res.status(500).json({ message: "Error retrieving character", error });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
