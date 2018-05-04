'use strict';

const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const morgan = require('morgan');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

//const {DATABASE_URL, PORT} = require('/config');
const {Event} = require('./models');

const app = express();

app.use(morgan('common'));
app.use(express.json());

router.post('/', jsonParser, (req, res) => {
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


module.exports = router;