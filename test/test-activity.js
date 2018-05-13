'use strict'

const chai = require('chai');
const chaitHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;
const activityRouter = require('../activityRouter');

const {Activity} = require('../models')
const {Event} = require('../models')
const {app, runServer, closeServer} = require('../server.js');
const {TEST_DATABASE_URL} = require('../config.js')

chai.use(chaitHttp);

function seedActivityData(){
    console.info('seeding activity data');
    const activityData = []
    for (let i=1; i<=10; i++){
        activityData.push(generateActivityData());
    }
    return Activity.insertMany(activityData)
}

function generateActivityData(){
    return{
        eventId: "5af4c9c6f4266d148c2bc6ad",
        activity_name: faker.lorem.word(),
        activity_description: faker.lorem.sentence(),
        activity_date: faker.date.future(),
        activity_time: faker.random.number(),
        kid_cost: faker.finance.amount(),
        adult_cost: faker.finance.amount(),
        group_cost: faker.finance.amount(),
        group_size: faker.random.number(),
        activity_host: faker.internet.userName(),
        attendees: faker.random.arrayElement(),
        kid_number: faker.random.number(),
        adult_number: faker.random.number()
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
    });

    describe('GET endpoint', function(){
        it('should return all activities associated with an event', function(){
            let eventId = "5af4c9c6f4266d148c2bc6ad"
            let res;
            
            return chai.request(app)
                .get(`/activity/event/${eventId}`)
                .then(function(_res){
                    res = _res;
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body).to.be.an('array');
                    expect(res.body).to.have.length.of.at.least(1)
                    return Activity.count()
                    .then(function(count){
                        expect(res.body).to.have.lengthOf(count);
                    });
                });
        });
    });
})