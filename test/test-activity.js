'use strict'

const chai = require('chai');
const chaitHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;
const activityRouter = require('../activityRouter');

const {Activity} = require('../models')
const {app, runServer, closeServer} = require('../server.js');
const {TEST_DATABASE_URL} = require('../config.js')

chai.use(chaitHttp);

function seedActivityData(){
    console.info('seeding activity data');
    const activityData = []
    for (let i=1; i<=10; i++){
        activityData.push(generateActivityData());
    }
    return activityData.insertMany(activityData)
}