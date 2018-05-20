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
        //activity_date: faker.date.future(),
        //activity_time: faker.random.number(),
        kid_cost: faker.finance.amount(),
        adult_cost: faker.finance.amount(),
        group_cost: faker.finance.amount(),
        group_size: faker.random.number(),
        activity_host: faker.internet.userName(),
        //attendees: faker.random.arrayElement(),
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
        xit('should return all activities associated with an event', function(){
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

        xit('should return the correct activity when called by Id', function(){
            let singleAct;

            return Activity
                .findOne()
                .then(function(a){
                    singleAct = a.body;
                })

            return chai.request(app)
                .get(`activity/${singleAct.id}`)
                .then(function(res){
                    expect(res).to.be.an('object');
                    expect(res).to.include.keys('id', 'eventId', 'activity_name', 'activity_host');
                    return res
                })
                .then(function(res){
                    expect(singleAct.id).to.equal(res.id);
                    expect(singleAct.activity_name).to.equal(res.activity_name);
                    expect(singleAct.activity_description).to.equal(res.activity_description);
                    expect(singleAct.eventId).to.equal(res.eventId);
                    expect(singleAct.activity_host).to.equal(res.activity_host);
                });
        });
    });

    describe('POST endpoint', function(){
        it('should create a new activity', function(){
            const newAct = generateActivityData()
            console.log(newAct);

            return chai.request(app)
                .post('/activity')
                .send(newAct)
                .then(function(res){
                    console.log(res.body);
                    expect(res).to.have.status(201);
                    expect(res).to.be.json;
                    expect(res.body).to.include.keys('id', 'eventId', 'name', 'host');
                    expect(res.body.name).to.equal(newAct.activity_name);
                    expect(res.body.eventId).to.equal(newAct.eventId);
                    expect(res.body.host).to.equal(newAct.activity_host);
                    return Activity.findById(res.body.id);
                })
                .then(function(nAct){
                    expect(nAct.activity_name).to.equal(newAct.activity_name);
                    expect(nAct.eventId).to.equal(newAct.eventId);
                    expect(nAct.activity_host).to.equal(newAct.activity_host);
                });
        });
    });

    describe('PUT endpoint', function(){
        it('should update included fields', function(){
            const updateAct = {
                activity_name: faker.lorem.word(),
                activity_description: faker.lorem.sentence(),
            }

            return Activity
                .findOne()
                .then(function(act){
                    updateAct.id = act.id;
                    console.log(act);
                    console.log(updateAct);
                    console.log(updateAct.id);
                return chai.request(app)
                    .put(`/activity/${updateAct.id}`)
                    .send(updateAct)
                })
            
            .then(function(res){
                expect(res).to.have.status(204);
                return Activity.findById(updateAct.id);
            })
            .then(function(uAct){
                expect(uAct.activity_name).to.equal(updateAct.activity_name);
                expect(uAct.activity_description).to.equal(updateAct.activity_description);
            })
        });



    });

    describe('DELETE endpoint', function(){
        it('should delete an activity by id', function(){
            const deleteAct = {}

            return Activity
                .findOne()
                .then(function(act){
                    deleteAct.id = act.id;
                })
            return chai.request(app)
                .delete(`/activity/${deleteAct.id}`)
                .then(function(res){
                    expect(res).to.have.status(204);
                    const deleted = Activity.findById(deleteAct.id);
                    return deleted;
                })
            .then(function(dAct){
                expect(dAct).to.be.null;
            })
        });
    });
});