'use strict'

const chai = require('chai');
const chaitHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;
const eventRouter = require('../eventRouter');

const {Event} = require('../models')
const {app, runServer, closeServer} = require('../server.js');
const {TEST_DATABASE_URL} = require('../config.js')

chai.use(chaitHttp);

function seedEventData(){
    console.info('seeding event data');
    const eventData = []
    for(let i=1; i<=10; i++){
        eventData.push(generateEventData());
    }
    return Event.insertMany(eventData);
}

function generateEventData(){
    return{
        event_name: faker.random.words(),
        event_location: faker.random.locale(),
        event_dates: {start_date: faker.date.future(), end_date: faker.date.future()},
        event_organizer: faker.name.firstName()
    }
}

function tearDownDb(){
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

describe('Event API endpoint', function(){

    before(function(){
        return runServer(TEST_DATABASE_URL);
    });
    beforeEach(function(){
        return seedEventData();
    });
    afterEach(function(){
        return tearDownDb();
    });
    after(function(){
        return closeServer();
    });

    describe('Get endpoint', function(){
        it ('should get all events', function(){
            let res; 
            return chai.request(app)
                .get('/event')
                .then(function(_res){
                    res = _res;
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body).to.be.an('array');
                    expect(res.body).to.have.length.of.at.least(1);
                    return Event.count()
                    .then(function(count){
                        expect(res.body).to.have.lengthOf(count);
                    });
                });
        });

        it('should return the correct post when called by id', function(){
            let singleEvent;
            return chai.request(app)
                .get('/event')
                .then(function(res){
                    res.body.forEach(function(event){
                        expect(event).to.be.an('object');
                        expect(event).to.include.keys('id', 'name', 'dates', 'location', 'organizer');
                    });
                    singleEvent = res.body[0];
                    return Event.findById(singleEvent.id);
                })
                .then(function(event){
                    expect(singleEvent.id).to.equal(event.id);
                    expect(singleEvent.name).to.equal(event.event_name);
                    expect(singleEvent.location).to.equal(event.event_location);
                    //expect(singleEvent.organizer).to.equal(event.event_organizer);
                });
        });
    });

    describe('POST endpoint', function(){

        it('should add a new event', function(){
            const newEvent = generateEventData();
            console.log(newEvent);

            return chai.request(app)
                .post('/event')
                .send(newEvent)
                .then(function(res){
                    expect(res).to.have.status(201);
                    expect(res).to.be.json;
                    expect(res.body).to.include.keys('id', 'name', 'dates', 'location', 'organizer');
                    expect(res.body.name).to.equal(newEvent.event_name);
                    expect(res.body.location).to.equal(newEvent.event_location);
                    //expect(res.body.dates).to.include(newEvent.event_dates.end_date);
                    //expect(res.body.organizer).to.equal(newEvent.event_organizer);
                    return Event.findById(res.body.id);
                })
                .then(function(nEvent){
                    expect(nEvent.event_name).to.equal(newEvent.event_name);
                    expect(nEvent.event_location).to.equal(newEvent.event_location);
                    //expect(nEvent.event_organizer).to.equal(newEvent.event_organizer);
                });
        });
    });

    describe('PUT endpoint', function(){
        it('should update fields', function(){
            const updateEvent = {
                event_name: faker.random.words(),
                event_location: faker.random.locale(), 
            };
            return Event
                .findOne()
                .then(function(event){
                    updateEvent.id = event.id;

                return chai.request(app)
                    .put(`/event/${updateEvent.id}`)
                    .send(updateEvent)
                })
            .then(function(res){
                expect(res).to.have.status(204);
                return Event.findById(updateEvent.id);
            })
            .then(function(uEvent){
                expect(uEvent.event_name).to.equal(updateEvent.event_name);
                expect(uEvent.event_location).to.equal(updateEvent.event_location);
            })
        });
    });

    describe('DELETE endpoint', function(){
        it('should delete an event by id', function(){
            const deleteEvent = {}

            return Event
                .findOne()
                .then(function(event){
                    deleteEvent.id = event.id;
                })
                return chai.request(app)
                    .delete(`/event/{${deleteEvent.id}`)
                    .then (function(res){
                        expect(res).to.have.status(204);
                        return Event.findById(deleteEvent.id)
                    })
                .then(function(dEvent){
                    expect(dEvent).to.be.null;
                })

        });
    });
});

describe('Event planning API', function(){
    it('should answer a request to root with html', function(){
        let res;
        return chai.request(app)
            .get('/')
            .then(function(_res){
                res = _res;
                expect(res).to.have.status(200);
                expect(res).to.be.html;
            });
    });
});