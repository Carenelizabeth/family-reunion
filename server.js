'use strict'

const express = require('express');
const morgan = require('morgan');
const Mongoose = require('mongoose');
Mongoose.Promise = global.Promise;

const PORT = require('./config.js');

const app = express();
app.use(express.static('public'));
app.use(morgan('common'));
app.use(express.json());



module.exports = app