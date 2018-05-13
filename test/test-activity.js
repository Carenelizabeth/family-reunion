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

function generateActivityData(){
    return{
        activity_name: faker.lorem.word(),
        activity_description: faker.lorem.sentence(),
        activity_date: lorem.data.future(),
        activity_time: lorem.random.number(),
        kid_cost: lorem.finance.amount(),
        adult_cost: lorem.finance.amount(),
        group_cost: lorem.finance.amount(),
        group_size: lorem.random.number(),
        activity_host: lorem.internet.userName(),
        attendees: lorem.random.arrayElement(),
        kid_number: lorem.random.number(),
        adult_number: lorem.random.number()
    }
}

function tearDownDb(){
    console.warn('Deleting database')
    return mongoose.connection.dropDatabase();
}

describe('Activity API endpoint', function(){

    before(function(){
        return runServer(TEST_DATABASE_URL);
    });
    beforeEach(function(){
        return seedActivityData();
    });
    afterEach(function(){
        return tearDownDb();
    });
    after(function(){
        return closeServer();
    })
})