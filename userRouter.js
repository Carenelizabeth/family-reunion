'use strict';

const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const morgan = require('morgan');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const {User} = require('./models');

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
        .then(user => res.json(user.serialize()))
        .catch(err => {
            console.error(err)
            res.status(500).json({error: "Internal server error"});
        });
});

router.get(':/id', (req, res) => {
    User
        .findById(req.params.id)
        .then(user => res.json(user.serialize()))
        .catch(err => {
            res.status(500).json({error: 'Internal server error'});
        });
});

router.post('/', (req, res) => {
    const requiredFields = ['user_name', 'email', 'password']
    for (let i=0; i<requiredFields.length; i++){
        const field = requiredFields[i];
        if(!(field in req.body)){
            const message = `Missing ${field} in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }

    console.log(req.body.event_id)

    User
        .create({
            user_name: req.body.user_name,
            email: req.body.email,
            password: req.body.password,
            event_id: req.body.event_id
        })
        .then(user => res.status(201).json(user.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({error: 'Something went wrong on our end'});
        });
});

router.put('/:id', (req, res) =>{
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        res.status(400).json({
          error: 'Request path id and request body id values must match'
        });
      }

      const toUpdate = {}
      const updateableFields = ['user_name', 'email', 'password'];
      updateableFields.forEach(field => {
        if (field in req.body) {
            toUpdate[field] = req.body[field];
        }
    });

    User
        .findByIdAndUpdate(req.params.id, {$set: toUpdate})
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