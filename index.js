import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ["http://localhost:5173","https://ben10-website.vercel.app/"],
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB connection
const uri = process.env.MONGODB_URI;
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

// Schema and model
const ben10Schema = new mongoose.Schema({
  characterName: { type: String, required: true },
  characterDescription: { type: String, required: true },
  imageUrl: {
    data: Buffer,
    contentType: String,
  },
});

const Ben10 = mongoose.model("ben10", ben10Schema);

// Routes

// Create a new character
app.post("/api/ben", upload.single("imageUrl"), async (req, res) => {
  try {
    const { characterName, characterDescription } = req.body;

    if (!characterName || !characterDescription || !req.file) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newCharacter = new Ben10({
      characterName,
      characterDescription,
      imageUrl: {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      },
    });

    const savedCharacter = await newCharacter.save();
    res.status(200).json({
      message: "Character uploaded successfully",
      character: savedCharacter,
    });
  } catch (err) {
    console.error("Error while uploading character:", err);
    res
      .status(500)
      .json({ message: "Something went wrong while uploading character", error: err.message });
  }
});

// Update character by ID
app.put("/api/ben/:id", upload.single("imageUrl"), async (req, res) => {
  try {
    const { characterName, characterDescription } = req.body;
    const updateData = {
      characterName,
      characterDescription,
    };

    if (req.file) {
      updateData.imageUrl = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }

    const updatedCharacter = await Ben10.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (updatedCharacter) {
      res.status(200).json({
        message: "Character updated successfully",
        character: updatedCharacter,
      });
    } else {
      res.status(404).json({ message: `Character with id ${req.params.id} not found` });
    }
  } catch (err) {
    console.error("Error while updating character:", err);
    res
      .status(500)
      .json({ message: "Something went wrong while updating character", error: err.message });
  }
});

// Delete character by ID
app.delete("/api/ben/:id", async (req, res) => {
  try {
    const deletedCharacter = await Ben10.findByIdAndDelete(req.params.id);
    if (deletedCharacter) {
      res.status(200).json({
        message: `Character with id ${req.params.id} deleted`,
        character: deletedCharacter,
      });
    } else {
      res.status(404).json({ message: `Character with id ${req.params.id} not found` });
    }
  } catch (err) {
    console.error("Error while deleting character:", err);
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
});


app.get("/api/ben", async (req, res) => {
  try {
    const characters = await Ben10.find({}); // Querying the characters
    if (!characters || characters.length === 0) {
      return res.status(404).json({
        message: "No characters found",
      });
    }

    
    res.status(200).json({
      message: "Characters retrieved successfully",
      characters,
    });
  } catch (error) {
    console.error("Error retrieving characters:", error);
    res.status(500).json({
      message: "Error retrieving characters",
      error: error.message || error,
    });
  }
});


// Retrieve a character by ID
app.get("/api/ben/:id", async (req, res) => {
  try {
    const character = await Ben10.findById(req.params.id);
    if (character) {
      res.status(200).json({
        ...character.toObject(),
        imageUrl: `data:${character.imageUrl.contentType};base64,${character.imageUrl.data.toString(
          "base64"
        )}`,
      });
    } else {
      res.status(404).json({ message: `Character with id ${req.params.id} not found` });
    }
  } catch (err) {
    console.error("Error while retrieving character:", err);
    res.status(500).json({ message: "Error retrieving character", error: err.message });
  }
});

// Port handling
const PORT = process.env.PORT || 3001;

// Avoid EADDRINUSE error
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}).on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  } else {
    console.error(err);
  }
});
