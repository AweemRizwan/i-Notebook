const express = require('express');
const router = express.Router();
var fetchuser = require('../middleware/fetchuser');
const Note = require('../models/Note');
const { body, validationResult } = require('express-validator');

//Route 1: Get all notes using : GET "/api/notes/fetchallnotes" .Login required 

router.get('/fetchallnotes', fetchuser, async (req, res) => {

    try {

        const notes = await Note.find({ user: req.user.id });

        res.json(notes)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Internal sever error')
    }
})

//Route 2: Get a new note using : POST "/api/notes/addnotes".Login required 

router.post('/addnote', fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Enter a valid Description').isLength({ min: 5 })
], async (req, res) => {

    try {



        const { title, description, tag } = req.body;
        // Tf there are errors,return bad request and the errors
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() })
        }

        const note = new Note({
            title, description, tag, user: req.user.id
        })
        const savedNote = await note.save();

        res.json(savedNote)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Internal sever error')
    }
})

//Route 3: Update an existing notes using : PUT "/api/notes/updatenote".Login required 

router.put('/updatenote/:id', fetchuser, [

], async (req, res) => {
    const { title, description, tag } = req.body;

    try {

        // Create a new note object

        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };

        // Find the note to be updated and update it

        let note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).send("Not found")
        }

        if (note.user.toString() !== req.user.id) {
            return res.status(404).send("Not Allowed")
        }

        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
        res.json({ note })

    } catch (error) {
        console.error(error.message)
        res.status(500).send('Internal sever error')
    }

})

//Route 4: Delete an existing notes using : DELETE "/api/notes/deletenote".Login required 

router.delete('/deletenote/:id', fetchuser, [

], async (req, res) => {

    try {

        // Find the note to be deleted and delete it

        let note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).send("Not found")
        }

        // Allow deletion only if user owns this note

        if (note.user.toString() !== req.user.id) {
            return res.status(404).send("Not Allowed")
        }

        note = await Note.findByIdAndDelete(req.params.id);
        res.json({ "Success": "Note hs been deleted", note: note })

    } catch (error) {
        console.error(error.message)
        res.status(500).send('Internal sever error')
    }

})



module.exports = router

