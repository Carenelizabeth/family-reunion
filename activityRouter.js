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

