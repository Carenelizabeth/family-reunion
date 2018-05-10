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

router.get('/', (req,res) => {
    User
        .find()
        .then(users => 
            {res.json(users.map(user => user.serialize()));
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({error: 'Internal server error'})
        });
});

router.get('/:id', (req, res) => {
    User
        .findById(req.params.id)
        //.populate('events')
        .then(user => res.json(user.serialize()))
        .catch(err => {
            console.error(err)
            res.status(500).json({error: "Internal server error"});
        });
});

router.post('/', (req, res) => {
    const requiredFields = ['username', 'email', 'password']
    for (let i=0; i<requiredFields.length; i++){
        const field = requiredFields[i];
        if(!(field in req.body)){
            const message = `Missing ${field} in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }

    const explicitlyTrimmedFields = ['username', 'password'];
    const nonTrimmedField = explicitlyTrimmedFields.find(field =>
      req.body[field].trim() !== req.body[field]
    );

    if(nonTrimmedField){
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'cannot start or end with whitespace',
            location: nonTrimmedField
        })
    }

    const sizedFields = {
        username: {min: 1},
        password: {min: 7, max: 72}
    };

    const tooShort = Object.keys(sizedFields).find(
        field => 'min' in sizedFields[field] && 
            req.body[field].trim().length < sizedFields[field].min
    );
    const tooLong = Object.keys(sizedFields).find(
        field => 'max' in sizedFields[field] &&
            req.body[field].trim().length > sizedFields[field].max
    );

    if (tooShort || tooLong) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: tooShort 
                ? `Must be at least ${sizedFields[tooSmall].min} characters long`
                : `Must be at most ${sizedFields[tooLong].max} characters long`,
            location: tooShort || tooLong
        });
    }

    let{username, password, email} = req.body;
    email = email.trim();
    console.log(username);
    return User.find({username})
        .count()
        .then (count => {
            if (count > 0) {
                return Promise.reject({
                    code: 422,
                    reason: 'ValidationError',
                    message: 'Username is already taken',
                    location: 'username'
                })
            }
            console.log(password);
            return User.hashPassword(password);
        })
        .then(hash => {
            console.log('something ran')
            return User.create({
                username,
                password: hash,
                email
            });
        })
        .then(user => {
            console.log(user)
            return res.status(201).json(user.serialize());
        })
        .catch(err => {
            if (err.reason === 'ValidationError') {
                return res.status(err.code).json(err);
            }
            res.status(500).json({code: 500, message: 'Internal server error'});
        });
});

router.put('/:id', (req, res) =>{
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        res.status(400).json({
          error: 'Request path id and request body id values must match'
        });
      }

    const toUpdate = {}
    const updateableFields = ['username', 'email', 'password'];
    updateableFields.forEach(field => {
        if (field in req.body) {
            toUpdate[field] = req.body[field];
        }
    });

    const event = req.body.event_id;
    console.log(event);

    User
        .findByIdAndUpdate(req.params.id, 
            {$set: toUpdate}, 
            {$push: {event_id: event}})
        .then(updatedEvent => res.status(204).end())
        .catch(err => res.status(500).json({message: 'Internal server error'}));
})


router.delete('/:id', (req, res) =>{
    User
        .findByIdAndRemove(req.params.id)
        .then(() => {
            console.log(`Deleted user with id ${req.params.id}`);
            res.status(204).end();
        });
});

module.exports = router;