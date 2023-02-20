const express = require("express")
const router = express.Router()
const { body, validationResult } = require('express-validator')
const fetchuser = require("../middleware/fetchuser")
const Notes = require("../models/Notes")

//Route 1 : Fetch all notes from the database using GET: "/api/notes/fetchallnotes" , login Required
router.get("/fetchallnotes", fetchuser, async function (req, res) {
    const notes = await Notes.find({ user: req.user.id })
    res.json(notes)
})

//Route 2 : Add notes to the database using POST: "/api/notes/addnote" , login Required
router.post("/addnote", fetchuser, [
    body('title', "Enter a Valid Title").isLength({ min: 3 }),
    body('description', "Description must be at least 5 characters.").isLength({ min: 5 })], function (req, res) {

        const { title, description, tag } = req.body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const note = new Notes({ title, description, tag, user: req.user.id })
        note.save(function (err) {
            if (err) {
                console.log(err)
                res.status(500).send("Internal Server Error.")
            } else {
                res.json(note)
            }
        })

    })

//Route 3 : Update notes using PUT: "/api/notes/updatenote" , login Required
router.put("/updatenote/:id", fetchuser, async function (req, res) {
    const {title, description, tag} = req.body
    //Create a new Note object
    const newNote = {}
    if(title){newNote.title = title}
    if(description){newNote.description = description}
    if(tag){newNote.tag = tag}

    //Find the note to be updated
    let note = await Notes.findById(req.params.id)
    if(!note){return res.status(404).send("Not Found")}

    //Allow deletion if only the user owns the note
    if(note.user.toString() !== req.user.id){
        return res.status(401).send("Not Allowed")
    }
    note = await Notes.findByIdAndUpdate(req.params.id, {$set: newNote}, {new:true})
    res.json(note)
    })

//Route 4 : Delete notes using DELETE: "/api/notes/delete" , login Required
router.delete("/delete/:id", fetchuser, async function(req, res){
    let note = await Notes.findById(req.params.id)
    if(!note){return res.status(404).send("Not Found")}

    if(note.user.toString() !== req.user.id){
        return res.status(401).send("Not Allowed")
    }
    note = await Notes.findByIdAndDelete(req.params.id)
    res.json({Success: "Note has been deleted", note: note})
})

module.exports = router