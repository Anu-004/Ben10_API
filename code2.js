import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"

dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())
app.use(express.urlencoded({ extended: true }))

const uri = process.env.MONGODB_URI

mongoose
    .connect(uri)
    .then(() => {
        console.log("Connected to MongoDB")
    })
    .catch((err) => {
        console.log("Error connecting to MongoDB", err)
    })

const superheroSchema = new mongoose.Schema({
    superheroName: {type: String, required: true},
    originalName: { type: String, required: true },
    abilities: { type: String },
    weakness: { type: String },
    backstory: { type: String },
    reason: { type: String },
    contributor: { type: String },
    comment: {type: String},
})

const Superhero = mongoose.model("Superhero", superheroSchema)

app.get("/api/superheroes/", async (req, res) => {
    try {
        const superheroes = await Superhero.find()
        res.status(200).json(superheroes)
    } catch (err) {
        res.status(500).json({message:"Error occured in fetching",err})
    }
})

app.post("/api/superheroes", async (req, res) => {
    const newSuperhero = new Superhero({
        superheroName: req.body.superheroName,
        originalName: req.body.originalName,
        abilities: req.body.abilities,
        weakness: req.body.weakness,
        backstory: req.body.backstory,
        reason: req.body.reason,
        contributor: req.body.contributor,
        comment: req.body.comment
    })

    try {
        const savedSuperhero = await newSuperhero.save()
        res.status(200).json(savedSuperhero)
    } catch (err) {
        res.status(500).json({message:"Error occured in saving",err})
    }
})

app.put ("/api/superheroes/:id", async (req, res) => {
    try { 
        const updatedSuperhero = await Superhero.findByIdAndUpdate(req.params.id, req.body, { new: true })
        if (updatedSuperhero) {
            res.status(200).json(updatedSuperhero)
         } else {
            res.status(404).json({ message: Superhero with id: ${req.params.id} not found })
         }
    } catch (err) {
        res.status(500).json({message:"Error occured in updating",err})
    }
})

app.delete("/api/superheroes/:id", async (req, res) => {
    try {
        const deletedSuperhero = await Superhero.findByIdAndDelete(req.params.id)
        if (deletedSuperhero) {
            res.status(200).json({ message: Superhero with id: ${req.params.id} deleted })
        } else {
            res.status(404).json({ message: Superhero with id: ${req.params.id} not found })
        }
    } catch (err) {
        res.status(500).json({message:"Error occured in deleting",err})
    }
})
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})