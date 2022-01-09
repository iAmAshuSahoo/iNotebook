const express = require('express')
const {body, validationResult} = require('express-validator');
const fetchuser = require('../middleware/fetchuser')
const Notes = require("../models/Notes");
const router = express.Router()

//ROUTE 1 : Fetch notes using GET "api/notes/fetchnotes". Login required
router.get('/fetchnotes',
    fetchuser,
    async (req, res) => {
      try {
        const notes = await Notes.find({user: req.user.id})
        res.json(notes);
      } catch (error) {
        console.error(error);  // Ideally use logger, SQS
        res.status(500).send("Some error occured")
      }
    }
)

//ROUTE 2 : Add new notes using POST "api/notes/addnotes". Login required
router.post('/addnotes',
    fetchuser,
    [body('title').isLength({min: 3}),
    body('description').isLength({min:5})],
    async (req, res) => {
      //Find validation error , return bad request and errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          res.status(400).json( {errors: errors.array()} )
      }
      try {
        const {title, description, tag} = req.body;
        const notes = await Notes({
          title, description, tag, user: req.user.id
        })
        const savedNote = await notes.save();

        res.json(savedNote);
      } catch (error) {
        console.error(error);  // Ideally use logger, SQS
        res.status(500).send("Some error occured")
      }
    }
)

//ROUTE 3 : Update notes using PUT "api/notes/updatednotes". Login required
router.put('/updatednotes/:id',
    fetchuser,
    async (req, res) => {
      try {
        const {title, description, tag} = req.body;
        // Create a newNote object
        const newNote = {};
        if(title) {newNote.title = title}
        if(description) {newNote.description = description}
        if(tag) {newNote.tag = tag}

        // Find if the note exists
        let notes = await Notes.findById(req.params.id);
        if (!notes) {
          return res.status(404).send("Not Found");
        }
        if (notes.user.toString() !== req.user.id) {
          return res.status(401).send("Not Allowed");
        }
        notes = await Notes.findByIdAndUpdate(
          req.params.id, {$set: newNote}, {new: true}
        )

        res.json({notes});
      } catch (error) {
        console.error(error);  // Ideally use logger, SQS
        res.status(500).send("Some error occured")
      }
    }
)

//ROUTE 4 : Delete notes using DELETE "api/notes/deletenotes". Login required
router.delete('/deletenotes/:id',
    fetchuser,
    async (req, res) => {
      try {
        // Find if the note exists
        let notes = await Notes.findById(req.params.id);
        if (!notes) {
          return res.status(404).send("Not Found");
        }
        if (notes.user.toString() !== req.user.id) {
          return res.status(401).send("Not Allowed");
        }
        notes = await Notes.findByIdAndDelete(req.params.id)
        res.json({"Success" : "The note is deleted", note: notes});
      } catch (error) {
        console.error(error);  // Ideally use logger, SQS
        res.status(500).send("Some error occured")
      }
    }
)

module.exports = router