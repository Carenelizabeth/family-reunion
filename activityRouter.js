'use strict';

const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const morgan = require('morgan');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const {Activity} = require('./models');

const app = express();

app.use(morgan('common'));
app.use(express.json());

router.get('/', (req, res) => {
    Activity
        .find()
        .then(activities => res.json(activites.map(a => a.serialize())))
        .catch(err =>{
            console.error(err);
            res.status(500).json({error: 'Internal server error'})
        });
});

router.get('/:id', (req,res) =>{
    Activity
        .findById({id: req.params.id})
        .then(a => res.json(a.serialize()))
        .catch(err => res.status(500).json({error: 'Internal server error'}));
})

router.post('/', (req, res) =>{
    const required = ['activity_name', 'activity_description']
    for(let i=0; i<required.length; i++){
        const field = required[i];
        if(!(field in req.body)){
            const message = `Missing ${field} in request body`;
            console.error(message)
            return res.status(400).send(message);
        }
    }

    Activity
        .create({
            activity_name: req.body.activity_name,
            activity_description: req.body.activity_description,
            activity_date: req.body.activity_date,
            activity_time: req.body.activity_time,
            kid_cost: req.body.kid_cost,
            adult_cost: req.body.adult_cost,
            group_cost: req.body.group_cost,
            groupe_size: req.body.group_cost,
            activity_host: req.body.hostId,
            attendees: req.body.userId
        })
        .then(event => res.status(201).json(event.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({error: 'Internal server error'})
        });
});

router.put('/join/:id', (req, res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        res.status(400).json({
          error: 'Request path id and request body id values must match'
        });
    }

    const update = {};
    const updateable = ['kid_number', 'adult_number']
     updateable.forEach(field =>{
        if (field in req.body){
            update[field] = req.body[field]
        }
    });

    Activity
      .findByIdAndUpdate(req.params.id, {$set:update}, {$push: {attendees: req.body.user}})
      .then(a => res.status(204).end())
      .catch(err => res.status(204).end())
});

router.put('/', (res, req) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        res.status(400).json({
          error: 'Request path id and request body id values must match'
        });
    }

    const update = {}
    const updateable = ['activity_name', 'activity_description', 'activity_date', 'activity_time', 'kid_cost', 'adult_cost', 'group_cost', 'group_size']
    updateable.forEach(field =>{
        if (field in req.body){
            update[field] = req.body[field]
        }
    });
    
    Activity
        .findByIdAndUpdate(req.params.id, {$set: update})
        .then(a => res.status(204).end())
        .catch(err => res.status(500).json({message: 'Internal server erro'}))
})

router.delete('/', (req, res) =>{
    Activity
        .findByIdAndRemove(req.params.id)
        .then(() => {
            console.log('Deleted post')
            res.status(204).end();
        });
});

module.exports = router;