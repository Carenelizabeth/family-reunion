'use strict'

const express = require('express');
const morgan = require('morgan');
const Mongoose = require('mongoose');
Mongoose.Promise = global.Promise;

const app = express();

const {PORT} = require('./config.js');
//app.listen(process.env.PORT || 8080);

app.use(express.static('public'));
app.use(morgan('common'));
app.use(express.json());

app.listen(PORT);
module.exports = app