'use strict';

const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const morgan = require('morgan');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const {User, Event} = require('./models');

const app = express();

app.use(morgan('common'));
app.use(express.json());

router.get('/', (req,res) =>{
    Event
        .find()
        //.populate({path: 'event_organizer'})
        .then(events => 
            {res.json(events.map(event => event.serialize()));
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({error: 'Whelp, something is not right here'});
        });
});

router.get('/:name', (req, res) => {
    Event   
        .findOne({event_name: req.params.name})
        .then(event => res.json(event.serialize()))
        .catch(err => {
            res.status(500).json({error: 'This is embarassing...'});
        });
});

router.get('/byUserId/:id', (req, res) => {
    console.log(req.params.id);
    Event
        .find({event_organizer: req.params.id})
        .then(events =>{
            res.json(events.map(event => event.serialize()));
        })
        .catch(err => {
            res.status(500).json({error: 'Internal server error'});
        });
 });

router.post('/', (req, res) => {
    const requiredFields = ['event_name', 'event_location', 'event_dates', 'event_organizer']
    for (let i=0; i < requiredFields.length; i++){
        const field = requiredFields[i];
        if(!(field in req.body)){
            const message = `Missing ${field} in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }

    Event
        .create({
            event_name: req.body.event_name,
            event_location: req.body.event_location,
            event_dates: req.body.event_dates,
            event_organizer: req.body.event_organizer
        })
        .then(event => res.status(201).json(event.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({error: 'Oh no! Panic!!!'});
        });
});

router.put('/:id', (req, res) => {
    console.log(req.params.id);
    console.log(req.body.id);
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        res.status(400).json({
          error: 'Request path id and request body id values must match'
        });
      }
    
    const toUpdate = {};
    const updateableFields = ['event_location', 'event_dates', 'event_name'];
    updateableFields.forEach(field => {
        if (field in req.body) {
            toUpdate[field] = req.body[field];
        }
    });

    Event
        .findByIdAndUpdate(req.params.id, { $set: toUpdate })
        .then(updatedEvent => res.status(204).end())
        .catch(err => res.status(500).json({ message: 'Something went wrong' }));

})

router.delete('/:id', (req, res) => {
    Event
      .findByIdAndRemove(req.params.id)
      .then(() => {
        console.log(`Deleted blog post with id ${req.params.id}`);
        res.status(204).end();
      });
});


module.exports = router;