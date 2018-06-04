'use strict';

const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const morgan = require('morgan');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const {Activity} = require('../models/activityModel');

const app = express();

app.use(morgan('common'));
app.use(express.json());

router.get('/event/:eventId', (req, res) => {    
    Activity
        .find({eventId: req.params.eventId})
        .then(activities => {res.json(activities.map(a => a.serialize()));})
        .catch(err =>{
            res.status(500).json({error: 'Internal server error'})
        });
});

//This retrieves that activities that a user is hosting
router.get('/host', (req, res) => {
    Activity
        .find({activity_host: req.query.userId, 
            eventId: req.query.eventId
        })
        .then(activites => {res.json(activites.map(a => a.serialize()));})
        .catch(err =>{
            res.status(500).json({error: 'Internal server error'})
        });
})

//This retrieves activities that the user is part of, but excludes those they are hosting
router.get('/user', (req, res) => {
    Activity
        .find(
            {activity_host: {$ne: req.query.userId},
            attendees: {$all: [req.query.userId]}, 
            eventId: req.query.eventId, 
        })
        .then(activities => {res.json(activities.map(a => a.serialize()));})
        .catch(err =>{
            res.status(500).json({error: 'Internal server error'})
        })
        
})

router.get('/:id', (req,res) =>{
    Activity
        .findById(req.params.id)
        .then(a => res.json(a.serialize()))
        .catch(err => res.status(500).json({error: 'Internal server error'}));
})

router.post('/', (req, res) =>{
    const required = ['eventId', 'activity_name', 'activity_host']
    for(let i=0; i<required.length; i++){
        const field = required[i];
        if(!(field in req.body)){
            const message = `Missing ${field} in request body`;
            return res.status(400).send(message);
        }
    }

    Activity
        .create({
            eventId: req.body.eventId,
            activity_name: req.body.activity_name,
            activity_url: req.body.activity_url,
            activity_date: req.body.activity_date,
            activity_time: req.body.activity_time,
            kids_welcome: req.body.kids_welcome,
            kid_cost: req.body.kid_cost,
            adult_cost: req.body.adult_cost,
            group_cost: req.body.group_cost,
            group_size: req.body.group_size,
            activity_host: req.body.activity_host,
            host_name: req.body.host_name,
            attendees: req.body.attendees,
            kid_number: req.body.kid_number,
            adult_number: req.body.adult_number,
            activity_comments: {comment: req.body.activity_comments, name: req.body.host_name}
        })
        .then(event => res.status(201).json(event.serialize()))
        .catch(err => {
            res.status(500).json({error: 'Internal server error'})
        });
});

router.put('/join/:id', (req, res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        res.status(400).json({
          error: 'Request path id and request body id values must match'
        });
    }

    Activity
        .findByIdAndUpdate(req.params.id, 
            {$inc: {kid_number: req.body.kid_number, adult_number: req.body.adult_number},
            $addToSet: {attendees: req.body.userId}})
        .then(a => res.status(204).end())
        .catch(err => res.status(500).json({message: 'Internal server error'}));
});

router.put('/:id', (req, res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        res.status(400).json({
          error: 'Request path id and request body id values must match'
        });
    }

    const update = {}
    const updateable = ['activity_name', 'activity_url','activity_date', 'activity_time', 'kid_cost', 'adult_cost', 'group_cost', 'group_size', 'kids_welcome']
    updateable.forEach(field =>{
        if (field in req.body){
            update[field] = req.body[field]
        }
    });
    
    Activity
        .findByIdAndUpdate(req.params.id, {$set: update})
        .then(a => res.status(204).end())
        .catch(err => res.status(500).json({message: 'Internal server error'}))
})

router.put('/comments/:id', (req, res) =>{
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        res.status(400).json({
          error: 'Request path id and request body id values must match'
        });
    }

    const data = {comment: req.body.comment,
                name: req.body.name}

    Activity
        .findByIdAndUpdate(req.params.id, {$addToSet: {activity_comments: data}})
        .then(a => res.status(204).end())
        .catch(err => res.status(500).json({message: 'Internal server error'}))
})

router.delete('/:id', (req, res) =>{
    Activity
        .findByIdAndRemove(req.params.id)
        .then(() => {
            res.status(204).end();
        });
});

module.exports = router;